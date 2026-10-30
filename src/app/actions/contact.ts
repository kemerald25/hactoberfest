"use server";

import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { z } from "zod";
import { logActivity } from "@/app/actions/admin";
import { Resend } from "resend";
import { renderContactEmail } from "@/lib/email-template";

const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

async function sendContactEmail(name: string, email: string, company: string, message: string) {
  try {
    const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "ReplyIQ Contact <support@replyiq.cv>",
        to: "support@replyiq.cv",
        subject: `New Inquiry from ${name} (${company})`,
        html: renderContactEmail({ name, email, company, message })
      });
      console.log("Contact notification email sent successfully via Resend.");
    } else {
      console.warn("Resend API key missing in environment. Email not sent.");
    }
  } catch (emailErr) {
    console.error("Failed to send contact notification email:", emailErr);
  }
}

export async function submitContactLead(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    message: formData.get("message"),
  };

  const validated = ContactSchema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const { name, email, company, message } = validated.data;
  const cookieStore = await cookies();
  const refCode = cookieStore.get("replyiq_ref")?.value;
  const deviceId = cookieStore.get("replyiq_device_id")?.value || "";

  // 1. Handle Referral Tracking Fallback (Mock Mode)
  if (!supabase) {
    console.log("Supabase not configured. Lead data received:", validated.data);
    
    if (refCode) {
      const mockProfileStr = cookieStore.get("mock_partner_profile")?.value;
      if (mockProfileStr) {
        const mockPartner = JSON.parse(mockProfileStr);
        // If the cookie referral matches this partner's code, add a referral
        if (mockPartner.referral_code === refCode) {
          const referralsStr = cookieStore.get("mock_partner_referrals")?.value;
          const mockReferrals = referralsStr ? JSON.parse(referralsStr) : [];
          
          // Add a new pending referral
          mockReferrals.unshift({
            id: `ref-mock-${Date.now()}`,
            business_name: company,
            email: email,
            status: "pending",
            created_at: new Date().toISOString()
          });

          cookieStore.set("mock_partner_referrals", JSON.stringify(mockReferrals), {
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          });
          console.log(`Associated lead with mock partner: ${mockPartner.name} (${refCode})`);
        }
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
    await logActivity(null, "lead_generated", `Contact Lead submitted by ${name} (${email}) for company ${company}`);
    await sendContactEmail(name, email, company, message);
    return { success: true };
  }

  // 2. Handle Referral Tracking (Supabase Mode)
  try {
    // Insert into contact leads
    const { error: leadError } = await supabase
      .from("contact_leads")
      .insert([{ name, email, company, message }]);

    if (leadError) {
      console.error("Supabase contact_leads error:", leadError);
      return { success: false, error: "Failed to submit lead. Please try again." };
    }

    // Check if referral code is present in cookies
    if (refCode) {
      // Find the partner
      const { data: partner } = await supabase
        .from("campus_partners")
        .select("id, device_id, name")
        .eq("referral_code", refCode)
        .maybeSingle();

      if (partner) {
        const isSuspicious = !!partner.device_id && partner.device_id === deviceId;

        // Record referral
        const { error: refError } = await supabase
          .from("partner_referrals")
          .insert([
            {
              partner_id: partner.id,
              business_name: company,
              email: email,
              status: "pending",
              device_id: deviceId,
              is_suspicious: isSuspicious,
            },
          ]);

        if (refError) {
          console.error("Supabase referral insert error:", refError);
        } else {
          console.log(`Successfully attributed referral to partner ID: ${partner.id}`);
          if (isSuspicious) {
            await logActivity(null, "fraud_warning", `Self-referral fraud warning! Lead '${company}' and partner '${partner.name}' share same device footprint.`);
          }
        }
      }
    }

    await logActivity(null, "lead_generated", `Contact Lead submitted by ${name} (${email}) for company ${company}`);
    await sendContactEmail(name, email, company, message);
    return { success: true };
  } catch (err) {
    console.error("Contact lead submission crash:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

