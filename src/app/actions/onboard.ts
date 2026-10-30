"use server";

import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { z } from "zod";
import { logActivity } from "@/app/actions/admin";
import { Resend } from "resend";
import { renderOnboardingEmail } from "@/lib/email-template";

const OnboardSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  ownerName: z.string().min(2, "Your name must be at least 2 characters"),
  phone: z.string().min(7, "Please enter a valid WhatsApp number"),
  email: z.string().email("Please enter a valid email address"),
  websiteUrl: z.string().optional(),
  description: z.string().min(10, "Please tell us a bit more about your business"),
  referralCode: z.string().optional(),
  plan: z.enum(["starter", "professional", "enterprise"]).default("professional"),
});

async function sendOnboardingEmail(data: {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  websiteUrl?: string;
  description: string;
  referralCode?: string;
  plan?: string;
}) {
  try {
    const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "ReplyIQ Onboarding <support@replyiq.cv>",
        to: "support@replyiq.cv",
        subject: `New Onboarding Request: ${data.businessName}`,
        html: renderOnboardingEmail(data)
      });
      console.log("Onboarding notification email sent successfully.");
    } else {
      console.warn("Resend API key missing in environment. Email not sent.");
    }
  } catch (err) {
    console.error("Failed to send onboarding email:", err);
  }
}

export async function submitOnboarding(formData: FormData) {
  const rawData = {
    businessName: formData.get("businessName"),
    ownerName: formData.get("ownerName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    websiteUrl: formData.get("websiteUrl") || undefined,
    description: formData.get("description"),
    referralCode: formData.get("referralCode") || undefined,
    plan: formData.get("plan") || undefined,
  };

  const validated = OnboardSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const { businessName, ownerName, phone, email, websiteUrl, description, referralCode, plan } = validated.data;

  const cookieStore = await cookies();
  const deviceId = cookieStore.get("replyiq_device_id")?.value || "";

  // Resolve referral code: form input takes priority, then cookie fallback
  const refCode = referralCode?.trim() || cookieStore.get("replyiq_ref")?.value || null;

  // ── MOCK MODE (no Supabase) ──────────────────────────────────────────────────
  if (!supabase) {
    console.log("Onboarding submission (mock mode):", { businessName, ownerName, email, refCode, plan });
    await new Promise(resolve => setTimeout(resolve, 800));
    await logActivity(null, "business_onboarded", `New self-onboarded business: '${businessName}' by ${ownerName} (${email}) (Plan: ${plan})`);
    await sendOnboardingEmail({
      businessName,
      ownerName,
      phone,
      email,
      websiteUrl,
      description,
      referralCode: refCode || undefined,
      plan
    });
    return { success: true };
  }

  // ── SUPABASE MODE ────────────────────────────────────────────────────────────
  try {
    // 1. Deduplication check — block resubmission from same email
    const { data: existing } = await supabase
      .from("businesses")
      .select("business_id")
      .eq("email_contact", email)
      .eq("setup_status", "pending_setup")
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: "We already have a pending setup request from this email. We'll reach out to you soon!",
      };
    }

    // 2. Generate a URL-safe business ID slug
    const baseSlug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `biz-${Date.now()}`;

    let businessId = baseSlug;
    let counter = 1;
    while (true) {
      const { data: clash } = await supabase
        .from("businesses")
        .select("business_id")
        .eq("business_id", businessId)
        .maybeSingle();
      if (!clash) break;
      businessId = `${baseSlug}-${counter++}`;
    }

    // 3. Insert business record with pending_setup status
    const { error: insertError } = await supabase.from("businesses").insert([
      {
        business_id: businessId,
        name: businessName,
        owner_name: ownerName,
        phone: phone,
        email_contact: email,
        website_url: websiteUrl || "",
        business_description: description,
        system_prompt: `You are a helpful AI assistant for ${businessName}. (Setup in progress — full configuration coming soon.)`,
        knowledge_base: "",
        theme_color: "#8B5CF6",
        status: "inactive",
        setup_status: "pending_setup",
        signup_source: refCode ? "partner" : "direct",
        referred_by_code: refCode || null,
        payment_plan: plan,
        installments_paid: 0,
      },
    ]);

    if (insertError) {
      console.error("Onboarding insert error:", insertError);
      return { success: false, error: "Something went wrong. Please try again." };
    }

    // 4. Handle referral attribution
    if (refCode) {
      const { data: partner } = await supabase
        .from("campus_partners")
        .select("id, device_id, name")
        .ilike("referral_code", refCode)
        .maybeSingle();

      if (partner) {
        const isSuspicious = !!partner.device_id && partner.device_id === deviceId;

        await supabase.from("partner_referrals").insert([
          {
            partner_id: partner.id,
            business_name: businessName,
            email: email,
            status: "pending",
            device_id: deviceId,
            is_suspicious: isSuspicious,
          },
        ]);

        if (isSuspicious) {
          await logActivity(
            null,
            "fraud_warning",
            `Self-referral fraud warning! Onboarding lead '${businessName}' and partner '${partner.name}' share same device fingerprint.`
          );
        }
      }
    }

    // 5. Log the onboarding event
    await logActivity(
      null,
      "business_onboarded",
      `New self-onboarded business: '${businessName}' by ${ownerName} (${email})${refCode ? ` via referral ${refCode}` : ""} (Plan: ${plan})`
    );

    await sendOnboardingEmail({
      businessName,
      ownerName,
      phone,
      email,
      websiteUrl,
      description,
      referralCode: refCode || undefined,
      plan
    });

    return { success: true };
  } catch (err: any) {
    console.error("Onboarding error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
