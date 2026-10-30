import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { siteConfig } from "@/lib/site-config";
import { revalidatePath } from "next/cache";
import { checkAdminSession } from "@/app/actions/admin";

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

const StatusSchema = z.object({
  status: z.enum(["pending_approval", "published", "rejected", "draft"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Authorization: either valid x-agent-key header or active admin session cookie
  const agentKey = req.headers.get("x-agent-key");
  const isAgentAuth = verifyAgentKey(agentKey);
  const isAdminAuth = await checkAdminSession();

  if (!isAgentAuth && !isAdminAuth) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Valid x-agent-key header or admin session required." },
      { status: 401 }
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, error: "Database service role not configured." },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Malformed JSON payload." }, { status: 400 });
  }

  const parseResult = StatusSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: "Invalid status value. Must be 'pending_approval', 'published', or 'rejected'." },
      { status: 422 }
    );
  }

  const { status } = parseResult.data;

  try {
    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "published") {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[API_STATUS_UPDATE] Database error:", error.message);
      return NextResponse.json(
        { success: false, error: "Failed to update article status." },
        { status: 500 }
      );
    }

    revalidatePath("/blog");
    if (post?.slug) {
      revalidatePath(`/blog/${post.slug}`);
      if (post.category) {
        revalidatePath(`/blog/category/${post.category.toLowerCase().replace(/\s+/g, "-")}`);
      }
    }
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      success: true,
      id: post.id,
      slug: post.slug,
      status: post.status,
      url: `${siteConfig.url}/blog/${post.slug}`,
    });
  } catch (err: any) {
    console.error("[API_STATUS_UPDATE] Unhandled error:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
