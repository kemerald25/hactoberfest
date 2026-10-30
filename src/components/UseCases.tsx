"use client";

import { motion } from "framer-motion";

export function UseCases() {
  const cases = [
    {
      title: "Fashion & Retail",
      scenario: "Customer DMs at 11:30 PM: \"Do you have this dress in size 12 and can you deliver to Lekki tomorrow?\"",
      result: "AI checks inventory details, confirms size 12 is in stock, quotes Lekki delivery rate, and collects customer delivery address.",
      statLabel: "After-Hours Orders Saved",
      statValue: "+38%"
    },
    {
      title: "Real Estate & Short-lets",
      scenario: "Prospect messages: \"Is the 2-bed in Ikoyi free this weekend? What is the caution fee?\"",
      result: "AI responds in 3 seconds with pricing, amenity list, caution fee policy, and requests inspection date.",
      statLabel: "Response Time Reduction",
      statValue: "95%"
    },
    {
      title: "Coaching & Services",
      scenario: "Lead asks: \"How much is your 1-on-1 strategy session and what is included?\"",
      result: "AI outlines package deliverables, answers FAQs, and provides a direct payment link to book the session.",
      statLabel: "Consultation Bookings",
      statValue: "+52%"
    },
    {
      title: "Beauty & Wellness",
      scenario: "Client texts: \"Can I book bridal makeup for November 16th for 4 people?\"",
      result: "AI verifies date availability, sends rate card, calculates group discount, and secures deposit payment.",
      statLabel: "Deposit Collection Rate",
      statValue: "4.8x"
    }
  ];

  return (
    <section id="use-cases" className="py-[120px] bg-transparent border-t border-white/6 relative z-10">
      <div className="w-full max-w-[1120px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-[64px]">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa]">
            Use Cases
          </span>
          <h2 className="text-[40px] font-bold tracking-[-0.025em] leading-[1.1] text-[#F8FAFC] mt-3">
            Built for businesses that <span className="font-['Instrument_Serif'] italic text-[#a78bfa]">can't afford</span> to be slow.
          </h2>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {cases.map((uc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, threshold: 0.1 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="relative rounded-2xl bg-[#0D1117] border border-white/[0.08] p-6 md:p-8 shadow-xl hover:border-[#8B5CF6]/30 transition-all duration-300 flex flex-col justify-between min-h-[260px] overflow-hidden"
            >
              {/* Decorative top-left accent gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8B5CF6]/40 to-transparent" />

              {/* Top Section: Title & Scenario */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#a78bfa] px-2 py-0.5 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                    {uc.title}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold block mb-1">Incoming Lead</span>
                  <p className="text-white/90 text-[13px] sm:text-[14px] leading-relaxed italic font-serif">
                    {uc.scenario}
                  </p>
                </div>
              </div>

              {/* Middle Section: TaskBridge Action */}
              <div className="mt-4 mb-6">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold block mb-1">TaskBridge Action</span>
                <p className="text-white/70 text-[12px] sm:text-[12.5px] leading-relaxed font-sans">
                  {uc.result}
                </p>
              </div>

              {/* Bottom Section: Stat callout */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold font-sans leading-tight">
                  {uc.statLabel}
                </span>
                <span className="text-[28px] font-bold tracking-tight text-[#a78bfa] leading-none shrink-0 ml-4">
                  {uc.statValue}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
