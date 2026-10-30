/**
 * @fileOverview Unit tests for ReplyIQ WhatsApp API routes and utilities.
 * Run this script with `npx tsx test-unit.ts`.
 */

import { generateWhatsAppDeepLink } from "./src/lib/whatsapp-link";
import { POST as sessionPOST } from "./src/app/api/whatsapp/session/route";
import { POST as messagePOST } from "./src/app/api/whatsapp/message/route";
import { supabase } from "./src/lib/supabase";
import { NextRequest } from "next/server";

// Ensure environment variables are loaded for testing
process.env.REPLYIQ_SHARED_SECRET = "test_secret_key_12345";
process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE = "+2348161395450";

async function testUnit() {
  console.log("\n=== STARTING WHATSAPP INTEGRATION UNIT TESTS ===\n");

  if (!supabase) {
    console.error("Supabase client is not configured. Aborting tests.");
    return;
  }

  // 1. Test Deep Link Utility
  try {
    process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE = "+2348161395450";
    const link = generateWhatsAppDeepLink("mindshift");
    console.log("Test 1: generateWhatsAppDeepLink output:", link);
    if (link === "https://wa.me/2348161395450?text=START%3Amindshift") {
      console.log("Test 1: PASSED");
    } else {
      console.error("Test 1: FAILED (Expected: https://wa.me/2348161395450?text=START%3Amindshift)");
    }
  } catch (error) {
    console.error("Test 1: FAILED with error:", error);
  }

  // 2. Test Deep Link Utility Missing Env
  try {
    delete process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE;
    delete process.env.ADMIN_WHATSAPP_PHONE;
    try {
      generateWhatsAppDeepLink("mindshift");
      console.error("Test 2: FAILED (Expected utility to throw an error)");
    } catch (err: any) {
      console.log("Test 2: PASSED (Successfully threw error: " + err.message + ")");
    }
  } catch (error) {
    console.error("Test 2: FAILED with error:", error);
  }

  // Restore env phone number
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE = "+2348161395450";

  // 3. Test API Routes - Session Authorization
  try {
    const req = new NextRequest("http://localhost/api/whatsapp/session", {
      method: "POST",
      headers: {
        "x-replyiq-secret": "wrong_secret_key",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone: "1234567890@c.us", businessId: "mindshift" })
    });
    const res = await sessionPOST(req);
    console.log("Test 3: Unauthorized Session Status (Expected 401):", res.status);
    const data = await res.json();
    console.log("Test 3 Data:", data);
    if (res.status === 401 && data.success === false) {
      console.log("Test 3: PASSED");
    } else {
      console.error("Test 3: FAILED");
    }
  } catch (error) {
    console.error("Test 3: FAILED with error:", error);
  }

  // 4. Test API Routes - Session Valid Registration
  try {
    // Clean up any existing test session first
    await supabase.from("whatsapp_sessions").delete().eq("phone", "1234567890@c.us");

    const req = new NextRequest("http://localhost/api/whatsapp/session", {
      method: "POST",
      headers: {
        "x-replyiq-secret": "test_secret_key_12345",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone: "1234567890@c.us", businessId: "mindshift" })
    });
    const res = await sessionPOST(req);
    console.log("Test 4: Valid Session Status:", res.status);
    const data = await res.json();
    console.log("Test 4 Data:", data);
    
    // Check if session was stored in Supabase
    const { data: storedSession } = await supabase
      .from("whatsapp_sessions")
      .select("business_id, history")
      .eq("phone", "1234567890@c.us")
      .maybeSingle();

    console.log("Test 4 Stored Session in DB:", storedSession);
    if (res.status === 200 && data.success === true && storedSession && storedSession.business_id === "mindshift") {
      console.log("Test 2: PASSED");
    } else {
      console.error("Test 4: FAILED");
    }
  } catch (error) {
    console.error("Test 4: FAILED with error:", error);
  }

  // 5. Test API Routes - Message Route No Session
  try {
    const req = new NextRequest("http://localhost/api/whatsapp/message", {
      method: "POST",
      headers: {
        "x-replyiq-secret": "test_secret_key_12345",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone: "unregistered_phone@c.us", message: "Hi!" })
    });
    const res = await messagePOST(req);
    console.log("Test 5: Message No Session Status (Expected 200):", res.status);
    const data = await res.json();
    console.log("Test 5 Data (Expected noSession: true):", data);
    if (res.status === 200 && data.noSession === true) {
      console.log("Test 5: PASSED");
    } else {
      console.error("Test 5: FAILED");
    }
  } catch (error) {
    console.error("Test 5: FAILED with error:", error);
  }

  // 6. Test API Routes - Message Route with Session (Calls Genkit Cloudflare Flow)
  try {
    // Upsert fresh clean session directly in Supabase
    await supabase.from("whatsapp_sessions").upsert({
      phone: "1234567890@c.us",
      business_id: "mindshift",
      history: [],
      updated_at: new Date().toISOString()
    });
    
    const req = new NextRequest("http://localhost/api/whatsapp/message", {
      method: "POST",
      headers: {
        "x-replyiq-secret": "test_secret_key_12345",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone: "1234567890@c.us", message: "What services do you offer?" })
    });
    console.log("Test 6: Sending message to AI flow (making external API call)...");
    const res = await messagePOST(req);
    console.log("Test 6: Message Status:", res.status);
    const data = await res.json();
    console.log("Test 6 Data:", data);

    const { data: updatedSession } = await supabase
      .from("whatsapp_sessions")
      .select("business_id, history")
      .eq("phone", "1234567890@c.us")
      .maybeSingle();

    console.log("Test 6 Updated Session History:", updatedSession?.history);

    if (
      res.status === 200 &&
      data.success === true &&
      data.reply &&
      updatedSession &&
      Array.isArray(updatedSession.history) &&
      updatedSession.history.length === 2
    ) {
      console.log("Test 6: PASSED");
    } else {
      console.error("Test 6: FAILED");
    }
  } catch (error) {
    console.error("Test 6: FAILED with error:", error);
  }

  console.log("\n=== UNIT TESTS COMPLETED ===\n");
}

testUnit();
