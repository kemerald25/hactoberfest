import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import { renderInstallmentReminderEmail } from "@/lib/email-template";
import { logActivity } from "@/app/actions/admin";

export async function GET(request: NextRequest) {
  // 1. Authenticate Request using REPLYIQ_SHARED_SECRET
  const authHeader = request.headers.get("Authorization");
  const expectedSecret = process.env.REPLYIQ_SHARED_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 500 });
  }

  try {
    // 2. Fetch all businesses on installment plans
    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("business_id, name, owner_name, email_contact, payment_plan, installments_paid")
      .in("payment_plan", ["installment_2x", "installment_3x"]);

    if (error) {
      console.error("Failed to query businesses for reminders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const remindedList: string[] = [];
    const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;
    const resend = apiKey ? new Resend(apiKey) : null;

    if (!resend) {
      console.warn("Resend API key missing. Reminders cannot be sent.");
    }

    // 3. Process each business and calculate balance
    for (const biz of (businesses || [])) {
      const maxInstallments = biz.payment_plan === "installment_2x" ? 2 : 3;
      const paidCount = biz.installments_paid || 0;

      // Skip if paid in full
      if (paidCount >= maxInstallments) {
        continue;
      }

      const installmentAmount = biz.payment_plan === "installment_2x" ? 7500 : 5000;
      const paidAmount = paidCount * installmentAmount;
      const balanceAmount = 15000 - paidAmount;

      // Only send if they owe something and have a valid email contact
      if (balanceAmount > 0 && biz.email_contact) {
        const planName = biz.payment_plan === "installment_2x" ? "2x Installment Plan" : "3x Installment Plan";
        const emailHtml = renderInstallmentReminderEmail({
          name: biz.owner_name || biz.name,
          plan: planName,
          paidCount,
          maxCount: maxInstallments,
          paidAmount,
          balanceAmount
        });

        if (resend) {
          try {
            await resend.emails.send({
              from: "ReplyIQ Billing <support@replyiq.cv>",
              to: biz.email_contact,
              subject: `Friendly Payment Reminder: Installment Balance for ${biz.name}`,
              html: emailHtml
            });

            await logActivity(
              biz.business_id,
              "installment_reminder_sent",
              `Sent weekly payment reminder to ${biz.email_contact} (₦${balanceAmount.toLocaleString()} pending)`
            );

            remindedList.push(biz.name);
          } catch (sendErr) {
            console.error(`Failed to send weekly reminder to ${biz.email_contact}:`, sendErr);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      remindedCount: remindedList.length,
      reminded: remindedList
    });

  } catch (err: any) {
    console.error("Error during payment reminders cron run:", err);
    return NextResponse.json({ error: err.message || "Cron run failed" }, { status: 500 });
  }
}
