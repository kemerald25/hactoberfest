/**
 * @fileOverview Next.js API Route for registering WhatsApp sessions.
 * Matches customer phone numbers with their active business tenant.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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
 * POST handler to register or update a WhatsApp session.
 *
 * Request Body:
 * - phone (string): Customer's WhatsApp phone number.
 * - businessId (string): The business ID they are trying to connect to.
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
    const { phone, businessId } = body;

    if (!phone || typeof phone !== "string" || !businessId || typeof businessId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid phone or businessId parameters" },
        { status: 400 }
      );
    }

    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    // Verify business exists in Supabase
    // Selects ONLY the business_id column and uses maybeSingle() to handle missing entries gracefully
    const { data: business, error } = await supabase
      .from("businesses")
      .select("business_id")
      .eq("business_id", businessId.trim())
      .maybeSingle();

    if (error) {
      console.error("Supabase error during business verification:", error);
      return NextResponse.json(
        { success: false, error: "Database error during business lookup" },
        { status: 500 }
      );
    }

    if (!business) {
      return NextResponse.json(
        { success: false, error: "Business not found" },
        { status: 404 }
      );
    }

    // Register or overwrite the session. Clearing history for a clean context.
    const { error: upsertError } = await supabase
      .from("whatsapp_sessions")
      .upsert({
        phone: phone.trim(),
        business_id: business.business_id,
        history: [],
        updated_at: new Date().toISOString()
      });

    if (upsertError) {
      console.error("Supabase error during session upsert:", upsertError);
      return NextResponse.json(
        { success: false, error: "Database error during session creation" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true }
    );
  } catch (error: any) {
    console.error("Unhandled error in session route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
