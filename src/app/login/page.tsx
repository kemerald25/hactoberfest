"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Users, Lock, Mail, ArrowRight, Sparkles, Check } from "lucide-react";
import { loginBusiness, requestPasswordReset } from "@/app/actions/business";
import { loginPartner } from "@/app/actions/partners";
import Image from "next/image";
import { TaskBridgeLogo } from "@/components/TaskBridgeLogo";

export default function LoginPage() {
  const router = useRouter();
  const [activePortal, setActivePortal] = useState<"business" | "partner">("business");
  
  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      if (activePortal === "business") {
        const res = await loginBusiness(formData);
        if (res.success && res.businessId) {
          router.push(`/business/${res.businessId}`);
        } else {
          setError(res.error || "Invalid business email or password.");
        }
      } else {
        const res = await loginPartner(formData);
        if (res.success) {
          router.push("/partners");
        } else {
          setError(res.error || "Invalid partner email or password.");
        }
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setIsForgotSubmitting(true);

    try {
      const res = await requestPasswordReset(forgotEmail, activePortal);
      if (res.success) {
        setForgotSuccess(res.message || "A recovery link has been sent to your email address.");
        setForgotEmail("");
      } else {
        setForgotError(res.error || "Could not dispatch reset email. Try again.");
      }
    } catch (err) {
      setForgotError("An unexpected error occurred.");
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#060810] bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] overflow-x-hidden pt-[110px] pb-16 flex flex-col justify-between font-sans">
      <Navbar />

      {/* Decorative Glow Background */}
      <div className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[350px] sm:w-[800px] h-[350px] bg-[radial-gradient(circle,rgba(139,92,246,0.14)_0%,transparent_60%)] pointer-events-none z-0" />

      <div className="w-full max-w-[440px] mx-auto px-4 relative z-10 my-auto">
        
        {/* Card Container */}
        <div className="bg-[#0D1117]/80 border border-white/8 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
          
          {/* Accent light leak top border */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent" />

          {/* Logo/Title */}
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="mb-3">
              <TaskBridgeLogo size="lg" />
            </div>
            <p className="text-white/40 text-[12.5px] mt-1">
              Select account type to enter your workspace
            </p>
          </div>

          {!showForgot ? (
            <>
              {/* Portal Tabs Selector */}
              <div className="bg-[#060810]/75 border border-white/5 p-1 rounded-xl flex items-center gap-1 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal("business");
                    setError("");
                    setPassword("");
                  }}
                  className={`flex-1 py-2 rounded-lg text-[12.5px] font-medium transition-all flex items-center justify-center gap-2 ${
                    activePortal === "business"
                      ? "bg-[#8B5CF6] text-white"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Business</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal("partner");
                    setError("");
                    setPassword("");
                  }}
                  className={`flex-1 py-2 rounded-lg text-[12.5px] font-medium transition-all flex items-center justify-center gap-2 ${
                    activePortal === "partner"
                      ? "bg-[#8B5CF6] text-white"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Campus Partner</span>
                </button>
              </div>

              {/* Error Box */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[12px] mb-4">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                    {activePortal === "business" ? "Business Contact Email" : "Ambassador Email"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activePortal === "business" ? "partner@company.com" : "name@unilag.edu"}
                      className="bg-[#060810]/40 border-white/8 text-white h-11 pl-10 rounded-lg placeholder:text-white/15 text-[13.5px] focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 focus-visible:border-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(true);
                        setForgotSuccess("");
                        setForgotError("");
                      }}
                      className="text-[10.5px] text-[#a78bfa] hover:text-[#C084FC] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
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

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#8B5CF6]/50 text-white font-semibold text-[13.5px] rounded-lg mt-2 flex items-center justify-center gap-2 shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Entering Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            // Forgot Password Screen
            <div className="space-y-4">
              <div>
                <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Reset Password</span>
                </h3>
                <p className="text-white/45 text-[12px] mt-1.5 leading-relaxed">
                  Enter your email. If your account is registered in our {activePortal === "business" ? "Business" : "Partner"} records, you'll receive a password reset link.
                </p>
              </div>

              {forgotError && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[12px]">
                  {forgotError}
                </div>
              )}

              {forgotSuccess ? (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-green-400 text-[12.5px] space-y-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Check className="w-4 h-4" />
                    <span>Request Dispatched</span>
                  </div>
                  <p className="leading-relaxed text-white/50 text-[11.5px]">{forgotSuccess}</p>
                  <Button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="w-full h-9 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[12px] rounded-lg shadow-none"
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <Input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="recovery@email.com"
                        className="bg-[#060810]/40 border-white/8 text-white h-11 pl-10 rounded-lg placeholder:text-white/15 text-[13.5px] focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 focus-visible:border-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <Button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className="flex-1 h-10 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[12.5px] rounded-lg shadow-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isForgotSubmitting}
                      className="flex-1 h-10 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#8B5CF6]/50 text-white text-[12.5px] rounded-lg flex items-center justify-center gap-2 shadow-none"
                    >
                      {isForgotSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
