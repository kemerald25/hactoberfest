import { getBlogPosts } from "@/app/actions/blog";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600; // 1 hour

export async function GET() {
  const res = await getBlogPosts({ limit: 50 });
  const posts = res.success ? res.data : [];

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${siteConfig.url}/blog/${post.slug}`;
      const pubDate = new Date(post.published_at || post.created_at).toUTCString();
      const escapedTitle = escapeXml(post.title);
      const escapedExcerpt = escapeXml(post.excerpt || post.content.substring(0, 200));
      const categoryTag = post.category ? `<category>${escapeXml(post.category)}</category>` : "";

      return `
    <item>
      <title>${escapedTitle}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapedExcerpt}</description>
      ${categoryTag}
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${escapeXml(post.author_name || "TaskBridge Team")}</dc:creator>
    </item>`;
    })
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.hubName)} — Nigerian Tech Intelligence &amp; SME Insights</title>
    <link>${siteConfig.url}/blog</link>
    <description>${escapeXml(siteConfig.hubDescription)}</description>
    <language>en-NG</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
