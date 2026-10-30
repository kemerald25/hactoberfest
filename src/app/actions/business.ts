"use server";

import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import { Resend } from "resend";
import { renderPasswordResetEmail } from "@/lib/email-template";
import { logActivity } from "@/app/actions/admin";

// Helpers
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Schemas
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// 1. BUSINESS LOGIN
export async function loginBusiness(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";

  const validated = LoginSchema.safeParse({ email, password });
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  if (!supabase) {
    return { success: false, error: "Database is not configured." };
  }

  try {
    const password_hash = hashPassword(password);
    const { data: business, error } = await supabase
      .from("businesses")
      .select("id, business_id, name")
      .eq("email_contact", email)
      .eq("password_hash", password_hash)
      .maybeSingle();

    if (error || !business) {
      return { success: false, error: "Invalid email or password." };
    }

    const cookieStore = await cookies();
    cookieStore.set("business_session", business.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    await logActivity(business.business_id, "business_login", `Business owner for '${business.name}' logged in`);
    return { success: true, businessId: business.business_id };
  } catch (err: any) {
    console.error("Business login crash:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

// 2. BUSINESS LOGOUT
export async function logoutBusiness() {
  const cookieStore = await cookies();
  cookieStore.delete("business_session");
  return { success: true };
}

// 3. GET SESSION DATA
export async function checkBusinessSession(businessIdSlug: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("business_session")?.value;

  if (!sessionToken || !supabase) {
    return false;
  }

  try {
    const { data: biz } = await supabase
      .from("businesses")
      .select("id")
      .eq("business_id", businessIdSlug)
      .eq("id", sessionToken)
      .maybeSingle();

    return !!biz;
  } catch {
    return false;
  }
}

// 4. GET BUSINESS DASHBOARD DATA
export async function getBusinessDashboardData(businessIdSlug: string) {
  const isAuth = await checkBusinessSession(businessIdSlug);
  if (!isAuth) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    // Fetch business details
    const { data: business, error: bizErr } = await supabase!
      .from("businesses")
      .select("*")
      .eq("business_id", businessIdSlug)
      .single();

    if (bizErr || !business) {
      return { success: false, error: "Business details not found." };
    }

    // Fetch all logs from training_logs for analytics and threads
    const { data: logs, error: logsErr } = await supabase!
      .from("training_logs")
      .select("session_id, channel, role, created_at, metadata")
      .eq("business_id", businessIdSlug)
      .order("created_at", { ascending: false });

    if (logsErr) {
      console.error("Error fetching training logs for business:", logsErr);
    }

    // Process logs to extract unique chat threads
    const threadMap = new Map<string, { session_id: string; channel: string; last_active: string; message_count: number }>();
    let totalMessages = 0;
    let totalResponseTime = 0;
    let responseCount = 0;
    
    const channelCounts: Record<string, number> = { widget: 0, standalone: 0, whatsapp: 0 };
    const langCounts: Record<string, number> = {};

    if (logs) {
      totalMessages = logs.length;
      for (const log of logs) {
        // Threads mapping
        const existing = threadMap.get(log.session_id);
        if (!existing) {
          threadMap.set(log.session_id, {
            session_id: log.session_id,
            channel: log.channel,
            last_active: log.created_at,
            message_count: 1
          });
        } else {
          existing.message_count += 1;
        }

        // Metrics calculations
        if (log.channel) {
          channelCounts[log.channel] = (channelCounts[log.channel] || 0) + 1;
        }
        
        if (log.role === "assistant" && log.metadata?.response_time_ms) {
          totalResponseTime += Number(log.metadata.response_time_ms);
          responseCount++;
        }

        if (log.metadata?.language) {
          const lang = log.metadata.language;
          langCounts[lang] = (langCounts[lang] || 0) + 1;
        }
      }
    }

    const threads = Array.from(threadMap.values());
    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

    return {
      success: true,
      business,
      threads,
      metrics: {
        totalMessages,
        totalChats: threads.length,
        avgResponseTime,
        channelDistribution: channelCounts,
        languageDistribution: langCounts
      }
    };

  } catch (err: any) {
    console.error("Dashboard data crash:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

// 5. GET SESSION MESSAGES
export async function getSessionMessages(businessIdSlug: string, sessionId: string) {
  const isAuth = await checkBusinessSession(businessIdSlug);
  if (!isAuth) {
    return { success: false, error: "Unauthorized access." };
  }

  if (!supabase) {
    return { success: false, error: "Database client is offline." };
  }

  try {
    const { data: messages, error } = await supabase
      .from("training_logs")
      .select("role, content, created_at, metadata")
      .eq("business_id", businessIdSlug)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messages: messages || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 6. UPDATE KNOWLEDGE BASE
export async function updateBusinessKbFromDashboard(
  businessIdSlug: string,
  data: { systemPrompt: string; knowledgeBase: string }
) {
  const isAuth = await checkBusinessSession(businessIdSlug);
  if (!isAuth) {
    return { success: false, error: "Unauthorized access." };
  }

  if (!supabase) {
    return { success: false, error: "Database client is offline." };
  }

  try {
    const { error } = await supabase
      .from("businesses")
      .update({
        system_prompt: data.systemPrompt,
        knowledge_base: data.knowledgeBase,
      })
      .eq("business_id", businessIdSlug);

    if (error) {
      return { success: false, error: error.message };
    }

    await logActivity(businessIdSlug, "kb_updated_by_owner", "Knowledge base details updated by business owner");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 7. CHANGE PASSWORD
export async function changeBusinessPassword(
  businessIdSlug: string,
  formData: FormData
) {
  const isAuth = await checkBusinessSession(businessIdSlug);
  if (!isAuth) {
    return { success: false, error: "Unauthorized access." };
  }

  const currentPassword = formData.get("currentPassword")?.toString() || "";
  const newPassword = formData.get("newPassword")?.toString() || "";

  const validated = ChangePasswordSchema.safeParse({ currentPassword, newPassword });
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  if (!supabase) {
    return { success: false, error: "Database client is offline." };
  }

  try {
    // Verify current password first
    const currentHash = hashPassword(currentPassword);
    const { data: business, error: selectErr } = await supabase
      .from("businesses")
      .select("id")
      .eq("business_id", businessIdSlug)
      .eq("password_hash", currentHash)
      .maybeSingle();

    if (selectErr || !business) {
      return { success: false, error: "Current password is incorrect." };
    }

    // Update with new password hash
    const newHash = hashPassword(newPassword);
    const { error: updateErr } = await supabase
      .from("businesses")
      .update({ password_hash: newHash })
      .eq("business_id", businessIdSlug);

    if (updateErr) {
      return { success: false, error: "Failed to update password." };
    }

    await logActivity(businessIdSlug, "password_changed_by_owner", "Business owner changed account password");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 8. REQUEST PASSWORD RESET
export async function requestPasswordReset(email: string, portal: "business" | "partner") {
  if (!supabase) {
    return { success: false, error: "Database client is offline." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  try {
    let userName = "";
    let isFound = false;

    if (portal === "business") {
      const { data: biz } = await supabase
        .from("businesses")
        .select("business_id, name, owner_name")
        .eq("email_contact", cleanEmail)
        .maybeSingle();

      if (biz) {
        isFound = true;
        userName = biz.owner_name || biz.name;
        await supabase
          .from("businesses")
          .update({ reset_token: token, reset_token_expires: expires })
          .eq("email_contact", cleanEmail);
      }
    } else {
      const { data: partner } = await supabase
        .from("campus_partners")
        .select("id, name")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (partner) {
        isFound = true;
        userName = partner.name;
        await supabase
          .from("campus_partners")
          .update({ reset_token: token, reset_token_expires: expires })
          .eq("email", cleanEmail);
      }
    }

    if (!isFound) {
      // Return success to prevent email enumeration attacks
      return { success: true, message: "If the email is registered, a password reset link has been sent." };
    }

    // Send reset email
    const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const host = process.env.NEXT_PUBLIC_APP_URL || "https://replyiq.cv";
      const resetLink = `${host}/reset-password?token=${token}&portal=${portal}`;

      await resend.emails.send({
        from: "ReplyIQ Accounts <support@replyiq.cv>",
        to: cleanEmail,
        subject: "Reset Your ReplyIQ Account Password",
        html: renderPasswordResetEmail({ name: userName, resetLink })
      });
    } else {
      console.warn("Resend API key missing in environment. Reset link: ", token);
    }

    return { success: true, message: "If the email is registered, a password reset link has been sent." };
  } catch (err: any) {
    console.error("Password reset request crash:", err);
    return { success: false, error: err.message || "An error occurred." };
  }
}

// 9. RESET PASSWORD (using token)
export async function resetPassword(
  token: string,
  portal: "business" | "partner",
  newPasswordStr: string
) {
  if (!token || !supabase) {
    return { success: false, error: "Invalid request parameters or database offline." };
  }

  if (newPasswordStr.length < 6) {
    return { success: false, error: "New password must be at least 6 characters." };
  }

  const passwordHash = hashPassword(newPasswordStr);
  const now = new Date().toISOString();

  try {
    let success = false;

    if (portal === "business") {
      const { data: biz, error } = await supabase
        .from("businesses")
        .select("business_id")
        .eq("reset_token", token)
        .gt("reset_token_expires", now)
        .maybeSingle();

      if (biz && !error) {
        success = true;
        await supabase
          .from("businesses")
          .update({
            password_hash: passwordHash,
            reset_token: null,
            reset_token_expires: null
          })
          .eq("business_id", biz.business_id);
          
        await logActivity(biz.business_id, "password_reset_by_owner", "Password successfully reset via token");
      }
    } else {
      const { data: partner, error } = await supabase
        .from("campus_partners")
        .select("id")
        .eq("reset_token", token)
        .gt("reset_token_expires", now)
        .maybeSingle();

      if (partner && !error) {
        success = true;
        await supabase
          .from("campus_partners")
          .update({
            password_hash: passwordHash,
            reset_token: null,
            reset_token_expires: null
          })
          .eq("id", partner.id);
          
        await logActivity(null, "partner_password_reset", `Campus partner with ID '${partner.id}' reset password via token`);
      }
    }

    if (!success) {
      return { success: false, error: "Invalid or expired password reset token." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Password reset token save error:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

// 10. GET PUBLIC SESSION MESSAGES (for visitor widget history restore)
export async function getPublicSessionMessages(businessIdSlug: string, sessionId: string) {
  if (!supabase) {
    return { success: false, error: "Database offline" };
  }
  try {
    const { data: logs, error } = await supabase
      .from("training_logs")
      .select("role, content, created_at")
      .eq("business_id", businessIdSlug)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    // Map database roles ('user', 'assistant') to widget roles ('user', 'model')
    const messages = (logs || []).map((log) => ({
      role: log.role === "assistant" ? "model" as const : "user" as const,
      content: log.content,
    }));

    return { success: true, messages };
  } catch (err: any) {
    return { success: false, error: err.message || "An error occurred." };
  }
}
