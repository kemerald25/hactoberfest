import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { generatePreviewToken } from "@/lib/bot/preview-token";
import { answerTelegramCallback, editTelegramMessage, publishPostToTelegramGroup } from "@/lib/bot/telegram";
import { publishPostToLinkedIn } from "@/lib/bot/linkedin";
import { logActivity } from "@/app/actions/admin";
import { timingSafeEqual } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. Handle Interactive Inline Button Callbacks
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const callbackId = callbackQuery.id;
      const fromId = String(callbackQuery.from?.id || "");
      const adminChatId = String(process.env.TELEGRAM_ADMIN_CHAT_ID || "");
      const message = callbackQuery.message;
      const messageId = message?.message_id;
      const chatId = message?.chat?.id;
      const callbackData: string = callbackQuery.data || "";

      // Authorization check: Only the designated admin can tap buttons
      if (adminChatId && fromId !== adminChatId) {
        console.warn(`[Telegram Webhook] Unauthorized tap attempt from user ID: ${fromId}`);
        await answerTelegramCallback(
          callbackId,
          "⛔ Unauthorized. Only the designated ReplyIQ admin can approve drafts.",
          true
        );
        return NextResponse.json({ ok: true });
      }

      const client = supabaseAdmin || supabase;
      if (!client) {
        await answerTelegramCallback(callbackId, "⚠️ Database client is temporarily unavailable.", true);
        return NextResponse.json({ ok: true });
      }

      // 2. Parse Action (appr or rejc)
      const parts = callbackData.split(":");
      const action = parts[0];
      const postId = parts[1];
      const tokenPrefix = parts[2];

      if (!postId || !tokenPrefix || (action !== "appr" && action !== "rejc")) {
        await answerTelegramCallback(callbackId, "Invalid action data.", true);
        return NextResponse.json({ ok: true });
      }

      // 3. Cryptographic Verification of tokenPrefix
      const expectedToken = generatePreviewToken(postId);
      const expectedPrefix = expectedToken.slice(0, 16);
      let isTokenValid = false;
      try {
        isTokenValid = timingSafeEqual(
          Buffer.from(tokenPrefix, "utf-8"),
          Buffer.from(expectedPrefix, "utf-8")
        );
      } catch {
        isTokenValid = false;
      }

      if (!isTokenValid) {
        await answerTelegramCallback(callbackId, "⛔ Expired or invalid draft token.", true);
        return NextResponse.json({ ok: true });
      }

      const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.replyiq.cv";
      const siteUrl = rawSiteUrl.trim().replace(/\/+$/, "");

      if (action === "appr") {
        // Publish action
        const nowIso = new Date().toISOString();
        const { data: post, error } = await client
          .from("blog_posts")
          .update({
            status: "published",
            published_at: nowIso,
            updated_at: nowIso,
          })
          .eq("id", postId)
          .select("id, title, slug, category, excerpt, cover_image, reading_time")
          .single();

        if (error || !post) {
          await answerTelegramCallback(callbackId, `Failed to publish: ${error?.message || "Not found"}`, true);
          return NextResponse.json({ ok: true });
        }

        // Revalidate feeds
        revalidatePath("/blog");
        if (post.slug) revalidatePath(`/blog/${post.slug}`);
        revalidatePath("/sitemap.xml");

        // Broadcast to Telegram Community Group & LinkedIn
        await Promise.allSettled([
          publishPostToTelegramGroup(post).catch((err) =>
            console.error("[Telegram Webhook] Group broadcast error:", err)
          ),
          publishPostToLinkedIn(post).catch((err) =>
            console.error("[Telegram Webhook] LinkedIn broadcast error:", err)
          ),
        ]);

        await answerTelegramCallback(callbackId, "🎉 Published! Article is now live on ReplyIQ.", false);

        if (chatId && messageId) {
          const updatedText = [
            `✅ <b>PUBLISHED LIVE TO TECH HUB</b>`,
            ``,
            `📌 <b>${post.title}</b>`,
            `🏷 <b>Category:</b> ${post.category || "General"}`,
            ``,
            `🌐 <a href="${siteUrl}/blog/${post.slug}">View Article on ReplyIQ</a>`,
            `🕒 <i>Published at ${new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Lagos" })} WAT</i>`,
          ].join("\n");

          await editTelegramMessage(chatId, messageId, updatedText);
        }

        await logActivity(null, "telegram_bot_approval", `Draft '${post.title}' approved and published via Telegram Bot.`);
        return NextResponse.json({ ok: true });
      }

      if (action === "rejc") {
        // Reject action
        const nowIso = new Date().toISOString();
        const { data: post, error } = await client
          .from("blog_posts")
          .update({
            status: "rejected",
            updated_at: nowIso,
          })
          .eq("id", postId)
          .select("id, title")
          .single();

        if (error || !post) {
          await answerTelegramCallback(callbackId, `Failed to reject: ${error?.message || "Not found"}`, true);
          return NextResponse.json({ ok: true });
        }

        await answerTelegramCallback(callbackId, "Draft archived as rejected.", false);

        if (chatId && messageId) {
          const updatedText = [
            `❌ <b>DRAFT REJECTED & ARCHIVED</b>`,
            ``,
            `📌 <s>${post.title}</s>`,
            `<i>This draft will not be published to the public.</i>`,
          ].join("\n");

          await editTelegramMessage(chatId, messageId, updatedText);
        }

        await logActivity(null, "telegram_bot_rejection", `Draft '${post.title}' rejected via Telegram Bot.`);
        return NextResponse.json({ ok: true });
      }
    }

    // 4. Handle Bot Added to Group / Channel (my_chat_member update)
    if (update.my_chat_member) {
      const chat = update.my_chat_member.chat;
      const newMember = update.my_chat_member.new_chat_member;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (chat && newMember && (newMember.status === "member" || newMember.status === "administrator")) {
        const client = supabaseAdmin || supabase;
        if (client) {
          try {
            await client.from("activity_logs").insert([
              {
                event_type: "telegram_group_config",
                description: `Bot added to Telegram group: ${chat.id} (${chat.title || "Community"})`,
                metadata: { group_chat_id: String(chat.id), chat_title: chat.title || "" },
              },
            ]);
          } catch (e) {
            console.error("[Telegram Webhook] Failed to log group add:", e);
          }
        }

        if (botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chat.id,
              text: `🎉 <b>ReplyIQ Tech Hub Bot Connected!</b>\n\n📌 <b>This Group Chat ID:</b> <code>${chat.id}</code>\n\n✅ <b>Connected automatically!</b> Whenever you approve an article, it will be automatically broadcasted here with rich cover photos and website links! 🚀`,
              parse_mode: "HTML",
            }),
          });
        }
      }
    }

    // 5. Handle incoming text commands & group events (/id, /chatid, /groupid, /start, /status, /help, new members)
    const incomingMsg = update.message || update.channel_post;
    if (incomingMsg) {
      const text = (incomingMsg.text || "").trim().toLowerCase();
      const chatId = incomingMsg.chat?.id;
      const chatType = incomingMsg.chat?.type;
      const isGroup = chatType === "group" || chatType === "supergroup" || chatType === "channel";
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      // Auto-register group chat ID in database whenever ANY event, message, or member update happens in a group
      if (isGroup && chatId) {
        const client = supabaseAdmin || supabase;
        if (client) {
          try {
            await client.from("activity_logs").insert([
              {
                event_type: "telegram_group_config",
                description: `Auto-registered Telegram group: ${chatId} (${incomingMsg.chat?.title || "Community"})`,
                metadata: { group_chat_id: String(chatId), chat_title: incomingMsg.chat?.title || "" },
              },
            ]);
          } catch (e) {
            console.error("[Telegram Webhook] Failed to auto-register group:", e);
          }
        }
      }

      const isBotAdded = incomingMsg.new_chat_members?.some(
        (u: any) => u.username?.toLowerCase() === "replyiqblog_bot" || u.is_bot
      );

      const isMentioned =
        text.includes("replyiqblog_bot") ||
        incomingMsg.reply_to_message?.from?.username?.toLowerCase() === "replyiqblog_bot";

      const isAnySlashCommand = text.startsWith("/");

      // Always reply to ANY message in 1-on-1 private chat, or to any slash command/mention/member-add in groups
      const shouldReply = !isGroup || isBotAdded || isMentioned || isAnySlashCommand;

      if (botToken && chatId && shouldReply) {
        const replyText = isGroup
          ? `📌 <b>Telegram Group Connected!</b>\n\nGroup Chat ID: <code>${chatId}</code>\n\n✅ Saved to ReplyIQ! Whenever a daily tech brief is approved, it will automatically broadcast here with a rich cover card and link! 🚀\n\n<i>Make sure @replyiqblog_bot is an Admin with 'Post Messages' permission.</i>`
          : `🤖 <b>ReplyIQ Tech Hub Bot Online</b>\n\n👤 <b>Your Admin Chat ID:</b> <code>${chatId}</code>\n\nWhenever automated drafts are synthesized, you will receive preview alerts and approval buttons here.`;

        try {
          const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: replyText,
              parse_mode: "HTML",
            }),
          });
          const resJson = await res.json().catch(() => null);
          if (!res.ok) {
            console.error("[Telegram Webhook] sendMessage failed:", resJson);
            // Fallback without HTML formatting in case HTML was malformed
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: isGroup
                  ? `📌 Telegram Group Connected!\n\nGroup Chat ID: ${chatId}\n\nSaved to ReplyIQ!`
                  : `🤖 ReplyIQ Tech Hub Bot Online\n\nYour Admin Chat ID: ${chatId}`,
              }),
            });
          }
        } catch (sendErr) {
          console.error("[Telegram Webhook] Error calling sendMessage:", sendErr);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Telegram Webhook] Error processing update:", err);
    return NextResponse.json({ ok: true, error: err.message });
  }
}
