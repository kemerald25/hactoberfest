import { supabaseAdmin, supabase } from "@/lib/supabase";

/**
 * Resolves active LinkedIn credentials from process.env or Supabase app_settings
 */
export async function getLinkedInConfig(): Promise<{ token: string; orgId: string }> {
  let token = (process.env.LINKEDIN_ACCESS_TOKEN || "").trim();
  let orgId = (process.env.LINKEDIN_ORGANIZATION_ID || "120793916").trim();

  // If token is missing, check Supabase app_settings fallback
  if (!token) {
    const client = supabaseAdmin || supabase;
    if (client) {
      try {
        const { data } = await client
          .from("app_settings")
          .select("value")
          .eq("key", "linkedin_config")
          .maybeSingle();

        if (data?.value?.access_token) {
          token = String(data.value.access_token).trim();
        }
        if (data?.value?.org_id) {
          orgId = String(data.value.org_id).trim();
        }
      } catch (err) {
        console.warn("[LinkedIn Config] Error fetching from app_settings:", err);
      }
    }
  }

  return { token, orgId };
}

/**
 * Tests LinkedIn connection using the configured credentials
 */
export async function testLinkedInConnection() {
  const { token, orgId } = await getLinkedInConfig();

  if (!token) {
    return {
      success: false,
      error: "No LINKEDIN_ACCESS_TOKEN found. Please ensure it is added to your Vercel Environment Variables.",
    };
  }

  if (token.startsWith("WPL_AP")) {
    return {
      success: false,
      error: "The provided token starts with 'WPL_AP' (Webhook Key), not an OAuth Bearer token. LinkedIn Access Tokens start with 'AQ...'.",
    };
  }

  try {
    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: body?.message || `LinkedIn authentication failed (HTTP ${res.status}). Token might be expired or invalid.`,
      };
    }

    // Check if token has organization-level permissions
    const orgCheckRes = await fetch("https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    const hasOrgAccess = orgCheckRes.ok;

    return {
      success: true,
      hasOrgAccess,
      message: hasOrgAccess
        ? `✅ LinkedIn Connected! Authenticated as ${body.name || "Admin"} with full Company Page publishing rights (Org ID: ${orgId}).`
        : `✅ LinkedIn Connected! Authenticated as ${body.name || "Admin"}. Ready to automatically share approved articles with rich link previews and hashtags!`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach LinkedIn API." };
  }
}

/**
 * Downloads image bytes once into memory with timeout
 */
async function downloadImageBuffer(imageUrl: string): Promise<{ buffer: Uint8Array; contentType: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const imgRes = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReplyIQLabBot/1.0",
      },
    });
    clearTimeout(timeoutId);

    if (!imgRes.ok) {
      console.warn(`[LinkedIn Image Download] Failed to download image from ${imageUrl} (HTTP ${imgRes.status})`);
      return null;
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    return { buffer, contentType };
  } catch (err: any) {
    console.warn(`[LinkedIn Image Download] Failed to download ${imageUrl}: ${err.message}`);
    return null;
  }
}

/**
 * Uploads an image binary directly to LinkedIn assets API and returns an asset URN (urn:li:digitalmediaAsset:...)
 */
async function uploadImageToLinkedIn(
  image: { buffer: Uint8Array; contentType: string },
  token: string,
  ownerUrn: string
): Promise<string | null> {
  try {
    // 1. Register image upload with LinkedIn
    const regRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: ownerUrn,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    });

    if (!regRes.ok) {
      console.warn(`[LinkedIn Image Upload] Register upload failed: HTTP ${regRes.status}`);
      return null;
    }

    const regData = await regRes.json();
    const uploadUrl =
      regData?.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?.uploadUrl;
    const assetUrn = regData?.value?.asset;

    if (!uploadUrl || !assetUrn) return null;

    // 2. Upload binary bytes
    const upRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": image.contentType,
      },
      body: image.buffer as any,
    });

    if (!upRes.ok) {
      console.warn(`[LinkedIn Image Upload] Binary upload failed: HTTP ${upRes.status}`);
      return null;
    }

    return assetUrn;
  } catch (err: any) {
    console.warn(`[LinkedIn Image Upload] Failed: ${err.message}`);
    return null;
  }
}

/**
 * Publishes an approved blog post to LinkedIn.
 * Automatically tries the company page URN first, with seamless fallback to the verified founder/admin account.
 */
export async function publishPostToLinkedIn(
  post: {
    title: string;
    slug: string;
    excerpt?: string | null;
    category?: string | null;
    reading_time?: number | null;
    cover_image?: string | null;
  }
): Promise<{
  success: boolean;
  error?: string;
  postId?: string;
  target?: "organization" | "person";
  authorName?: string;
}> {
  const { token, orgId } = await getLinkedInConfig();
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.replyiq.cv";
  const siteUrl = rawSiteUrl.trim().replace(/\/+$/, "");
  const liveUrl = `${siteUrl}/blog/${post.slug}`;

  if (!token) {
    console.warn("[LinkedIn Auto-Post] Skipped: LINKEDIN_ACCESS_TOKEN not set.");
    return { success: false, error: "LinkedIn credentials not configured in environment variables." };
  }

  if (token.startsWith("WPL_AP")) {
    console.warn("[LinkedIn Auto-Post] Skipped: Provided token is a Webhook Key (starts with WPL_AP).");
    return {
      success: false,
      error: "Provided LINKEDIN_ACCESS_TOKEN starts with 'WPL_AP'. An OAuth Access Token starting with 'AQ...' is required.",
    };
  }

  try {
    const categoryTag = (post.category || "Tech").replace(/[^a-zA-Z0-9]/g, "");
    const commentary = [
      `🚀 NEW ON REPLYIQ LAB: ${post.title}`,
      ``,
      post.excerpt ? `${post.excerpt}\n` : "",
      `📖 Read the complete story and SME strategic breakdown:`,
      liveUrl,
      ``,
      `🏢 Powered by ReplyIQ: ${siteUrl}`,
      `#NigeriaTech #${categoryTag} #Fintech #Startups #ReplyIQLab #AfricanTech`,
    ]
      .filter((line) => line !== undefined)
      .join("\n");

    const buildPayload = (authorUrn: string, assetUrn: string | null) => {
      const isImage = !!assetUrn;
      return {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: commentary,
            },
            shareMediaCategory: isImage ? "IMAGE" : "ARTICLE",
            media: [
              isImage
                ? {
                    status: "READY",
                    description: {
                      text: post.excerpt || "Daily Nigerian Tech & Business Intelligence from ReplyIQ Lab.",
                    },
                    media: assetUrn,
                    title: {
                      text: post.title,
                    },
                  }
                : {
                    status: "READY",
                    description: {
                      text: post.excerpt || "Daily Nigerian Tech & Business Intelligence from ReplyIQ Lab.",
                    },
                    originalUrl: liveUrl,
                    title: {
                      text: post.title,
                    },
                  },
            ],
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };
    };

    // Download image once if cover_image exists
    let downloadedImage: { buffer: Uint8Array; contentType: string } | null = null;
    if (post.cover_image && post.cover_image.startsWith("http")) {
      downloadedImage = await downloadImageBuffer(post.cover_image);
    }

    // 1. Try uploading cover image directly for Organization post
    let orgAssetUrn: string | null = null;
    if (downloadedImage) {
      orgAssetUrn = await uploadImageToLinkedIn(
        downloadedImage,
        token,
        `urn:li:organization:${orgId}`
      );
    }

    const orgPayload = buildPayload(`urn:li:organization:${orgId}`, orgAssetUrn);

    // 2. Try publishing to official Company Page
    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orgPayload),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.id) {
      console.log(`[LinkedIn Auto-Post] Successfully shared to LinkedIn organization page ${orgId}:`, data.id);
      return { success: true, postId: data.id, target: "organization" };
    }

    // 3. If organization post fails, fall back gracefully to verified account profile
    console.warn("[LinkedIn Auto-Post] Org post attempt failed, attempting verified account profile fallback:", data);
    try {
      const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      if (userData?.sub) {
        const personUrn = `urn:li:person:${userData.sub}`;

        let personAssetUrn: string | null = null;
        if (downloadedImage) {
          personAssetUrn = await uploadImageToLinkedIn(downloadedImage, token, personUrn);
        }

        const personPayload = buildPayload(personUrn, personAssetUrn);

        const personRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(personPayload),
        });
        const personData = await personRes.json().catch(() => null);
        if (personRes.ok && personData?.id) {
          console.log(`[LinkedIn Auto-Post] Successfully shared via authenticated account (${userData.name || userData.sub}):`, personData.id);
          return { success: true, postId: personData.id, target: "person", authorName: userData.name };
        }
      }
    } catch (fallbackErr) {
      console.error("[LinkedIn Auto-Post] Account profile fallback error:", fallbackErr);
    }

    console.error("[LinkedIn Auto-Post] API Error:", data);
    return {
      success: false,
      error: data?.message || `LinkedIn API error ${res.status}: ${JSON.stringify(data)}`,
    };
  } catch (err: any) {
    console.error("[LinkedIn Auto-Post] Network Error:", err);
    return { success: false, error: err.message };
  }
}
