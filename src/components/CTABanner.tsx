"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  return (
    <section className="py-[120px] bg-transparent relative z-10">
      <div className="w-full max-w-[1120px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, threshold: 0.15 }}
          className="relative rounded-2xl bg-[#0D1117]/80 border border-white/8 p-8 md:p-16 text-center shadow-[0_0_80px_rgba(139,92,246,0.04)] overflow-hidden"
        >
          {/* Subtle grid pattern matching the main background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(circle_at_center,white_60%,transparent_100%)] opacity-80 pointer-events-none z-0" />
          
          {/* Centered vibrant purple radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0%,transparent_60%)] rounded-full blur-[80px] pointer-events-none z-0" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-[32px] sm:text-[42px] font-bold text-[#F8FAFC] tracking-[-0.025em] leading-[1.1] mb-4">
              AI-driven support for <br />
              <span className="font-['Instrument_Serif'] italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#8B5CF6]">
                everyone.
              </span>
            </h2>
            <p className="text-[14px] sm:text-[15px] text-white/55 mt-2 mb-8 max-w-[440px] mx-auto leading-relaxed">
              Launch your custom-trained TaskBridge AI widget in under 24 hours. Stop leaving potential customers waiting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/onboard">
                <Button className="h-10 px-6 bg-white hover:bg-white/95 text-black font-semibold text-[13px] rounded-lg transition-all duration-150 shadow-md">
                  Get Started
                </Button>
              </a>
              <a href="#live-widget">
                <Button variant="outline" className="h-10 px-5 border border-[#8B5CF6]/30 bg-transparent hover:bg-white/5 text-[#a78bfa] font-medium text-[13px] rounded-lg transition-all duration-150">
                  Try Live Widget
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
