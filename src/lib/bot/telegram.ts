import { BlogPostItem } from "@/app/actions/blog";
import { generatePreviewToken } from "@/lib/bot/preview-token";
import { supabaseAdmin, supabase } from "@/lib/supabase";

interface TelegramInlineButton {
  text: string;
  url?: string;
  callback_data?: string;
}

interface TelegramSendMessagePayload {
  chat_id: string | number;
  text: string;
  parse_mode: "HTML" | "MarkdownV2" | "Markdown";
  disable_web_page_preview?: boolean;
  reply_markup?: {
    inline_keyboard: TelegramInlineButton[][];
  };
}

/**
 * Sends a rich notification with interactive preview & approval buttons to the admin on Telegram.
 */
export async function sendDraftNotification(post: BlogPostItem): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.replyiq.cv";
  const siteUrl = rawSiteUrl.trim().replace(/\/+$/, "");

  if (!botToken || !adminChatId) {
    console.warn("[Telegram Bot] Notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID is not configured in .env");
    return { success: false, error: "Telegram credentials not configured." };
  }

  try {
    const previewToken = generatePreviewToken(post.id);
    const previewUrl = `${siteUrl}/blog/preview/${post.id}?token=${previewToken}`;
    const tokenPrefix = previewToken.slice(0, 16);

    // Telegram callback_data is capped at 64 bytes.
    // "appr:" (5) + 36 (UUID) + ":" (1) + 16 = 58 bytes (under 64 bytes limit)
    const approveCallback = `appr:${post.id}:${tokenPrefix}`;
    const rejectCallback = `rejc:${post.id}:${tokenPrefix}`;

    let sourcesSnippet = "";
    if (post.source_urls && post.source_urls.length > 0) {
      const names = post.source_urls
        .map((s) => s.publisher || s.title)
        .filter(Boolean)
        .slice(0, 3)
        .join(", ");
      if (names) {
        sourcesSnippet = `\n📡 <b>Sources:</b> ${names}`;
      }
    }

    const messageHtml = [
      `📰 <b>New Tech Hub Draft Ready for Review!</b>`,
      ``,
      `📌 <b>${escapeHtml(post.title)}</b>`,
      `🏷 <b>Category:</b> ${escapeHtml(post.category || "General")}`,
      `⏱ <b>Read Time:</b> ${post.reading_time || 3} min${sourcesSnippet}`,
      ``,
      post.excerpt ? `📝 <i>${escapeHtml(post.excerpt)}</i>\n` : "",
      `👇 Review the draft below before publishing to the public feed:`,
    ]
      .filter((line) => line !== undefined)
      .join("\n");

    const payload: TelegramSendMessagePayload = {
      chat_id: adminChatId,
      text: messageHtml,
      parse_mode: "HTML",
      disable_web_page_preview: false,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "👁 Open Secret Preview",
              url: previewUrl,
            },
          ],
          [
            {
              text: "✅ Approve & Publish",
              callback_data: approveCallback,
            },
            {
              text: "❌ Reject",
              callback_data: rejectCallback,
            },
          ],
        ],
      },
    };

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("[Telegram Bot] API error sending message:", data);
      return { success: false, error: data.description || "Failed to send Telegram message." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Telegram Bot] Network error sending notification:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Helper to answer callback queries (clears loading wheel on Telegram client)
 */
export async function answerTelegramCallback(
  callbackQueryId: string,
  text: string,
  showAlert: boolean = false
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
  } catch (err) {
    console.error("[Telegram Bot] Error answering callback query:", err);
  }
}

/**
 * Helper to edit message text after action (e.g. replacing buttons with a live link)
 */
export async function editTelegramMessage(
  chatId: string | number,
  messageId: number,
  newText: string
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: newText,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
  } catch (err) {
    console.error("[Telegram Bot] Error editing message text:", err);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Broadcasts an approved live article to the public Telegram community / group.
 */
export async function publishPostToTelegramGroup(post: {
  id?: string;
  title: string;
  slug: string;
  category?: string | null;
  excerpt?: string | null;
  cover_image?: string | null;
  reading_time?: number | null;
}): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  let groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID || process.env.TELEGRAM_CHANNEL_ID;
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.replyiq.cv";
  const siteUrl = rawSiteUrl.trim().replace(/\/+$/, "");
  const liveUrl = `${siteUrl}/blog/${post.slug}`;

  if (!botToken) {
    return { success: false, error: "TELEGRAM_BOT_TOKEN not configured." };
  }

  // Fallback: If not in environment variables, check Supabase activity_logs for auto-registered ID
  if (!groupChatId) {
    const client = supabaseAdmin || supabase;
    if (client) {
      try {
        const { data: configLog } = await client
          .from("activity_logs")
          .select("metadata")
          .eq("event_type", "telegram_group_config")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (configLog?.metadata?.group_chat_id) {
          groupChatId = String(configLog.metadata.group_chat_id);
          console.log(`[Telegram Bot] Retrieved auto-registered groupChatId: ${groupChatId} from Supabase.`);
        }
      } catch (err) {
        console.warn("[Telegram Bot] Could not load dynamic group ID from Supabase:", err);
      }
    }
  }

  if (!groupChatId) {
    console.warn(
      "[Telegram Bot] Group broadcast skipped: Set TELEGRAM_GROUP_CHAT_ID in .env or add the bot to your Telegram group."
    );
    return { success: false, error: "TELEGRAM_GROUP_CHAT_ID not configured." };
  }

  try {
    const categoryTag = (post.category || "Tech").replace(/[^a-zA-Z0-9]/g, "");

    const captionHtml = [
      `🚀 <b>NEW TECH BRIEF IS LIVE!</b>`,
      ``,
      `📌 <b>${escapeHtml(post.title)}</b>`,
      `🏷 <b>Category:</b> #${categoryTag}`,
      `⏱ <b>Read Time:</b> ${post.reading_time || 3} min read`,
      ``,
      post.excerpt ? `<i>${escapeHtml(post.excerpt)}</i>\n` : "",
      `👉 <b>Read the complete story on ReplyIQ Lab:</b>`,
      `<a href="${liveUrl}">${liveUrl}</a>`,
    ]
      .filter((line) => line !== undefined)
      .join("\n");

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: "📖 Read Full Story On Website 🔗",
            url: liveUrl,
          },
        ],
      ],
    };

    // If cover image is available, send as photo with rich caption
    if (post.cover_image && post.cover_image.startsWith("http")) {
      try {
        const photoRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: groupChatId,
            photo: post.cover_image,
            caption: captionHtml,
            parse_mode: "HTML",
            reply_markup: replyMarkup,
          }),
        });
        const photoData = await photoRes.json();
        if (photoData.ok) {
          console.log(`[Telegram Bot] Successfully announced '${post.title}' to group ${groupChatId}`);
          return { success: true };
        }
        console.warn("[Telegram Bot] sendPhoto to group failed, falling back to sendMessage:", photoData);
      } catch (photoErr) {
        console.warn("[Telegram Bot] Photo send error, falling back to text:", photoErr);
      }
    }

    // Text fallback
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: groupChatId,
        text: captionHtml,
        parse_mode: "HTML",
        disable_web_page_preview: false,
        reply_markup: replyMarkup,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("[Telegram Bot] Error sending group announcement:", data);
      return { success: false, error: data.description || "Failed to broadcast to group." };
    }

    console.log(`[Telegram Bot] Successfully announced '${post.title}' to group ${groupChatId}`);
    return { success: true };
  } catch (err: any) {
    console.error("[Telegram Bot] Group broadcast network error:", err);
    return { success: false, error: err.message };
  }
}
