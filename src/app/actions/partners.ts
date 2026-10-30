"use server";

import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import { logActivity } from "@/app/actions/admin";
import { Resend } from "resend";
import { renderAmbassadorWelcomeEmail } from "@/lib/email-template";

// Zod schemas for validation
const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  whatsapp: z.string().min(5, "WhatsApp number must be valid"),
  university: z.string().min(2, "University is required"),
  faculty: z.string().min(2, "Faculty is required"),
  department: z.string().min(2, "Department is required"),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Helper to hash password using native Node.js crypto
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Helper to generate referral code
function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, "").toUpperCase().substring(0, 5);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}-${randomNum}`;
}

async function sendWelcomeEmail(name: string, email: string, referralCode: string) {
  try {
    const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "ReplyIQ Ambassadors <support@replyiq.cv>",
        to: email,
        subject: "Welcome to the ReplyIQ Campus Partner Program!",
        html: renderAmbassadorWelcomeEmail({ name, referralCode })
      });
      console.log(`Welcome email successfully sent to ${email}`);
    } else {
      console.warn("Resend API key missing in environment. Welcome email not sent.");
    }
  } catch (err) {
    console.error("Failed to send ambassador welcome email:", err);
  }
}

// 1. REGISTER ACTION
export async function registerPartner(formData: FormData) {
  const rawData = {
    name: formData.get("name")?.toString() || "",
    email: formData.get("email")?.toString().trim().toLowerCase() || "",
    password: formData.get("password")?.toString() || "",
    whatsapp: formData.get("whatsapp")?.toString() || "",
    university: formData.get("university")?.toString() || "",
    faculty: formData.get("faculty")?.toString() || "",
    department: formData.get("department")?.toString() || "",
  };

  const validated = RegisterSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const { name, email, password, whatsapp, university, faculty, department } = validated.data;
  const password_hash = hashPassword(password);
  const referral_code = generateReferralCode(name);

  const cookieStore = await cookies();
  const deviceId = cookieStore.get("replyiq_device_id")?.value || "";

  // If Supabase is not configured, fallback to cookie-based mock store for prototype
  if (!supabase) {
    const mockPartner = {
      id: "mock-uuid-12345",
      name,
      email,
      whatsapp,
      university,
      faculty,
      department,
      referral_code,
      created_at: new Date().toISOString(),
    };

    const cookieStore = await cookies();
    cookieStore.set("partner_session", mockPartner.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    cookieStore.set("mock_partner_profile", JSON.stringify(mockPartner), {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Seed mock referrals so they see a populated dashboard
    const mockReferrals = [
      { id: "ref-1", business_name: "Swift Logistics", email: "info@swiftlog.com", status: "paying", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "ref-2", business_name: "Zeta Fashion", email: "hello@zetafashion.com", status: "paying", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "ref-3", business_name: "Beta Academy", email: "admissions@beta.edu", status: "pending", created_at: new Date().toISOString() },
    ];
    cookieStore.set("mock_partner_referrals", JSON.stringify(mockReferrals), {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    await logActivity(null, "partner_registered", `Ambassador '${name}' (${email}) registered from ${university}`);
    await sendWelcomeEmail(name, email, referral_code);
    return { success: true, partner: mockPartner };
  }

  try {
    // Check if email already exists
    const { data: existingPartners } = await supabase
      .from("campus_partners")
      .select("id")
      .eq("email", email);

    if (existingPartners && existingPartners.length > 0) {
      return { success: false, error: "Email already registered as a partner." };
    }

    // Insert partner
    const { data: newPartner, error } = await supabase
      .from("campus_partners")
      .insert([
        {
          name,
          email,
          whatsapp,
          university,
          faculty,
          department,
          referral_code,
          password_hash,
          device_id: deviceId,
        },
      ])
      .select()
      .single();

    if (error || !newPartner) {
      console.error("Supabase insert error:", error);
      return { success: false, error: "Failed to register. Please try again." };
    }

    const cookieStore = await cookies();
    cookieStore.set("partner_session", newPartner.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    await logActivity(null, "partner_registered", `Ambassador '${name}' (${email}) registered from ${university}`);
    await sendWelcomeEmail(name, email, referral_code);
    return { success: true, partner: newPartner };
  } catch (err) {
    console.error("Registration crash:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

// 2. LOGIN ACTION
export async function loginPartner(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";

  const validated = LoginSchema.safeParse({ email, password });
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const password_hash = hashPassword(password);

  // If Supabase is not configured, allow logging in with any mock details
  if (!supabase) {
    const mockProfileStr = (await cookies()).get("mock_partner_profile")?.value;
    let mockPartner;
    if (mockProfileStr) {
      mockPartner = JSON.parse(mockProfileStr);
    } else {
      mockPartner = {
        id: "mock-uuid-12345",
        name: "Demo Partner",
        email: email,
        whatsapp: "+2348012345678",
        university: "University of Lagos",
        faculty: "Science",
        department: "Computer Science",
        referral_code: "DEMO-7391",
        created_at: new Date().toISOString(),
      };
      const cookieStore = await cookies();
      cookieStore.set("mock_partner_profile", JSON.stringify(mockPartner), {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      // Seed mock referrals
      const mockReferrals = [
        { id: "ref-1", business_name: "Swift Logistics", email: "info@swiftlog.com", status: "paying", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "ref-2", business_name: "Zeta Fashion", email: "hello@zetafashion.com", status: "paying", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "ref-3", business_name: "Beta Academy", email: "admissions@beta.edu", status: "pending", created_at: new Date().toISOString() },
      ];
      cookieStore.set("mock_partner_referrals", JSON.stringify(mockReferrals), {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    const cookieStore = await cookies();
    cookieStore.set("partner_session", mockPartner.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true, partner: mockPartner };
  }

  try {
    const { data: partner, error } = await supabase
      .from("campus_partners")
      .select("*")
      .eq("email", email)
      .eq("password_hash", password_hash)
      .maybeSingle();

    if (error || !partner) {
      return { success: false, error: "Invalid email or password." };
    }

    const cookieStore = await cookies();
    cookieStore.set("partner_session", partner.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true, partner };
  } catch (err) {
    console.error("Login crash:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

// 3. LOGOUT ACTION
export async function logoutPartner() {
  const cookieStore = await cookies();
  cookieStore.delete("partner_session");
  return { success: true };
}

// 4. GET PARTNER DASHBOARD DATA ACTION
export async function getPartnerDashboardData() {
  const cookieStore = await cookies();
  const partnerId = cookieStore.get("partner_session")?.value;

  if (!partnerId) {
    return { success: false, error: "Not logged in" };
  }

  // Fallback for mock dashboard
  if (!supabase) {
    const profileStr = cookieStore.get("mock_partner_profile")?.value;
    const referralsStr = cookieStore.get("mock_partner_referrals")?.value;

    if (!profileStr) {
      return { success: false, error: "No profile found" };
    }

    const partner = JSON.parse(profileStr);
    const referrals = referralsStr ? JSON.parse(referralsStr) : [];

    return {
      success: true,
      partner,
      referrals,
      metrics: calculateMetrics(referrals, partner),
    };
  }

  try {
    const { data: partner, error: partnerError } = await supabase
      .from("campus_partners")
      .select("id, name, email, whatsapp, university, faculty, department, referral_code, created_at, is_ambassador")
      .eq("id", partnerId)
      .maybeSingle();

    if (partnerError || !partner) {
      return { success: false, error: "Partner profile not found" };
    }

    const { data: referrals, error: referralsError } = await supabase
      .from("partner_referrals")
      .select("*")
      .eq("partner_id", partner.id)
      .order("created_at", { ascending: false });

    if (referralsError) {
      console.error("Referrals retrieval error:", referralsError);
      return { success: false, error: "Failed to load referrals" };
    }

    return {
      success: true,
      partner,
      referrals: referrals || [],
      metrics: calculateMetrics(referrals || [], partner),
    };
  } catch (err) {
    console.error("Stats crash:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

// Helper to compute referral rewards based on current pay structures
interface Referral {
  status: string;
}

function calculateMetrics(referrals: Referral[], partner?: any) {
  const totalReferrals = referrals.length;
  const payingReferrals = referrals.filter((r) => r.status === "paying").length;
  const pendingReferrals = totalReferrals - payingReferrals;

  // Tier calculation:
  // Tier 1: 1 paying business -> ₦1,500 (₦2,000 if Ambassador)
  // Tier 2: 3 paying businesses -> Free Setup
  // Tier 3: 5 paying businesses -> Official Partner (₦2,000 commission)
  // Tier 4: 10 paying businesses -> Senior Partner (₦2,500 commission)
  let currentTier = "None";
  let tierNumber = 0;
  if (payingReferrals >= 10) {
    currentTier = "Senior Partner (Tier 4)";
    tierNumber = 4;
  } else if (payingReferrals >= 5) {
    currentTier = "Official Partner (Tier 3)";
    tierNumber = 3;
  } else if (payingReferrals >= 3) {
    currentTier = "Free Setup Earner (Tier 2)";
    tierNumber = 2;
  } else if (payingReferrals >= 1) {
    currentTier = partner?.is_ambassador ? "Ambassador (Tier 1)" : "Referral Earner (Tier 1)";
    tierNumber = 1;
  }

  // Earnings bracket calculation:
  // First 4 referrals: ₦1,500 each (₦2,000 each if Ambassador)
  // 5th to 9th referrals: ₦2,000 each
  // 10th+ referrals: ₦2,500 each
  let totalEarnings = 0;
  const isAmb = partner?.is_ambassador || false;
  for (let i = 1; i <= payingReferrals; i++) {
    if (i >= 10) {
      totalEarnings += 2500;
    } else if (i >= 5) {
      totalEarnings += 2000;
    } else {
      totalEarnings += isAmb ? 2000 : 1500;
    }
  }

  // Calculate info for next tier
  let nextTier = "";
  let referralsNeededForNext = 0;
  if (payingReferrals < 1) {
    nextTier = partner?.is_ambassador ? "Ambassador (Tier 1)" : "Referral Earner (Tier 1)";
    referralsNeededForNext = 1 - payingReferrals;
  } else if (payingReferrals < 3) {
    nextTier = "Free Setup Earner (Tier 2)";
    referralsNeededForNext = 3 - payingReferrals;
  } else if (payingReferrals < 5) {
    nextTier = "Official Partner (Tier 3)";
    referralsNeededForNext = 5 - payingReferrals;
  } else if (payingReferrals < 10) {
    nextTier = "Senior Partner (Tier 4)";
    referralsNeededForNext = 10 - payingReferrals;
  }

  return {
    totalReferrals,
    payingReferrals,
    pendingReferrals,
    totalEarnings,
    currentTier,
    tierNumber,
    nextTier,
    referralsNeededForNext,
  };
}

