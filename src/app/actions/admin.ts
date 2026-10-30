"use server";

import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { renderAiLiveEmail, renderNewsletterEmail, renderBusinessActivationEmail, renderColdOutboundEmail, cleanPlainOutreachText } from "@/lib/email-template";
import crypto from "crypto";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "unityekeoba18@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Replyiq@2026";

// 1. ADMIN LOGIN ACTION
export async function loginAdmin(formData: FormData) {
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "replyiq_admin_active", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    
    // Log successful admin login
    await logActivity(null, "admin_login", "Administrator logged in successfully");
    
    return { success: true };
  }

  // Log failed admin login attempt
  await logError("API", `Failed admin login attempt from email: ${email}`, `Password entered: ${password.substring(0, 3)}***`);
  return { success: false, error: "Invalid admin email or password." };
}

// 2. ADMIN LOGOUT ACTION
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

// 3. CHECK ADMIN SESSION
export async function checkAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return session === "replyiq_admin_active";
}

// Helper to check if authorized, throwing if not
async function requireAuth() {
  const isAuth = await checkAdminSession();
  if (!isAuth) {
    throw new Error("Unauthorized access to admin console.");
  }
}

// 4. GET ALL ADMIN DASHBOARD DATA
export async function getAdminDashboardData() {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  // Supabase Implementation
  try {
    const { data: partners } = await supabase.from("campus_partners").select("*").order("created_at", { ascending: false });
    const { data: referrals } = await supabase.from("partner_referrals").select("*").order("created_at", { ascending: false });
    const { data: businesses } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
    const { data: leads } = await supabase.from("contact_leads").select("*").order("created_at", { ascending: false });
    const { data: chats } = await supabase.from("whatsapp_sessions").select("*").order("updated_at", { ascending: false });
    const { data: transactions } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
    const { data: activities } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false });
    const { data: errors } = await supabase.from("error_logs").select("*").order("created_at", { ascending: false });
    const { data: announcements } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    const { data: subscribers } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
    const { data: marketingLeads } = await supabase.from("marketing_leads").select("*").order("created_at", { ascending: false });

    const allBusinesses = businesses || [];
    const pendingSetupCount = allBusinesses.filter((b: any) => b.setup_status === "pending_setup").length;
    const inProgressCount = allBusinesses.filter((b: any) => b.setup_status === "in_progress").length;

    return {
      success: true,
      data: {
        partners: partners || [],
        referrals: referrals || [],
        businesses: allBusinesses,
        leads: leads || [],
        chats: chats || [],
        transactions: transactions || [],
        activities: activities || [],
        errors: errors || [],
        announcements: announcements || [],
        subscribers: subscribers || [],
        marketingLeads: marketingLeads || [],
        pendingSetupCount,
        inProgressCount
      }
    };
  } catch (err: any) {
    console.error("Failed to load admin stats:", err);
    return { success: false, error: err.message || "Failed to load admin stats." };
  }
}

// 5. TOGGLE REFERRAL STATUS & LOG SETUP TRANSACTION
export async function toggleReferralStatus(referralId: string, newStatus: 'pending' | 'paying') {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { data: referral, error: fetchErr } = await supabase
      .from("partner_referrals")
      .select("*")
      .eq("id", referralId)
      .single();

    if (fetchErr || !referral) {
      return { success: false, error: "Referral not found." };
    }

    const { error: updateErr } = await supabase
      .from("partner_referrals")
      .update({ status: newStatus })
      .eq("id", referralId);

    if (updateErr) {
      return { success: false, error: "Failed to update status." };
    }

    // Auto-create N15,000 transaction if marked paying
    if (newStatus === "paying") {
      await supabase.from("transactions").insert([
        {
          business_name: referral.business_name,
          amount: 15000,
          status: "success"
        }
      ]);
      await logActivity(null, "referral_marked_paying", `Referral for '${referral.business_name}' approved. Setup transaction created.`);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update referral." };
  }
}

// 6. ADD MANUAL TRANSACTION
export async function addManualTransaction(businessName: string, amount: number) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase.from("transactions").insert([{ business_name: businessName, amount }]);
    if (error) return { success: false, error: error.message };
    await logActivity(null, "manual_transaction", `Manual transaction for N${amount.toLocaleString()} added to '${businessName}'`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 7. CREATE ANNOUNCEMENT
export async function createAnnouncement(title: string, content: string, targetType: string, targetId?: string) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase.from("announcements").insert([{ title, content, target_type: targetType, target_id: targetId || null }]);
    if (error) return { success: false, error: error.message };
    await logActivity(null, "announcement_created", `Announcement broadcasted: ${title} to ${targetType}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Helper to generate a unique business_id slug from business name
async function generateUniqueBusinessId(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!baseSlug) {
    return `biz-${Math.random().toString(36).substr(2, 9)}`;
  }

  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const { data } = await supabase!
      .from("businesses")
      .select("business_id")
      .eq("business_id", slug)
      .maybeSingle();

    if (!data) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return slug;
}

// 8. CREATE BUSINESS CONFIGURATION
export async function createBusiness(data: {
  name: string;
  systemPrompt: string;
  knowledgeBase?: string;
  themeColor?: string;
  whatsappPhone?: string;
  emailContact?: string;
  status: string;
  paymentPlan: 'trial' | 'full' | 'installment_2x' | 'installment_3x' | 'starter' | 'professional' | 'enterprise';
  referredByCode?: string;
}) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    // 1. Generate unique business ID slug
    const businessId = await generateUniqueBusinessId(data.name);

    // 2. Determine initial installments paid and payment amount
    let installmentsPaid = 0;
    let initialPaymentAmount = 0;

    if (data.paymentPlan === 'full') {
      installmentsPaid = 1;
      initialPaymentAmount = 15000;
    } else if (data.paymentPlan === 'installment_2x') {
      installmentsPaid = 1;
      initialPaymentAmount = 7500;
    } else if (data.paymentPlan === 'installment_3x') {
      installmentsPaid = 1;
      initialPaymentAmount = 5000;
    } else if (data.paymentPlan === 'starter') {
      installmentsPaid = 1;
      initialPaymentAmount = 5000;
    } else if (data.paymentPlan === 'professional') {
      installmentsPaid = 1;
      initialPaymentAmount = 15000;
    } else if (data.paymentPlan === 'enterprise') {
      installmentsPaid = 1;
      initialPaymentAmount = 25000;
    }

    // 3. Create the business in the database
    const { error: insertError } = await supabase
      .from("businesses")
      .insert([
        {
          business_id: businessId,
          name: data.name,
          system_prompt: data.systemPrompt,
          knowledge_base: data.knowledgeBase || "",
          theme_color: data.themeColor || "#000000",
          whatsapp_phone: data.whatsappPhone || "",
          email_contact: data.emailContact || "",
          status: data.status,
          payment_plan: data.paymentPlan,
          installments_paid: installmentsPaid,
          signup_source: data.referredByCode ? 'partner' : 'direct',
          referred_by_code: data.referredByCode || null
        }
      ]);

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // 4. Log the initial transaction if any
    if (initialPaymentAmount > 0) {
      await supabase.from("transactions").insert([
        {
          business_name: data.name,
          amount: initialPaymentAmount,
          status: "success"
        }
      ]);
    }

    // 5. Handle Ambassador referral mapping if code provided
    if (data.referredByCode) {
      const { data: partner } = await supabase
        .from("campus_partners")
        .select("id")
        .eq("referral_code", data.referredByCode)
        .maybeSingle();

      if (partner) {
        // Map referral record
        const { data: existingRef } = await supabase
          .from("partner_referrals")
          .select("id")
          .eq("partner_id", partner.id)
          .eq("email", data.emailContact || "")
          .eq("status", "pending")
          .maybeSingle();

        if (existingRef) {
          await supabase
            .from("partner_referrals")
            .update({ status: "paying" })
            .eq("id", existingRef.id);
        } else {
          await supabase.from("partner_referrals").insert([
            {
              partner_id: partner.id,
              business_name: data.name,
              email: data.emailContact || "",
              status: "paying"
            }
          ]);
        }
      }
    }

    await logActivity(businessId, "business_created", `New assistant configuration created for '${data.name}' with plan '${data.paymentPlan}'`);

    if (data.emailContact) {
      try {
        const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;
        if (apiKey) {
          const resend = new Resend(apiKey);
          await resend.emails.send({
            from: "ReplyIQ Support <support@replyiq.cv>",
            to: data.emailContact,
            subject: "Your ReplyIQ AI Assistant is Ready!",
            html: renderAiLiveEmail({ name: data.name, businessId })
          });
          console.log(`Live assistant notification sent successfully to ${data.emailContact}`);
        }
      } catch (emailErr) {
        console.error("Failed to send AI Ready notification:", emailErr);
      }
    }

    return { success: true, businessId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 8b. UPDATE BUSINESS CONFIGURATION
export async function updateBusiness(
  businessId: string, 
  data: {
    name: string;
    systemPrompt: string;
    knowledgeBase: string;
    themeColor: string;
    whatsappPhone: string;
    emailContact: string;
    status: string;
    paymentPlan: 'trial' | 'full' | 'installment_2x' | 'installment_3x' | 'starter' | 'professional' | 'enterprise';
    installmentsPaid: number;
    renewalDateStr?: string;
  }
) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  let renewalDate: string | null = null;
  if (data.renewalDateStr) {
    try {
      const parsed = new Date(data.renewalDateStr);
      if (!isNaN(parsed.getTime())) {
        renewalDate = parsed.toISOString();
      }
    } catch (e) {
      console.warn("Invalid renewal date:", data.renewalDateStr);
    }
  }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    // 1. Fetch current installments count to see if we need to log new transactions
    const { data: currentBiz } = await supabase
      .from("businesses")
      .select("installments_paid, name")
      .eq("business_id", businessId)
      .single();

    const currentPaid = currentBiz?.installments_paid || 0;
    const businessName = currentBiz?.name || data.name;

    // 2. Update the business config
    const { error } = await supabase
      .from("businesses")
      .update({
        name: data.name,
        system_prompt: data.systemPrompt,
        knowledge_base: data.knowledgeBase,
        theme_color: data.themeColor,
        whatsapp_phone: data.whatsappPhone,
        email_contact: data.emailContact,
        status: data.status,
        payment_plan: data.paymentPlan,
        installments_paid: data.installmentsPaid,
        renewal_date: renewalDate
      })
      .eq("business_id", businessId);

    if (error) return { success: false, error: error.message };

    // 3. Log a transaction if installments increased
    if (data.installmentsPaid > currentPaid) {
      const addedCount = data.installmentsPaid - currentPaid;
      let amountPerInstallment = 0;
      if (data.paymentPlan === 'installment_2x') {
        amountPerInstallment = 7500;
      } else if (data.paymentPlan === 'installment_3x') {
        amountPerInstallment = 5000;
      } else if (data.paymentPlan === 'starter') {
        amountPerInstallment = 5000;
      } else if (data.paymentPlan === 'professional' || data.paymentPlan === 'full') {
        amountPerInstallment = 15000;
      } else if (data.paymentPlan === 'enterprise') {
        amountPerInstallment = 25000;
      } else if (data.paymentPlan === 'full') {
        amountPerInstallment = 15000;
      }

      if (amountPerInstallment > 0) {
        await supabase.from("transactions").insert([
          {
            business_name: businessName,
            amount: amountPerInstallment * addedCount,
            status: "success"
          }
        ]);
        await logActivity(businessId, "installment_payment_recorded", `Logged payment for ${addedCount} installment(s) (₦${(amountPerInstallment * addedCount).toLocaleString()})`);
      }
    }

    await logActivity(businessId, "business_updated", `Configuration details updated by administrator`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 9. DELETE OPERATIONS (PARTNER, BUSINESS, LEAD, CHAT, TRANSACTION, ERROR)
export async function deletePartner(partnerId: string) {
  try { await requireAuth(); } catch (err) { return { success: false, error: "Unauthorized" }; }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase.from("campus_partners").delete().eq("id", partnerId);
    if (error) return { success: false, error: error.message };
    await logActivity(null, "partner_deleted", `Ambassador with ID '${partnerId}' deleted from partners roster`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteBusiness(businessId: string) {
  try { await requireAuth(); } catch (err) { return { success: false, error: "Unauthorized" }; }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase.from("businesses").delete().eq("business_id", businessId);
    if (error) return { success: false, error: error.message };
    await logActivity(null, "business_deleted", `Assistant configuration for '${businessId}' deleted from platform`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteLead(leadId: string) {
  try { await requireAuth(); } catch (err) { return { success: false, error: "Unauthorized" }; }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase.from("contact_leads").delete().eq("id", leadId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteWhatsAppSession(phone: string) {
  try { await requireAuth(); } catch (err) { return { success: false, error: "Unauthorized" }; }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase.from("whatsapp_sessions").delete().eq("phone", phone);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteTransaction(transactionId: string) {
  try { await requireAuth(); } catch (err) { return { success: false, error: "Unauthorized" }; }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase.from("transactions").delete().eq("id", transactionId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function clearAllErrorLogs() {
  try { await requireAuth(); } catch (err) { return { success: false, error: "Unauthorized" }; }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    // Delete all error logs
    const { error } = await supabase.from("error_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 10. SYSTEM ACTIVITY LOGGING HELPERS
export async function logActivity(businessId: string | null, eventType: string, description: string, metadata: any = {}) {
  if (!supabase) {
    return;
  }

  try {
    await supabase.from("activity_logs").insert([
      {
        business_id: businessId,
        event_type: eventType,
        description,
        metadata
      }
    ]);
  } catch (err) {
    console.error("Failed to write to activity_logs:", err);
  }
}

export async function logError(source: string, message: string, details: string = "") {
  if (!supabase) {
    return;
  }

  try {
    await supabase.from("error_logs").insert([
      {
        source,
        message,
        details
      }
    ]);
  } catch (err) {
    console.error("Failed to write to error_logs:", err);
  }
}

// Update business setup pipeline status (pending_setup → in_progress → live)
export async function updateBusinessSetupStatus(businessId: string, newStatus: "pending_setup" | "in_progress" | "live") {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) {
    return { success: false, error: "Supabase not configured." };
  }

  try {
    const { error } = await supabase
      .from("businesses")
      .update({ setup_status: newStatus })
      .eq("business_id", businessId);

    if (error) return { success: false, error: error.message };

    // If marking as live (paying), also update any pending partner referral for this business
    if (newStatus === "live") {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name, email_contact, referred_by_code, owner_name, password_hash, payment_plan")
        .eq("business_id", businessId)
        .maybeSingle();

      if (biz) {
        let generatedPassword = "";
        
        // If password is not set yet, generate one, hash it and update DB
        if (!biz.password_hash) {
          generatedPassword = Math.random().toString(36).substring(2, 12);
          const passwordHash = crypto.createHash("sha256").update(generatedPassword).digest("hex");
          await supabase
            .from("businesses")
            .update({ password_hash: passwordHash })
            .eq("business_id", businessId);
        }

        try {
          const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;
          if (apiKey && biz.email_contact) {
            const resend = new Resend(apiKey);
            
            const emailHtml = generatedPassword
              ? renderBusinessActivationEmail({
                  name: biz.owner_name || biz.name,
                  businessId,
                  email: biz.email_contact,
                  passwordStr: generatedPassword
                })
              : renderAiLiveEmail({ name: biz.owner_name || biz.name, businessId });

            await resend.emails.send({
              from: "ReplyIQ Support <support@replyiq.cv>",
              to: biz.email_contact,
              subject: generatedPassword
                ? "Your ReplyIQ Business Portal Credentials & AI Assistant are Ready!"
                : "Your ReplyIQ AI Assistant is Ready!",
              html: emailHtml
            });
            console.log(`Live assistant notification sent successfully to ${biz.email_contact}`);
          }
        } catch (emailErr) {
          console.error("Failed to send AI Ready notification:", emailErr);
        }
      }

      if (biz?.referred_by_code) {
        const { data: partner } = await supabase
          .from("campus_partners")
          .select("id")
          .ilike("referral_code", biz.referred_by_code)
          .maybeSingle();

        if (partner) {
          // Upgrade pending referral to paying
          const { data: existingRef } = await supabase
            .from("partner_referrals")
            .select("id")
            .eq("partner_id", partner.id)
            .eq("email", biz.email_contact || "")
            .eq("status", "pending")
            .maybeSingle();

          if (existingRef) {
            await supabase
              .from("partner_referrals")
              .update({ status: "paying" })
              .eq("id", existingRef.id);

            let transactionAmount = 15000;
            if (biz.payment_plan === "starter") {
              transactionAmount = 5000;
            } else if (biz.payment_plan === "enterprise") {
              transactionAmount = 25000;
            } else if (biz.payment_plan === "trial") {
              transactionAmount = 0;
            }

            await supabase.from("transactions").insert([{
              business_name: biz.name,
              amount: transactionAmount,
              status: "success"
            }]);
          }
        }
      }

      await logActivity(businessId, "business_went_live", `Business '${businessId}' marked as live and set up.`);
    } else {
      await logActivity(businessId, "setup_status_updated", `Business '${businessId}' setup status changed to '${newStatus}'.`);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update setup status." };
  }
}

// 11. GET VERCEL LOGS
export async function getVercelLogs() {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  const authToken = process.env.VERCEL_AUTH_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!authToken || !projectId) {
    return {
      success: false,
      error: "Vercel configuration missing",
      details: "Ensure VERCEL_AUTH_TOKEN and VERCEL_PROJECT_ID environment variables are set."
    };
  }

  try {
    const teamParam = teamId ? `&teamId=${teamId}` : "";
    
    // First, try to fetch the active production deployment
    let deplUrl = `https://api.vercel.com/v6/deployments?projectId=${projectId}&target=production&state=READY&limit=1${teamParam}`;
    let deplRes = await fetch(deplUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    if (!deplRes.ok) {
      const errText = await deplRes.text();
      return { success: false, error: `Failed to fetch deployment details: ${deplRes.statusText}`, details: errText };
    }

    let deplData = await deplRes.json();
    let deploymentId = deplData.deployments?.[0]?.uid;

    // Fallback to the latest deployment overall if no production target is found
    if (!deploymentId) {
      deplUrl = `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1${teamParam}`;
      deplRes = await fetch(deplUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (deplRes.ok) {
        deplData = await deplRes.json();
        deploymentId = deplData.deployments?.[0]?.uid;
      }
    }

    if (!deploymentId) {
      return { success: false, error: "No active deployments found for this project." };
    }

    const logsUrl = `https://api.vercel.com/v1/projects/${projectId}/deployments/${deploymentId}/runtime-logs?limit=100${teamId ? `&teamId=${teamId}` : ""}`;
    const logsRes = await fetch(logsUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    if (!logsRes.ok) {
      const errText = await logsRes.text();
      return { success: false, error: `Failed to fetch runtime logs: ${logsRes.statusText}`, details: errText };
    }

    let logsText = "";
    const reader = logsRes.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      const maxLogs = 100;
      let isFinished = false;

      const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 1500));

      const readStream = async () => {
        try {
          while (!isFinished) {
            const { done, value } = await reader.read();
            if (done) break;
            logsText += decoder.decode(value, { stream: true });
            const lines = logsText.split("\n");
            if (lines.length > maxLogs + 1) {
              isFinished = true;
              await reader.cancel();
              break;
            }
          }
        } catch (e) {
          console.error("Error reading Vercel log stream:", e);
        } finally {
          isFinished = true;
        }
      };

      await Promise.race([readStream(), timeoutPromise]);

      if (!isFinished) {
        isFinished = true;
        try {
          await reader.cancel();
        } catch (e) {}
      }
    } else {
      logsText = await logsRes.text();
    }

    const lines = logsText.split("\n").filter(Boolean);
    const parsedLogs = lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return { message: line, level: "info", timestampInMs: Date.now() };
      }
    });

    return { success: true, logs: parsedLogs };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to retrieve Vercel logs" };
  }
}

// 12. SEND NEWSLETTER BROADCAST
export async function sendNewsletterBroadcast(
  subject: string, 
  content: string, 
  customEmails?: string,
  targetType: "both" | "subscribers" | "manual" = "both"
) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    let emails: string[] = [];

    // 1. Gather existing subscribers if target is "both" or "subscribers"
    if (targetType === "both" || targetType === "subscribers") {
      const { data: subscribers, error: subError } = await supabase
        .from("newsletter_subscribers")
        .select("email");

      if (subError) {
        return { success: false, error: subError.message };
      }

      emails = (subscribers || []).map((s: any) => s.email).filter(Boolean);
    }

    // 2. Gather, auto-subscribe, and add custom emails if target is "both" or "manual"
    if ((targetType === "both" || targetType === "manual") && customEmails && customEmails.trim()) {
      const customList = customEmails
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0 && e.includes("@"));

      if (customList.length > 0) {
        // Query to see which custom emails are already in the database
        const { data: existingSubs } = await supabase
          .from("newsletter_subscribers")
          .select("email")
          .in("email", customList);

        const existingEmailsSet = new Set((existingSubs || []).map(s => s.email.toLowerCase()));
        const newEmailsToInsert = customList.filter(email => !existingEmailsSet.has(email));

        if (newEmailsToInsert.length > 0) {
          const insertPayload = newEmailsToInsert.map(email => ({ email }));
          const { error: insertError } = await supabase
            .from("newsletter_subscribers")
            .insert(insertPayload);
          
          if (insertError) {
            console.error("Failed to auto-subscribe custom emails:", insertError);
          } else {
            console.log(`Auto-subscribed ${newEmailsToInsert.length} new custom emails`);
          }
        }

        // Merge custom emails with the final sending list
        if (targetType === "manual") {
          emails = Array.from(new Set(customList));
        } else {
          emails = Array.from(new Set([...emails, ...customList]));
        }
      }
    }

    if (emails.length === 0) {
      await logActivity(null, "newsletter_broadcast_skipped", "Newsletter broadcast skipped: No recipients found.");
      return { success: true, count: 0 };
    }

    const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "ReplyIQ Newsletter <support@replyiq.cv>",
        to: "support@replyiq.cv",
        bcc: emails,
        subject: subject,
        html: renderNewsletterEmail(subject, formatEmailBody(content))
      });
      await logActivity(null, "newsletter_broadcast", `Newsletter broadcasted to ${emails.length} recipients: "${subject}"`);
      return { success: true, count: emails.length };
    } else {
      return { success: false, error: "Resend API key is missing in environmental variables." };
    }
  } catch (err: any) {
    console.error("Newsletter broadcast error:", err);
    return { success: false, error: err.message || "Failed to broadcast newsletter." };
  }
}

// Helper to format raw newlines to HTML breaks for plain-text email bodies
function formatEmailBody(body: string): string {
  if (!body) return "";
  return body.replace(/\r?\n/g, "<br />");
}

// 13. DELETE NEWSLETTER SUBSCRIBER
export async function deleteNewsletterSubscriber(id: string) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    await logActivity(null, "newsletter_subscriber_deleted", `Newsletter subscriber with ID '${id}' deleted.`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete subscriber." };
  }
}

// 14. SEND PERSONALIZED AMBASSADOR EMAIL
export async function sendPersonalizedAmbassadorEmail(email: string, subject: string, content: string) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!email.trim() || !subject.trim() || !content.trim()) {
    return { success: false, error: "All fields are required." };
  }

  const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "ReplyIQ Ambassadors <support@replyiq.cv>",
        to: email.trim(),
        subject: subject,
        html: renderNewsletterEmail(subject, formatEmailBody(content))
      });
      await logActivity(null, "ambassador_email_sent", `Ambassador email sent to ${email}: "${subject}"`);
      return { success: true };
    } catch (err: any) {
      console.error("Personalized email sending error:", err);
      return { success: false, error: err.message || "Failed to send email." };
    }
  } else {
    return { success: false, error: "Resend API key is missing in environmental variables." };
  }
}

// 15. TOGGLE PARTNER AMBASSADOR STATUS
export async function togglePartnerAmbassadorStatus(partnerId: string, isAmbassador: boolean) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase
      .from("campus_partners")
      .update({ is_ambassador: isAmbassador })
      .eq("id", partnerId);

    if (error) {
      return { success: false, error: error.message };
    }

    await logActivity(null, "partner_ambassador_status_toggled", `Ambassador status for partner ID '${partnerId}' set to ${isAmbassador}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update ambassador status." };
  }
}

// 16. WEB WEBSITE CONTENT EXTRACTOR HELPERS
async function fetchWebsiteText(url: string): Promise<string> {
  try {
    let cleanUrl = url.trim();
    if (!cleanUrl) return "";
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }
    const response = await fetch(cleanUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000) // 8-second timeout
    });
    if (!response.ok) {
      return "";
    }
    const html = await response.text();
    // Strip script and style tags, iframes, and SVGs
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");
    
    // Strip HTML tags
    text = text.replace(/<[^>]+>/g, " ");
    
    // Decode common entities
    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Clean up multiple spaces and newlines
    text = text.replace(/\s+/g, " ").trim();
    return text.substring(0, 3000); // Truncate to first 3000 chars to avoid token bloat
  } catch (error) {
    console.error(`Error fetching website text from ${url}:`, error);
    return "";
  }
}

// 17. IMPORT MARKETING LEADS FROM CSV
export async function importMarketingLeads(leads: any[]) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) {
    return { success: false, error: "Supabase client not configured." };
  }

  try {
    const { data, error } = await supabase
      .from("marketing_leads")
      .insert(leads)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    await logActivity(null, "marketing_leads_imported", `Imported ${leads.length} marketing leads from CSV`);
    return { success: true, count: leads.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 18. GENERATE AI MARKETING OUTBOUND COPY (WEBSITE SCRAPE + CLOUDFLARE AI PROMPT)
export async function generateAiMarketingOutreach(leadIds: string[]) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) {
    return { success: false, error: "Supabase client not configured." };
  }

  const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

  if (!ACCOUNT_ID || !API_TOKEN) {
    return { success: false, error: "Cloudflare credentials are not configured in environment variables." };
  }

  const results = [];

  for (const id of leadIds) {
    try {
      const { data: lead, error: fetchErr } = await supabase
        .from("marketing_leads")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchErr || !lead) {
        results.push({ id, success: false, error: "Lead not found." });
        continue;
      }

      // Set state to fetching
      await supabase.from("marketing_leads").update({ status: "fetching" }).eq("id", id);

      // Scrape website text
      let websiteText = "";
      if (lead.website) {
        websiteText = await fetchWebsiteText(lead.website);
      }

      // Prepare AI outreach pitch prompt
      const promptContext = websiteText 
        ? `Website content snippet for "${lead.name}":\n"""\n${websiteText}\n"""`
        : `No website content was available. The business name is "${lead.name}" and they are in the "${lead.category || 'General'}" category.`;

      const prompt = `You are Unity Ekeoba, the founder of ReplyIQ (replyiq.cv). ReplyIQ is a premium SaaS platform offering AI customer support assistants that automate FAQ handling, process user requests, and integrate seamlessly with WhatsApp and web chat widgets.

Your goal is to draft a highly personalized, compelling outbound cold sales email to pitch ReplyIQ to a prospective business.
Here is the prospect's details:
Name: ${lead.name}
Category: ${lead.category || 'Unknown'}
${promptContext}

Write a sales email that is professional, warm, and directly addresses how ReplyIQ can automate their customer support, handle WhatsApp queries, or improve their operations.

IMPORTANT Rules:
1. The tone must be clean, executive, and founder-to-founder.
2. The email should be a normal plain-text style email (we will render it on a clean white background).
3. Do not include signature placeholder lines like "[Your Name]" or "Unity Ekeoba" inside the body - we will append it automatically.
4. You MUST include a link to our website with tracking parameter at the end of the email body, formatted exactly as: https://replyiq.cv/?utm_source=cold_outreach&lead_id=${lead.id}. Present it as the final line of your pitch body (e.g., "Check out how it works here: https://replyiq.cv/?utm_source=cold_outreach&lead_id=${lead.id}").
5. Respond ONLY with a JSON object. Do not include any markdown backticks (\`\`\`json) or extra text outside the JSON.

Expected JSON format:
{
  "subject": "A personalized, hook-style subject line",
  "body": "Hi [Contact Name or Team at Business Name],\\n\\n[A personalized paragraph highlighting what they do based on their website and category]\\n\\n[A pitch connecting it to ReplyIQ's WhatsApp & web support AI, saving them time/money]\\n\\n[A clear, soft call-to-action asking if they'd be open to a quick chat next week.]\\n\\nCheck out how it works here: https://replyiq.cv/?utm_source=cold_outreach&lead_id=${lead.id}"
}`;

      // Call Cloudflare AI (Llama 3.1 8b)
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct-fast`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: "You are a professional B2B copywriter and sales strategist. You only respond in JSON format." },
              { role: "user", content: prompt }
            ]
          }),
          signal: AbortSignal.timeout(15000)
        }
      );

      if (!response.ok) {
        throw new Error(`Cloudflare AI request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.result) {
        throw new Error("Cloudflare AI did not return a successful response.");
      }

      let aiResponseText = "";
      let parsedJson = null;
      const rawResponse = data.result.response;

      if (typeof rawResponse === "string") {
        aiResponseText = rawResponse.trim();
      } else if (rawResponse && typeof rawResponse === "object") {
        parsedJson = rawResponse;
      } else if (typeof data.result === "string") {
        aiResponseText = data.result.trim();
      } else if (data.result && typeof data.result === "object") {
        // If data.result itself is the object and doesn't contain response field
        parsedJson = data.result;
      }

      if (!parsedJson && aiResponseText) {
        try {
          const jsonStr = aiResponseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
          parsedJson = JSON.parse(jsonStr);
        } catch (e) {
          console.warn("Failed to parse JSON response, using fallback extraction", e);
          const subjectMatch = aiResponseText.match(/"subject"\s*:\s*"([^"]+)"/);
          const bodyMatch = aiResponseText.match(/"body"\s*:\s*"([\s\S]+?)"(?=\s*})/);
          parsedJson = {
            subject: subjectMatch ? subjectMatch[1] : `Improving customer experience for ${lead.name}`,
            body: bodyMatch ? bodyMatch[1].replace(/\\n/g, "\n") : aiResponseText
          };
        }
      }

      if (!parsedJson) {
        parsedJson = {
          subject: `Improving customer experience for ${lead.name}`,
          body: `Hi Team,\n\nI was looking at your business and thought we could help...`
        };
      }

      // Update DB with fetched status and details
      const rawBody = parsedJson.body || `Hi Team,\n\nI was looking at your business and thought we could help...`;
      const cleanedBody = cleanPlainOutreachText(rawBody, id);

      const { error: updateErr } = await supabase
        .from("marketing_leads")
        .update({
          status: "fetched",
          ai_subject: (parsedJson.subject || `Partnering with ${lead.name}`).trim(),
          ai_body: cleanedBody
        })
        .eq("id", id);

      if (updateErr) throw new Error(updateErr.message);
      results.push({ id, success: true });
    } catch (err: any) {
      console.error(`AI enrichment failed for lead ${id}:`, err);
      results.push({ id, success: false, error: err.message || "Failed during AI pitch generation" });
      await supabase.from("marketing_leads").update({ status: "failed" }).eq("id", id);
    }
  }

  return { success: true, results };
}

// 19. BROADCAST COLD EMAIL (SEND PERSONALIZED COLD MAIL VIA RESEND)
export async function sendColdOutboundEmails(leads: { id: string; email: string; subject: string; body: string }[]) {
  try {
    await requireAuth();
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }

  const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Resend API key is missing in environmental variables." };
  }

  const resend = new Resend(apiKey);
  const results = [];

  for (const lead of leads) {
    try {
      const htmlContent = renderColdOutboundEmail({
        subject: lead.subject,
        body: lead.body,
        leadId: lead.id
      });

      const { error } = await resend.emails.send({
        from: "Unity Ekeoba <unity@replyiq.cv>",
        to: lead.email,
        subject: lead.subject,
        html: htmlContent
      });

      if (error) {
        console.error(`Failed to send email to ${lead.email}:`, error);
        results.push({ id: lead.id, success: false, error: error.message });
        await supabase!
          .from("marketing_leads")
          .update({ status: "failed" })
          .eq("id", lead.id);
      } else {
        results.push({ id: lead.id, success: true });
        await supabase!
          .from("marketing_leads")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", lead.id);
        
        await logActivity(null, "outbound_email_sent", `Sent personalized cold email to ${lead.email}`);
      }
    } catch (err: any) {
      console.error(`Error sending to ${lead.email}:`, err);
      results.push({ id: lead.id, success: false, error: err.message });
      await supabase!
        .from("marketing_leads")
        .update({ status: "failed" })
        .eq("id", lead.id);
    }
  }

  return { success: true, results };
}

// 20. DELETE MARKETING LEAD
export async function deleteMarketingLead(leadId: string) {
  try { await requireAuth(); } catch (err) { return { success: false, error: "Unauthorized" }; }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase.from("marketing_leads").delete().eq("id", leadId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 21. CLEAR ALL MARKETING LEADS
export async function clearAllMarketingLeads() {
  try { await requireAuth(); } catch (err) { return { success: false, error: "Unauthorized" }; }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase.from("marketing_leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 22. RESET MARKETING LEAD PITCH (CLEAR AI SUBJECT AND BODY)
export async function resetMarketingLeadPitch(leadId: string) {
  try { await requireAuth(); } catch (err) { return { success: false, error: "Unauthorized" }; }

  if (!supabase) {
    return { success: false, error: "Supabase database client is not configured." };
  }

  try {
    const { error } = await supabase
      .from("marketing_leads")
      .update({
        status: "pending",
        ai_subject: null,
        ai_body: null
      })
      .eq("id", leadId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


