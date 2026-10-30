import { RawNewsItem } from "./feed-collector";
import { calculateReadingTime } from "@/lib/site-config";

export interface GeneratedArticleDraft {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: "Daily Brief" | "AI & Tech" | "Funding & Startups" | "SME & Retail" | "Policy & Telco";
  tags: string[];
  cover_image: string;
  source_urls: { title: string; url: string; publisher?: string }[];
  reading_time: number;
  ai_generated: boolean;
}

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80", // Tech analytics
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80", // Business chart
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80", // Digital finance
  "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80", // Money / economy
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80", // Modern workspace
];

/**
 * Calls Cloudflare Workers AI Llama model to generate structured article content.
 */
async function callCloudflareLlama(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) return null;

  try {
    // Prefer Llama 3.3 70B, fallback to Llama 3.1 8B fast if needed
    const model = "@cf/meta/llama-3.3-70b-instruct";
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 3500,
          temperature: 0.3,
        }),
      }
    );

    const data = await res.json();
    if (data.success && data.result?.response) {
      return data.result.response;
    }

    // Try fallback fast model if 70B fails
    const fallbackRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct-fast`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 3000,
          temperature: 0.3,
        }),
      }
    );
    const fallbackData = await fallbackRes.json();
    if (fallbackData.success && fallbackData.result?.response) {
      return fallbackData.result.response;
    }
  } catch (err) {
    console.warn("[LLM Generator] Cloudflare AI error:", err);
  }
  return null;
}

/**
 * Calls Google Gemini 1.5 if GEMINI_API_KEY is available.
 */
async function callGemini(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!geminiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 3500,
          responseMimeType: "application/json",
        },
      }),
    });

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidate) return candidate;
  } catch (err) {
    console.warn("[LLM Generator] Gemini API error:", err);
  }
  return null;
}

/**
 * Sanitizes control characters (raw newlines, carriage returns, tabs) inside JSON string literals.
 */
function sanitizeJsonString(str: string): string {
  let insideString = false;
  let isEscaped = false;
  let result = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = str.charCodeAt(i);

    if (char === '"' && !isEscaped) {
      insideString = !insideString;
      result += char;
    } else if (insideString) {
      if (isEscaped) {
        result += char;
        isEscaped = false;
      } else if (char === "\\") {
        result += char;
        isEscaped = true;
      } else if (char === "\n") {
        result += "\\n";
      } else if (char === "\r") {
        result += "\\r";
      } else if (char === "\t") {
        result += "\\t";
      } else if (code < 32) {
        result += " ";
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Strips raw JSON formatting or field keys from content if the LLM leaked them.
 */
function cleanArticleContent(rawContent: string): string {
  let text = (rawContent || "").trim();

  // If the content starts with raw JSON fields like "title": "..." or {"title":
  if (
    /^\{?\s*"title"\s*:/i.test(text) ||
    /^\{?\s*"slug"\s*:/i.test(text) ||
    /^\{?\s*"category"\s*:/i.test(text)
  ) {
    const nestedMatch = text.match(/"content"\s*:\s*"([\s\S]*)/i);
    if (nestedMatch) {
      text = nestedMatch[1]
        .replace(/"\s*,\s*"tags"[\s\S]*$/i, "")
        .replace(/"\s*\}\s*$/i, "")
        .replace(/"\s*$/i, "");
    } else {
      text = text.replace(/^[^{]*\{/, "").replace(/\}[^}]*$/, "");
    }
  }

  // Also strip any leading '"content": "' or trailing '"}' if present
  text = text.replace(/^"content"\s*:\s*"/i, "");
  text = text.replace(/"\s*\}\s*$/i, "");

  return text
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .trim();
}

/**
 * Parses raw JSON output from LLM, stripping any surrounding markdown code fences
 * and automatically escaping any raw unescaped newlines/tabs inside string literals.
 */
function extractJsonFromLlmOutput(raw: string): any {
  let cleaned = raw.trim();
  // Strip ```json ... ``` or ``` ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  // Find first { and last }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  } else if (firstBrace !== -1 && lastBrace === -1) {
    cleaned = cleaned.substring(firstBrace) + '\n"}';
  }

  // 1. Try direct standard parse
  try {
    const res = JSON.parse(cleaned);
    if (res && typeof res === "object") {
      res.content = cleanArticleContent(res.content || "");
      return res;
    }
  } catch {
    // 2. Sanitize unescaped newlines/tabs inside string values
    try {
      let sanitized = sanitizeJsonString(cleaned);
      if (!sanitized.trim().endsWith("}")) {
        let patched = sanitized.trim();
        if (!patched.endsWith('"')) patched += '"';
        patched += "\n}";
        try {
          const res = JSON.parse(patched);
          if (res && typeof res === "object") {
            res.content = cleanArticleContent(res.content || "");
            return res;
          }
        } catch {}
      }
      const res = JSON.parse(sanitized);
      if (res && typeof res === "object") {
        res.content = cleanArticleContent(res.content || "");
        return res;
      }
    } catch {
      // 3. Fallback: extract fields via regex
      const titleMatch = cleaned.match(/"title"\s*:\s*"([^"]+)"/i);
      const slugMatch = cleaned.match(/"slug"\s*:\s*"([^"]+)"/i);
      const excerptMatch = cleaned.match(/"excerpt"\s*:\s*"([^"]+)"/i);
      const categoryMatch = cleaned.match(/"category"\s*:\s*"([^"]+)"/i);

      let cleanContent = "";
      const contentMatch = cleaned.match(/"content"\s*:\s*"([\s\S]*)/i);
      if (contentMatch) {
        cleanContent = cleanArticleContent(contentMatch[1]);
      } else {
        cleanContent = cleanArticleContent(cleaned);
      }

      return {
        title: titleMatch ? titleMatch[1] : "Nigerian Tech Daily Brief",
        slug: slugMatch ? slugMatch[1] : `tech-brief-${Date.now()}`,
        excerpt: excerptMatch ? excerptMatch[1] : "Daily Nigerian tech and SME intelligence.",
        category: categoryMatch ? categoryMatch[1] : "Daily Brief",
        content: cleanContent,
        tags: ["nigeria tech", "sme", "fintech"],
      };
    }
  }
}

/**
 * Synthesizes raw news items into a high-quality, localized Nigerian tech blog post draft.
 */
export async function generateArticleDraft(
  newsItems: RawNewsItem[],
  mode: "daily_brief" | "deep_dive" = "daily_brief"
): Promise<GeneratedArticleDraft> {
  if (newsItems.length === 0) {
    throw new Error("No news items provided for generation.");
  }

  const systemPrompt = `You are an elite Nigerian Tech Journalist & Senior Business Analyst writing for "ReplyIQ Lab" (the research arm of ReplyIQ at https://www.replyiq.cv).
Your audience is Nigerian business owners, startup founders, tech professionals, and SME operators in Lagos, Abuja, Port Harcourt, and across Africa.

EDITORIAL PRINCIPLES:
1. Tone: Authoritative, analytical, crisp, and localized. Understand Nigerian reality (NIBSS, CBN directives, naira volatility, POS agent banking, WhatsApp as the primary business operating system).
2. Never invent false facts, fake funding figures, or fictional founders. Rely strictly on the provided real news stories.
3. Explicitly attribute every story to its original source publication (e.g. TechCabal, TechNext, BusinessDay, Nairametrics).
4. Connect broader macro/tech movements to practical SME execution: How does fast customer communication, prompt WhatsApp responses, and business availability help retailers and service firms win during these shifts?
5. The output MUST be raw, valid JSON only (no conversational intro, no markdown wrapper around the JSON).
6. CRITICAL: The "content" field value must contain ONLY the article Markdown body (starting with ## headings). NEVER output "title", "slug", or JSON syntax inside the "content" string.

JSON SCHEMA REQUIRED:
{
  "title": "String (Punchy, SEO-optimized, maximum 75 characters. For daily brief, e.g. 'Nigerian Tech Daily: [Headline Hook]')",
  "slug": "String (lowercase-kebab-case-slug-with-year-e.g.-cbn-fintech-rules-2026)",
  "excerpt": "String (1-2 sentences summarizing the key takeaways for SMEs, under 160 characters)",
  "category": "String (Must be EXACTLY one of: 'Daily Brief', 'AI & Tech', 'Funding & Startups', 'SME & Retail', 'Policy & Telco')",
  "content": "String (Comprehensive Markdown formatted with ## and ### headers, bullet points, source attributions, and a concluding 'The Takeaway for Nigerian SMEs' section. Aim for 450 to 800 words)",
  "tags": ["Array of 3-5 lowercase strings like 'fintech', 'cbn', 'whatsapp automation', 'nigeria tech'"]
}`;

  const newsContext = newsItems
    .map(
      (item, idx) => `[STORY ${idx + 1}]
Publisher: ${item.publisher}
Title: ${item.title}
Published: ${item.pubDate}
URL: ${item.url}
Snippet: ${item.snippet}
`
    )
    .join("\n---\n");

  const userPrompt =
    mode === "daily_brief"
      ? `Write a comprehensive "Daily Brief" summarizing the top Nigerian tech developments from these stories.
Category must be "Daily Brief".

NEWS STORIES TO SYNTHESIZE:
${newsContext}

Include:
1. An engaging 2-sentence opening overview of today's tech climate.
2. Structured breakdown of 2-4 primary developments (with "What Happened" and "Why It Matters").
3. A strategic closing section titled "### The Takeaway for Nigerian Businesses & SME Operators" highlighting the necessity of rapid response times and customer availability.
`
      : `Write an in-depth analytical playbook / guide based on the most impactful story among these:
NEWS STORIES TO SELECT FROM:
${newsContext}

Choose the story with the highest impact on Nigerian businesses and SMEs.
`;

  // 1. Try Cloudflare Workers AI first
  let rawResponse = await callCloudflareLlama(systemPrompt, userPrompt);

  // 2. Fallback to Gemini if Cloudflare failed
  if (!rawResponse) {
    rawResponse = await callGemini(systemPrompt, userPrompt);
  }

  if (!rawResponse) {
    throw new Error(
      "Both Cloudflare Workers AI and Google Gemini failed to respond. Check API keys in .env."
    );
  }

  const parsed = extractJsonFromLlmOutput(rawResponse);

  const cleanSlug = String(parsed.slug || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const readingTime = calculateReadingTime(parsed.content || "");
  
  // Use real cover image from the lead original news source
  const realCoverImage = newsItems.find(
    (n) => n.imageUrl && typeof n.imageUrl === "string" && n.imageUrl.startsWith("http")
  )?.imageUrl;
  const coverImage = realCoverImage || FALLBACK_COVERS[Math.floor(Math.random() * FALLBACK_COVERS.length)];

  const sourceUrls = newsItems.map((n) => ({
    title: n.title,
    url: n.url,
    publisher: n.publisher,
  }));

  return {
    title: String(parsed.title || "Nigerian Tech Intelligence Brief").slice(0, 95),
    slug: cleanSlug || `nigerian-tech-brief-${Date.now()}`,
    excerpt: String(parsed.excerpt || "").slice(0, 200),
    content: String(parsed.content || ""),
    category: parsed.category || (mode === "daily_brief" ? "Daily Brief" : "AI & Tech"),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : ["nigeria tech", "sme"],
    cover_image: coverImage,
    source_urls: sourceUrls,
    reading_time: Math.max(2, readingTime),
    ai_generated: true,
  };
}
