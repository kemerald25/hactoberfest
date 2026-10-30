"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/blog";

export function BlogNewsletter() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      const res = await subscribeToNewsletter(email, honeypot);
      if (res.success) {
        setStatus("success");
        setMessage(res.message || "Thank you! You're subscribed to updates.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(res.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-12 space-y-6">
      {/* Newsletter Box */}
      <div className="w-full rounded-2xl border border-white/10 bg-[#080d1a]/80 backdrop-blur-md p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {status === "success" ? (
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">You're on the list!</h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto">{message}</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Mail className="w-3.5 h-3.5" />
                <span>TaskBridge Intelligence</span>
              </div>
              <h4 className="text-xl font-bold text-white">Get AI Automation & Tech Intelligence</h4>
              <p className="text-xs sm:text-sm text-slate-400">
                Actionable updates on AI customer workflows, automation strategies, and practical tools. No fluff, no spam.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              {/* Anti-spam Honeypot field (hidden from humans) */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden pointer-events-none opacity-0 absolute"
              />

              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="your.email@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  disabled={status === "loading"}
                  className="w-full bg-[#030712]/90 border border-white/10 text-white text-sm h-12 pl-10 pr-4 rounded-xl focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-500 transition-colors disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold text-sm h-12 px-7 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                {status === "loading" ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Subscribe Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {status === "error" && (
              <p className="text-xs text-rose-400 font-medium">{message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
