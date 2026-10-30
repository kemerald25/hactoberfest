"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pricing() {
  return (
    <section id="pricing" className="py-[120px] bg-transparent border-t border-white/6 relative z-10 overflow-hidden">
      
      {/* Background glow behind pricing cards */}
      <motion.div
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8B5CF6] rounded-full blur-[120px] pointer-events-none"
      />

      <div className="w-full max-w-[1120px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-[64px]">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa]">
            Pricing
          </span>
          <h2 className="text-[40px] font-bold tracking-[-0.025em] leading-[1.1] text-[#F8FAFC] mt-3">
            Launch Your AI Assistant In <span className="font-['Instrument_Serif'] italic text-[#a78bfa]">24 Hours</span>
          </h2>
          <p className="text-white/55 max-w-[560px] mx-auto mt-4 text-[16px]">
            Stop paying high recurring monthly subscription fees just to reply to customers. Deploy your custom business assistant and live widget for one flat fee.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {[
            {
              name: "Starter",
              price: "₦5,000",
              outcome: "Never miss another customer inquiry.",
              target: "Perfect for: Freelancers, creators, and online stores.",
              features: [
                "AI responds inside your customer chat widget",
                "24/7 automated customer sales & support",
                "Business knowledge setup & product FAQ training",
                "Lead qualification and contact details collection",
              ],
              slug: "starter",
              popular: false,
            },
            {
              name: "Professional",
              price: "₦15,000",
              outcome: "Capture leads from Instagram, TikTok, and web automatically.",
              target: "Perfect for: Growing brands and active social commerce sellers.",
              features: [
                "Everything in Starter",
                "Custom branded AI Chat Page & Widget",
                "Bio link setup for TikTok, Instagram, and Facebook",
                "AI qualifies customers before booking tasks",
              ],
              slug: "professional",
              popular: true,
            },
            {
              name: "Enterprise",
              price: "₦30,000",
              outcome: "Complete automated sales funnel built for your business.",
              target: "Perfect for: Established businesses with high daily inquiry volume.",
              features: [
                "Everything in Professional",
                "Dedicated custom AI training and continuous tuning",
                "Custom integrations and workflow automation",
                "Priority technical support & SLA guarantee",
              ],
              slug: "enterprise",
              popular: false,
            },
          ].map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, threshold: 0.15 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
              className={`bg-[#0D1117]/90 border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative transition-all duration-300 hover:border-white/15 ${
                plan.popular
                  ? "border-[#8B5CF6] ring-1 ring-[#8B5CF6]/50 shadow-[0_0_30px_rgba(139,92,246,0.15)] md:-translate-y-2"
                  : "border-white/8"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div>
                {/* Card Header */}
                <div className="mb-6">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-[#a78bfa] font-semibold block mb-1">
                    {plan.name} Setup
                  </span>
                  <div className="text-[36px] font-bold text-[#F8FAFC] leading-none mb-2 tracking-tight">
                    {plan.price}
                  </div>
                  <p className="text-[11px] text-white/40 font-mono">One-time setup fee</p>
                </div>

                <div className="mb-6 pb-6 border-b border-white/5">
                  <p className="text-[13px] font-medium text-white/80 leading-snug mb-1">
                    {plan.outcome}
                  </p>
                  <p className="text-[11px] text-white/40 leading-snug">
                    {plan.target}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-[16px] h-[16px] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      </div>
                      <span className="text-[13px] text-white/80 leading-snug font-sans">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <a href={`/onboard?plan=${plan.slug}`}>
                  <Button
                    className={`w-full h-10 font-semibold text-[13px] rounded-lg transition-all duration-150 ${
                      plan.popular
                        ? "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    }`}
                  >
                    Get Started with {plan.name}
                  </Button>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
