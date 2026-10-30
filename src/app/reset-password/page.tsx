"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Sparkles, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { resetPassword } from "@/app/actions/business";
import Image from "next/image";
import { TaskBridgeLogo } from "@/components/TaskBridgeLogo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const portal = (searchParams.get("portal") as "business" | "partner") || "business";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the link URL.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(token, portal, password);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to reset password. Link may be invalid or expired.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-[16px] font-bold text-white">Invalid Reset Link</h3>
        <p className="text-white/40 text-[12.5px] leading-relaxed max-w-[320px] mx-auto">
          The password reset token is missing or malformed. Please request a new link from the login page.
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[12px] h-9 px-4 rounded-lg shadow-none"
        >
          Return to Login
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-5 h-5" />
        </div>
        <h3 className="text-[17px] font-bold text-white">Password Updated</h3>
        <p className="text-white/45 text-[12.5px] leading-relaxed">
          Your account password has been updated successfully. You can now log in to the dashboard portal.
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="w-full h-10 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-[13px] rounded-lg flex items-center justify-center gap-2 shadow-none"
        >
          <span>Go to Login Portal</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
          <span>New Password</span>
        </h3>
        <p className="text-white/40 text-[12px] mt-1 leading-relaxed">
          Enter a new password for your {portal === "business" ? "Business" : "Campus Partner"} workspace account.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[12px]">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-[#060810]/40 border-white/8 text-white h-11 pl-10 rounded-lg placeholder:text-white/15 text-[13.5px] focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 focus-visible:border-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <Input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-[#060810]/40 border-white/8 text-white h-11 pl-10 rounded-lg placeholder:text-white/15 text-[13.5px] focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 focus-visible:border-none"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#8B5CF6]/50 text-white font-semibold text-[13.5px] rounded-lg mt-2 flex items-center justify-center gap-2 shadow-none"
      >
        {isSubmitting ? "Updating Password..." : "Update Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="relative min-h-screen bg-[#060810] bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] overflow-x-hidden pt-[110px] pb-16 flex flex-col justify-between font-sans">
      <Navbar />

      <div className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[350px] sm:w-[800px] h-[350px] bg-[radial-gradient(circle,rgba(139,92,246,0.14)_0%,transparent_60%)] pointer-events-none z-0" />

      <div className="w-full max-w-[440px] mx-auto px-4 relative z-10 my-auto">
        <div className="bg-[#0D1117]/80 border border-white/8 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent" />
          
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="mb-3">
              <TaskBridgeLogo size="lg" />
            </div>
            <p className="text-white/40 text-[12.5px] mt-1">
              Reset and secure your account credentials
            </p>
          </div>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <svg className="animate-spin h-6 w-6 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-[12px] text-white/40">Initializing security context...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      <Footer />
    </main>
  );
}
