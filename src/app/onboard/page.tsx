"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitOnboarding } from "@/app/actions/onboard";
import {
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Globe,
  Monitor,
  Tag,
  Clock,
  Zap,
  Users,
} from "lucide-react";

export default function OnboardPage() {
  const [referralCode, setReferralCode] = useState("");
  const [referredByPartner, setReferredByPartner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "professional" | "enterprise">("professional");

  useEffect(() => {
    // 1. Try URL query param ?ref= and ?plan=
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    if (refParam) {
      setReferralCode(refParam);
      setReferredByPartner(true);
    } else {
      // Fallback to cookie
      const cookieEntries = document.cookie.split("; ");
      for (const entry of cookieEntries) {
        if (entry.startsWith("taskbridge_ref=")) {
          const code = decodeURIComponent(entry.substring("taskbridge_ref=".length));
          if (code) {
            setReferralCode(code);
            setReferredByPartner(true);
          }
          break;
        }
      }
    }

    const planParam = params.get("plan");
    if (planParam === "starter" || planParam === "professional" || planParam === "enterprise") {
      setSelectedPlan(planParam);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await submitOnboarding(formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const planDetails = {
    starter: {
      name: "Starter Setup",
      price: "₦5,000",
      description: "AI assistant that runs inside your own WhatsApp Business number.",
      benefits: [
        "AI assistant setup directly on your WhatsApp Business number",
        "Trained on your exact products, FAQs, and brand voice",
        "Responds to customers and pre-qualifies leads 24/7",
        "Collects customer details before you step in",
        "Set up and live in under 24 hours",
        "One flat fee — no monthly subscriptions",
      ],
    },
    professional: {
      name: "Professional Setup",
      price: "₦15,000",
      description: "Everything in Starter + Custom Branded AI Chat Page & Link-in-Bio.",
      benefits: [
        "Everything in the Starter package",
        "Custom-branded AI chat page & custom domain/url",
        "Link-in-bio page setup for TikTok, Instagram, and Facebook",
        "AI filters & qualifies leads before redirecting to WhatsApp",
        "One flat fee — no monthly subscriptions",
      ],
    },
    enterprise: {
      name: "Enterprise Setup",
      price: "₦25,000",
      description: "Everything in Professional + Live Website Widget Integration.",
      benefits: [
        "Everything in the Professional package",
        "Interactive live website widget for your existing website",
        "Embeds on WordPress, Shopify, Wix, or custom sites",
        "Custom colors, branding, and theme matching",
        "Priority setup & ongoing configuration support",
        "One flat fee — no monthly subscriptions",
      ],
    },
  };

  return (
    <main className="relative min-h-screen bg-[#060810] bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] overflow-x-hidden pt-[110px] pb-20">
      <Navbar />

      {/* Background glow */}
      <div className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,transparent_60%)] pointer-events-none z-0" />

      <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 relative z-10 pb-16 sm:pb-24">

        {/* Page Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 text-[#a78bfa] text-[11px] font-semibold tracking-wider uppercase mb-5"
          >
            <Sparkles className="w-3 h-3 text-[#8B5CF6] animate-pulse" />
            Set Up Your AI Assistant
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[30px] sm:text-[48px] font-bold tracking-tight text-white leading-tight mb-4"
          >
            Get your business AI-ready{" "}
            <span className="font-['Instrument_Serif'] italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#8B5CF6]">
              in 24 hours.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/55 text-[15px] sm:text-[17px] max-w-xl mx-auto leading-relaxed"
          >
            Fill in your details below. We'll review your submission and reach out on WhatsApp within 24 hours to get everything set up for you.
          </motion.p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left — Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa] mb-3">
                Selected Plan Details
              </p>
              <h3 className="text-white text-lg font-bold mb-1">{planDetails[selectedPlan].name}</h3>
              <p className="text-white/55 text-sm mb-6 leading-normal">{planDetails[selectedPlan].description}</p>

              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa] mb-3">
                What you get
              </p>
              <div className="space-y-4">
                {planDetails[selectedPlan].benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    </div>
                    <p className="text-[14px] text-white/75 leading-relaxed pt-1">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing callout */}
            <div className="bg-[#0D1117] border border-white/5 rounded-2xl p-5 space-y-1.5">
              <p className="text-[11px] text-white/35 uppercase tracking-wider font-mono">One-Time Setup Fee</p>
              <p className="text-[36px] font-bold text-white leading-none tracking-tight">
                {planDetails[selectedPlan].price}
              </p>
              <p className="text-[13px] text-white/45">Includes installation, training, and testing. No recurring fees.</p>
            </div>

            {/* Trust line */}
            <p className="text-[12px] text-white/30 leading-relaxed">
              After submitting, we'll review your details and reach out on WhatsApp to confirm and begin setup. You don't pay until we've discussed and you're ready.
            </p>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0D1117] border border-white/8 p-8 sm:p-12 rounded-2xl text-center shadow-2xl"
              >
                <div className="w-16 h-16 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-[#22C55E] w-8 h-8" />
                </div>
                <h2 className="text-[22px] font-bold text-white mb-2">You're on the list!</h2>
                <p className="text-white/55 text-[14px] leading-relaxed max-w-xs mx-auto mb-8">
                  We've received your details. Expect a WhatsApp message from us within 24 hours to get your AI assistant set up.
                </p>
                <Button
                  onClick={() => setSuccess(false)}
                  variant="outline"
                  className="h-10 px-5 border border-white/15 bg-transparent hover:bg-white/5 text-white font-medium text-[13px] rounded-lg"
                >
                  Submit another business
                </Button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-[#0D1117] border border-white/8 p-5 sm:p-8 rounded-2xl space-y-5 shadow-2xl"
              >
                <div>
                  <p className="text-[13px] font-semibold text-white mb-0.5">Business Setup Request</p>
                  <p className="text-[11.5px] text-white/35">Takes less than 2 minutes to complete.</p>
                </div>

                <div className="border-t border-white/5" />

                {/* Plan Selection Buttons */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">
                    Choose Your Package <span className="text-[#8B5CF6]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(["starter", "professional", "enterprise"] as const).map((planKey) => {
                      const details = planDetails[planKey];
                      const isActive = selectedPlan === planKey;
                      return (
                        <button
                          key={planKey}
                          type="button"
                          onClick={() => setSelectedPlan(planKey)}
                          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all duration-150 ${
                            isActive
                              ? "bg-[#8B5CF6]/10 border-[#8B5CF6] text-white ring-1 ring-[#8B5CF6]/40"
                              : "bg-[#060810]/60 border-white/8 text-white/50 hover:border-white/15"
                          }`}
                        >
                          <span className="text-[11px] font-bold block capitalize">{planKey}</span>
                          <span className={`text-[10px] mt-0.5 font-medium block ${isActive ? "text-[#a78bfa]" : "text-white/30"}`}>
                            {details.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hidden input to pass the selected plan */}
                <input type="hidden" name="plan" value={selectedPlan} />

                <div className="border-t border-white/5" />

                {/* Row 1: Business name + Owner name */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">
                      Business Name <span className="text-[#8B5CF6]">*</span>
                    </label>
                    <Input
                      name="businessName"
                      required
                      placeholder="e.g. Aduke Fashion Store"
                      className="bg-[#060810]/60 border-white/8 text-white placeholder:text-white/20 h-10 rounded-lg focus:border-[#8B5CF6]/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">
                      Your Name <span className="text-[#8B5CF6]">*</span>
                    </label>
                    <Input
                      name="ownerName"
                      required
                      placeholder="e.g. Aduke Johnson"
                      className="bg-[#060810]/60 border-white/8 text-white placeholder:text-white/20 h-10 rounded-lg focus:border-[#8B5CF6]/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                {/* Row 2: WhatsApp + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">
                      WhatsApp Number <span className="text-[#8B5CF6]">*</span>
                    </label>
                    <Input
                      name="phone"
                      required
                      placeholder="e.g. +2348012345678"
                      className="bg-[#060810]/60 border-white/8 text-white placeholder:text-white/20 h-10 rounded-lg focus:border-[#8B5CF6]/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">
                      Email Address <span className="text-[#8B5CF6]">*</span>
                    </label>
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder="you@yourbusiness.com"
                      className="bg-[#060810]/60 border-white/8 text-white placeholder:text-white/20 h-10 rounded-lg focus:border-[#8B5CF6]/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                {/* Website URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">
                    Website / Social Page{" "}
                    <span className="text-white/20 normal-case font-normal">(optional)</span>
                  </label>
                  <Input
                    name="websiteUrl"
                    placeholder="e.g. https://yourstore.com or instagram.com/yourstore"
                    className="bg-[#060810]/60 border-white/8 text-white placeholder:text-white/20 h-10 rounded-lg focus:border-[#8B5CF6]/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">
                    What does your business do? <span className="text-[#8B5CF6]">*</span>
                  </label>
                  <Textarea
                    name="description"
                    required
                    placeholder="e.g. We sell handmade fashion accessories. Customers often ask about sizing, delivery, and pricing..."
                    className="bg-[#060810]/60 border-white/8 text-white placeholder:text-white/20 min-h-[90px] rounded-lg focus:border-[#8B5CF6]/50 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                  />
                </div>

                {/* Referral Code */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35 flex items-center gap-2">
                    Referral Code{" "}
                    <span className="text-white/20 normal-case font-normal">(optional)</span>
                    {referredByPartner && referralCode && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 text-[#a78bfa] text-[9px] font-semibold tracking-wider normal-case">
                        <Tag className="w-2.5 h-2.5" />
                        Referred by partner
                      </span>
                    )}
                  </label>
                  <Input
                    name="referralCode"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="e.g. JOHN-8472"
                    className="bg-[#060810]/60 border-white/8 text-white placeholder:text-white/20 h-10 rounded-lg focus:border-[#8B5CF6]/50 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[12px]">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-[14px] rounded-lg shadow-none transition-all duration-150"
                >
                  {isSubmitting ? "Submitting..." : "Request My AI Assistant Setup →"}
                </Button>

                <p className="text-[11px] text-white/25 text-center">
                  No payment required now. We'll reach out before anything starts.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
