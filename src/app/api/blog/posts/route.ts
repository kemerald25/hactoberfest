import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { siteConfig, calculateReadingTime } from "@/lib/site-config";
import { revalidatePath } from "next/cache";

// Constant-time key comparison
function verifyAgentKey(providedKey: string | null): boolean {
  const expectedKey = process.env.AGENT_PUBLISH_KEY;
  if (!expectedKey || !providedKey) return false;

  const expectedBuffer = Buffer.from(expectedKey);
  const providedBuffer = Buffer.from(providedKey);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

// Zod Schema
const PostPublishSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(300),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/i, "Slug must be URL-safe alphanumeric characters and hyphens")
    .transform((val) => val.toLowerCase()),
  content: z.string().min(10, "Content markdown must be at least 10 characters"),
  excerpt: z.string().max(500).optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  source_urls: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url("Source URL must be valid"),
        publisher: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  cover_image: z.string().url("Cover image must be a valid URL").optional().nullable(),
  status: z
    .enum(["draft", "pending_approval", "published", "rejected"])
    .optional()
    .default("pending_approval"),
  seo_title: z.string().max(100).optional().nullable(),
  seo_description: z.string().max(200).optional().nullable(),
  ai_generated: z.boolean().optional().default(true),
  author_name: z.string().optional().default("ReplyIQ Lab Agent"),
  author_avatar: z.string().optional().default("/favicon.jpg"),
});

export async function POST(req: NextRequest) {
  // 1. Authenticate x-agent-key header
  const agentKey = req.headers.get("x-agent-key");
  if (!verifyAgentKey(agentKey)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Invalid or missing x-agent-key header." },
      { status: 401 }
    );
  }

  // 2. Ensure Service Role client is available
  if (!supabaseAdmin) {
    console.error("[API_PUBLISH] Service role client is not configured.");
    return NextResponse.json(
      { success: false, error: "Server database configuration error." },
      { status: 500 }
    );
  }

  // 3. Parse and validate JSON payload
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Malformed JSON payload." },
      { status: 400 }
    );
  }

  const parseResult = PostPublishSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation error",
        issues: parseResult.error.format(),
      },
      { status: 422 }
    );
  }

  const postData = parseResult.data;
  const readingTime = calculateReadingTime(postData.content);

  try {
    // Check if post already exists to maintain published_at if already set
    const { data: existingPost } = await supabaseAdmin
      .from("blog_posts")
      .select("id, published_at, status")
      .eq("slug", postData.slug)
      .maybeSingle();

    let publishedAt: string | null = null;
    if (postData.status === "published") {
      publishedAt = existingPost?.published_at || new Date().toISOString();
    }

    const payload = {
      title: postData.title.trim(),
      slug: postData.slug.trim(),
      content: postData.content.trim(),
      excerpt: postData.excerpt?.trim() || null,
      category: postData.category?.trim() || null,
      tags: postData.tags || [],
      source_urls: postData.source_urls || [],
      cover_image: postData.cover_image?.trim() || null,
      status: postData.status,
      seo_title: postData.seo_title?.trim() || null,
      seo_description: postData.seo_description?.trim() || null,
      ai_generated: postData.ai_generated,
      reading_time: readingTime,
      author_name: postData.author_name || "ReplyIQ Lab Agent",
      author_avatar: postData.author_avatar || "/favicon.jpg",
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    };

    // Idempotent upsert by slug
    const { data: savedPost, error } = await supabaseAdmin
      .from("blog_posts")
      .upsert(payload, { onConflict: "slug" })
      .select()
      .single();

    if (error) {
      console.error("[API_PUBLISH] Database error inserting/updating post:", error.message);
      return NextResponse.json(
        { success: false, error: "Failed to persist article." },
        { status: 500 }
      );
    }

    // Cache revalidation
    if (savedPost.status === "published") {
      revalidatePath("/blog");
      revalidatePath(`/blog/${savedPost.slug}`);
      if (savedPost.category) {
        revalidatePath(`/blog/category/${savedPost.category.toLowerCase().replace(/\s+/g, "-")}`);
      }
      revalidatePath("/sitemap.xml");
      revalidatePath("/blog/rss.xml");
    }

    const postUrl = `${siteConfig.url}/blog/${savedPost.slug}`;

    return NextResponse.json(
      {
        success: true,
        id: savedPost.id,
        slug: savedPost.slug,
        status: savedPost.status,
        url: postUrl,
        reading_time: savedPost.reading_time,
        action: existingPost ? "updated" : "created",
      },
      { status: existingPost ? 200 : 201 }
    );
  } catch (err: any) {
    console.error("[API_PUBLISH] Unhandled error:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
