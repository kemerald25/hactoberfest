import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function runCleanup(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || req.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET || "replyiq_cron_secret_2026";
  
  if (authHeader !== `Bearer ${expectedSecret}` && authHeader !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Delete WhatsApp sessions that haven't been active for 30 days
    const { error, count } = await supabase
      .from("whatsapp_sessions")
      .delete({ count: "exact" })
      .lt("updated_at", thirtyDaysAgo);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${count ?? 0} stale WhatsApp sessions older than 30 days.` 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return runCleanup(req);
}

export async function POST(req: NextRequest) {
  return runCleanup(req);
}
