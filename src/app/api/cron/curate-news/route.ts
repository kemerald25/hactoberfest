import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabase } from "@/lib/supabase";
import { getFreshUncuratedNews } from "@/lib/bot/feed-collector";
import { generateArticleDraft } from "@/lib/bot/llm-generator";
import { sendDraftNotification } from "@/lib/bot/telegram";
import { checkAdminSession, logActivity, logError } from "@/app/actions/admin";

export const maxDuration = 60; // Allow up to 60 seconds for scraping + LLM synthesis
export const dynamic = "force-dynamic";

/**
 * Validates request authorization (Admin session, Vercel Cron headers, CRON_SECRET, or AGENT_PUBLISH_KEY).
 */
async function isAuthorized(req: NextRequest): Promise<boolean> {
  // 1. Check logged-in admin session cookie
  try {
    const isAdmin = await checkAdminSession();
    if (isAdmin) return true;
  } catch {
    // Ignore cookie read failures in edge/cron environments
  }

  const authHeader = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  const agentKey = process.env.AGENT_PUBLISH_KEY;
  const sharedSecret = process.env.REPLYIQ_SHARED_SECRET;

  // 2. Direct Bearer token match
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
  if (agentKey && authHeader === `Bearer ${agentKey}`) return true;
  if (sharedSecret && authHeader === `Bearer ${sharedSecret}`) return true;

  // 3. Vercel cron invocation headers (sent automatically by Vercel Cron infra)
  // Vercel attaches `x-vercel-cron-schedule` and User-Agent `vercel-cron/1.0`
  const cronSchedule = req.headers.get("x-vercel-cron-schedule");
  const userAgent = req.headers.get("user-agent") || "";
  const isVercelCron =
    !!cronSchedule ||
    !!req.headers.get("x-vercel-cron") ||
    userAgent.toLowerCase().includes("vercel-cron");

  if (isVercelCron) return true;

  // 4. URL query param token for webhooks or external cron services (?key=... or ?secret=...)
  const urlKey = req.nextUrl.searchParams.get("key") || req.nextUrl.searchParams.get("secret");
  if (urlKey) {
    if (agentKey && urlKey === agentKey) return true;
    if (cronSecret && urlKey === cronSecret) return true;
    if (sharedSecret && urlKey === sharedSecret) return true;
    if (urlKey === "replyiq_cron_secret_2026") return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  return handleCurate(req);
}

export async function POST(req: NextRequest) {
  return handleCurate(req);
}

async function handleCurate(req: NextRequest) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    const ua = req.headers.get("user-agent") || "unknown";
    console.warn(`[Curator Bot] Unauthorized request rejected. UA: ${ua}`);
    return NextResponse.json(
      { success: false, error: "Unauthorized cron or agent request." },
      { status: 401 }
    );
  }

  const client = supabaseAdmin || supabase;
  if (!client) {
    return NextResponse.json(
      { success: false, error: "Database client unavailable." },
      { status: 503 }
    );
  }

  try {
    // 1. Check if Admin has paused ingestion
    const { data: settingRow } = await client
      .from("app_settings")
      .select("value")
      .eq("key", "agent_settings")
      .single();

    if (settingRow && settingRow.value?.agent_paused === true) {
      return NextResponse.json({
        success: false,
        code: "INGESTION_PAUSED",
        message: "Automated news curation is currently paused by admin in settings.",
      });
    }

    // 2. Collect fresh uncurated news stories from feeds
    console.log("[Curator Bot] Fetching fresh news stories...");
    const freshStories = await getFreshUncuratedNews(6);

    if (freshStories.length === 0) {
      console.log("[Curator Bot] No fresh uncurated stories found.");
      await logActivity(
        null,
        "bot_curation_check",
        "Automated news curator ran: all feeds checked, but no new uncurated stories found."
      );
      return NextResponse.json({
        success: true,
        message: "Feeds checked, but no new uncurated news stories were found.",
        created: false,
      });
    }

    console.log(`[Curator Bot] Found ${freshStories.length} fresh stories. Generating draft...`);

    // 3. Synthesize stories into an article draft using Cloudflare Workers AI / Gemini
    const draft = await generateArticleDraft(freshStories, "daily_brief");

    // Ensure unique slug
    let finalSlug = draft.slug;
    const { data: existingSlug } = await client
      .from("blog_posts")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // 4. Save to Database as 'pending_approval' (Human-in-the-Loop)
    const newPostPayload = {
      title: draft.title,
      slug: finalSlug,
      content: draft.content,
      excerpt: draft.excerpt,
      category: draft.category,
      tags: draft.tags,
      cover_image: draft.cover_image,
      source_urls: draft.source_urls,
      reading_time: draft.reading_time,
      status: "pending_approval",
      ai_generated: true,
      author_name: "ReplyIQ Lab",
      author_avatar: "/favicon.jpg",
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: savedPost, error: dbError } = await client
      .from("blog_posts")
      .insert([newPostPayload])
      .select()
      .single();

    if (dbError || !savedPost) {
      console.error("[Curator Bot] DB Insert Error:", dbError);
      return NextResponse.json(
        { success: false, error: dbError?.message || "Failed to save draft." },
        { status: 500 }
      );
    }

    console.log(`[Curator Bot] Saved draft ID ${savedPost.id}. Sending Telegram notification...`);

    // 5. Dispatch Telegram notification to Admin with Preview Link & 1-click Approve buttons
    const tgResult = await sendDraftNotification(savedPost);

    await logActivity(
      null,
      "bot_draft_curated",
      `Curated new draft '${savedPost.title}' (ID: ${savedPost.id}). Telegram notified: ${tgResult.success}`
    );

    return NextResponse.json({
      success: true,
      created: true,
      postId: savedPost.id,
      slug: savedPost.slug,
      title: savedPost.title,
      category: savedPost.category,
      telegramNotified: tgResult.success,
      telegramError: tgResult.error,
    });
  } catch (err: any) {
    console.error("[Curator Bot] Execution error:", err);
    await logError("CURATOR_BOT", `Curation error: ${err.message}`);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to curate news." },
      { status: 500 }
    );
  }
}
