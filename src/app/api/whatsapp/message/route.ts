/**
 * @fileOverview Next.js API Route for handling WhatsApp message interactions.
 * Checks for an active session, processes the message using the Genkit flow,
 * updates conversation history (with a 20-turn cap), and returns the AI response.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { liveChatAssistant } from "@/ai/flows/live-chat-assistant-flow";
import crypto from "crypto";

/**
 * Perform a constant-time string comparison using timingSafeEqual to prevent timing attacks.
 *
 * @param a - First string to compare.
 * @param b - Second string to compare.
 * @returns True if the strings are identical, false otherwise.
 */
function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Perform dummy timing comparison
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * POST handler to receive and reply to messages from WhatsApp.
 *
 * Request Body:
 * - phone (string): Customer's WhatsApp phone number.
 * - message (string): The text body of the incoming message.
 *
 * Headers:
 * - x-replyiq-secret: Shared secret key for internal authentication.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.REPLYIQ_SHARED_SECRET;
    if (!secret) {
      console.warn("WARNING: REPLYIQ_SHARED_SECRET is not configured in the environment variables.");
      return NextResponse.json(
        { success: false, error: "Authentication configuration missing" },
        { status: 500 }
      );
    }

    const requestSecret = req.headers.get("x-replyiq-secret");
    if (!requestSecret || !safeCompare(requestSecret, secret)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { phone, message } = body;

    if (!phone || typeof phone !== "string" || !message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid phone or message parameters" },
        { status: 400 }
      );
    }

    const trimmedPhone = phone.trim();

    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    const { data: session, error: sessionError } = await supabase
      .from("whatsapp_sessions")
      .select("business_id, history")
      .eq("phone", trimmedPhone)
      .maybeSingle();

    if (sessionError) {
      console.error("Supabase error during session retrieval:", sessionError);
      return NextResponse.json(
        { success: false, error: "Database error during session lookup" },
        { status: 500 }
      );
    }

    // If no session exists, return standard payload indicating noSession: true
    if (!session) {
      return NextResponse.json({
        success: true,
        noSession: true
      });
    }

    const businessId = session.business_id;
    const history = (session.history as Array<{ role: "user" | "model"; content: string }>) || [];

    // Call Genkit flow passing businessId and the conversation history
    const aiResult = await liveChatAssistant({
      businessId,
      history: [
        ...history,
        { role: "user" as const, content: message.trim() }
      ],
      channel: 'whatsapp',
      sessionId: trimmedPhone,
    });

    const replyText = aiResult.response;

    // Append both the user message and assistant reply to the history array
    const updatedHistory = [
      ...history,
      { role: "user" as const, content: message.trim() },
      { role: "model" as const, content: replyText }
    ];

    // Enforce 20-turn cap (40 entries total: 20 user, 20 assistant) to prevent memory bloat
    const cappedHistory = updatedHistory.length > 40
      ? updatedHistory.slice(updatedHistory.length - 40)
      : updatedHistory;

    // Update the session state with the capped history in Supabase
    const { error: updateError } = await supabase
      .from("whatsapp_sessions")
      .update({
        history: cappedHistory,
        updated_at: new Date().toISOString()
      })
      .eq("phone", trimmedPhone);

    if (updateError) {
      console.error("Supabase error during session update:", updateError);
      return NextResponse.json(
        { success: false, error: "Database error during session update" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reply: replyText
    });

  } catch (error: any) {
    console.error("Unhandled error in message route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
