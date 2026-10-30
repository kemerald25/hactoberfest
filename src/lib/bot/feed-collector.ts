import { supabaseAdmin, supabase } from "@/lib/supabase";

export interface RawNewsItem {
  title: string;
  url: string;
  publisher: string;
  pubDate: string;
  snippet: string;
  imageUrl?: string;
}

const ACTIVE_FEEDS = [
  // Tier 1: Core Tech & Startups (Dedicated Technology Publications)
  {
    publisher: "TechCabal",
    url: "https://techcabal.com/feed/",
  },
  {
    publisher: "TechNext",
    url: "https://technext24.com/feed/",
  },
  {
    publisher: "Techpoint Africa",
    url: "https://news.google.com/rss/search?q=site:techpoint.africa&hl=en-NG&gl=NG&ceid=NG:en",
  },
  {
    publisher: "The Condia",
    url: "https://thecondia.com/rss/",
  },
  {
    publisher: "Disrupt Africa",
    url: "https://old.disruptafrica.com/feed/",
  },
  {
    publisher: "WeeTracker",
    url: "https://weetracker.com/feed/",
  },
  {
    publisher: "Ventureburn",
    url: "https://ventureburn.com/feed/",
  },

  // Tier 2: Nigerian Fintech, Financial Services & Enterprise Technology
  {
    publisher: "Nairametrics Fintech",
    url: "https://nairametrics.com/category/financial-services/feed/",
  },
  {
    publisher: "BusinessDay Technology",
    url: "https://businessday.ng/category/technology/feed/",
  },
];

/**
 * Strips HTML tags and decodes common XML entities.
 */
function cleanText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts items from an RSS 2.0 XML string without heavy dependencies.
 */
function parseRssXml(xml: string, publisher: string): RawNewsItem[] {
  const items: RawNewsItem[] = [];
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title[\s\S]*?>([\s\S]*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link[\s\S]*?>([\s\S]*?)<\/link>/i);
    const pubDateMatch = itemXml.match(/<pubDate[\s\S]*?>([\s\S]*?)<\/pubDate>/i);
    const descMatch =
      itemXml.match(/<content:encoded[\s\S]*?>([\s\S]*?)<\/content:encoded>/i) ||
      itemXml.match(/<description[\s\S]*?>([\s\S]*?)<\/description>/i);

    const title = cleanText(titleMatch ? titleMatch[1] : "");
    let url = (linkMatch ? linkMatch[1] : "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
    // In some WordPress feeds, link tag is <link href="..." /> or text content
    if (!url) {
      const hrefMatch = itemXml.match(/<link[^>]+href="([^"]+)"/i);
      if (hrefMatch) url = hrefMatch[1].trim();
    }
    const pubDate = cleanText(pubDateMatch ? pubDateMatch[1] : "");
    const snippet = cleanText(descMatch ? descMatch[1] : "").slice(0, 500);

    // Extract real image from RSS XML if present
    let rawImageUrl = "";
    const mediaContentMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
    const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    const thumbnailMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
    const rawDesc = descMatch ? descMatch[1] : "";
    const imgTagMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
    const wpFeaturedMatch = itemXml.match(/<(?:wp:)?featured_image[^>]*>([^<]+)<\//i);

    if (mediaContentMatch && mediaContentMatch[1]) rawImageUrl = mediaContentMatch[1];
    else if (enclosureMatch && enclosureMatch[1]) rawImageUrl = enclosureMatch[1];
    else if (wpFeaturedMatch && wpFeaturedMatch[1]) rawImageUrl = wpFeaturedMatch[1];
    else if (thumbnailMatch && thumbnailMatch[1]) rawImageUrl = thumbnailMatch[1];
    else if (imgTagMatch && imgTagMatch[1]) rawImageUrl = imgTagMatch[1];

    let imageUrl: string | undefined = undefined;
    if (rawImageUrl) {
      const cleanImg = rawImageUrl.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
      if (
        cleanImg.startsWith("http") &&
        !cleanImg.includes("gravatar.com") &&
        !cleanImg.includes("feedburner.com") &&
        !cleanImg.includes("1x1") &&
        !cleanImg.endsWith(".svg")
      ) {
        imageUrl = cleanImg;
      }
    }

    if (title && url && url.startsWith("http")) {
      items.push({
        title,
        url,
        publisher,
        pubDate: pubDate || new Date().toISOString(),
        snippet,
        imageUrl,
      });
    }
  }

  return items;
}

/**
 * Fetches the open graph image directly from a source news article URL
 */
async function fetchArticleOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;

    const html = await res.text();
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

    if (ogMatch && ogMatch[1] && ogMatch[1].startsWith("http")) {
      const cleanOg = ogMatch[1].trim();
      if (!cleanOg.includes("gravatar.com") && !cleanOg.includes("1x1") && !cleanOg.endsWith(".svg")) {
        return cleanOg;
      }
    }
  } catch {
    // Ignore timeout / network errors
  }
  return null;
}

/**
 * Fetches an individual RSS feed with timeout and custom User-Agent.
 */
async function fetchFeed(feed: { publisher: string; url: string }): Promise<RawNewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReplyIQLabBot/1.0",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[Feed Collector] ${feed.publisher} returned HTTP ${res.status}`);
      return [];
    }

    const xmlText = await res.text();
    return parseRssXml(xmlText, feed.publisher);
  } catch (err: any) {
    console.warn(`[Feed Collector] Failed to fetch ${feed.publisher}: ${err.message}`);
    return [];
  }
}

/**
 * Collects fresh, uncurated stories from all target feeds and filters out previously covered stories.
 */
export async function getFreshUncuratedNews(limit: number = 8): Promise<RawNewsItem[]> {
  // 1. Fetch all feeds in parallel
  const feedPromises = ACTIVE_FEEDS.map((feed) => fetchFeed(feed));
  const results = await Promise.allSettled(feedPromises);

  const allItems: RawNewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      allItems.push(...r.value);
    }
  }

  if (allItems.length === 0) {
    return [];
  }

  // 2. Fetch existing recent source URLs and titles from Supabase to prevent duplicates
  const client = supabaseAdmin || supabase;
  const existingUrls = new Set<string>();
  const existingTitles = new Set<string>();

  if (client) {
    try {
      const { data: recentPosts } = await client
        .from("blog_posts")
        .select("title, source_urls")
        .order("created_at", { ascending: false })
        .limit(40);

      if (recentPosts) {
        for (const p of recentPosts) {
          if (p.title) existingTitles.add(p.title.toLowerCase().trim());
          if (Array.isArray(p.source_urls)) {
            for (const s of p.source_urls) {
              if (s && s.url) existingUrls.add(s.url.trim().toLowerCase());
            }
          }
        }
      }
    } catch (err) {
      console.warn("[Feed Collector] Could not check existing posts:", err);
    }
  }

  // 3. Filter out duplicates & items already seen
  const freshItems: RawNewsItem[] = [];
  const seenUrlsInBatch = new Set<string>();

  for (const item of allItems) {
    const cleanUrl = item.url.trim().toLowerCase();
    const cleanTitle = item.title.trim().toLowerCase();

    if (seenUrlsInBatch.has(cleanUrl)) continue;
    seenUrlsInBatch.add(cleanUrl);

    if (existingUrls.has(cleanUrl)) continue;
    if (existingTitles.has(cleanTitle)) continue;

    freshItems.push(item);
  }

  // 4. Sort fresh items by recency
  freshItems.sort((a, b) => {
    const timeA = new Date(a.pubDate).getTime() || 0;
    const timeB = new Date(b.pubDate).getTime() || 0;
    return timeB - timeA;
  });

  // 5. Enforce publisher diversity: maximum 2 stories per publisher
  const diversifiedItems: RawNewsItem[] = [];
  const publisherCounts = new Map<string, number>();

  for (const item of freshItems) {
    const currentCount = publisherCounts.get(item.publisher) || 0;
    if (currentCount < 2) {
      diversifiedItems.push(item);
      publisherCounts.set(item.publisher, currentCount + 1);
      if (diversifiedItems.length >= limit) break;
    }
  }

  // If still below target limit, fill with remaining fresh items
  if (diversifiedItems.length < limit) {
    for (const item of freshItems) {
      if (!diversifiedItems.includes(item)) {
        diversifiedItems.push(item);
        if (diversifiedItems.length >= limit) break;
      }
    }
  }

  const selectedItems = diversifiedItems.slice(0, limit);

  // 6. Enrich chosen stories with real cover images from article og:image if missing from RSS
  await Promise.allSettled(
    selectedItems.map(async (item) => {
      if (!item.imageUrl) {
        const ogImg = await fetchArticleOgImage(item.url);
        if (ogImg) item.imageUrl = ogImg;
      }
    })
  );

  return selectedItems;
}

