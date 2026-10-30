"use server";

import { supabase, supabaseAdmin } from "@/lib/supabase";
import { checkAdminSession, logActivity, logError } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
// @ts-ignore
import { Resend } from "resend";
import { renderNewsletterEmail } from "@/lib/email-template";
import { calculateReadingTime } from "@/lib/site-config";
import { generatePreviewToken, verifyPreviewToken } from "@/lib/bot/preview-token";
import { publishPostToTelegramGroup } from "@/lib/bot/telegram";
import { publishPostToLinkedIn, testLinkedInConnection } from "@/lib/bot/linkedin";

// Memory rate limit cache for newsletter subscription: IP -> [timestamp]
const rateLimitMap = new Map<string, number[]>();

export interface BlogPostSource {
  title: string;
  url: string;
  publisher?: string;
}

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  cover_image?: string | null;
  category?: string | null;
  tags?: string[] | null;
  source_urls?: BlogPostSource[] | null;
  ai_generated?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  reading_time?: number | null;
  status: "draft" | "pending_approval" | "published" | "rejected";
  author_name: string;
  author_avatar: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to check admin authorization
async function requireAuth() {
  const isAuth = await checkAdminSession();
  if (!isAuth) {
    throw new Error("Unauthorized access. Admin session required.");
  }
}

export interface GetBlogPostsOptions {
  includeDrafts?: boolean;
  category?: string;
  status?: "draft" | "pending_approval" | "published" | "rejected";
  page?: number;
  limit?: number;
  search?: string;
}

// 1. GET BLOG POSTS (PUBLIC OR ADMIN, WITH PAGINATION & CATEGORY)
export async function getBlogPosts(options?: boolean | GetBlogPostsOptions) {
  const opts: GetBlogPostsOptions = typeof options === "boolean" ? { includeDrafts: options } : (options || {});
  const client = supabaseAdmin || supabase;

  if (!client) {
    return { success: false, error: "Database client is not configured.", data: [], total: 0 };
  }

  const page = Math.max(1, opts.page || 1);
  const limit = Math.min(50, Math.max(1, opts.limit || 20));
  const offset = (page - 1) * limit;

  try {
    let query = client.from("blog_posts").select("*", { count: "exact" });

    if (opts.includeDrafts || opts.status) {
      await requireAuth();
      if (opts.status) {
        query = query.eq("status", opts.status);
      }
      query = query.order("created_at", { ascending: false });
    } else {
      // Public view: ONLY published posts
      query = query.eq("status", "published").order("published_at", { ascending: false });
    }

    if (opts.category && opts.category.toLowerCase() !== "all") {
      query = query.ilike("category", opts.category);
    }

    if (opts.search && opts.search.trim()) {
      query = query.or(`title.ilike.%${opts.search.trim()}%,excerpt.ilike.%${opts.search.trim()}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;
    if (error) {
      if (client === supabaseAdmin && supabase) {
        let fallbackQuery = supabase.from("blog_posts").select("*", { count: "exact" });
        if (opts.includeDrafts || opts.status) {
          if (opts.status) fallbackQuery = fallbackQuery.eq("status", opts.status);
          fallbackQuery = fallbackQuery.order("created_at", { ascending: false });
        } else {
          fallbackQuery = fallbackQuery.eq("status", "published").order("published_at", { ascending: false });
        }
        if (opts.category && opts.category.toLowerCase() !== "all") {
          fallbackQuery = fallbackQuery.ilike("category", opts.category);
        }
        fallbackQuery = fallbackQuery.range(offset, offset + limit - 1);
        const fallbackRes = await fallbackQuery;
        if (!fallbackRes.error && fallbackRes.data) {
          return {
            success: true,
            data: (fallbackRes.data as BlogPostItem[]) || [],
            total: fallbackRes.count || 0,
            page,
            limit,
            totalPages: fallbackRes.count ? Math.ceil(fallbackRes.count / limit) : 0,
          };
        }
      }
      return { success: false, error: error.message, data: [], total: 0 };
    }

    return {
      success: true,
      data: (posts as BlogPostItem[]) || [],
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to load blog posts.", data: [], total: 0 };
  }
}

// 2. GET SINGLE BLOG POST BY SLUG (PUBLIC)
export async function getBlogPostBySlug(slug: string) {
  const client = supabaseAdmin || supabase;
  if (!client) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { data: post, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    return { success: true, data: post as BlogPostItem };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to load blog post." };
  }
}

// 3. GET RELATED POSTS BY CATEGORY
export async function getRelatedPosts(category: string | undefined | null, currentSlug: string, limit: number = 3) {
  const client = supabaseAdmin || supabase;
  if (!client) return { success: false, data: [] };

  try {
    let query = client
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, category, published_at, author_name, reading_time")
      .eq("status", "published")
      .neq("slug", currentSlug)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq("category", category);
    }

    const { data: posts, error } = await query;
    if (error) return { success: false, data: [] };

    return { success: true, data: (posts as Partial<BlogPostItem>[]) || [] };
  } catch {
    return { success: false, data: [] };
  }
}

// 4. GET DAILY BRIEFS ARCHIVE
export async function getDailyBriefs(page: number = 1, limit: number = 10) {
  return getBlogPosts({
    category: "Daily Brief",
    page,
    limit,
  });
}

// 5. SAVE BLOG POST (ADMIN OR SECURE SERVICE)
export async function saveBlogPost(data: {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category?: string;
  tags?: string[];
  source_urls?: BlogPostSource[];
  ai_generated?: boolean;
  seo_title?: string;
  seo_description?: string;
  reading_time?: number;
  status: "draft" | "pending_approval" | "published" | "rejected";
  author_name?: string;
  author_avatar?: string;
}) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  const client = supabaseAdmin || supabase;
  if (!client) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  if (!data.title.trim()) return { success: false, error: "Title is required." };
  if (!data.slug.trim()) return { success: false, error: "Slug is required." };
  if (!data.content.trim()) return { success: false, error: "Content is required." };

  const slugFormatted = data.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const calculatedTime = data.reading_time || calculateReadingTime(data.content);

  try {
    const isUpdate = !!data.id;
    let publishedAt: string | null = null;
    let triggerBroadcast = false;

    if (data.status === "published") {
      if (isUpdate) {
        const { data: existing } = await client
          .from("blog_posts")
          .select("published_at, status")
          .eq("id", data.id)
          .single();
        publishedAt = existing?.published_at || new Date().toISOString();
        if (existing?.status !== "published") {
          triggerBroadcast = true;
        }
      } else {
        publishedAt = new Date().toISOString();
        triggerBroadcast = true;
      }
    }

    const postPayload = {
      title: data.title.trim(),
      slug: slugFormatted,
      content: data.content.trim(),
      excerpt: data.excerpt?.trim() || null,
      cover_image: data.cover_image?.trim() || null,
      category: data.category?.trim() || null,
      tags: data.tags || [],
      source_urls: data.source_urls || [],
      ai_generated: !!data.ai_generated,
      seo_title: data.seo_title?.trim() || null,
      seo_description: data.seo_description?.trim() || null,
      reading_time: calculatedTime,
      status: data.status,
      author_name: data.author_name?.trim() || "ReplyIQ Team",
      author_avatar: data.author_avatar?.trim() || "/favicon.jpg",
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (isUpdate) {
      result = await client
        .from("blog_posts")
        .update(postPayload)
        .eq("id", data.id)
        .select()
        .single();
    } else {
      result = await client
        .from("blog_posts")
        .insert([postPayload])
        .select()
        .single();
    }

    const { data: savedPost, error } = result;

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "A blog post with this slug already exists." };
      }
      return { success: false, error: error.message };
    }

    // Revalidate affected routes
    revalidatePath("/blog");
    revalidatePath(`/blog/${slugFormatted}`);
    if (data.category) {
      revalidatePath(`/blog/category/${data.category.toLowerCase().replace(/\s+/g, "-")}`);
    }
    revalidatePath("/sitemap.xml");

    await logActivity(
      null,
      isUpdate ? "blog_post_updated" : "blog_post_created",
      `Blog post '${data.title}' was ${isUpdate ? "updated" : "created"}`
    );

    if (triggerBroadcast) {
      notifySubscribersOfNewPost(savedPost.title, savedPost.slug, savedPost.excerpt || "").catch(console.error);
      await Promise.allSettled([
        publishPostToTelegramGroup(savedPost).catch((err) =>
          console.error("[Telegram Group] Error broadcasting from saveBlogPost:", err)
        ),
        publishPostToLinkedIn(savedPost).catch((err) =>
          console.error("[LinkedIn Auto-Post] Error broadcasting from saveBlogPost:", err)
        ),
      ]);
    }

    return { success: true, data: savedPost as BlogPostItem };
  } catch (err: any) {
    await logError("ADMIN_BLOG", `Error saving blog post: ${err.message}`);
    return { success: false, error: err.message || "Failed to save blog post." };
  }
}

// 6. UPDATE POST STATUS (APPROVE / REJECT / PUBLISH)
export async function updatePostStatus(id: string, status: "pending_approval" | "published" | "rejected" | "draft") {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const client = supabaseAdmin || supabase;
  if (!client) {
    return { success: false, error: "Database client unavailable." };
  }

  try {
    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "published") {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data: post, error } = await client
      .from("blog_posts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/blog");
    if (post?.slug) {
      revalidatePath(`/blog/${post.slug}`);
    }
    revalidatePath("/sitemap.xml");

    if (status === "published" && post) {
      await Promise.allSettled([
        publishPostToTelegramGroup(post).catch((err) =>
          console.error("[Telegram Group] Error broadcasting from admin update:", err)
        ),
        publishPostToLinkedIn(post).catch((err) =>
          console.error("[LinkedIn Auto-Post] Error broadcasting from admin update:", err)
        ),
      ]);
    }

    await logActivity(null, "blog_status_updated", `Post status changed to '${status}' for post ID ${id}`);

    return { success: true, data: post };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update post status." };
  }
}

// 7. GET AGENT DRAFTS (PENDING APPROVAL)
export async function getPendingAgentDrafts() {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized", data: [] };
  }

  const client = supabaseAdmin || supabase;
  if (!client) return { success: false, error: "Database client unavailable.", data: [] };

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message, data: [] };

    return { success: true, data: (data as BlogPostItem[]) || [] };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

// 8. GET & SET AGENT SETTINGS (PAUSE TOGGLE)
export async function getAgentSettings() {
  const client = supabaseAdmin || supabase;
  if (!client) return { success: false, paused: false };

  try {
    const { data, error } = await client
      .from("app_settings")
      .select("value")
      .eq("key", "agent_settings")
      .maybeSingle();

    if (error || !data) return { success: true, paused: false };
    return { success: true, paused: !!data.value?.agent_paused };
  } catch {
    return { success: true, paused: false };
  }
}

export async function setAgentSettings(paused: boolean) {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const client = supabaseAdmin || supabase;
  if (!client) return { success: false, error: "Database client unavailable." };

  try {
    const { error } = await client
      .from("app_settings")
      .upsert({
        key: "agent_settings",
        value: { agent_paused: paused },
        updated_at: new Date().toISOString(),
      });

    if (error) return { success: false, error: error.message };

    await logActivity(null, "agent_toggle", `Automated publisher paused status set to: ${paused}`);
    return { success: true, paused };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 9. DELETE BLOG POST (ADMIN ONLY)
export async function deleteBlogPost(id: string) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  const client = supabaseAdmin || supabase;
  if (!client) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { data: post } = await client
      .from("blog_posts")
      .select("title, slug")
      .eq("id", id)
      .single();

    const { error } = await client.from("blog_posts").delete().eq("id", id);
    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/blog");
    if (post?.slug) revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/sitemap.xml");

    await logActivity(null, "blog_post_deleted", `Blog post '${post?.title || id}' was deleted`);
    return { success: true };
  } catch (err: any) {
    await logError("ADMIN_BLOG", `Error deleting blog post: ${err.message}`);
    return { success: false, error: err.message || "Failed to delete blog post." };
  }
}

// 10. NEWSLETTER NOTIFICATION HELPER
async function notifySubscribersOfNewPost(postTitle: string, postSlug: string, postExcerpt: string) {
  const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("Resend API key is not configured. Skipping newsletter notification.");
    return;
  }

  const client = supabaseAdmin || supabase;
  if (!client) return;

  try {
    const { data: subscribers, error } = await client
      .from("newsletter_subscribers")
      .select("email");

    if (error || !subscribers || subscribers.length === 0) return;

    const resend = new Resend(apiKey);
    const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.replyiq.cv"}/blog/${postSlug}`;
    const emails = subscribers.map((sub: any) => sub.email).filter(Boolean);

    if (emails.length === 0) return;

    const contentHtml = `
      <h2 style="color: #ffffff; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 12px;">${postTitle}</h2>
      <p style="color: #cbd5e1; font-size: 14.5px; line-height: 1.6; margin-bottom: 24px;">
        ${postExcerpt || "Read the latest Nigerian tech intelligence and ecosystem developments from ReplyIQ Lab."}
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${postUrl}" style="background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">Read Full Story</a>
      </div>
    `;

    await resend.emails.send({
      from: "ReplyIQ Lab <support@replyiq.cv>",
      to: "support@replyiq.cv",
      bcc: emails,
      subject: `ReplyIQ Lab Brief: ${postTitle}`,
      html: renderNewsletterEmail(`New Insights from ReplyIQ Lab`, contentHtml),
    });

    await logActivity(null, "newsletter_broadcast_sent", `Sent newsletter alert for '${postTitle}' to ${emails.length} subscribers`);
  } catch (err: any) {
    await logError("NEWSLETTER_BROADCAST", `Failed to send newsletter emails: ${err.message}`);
  }
}

// 11. SUBSCRIBE TO NEWSLETTER (VALIDATION, HONEYPOT, RATE LIMITING, CLEAR MESSAGES)
export async function subscribeToNewsletter(emailOrFormData: string | FormData, honeypotField?: string) {
  let email = "";
  let honeypot = "";

  if (typeof emailOrFormData === "string") {
    email = emailOrFormData;
    honeypot = honeypotField || "";
  } else {
    email = (emailOrFormData.get("email") as string) || "";
    honeypot = (emailOrFormData.get("website") as string) || (emailOrFormData.get("company_url") as string) || "";
  }

  // Honeypot check: Bots fill hidden fields
  if (honeypot && honeypot.trim() !== "") {
    // Return quiet success so bots don't adapt
    return { success: true, message: "Thank you! You're subscribed." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { success: false, error: "Please provide a valid email address." };
  }

  // Simple IP sliding window rate limit
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown-ip";
    const ip = forwardedFor.split(",")[0].trim();
    const now = Date.now();

    const history = rateLimitMap.get(ip) || [];
    const recent = history.filter((timestamp) => now - timestamp < 60_000); // 1 minute window

    if (recent.length >= 5) {
      return { success: false, error: "Too many attempts. Please wait a minute and try again." };
    }

    recent.push(now);
    rateLimitMap.set(ip, recent);
  } catch {
    // Continue if headers cannot be read
  }

  const client = supabaseAdmin || supabase;
  if (!client) {
    return { success: false, error: "Subscription service unavailable. Please try again later." };
  }

  try {
    const { error } = await client
      .from("newsletter_subscribers")
      .insert([{ email: cleanEmail }]);

    if (error) {
      if (error.code === "23505") {
        return {
          success: true,
          alreadySubscribed: true,
          message: "You're already on the list! Watch your inbox for the daily brief.",
        };
      }
      return { success: false, error: error.message };
    }

    return {
      success: true,
      alreadySubscribed: false,
      message: "You're in! Check your inbox for the next Nigerian tech daily brief.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to subscribe." };
  }
}

// 12. GET BLOG POST FOR PREVIEW (AUTHENTICATED VIA CRYPTOGRAPHIC HMAC TOKEN)
export async function getBlogPostForPreview(id: string, token: string) {
  if (!id || !token) {
    return { success: false, error: "Invalid preview parameters." };
  }

  const isValid = verifyPreviewToken(id, token);
  if (!isValid) {
    return { success: false, error: "Unauthorized or expired preview link." };
  }

  const client = supabaseAdmin || supabase;
  if (!client) {
    return { success: false, error: "Database client unavailable." };
  }

  try {
    const { data: post, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !post) {
      return { success: false, error: "Draft not found." };
    }

    return { success: true, data: post as BlogPostItem };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch preview." };
  }
}

// 13. UPDATE POST STATUS VIA PREVIEW TOKEN (1-CLICK TELEGRAM / PREVIEW APPROVAL)
export async function updatePostStatusViaToken(
  id: string,
  token: string,
  status: "published" | "rejected"
) {
  if (!id || !token) {
    return { success: false, error: "Missing parameters." };
  }

  const isValid = verifyPreviewToken(id, token);
  if (!isValid) {
    return { success: false, error: "Invalid or unauthorized preview token." };
  }

  const client = supabaseAdmin || supabase;
  if (!client) {
    return { success: false, error: "Database client unavailable." };
  }

  try {
    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "published") {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data: post, error } = await client
      .from("blog_posts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !post) {
      return { success: false, error: error ? error.message : "Failed to update post." };
    }

    // Revalidate paths so it goes live instantly
    revalidatePath("/blog");
    if (post.slug) {
      revalidatePath(`/blog/${post.slug}`);
    }
    revalidatePath("/sitemap.xml");

    if (status === "published") {
      notifySubscribersOfNewPost(post.title, post.slug, post.excerpt || "").catch(console.error);
      await Promise.allSettled([
        publishPostToTelegramGroup(post).catch((err) =>
          console.error("[Telegram Group] Error broadcasting from preview approval:", err)
        ),
        publishPostToLinkedIn(post).catch((err) =>
          console.error("[LinkedIn Auto-Post] Error broadcasting from preview approval:", err)
        ),
      ]);
    }

    await logActivity(null, "preview_token_status_update", `Post '${post.title}' status updated to ${status} via secure token.`);

    return { success: true, data: post as BlogPostItem };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update post status." };
  }
}

// 14. GET DRAFT PREVIEW URL (FOR ADMIN 1-CLICK PREVIEW)
export async function getDraftPreviewUrl(id: string) {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  if (!id) return { success: false, error: "Post ID is required." };

  try {
    const token = generatePreviewToken(id);
    return { success: true, url: `/blog/preview/${id}?token=${token}` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate preview URL." };
  }
}

// 15. BROADCAST PUBLISHED POST TO TELEGRAM GROUP
export async function broadcastPublishedPostToTelegram(id: string) {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const client = supabaseAdmin || supabase;
  if (!client) {
    return { success: false, error: "Database client unavailable." };
  }

  try {
    const { data: post, error } = await client
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, category, reading_time, status")
      .eq("id", id)
      .single();

    if (error || !post) {
      return { success: false, error: "Post not found." };
    }

    const broadcastRes = await publishPostToTelegramGroup(post);
    if (!broadcastRes.success) {
      return { success: false, error: broadcastRes.error || "Failed to broadcast to Telegram group." };
    }

    await logActivity(null, "manual_telegram_broadcast", `Post '${post.title}' broadcasted to Telegram group.`);
    return { success: true, message: `Successfully announced '${post.title}' to your Telegram group!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to broadcast post." };
  }
}

// 16. TEST TELEGRAM GROUP BROADCAST CONNECTION
export async function sendTelegramGroupTestMessage(customChatId?: string) {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return { success: false, error: "TELEGRAM_BOT_TOKEN not configured." };

  let groupChatId = customChatId?.trim() || process.env.TELEGRAM_GROUP_CHAT_ID || process.env.TELEGRAM_CHANNEL_ID;
  const client = supabaseAdmin || supabase;

  if (!groupChatId && client) {
    const { data: log } = await client
      .from("activity_logs")
      .select("metadata")
      .eq("event_type", "telegram_group_config")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (log?.metadata?.group_chat_id) {
      groupChatId = String(log.metadata.group_chat_id);
    }
  }

  if (!groupChatId) {
    return {
      success: false,
      error: "No Group Chat ID found. Add @replyiqblog_bot to your group as an Admin, or type your Group Chat ID.",
    };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: groupChatId,
        text: `🚀 <b>ReplyIQ Lab Broadcast Test</b>\n\n✅ Your Telegram group is successfully connected to the ReplyIQ automated tech news curator!\n\nAll approved articles will automatically broadcast here with cover card and direct links.`,
        parse_mode: "HTML",
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: `Telegram Error: ${data.description}` };
    }

    if (customChatId && client) {
      await client.from("activity_logs").insert([
        {
          event_type: "telegram_group_config",
          description: `Admin manually set Telegram Group ID to: ${customChatId}`,
          metadata: { group_chat_id: customChatId },
        },
      ]);
    }

    return { success: true, message: `Test message delivered successfully to group ${groupChatId}!` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 17. BROADCAST PUBLISHED POST TO LINKEDIN COMPANY PAGE
export async function broadcastPublishedPostToLinkedIn(id: string) {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const client = supabaseAdmin || supabase;
  if (!client) {
    return { success: false, error: "Database client unavailable." };
  }

  try {
    const { data: post, error } = await client
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, category, reading_time, status")
      .eq("id", id)
      .single();

    if (error || !post) {
      return { success: false, error: "Post not found." };
    }

    const broadcastRes = await publishPostToLinkedIn(post);
    if (!broadcastRes.success) {
      return { success: false, error: broadcastRes.error || "Failed to broadcast to LinkedIn." };
    }

    const destination =
      broadcastRes.target === "organization"
        ? "ReplyIQ LinkedIn Company Page"
        : `LinkedIn profile (${broadcastRes.authorName || "Verified Account"})`;

    await logActivity(null, "manual_linkedin_broadcast", `Post '${post.title}' shared to ${destination}.`);
    return { success: true, message: `Successfully shared '${post.title}' to ${destination}!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to share post to LinkedIn." };
  }
}

export async function testLinkedInPageConnection() {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  return await testLinkedInConnection();
}






