"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/app/actions/admin";
import Image from "next/image";
import { TaskBridgeLogo } from "@/components/TaskBridgeLogo";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const res = await loginAdmin(formData);
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#080226] via-[#030014] to-[#010005] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Decorative Pulses */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Logo and Branding Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-3">
            <TaskBridgeLogo size="lg" />
          </div>
          <p className="text-white/45 text-[13px] mt-1.5">
            Internal operations control panel
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          
          {/* Subtle light leak at top border */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a78bfa]/40 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/35">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@replyiq.com"
                className="w-full bg-[#060413]/60 border border-white/8 text-[#F8FAFC] placeholder:text-white/20 h-11 px-4 rounded-lg focus:border-[#a78bfa]/50 focus:outline-none focus:ring-0 transition-all text-[14px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/35">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#060413]/60 border border-white/8 text-[#F8FAFC] placeholder:text-white/20 h-11 px-4 rounded-lg focus:border-[#a78bfa]/50 focus:outline-none focus:ring-0 transition-all text-[14px]"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[12px] font-sans">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#8B5CF6]/50 text-white font-semibold text-[14px] rounded-lg shadow-lg hover:shadow-purple-500/10 transition-all duration-200 mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Authenticate</span>
              )}
            </button>
          </form>
        </div>

        {/* Back to Site */}
        <div className="text-center mt-6">
          <a href="/" className="text-white/30 hover:text-white/60 transition-colors text-[12px] flex items-center justify-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            Back to main website
          </a>
        </div>

      </div>
    </div>
  );
}
