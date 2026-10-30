import { ImageResponse } from "next/og";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";
export const alt = "TaskBridge Lab Article";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let post: any = null;
  const client = supabaseAdmin || supabase;
  if (client) {
    try {
      const { data } = await client
        .from("blog_posts")
        .select("title, seo_title, category, author_name, reading_time")
        .eq("slug", slug)
        .maybeSingle();
      post = data;
    } catch {
      post = null;
    }
  }

  const title = post?.seo_title || post?.title || "TaskBridge Lab Insights";
  const category = post?.category || "Nigerian Tech";
  const author = post?.author_name || "TaskBridge Team";
  const readingTime = post?.reading_time ? `${post.reading_time} min read` : "3 min read";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #060810 0%, #0F0A28 50%, #150D3A 100%)",
          color: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Glow decoration */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
          }}
        />

        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 22,
                color: "#FFFFFF",
              }}
            >
              R
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>TaskBridge Lab</span>
              <span style={{ fontSize: 13, color: "#A78BFA", letterSpacing: "1px", textTransform: "uppercase" }}>
                Nigerian Tech &amp; SME Hub
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "8px 18px",
              borderRadius: 30,
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              color: "#C4B5FD",
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {category}
          </div>
        </div>

        {/* Main Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "1000px",
            zIndex: 10,
            margin: "20px 0",
          }}
        >
          <div
            style={{
              fontSize: title.length > 70 ? 46 : 56,
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              color: "#FFFFFF",
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "24px",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span style={{ fontSize: 16, color: "#E2E8F0", fontWeight: 600 }}>By {author}</span>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>•</span>
            <span style={{ fontSize: 16, color: "#A78BFA", fontWeight: 600 }}>{readingTime}</span>
          </div>

          <div style={{ fontSize: 15, color: "#94A3B8", letterSpacing: "0.5px" }}>
            www.taskbridge.ai/blog
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
