"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 90,
  });

  const steps = [
    {
      number: "1",
      title: "Connect Your Business Data",
      description: "Share your FAQs, services, pricing, and brand voice. We train the AI assistant on your exact operational knowledge.",
    },
    {
      number: "2",
      title: "We Build & Deploy Your Live Widget",
      description: "Within 24 hours, your AI is live as an embeddable website widget, direct chat page, or workflow bot.",
    },
    {
      number: "3",
      title: "Watch It Automate Tasks & Qualify Leads",
      description: "The widget handles inquiries, resolves customer tasks, and escalates to your team only when it matters.",
    },
  ];

  return (
    <section id="how-it-works" className="py-[120px] bg-transparent border-t border-white/6 relative z-10">
      <div className="w-full max-w-[1120px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-[64px]">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa]">
            The Process
          </span>
          <h2 className="text-[40px] font-bold tracking-[-0.025em] leading-[1.1] text-[#F8FAFC] mt-3">
            Three steps to <span className="font-['Instrument_Serif'] italic text-[#a78bfa]">smarter</span> support
          </h2>
        </div>

        {/* Timeline Container */}
        <div ref={containerRef} className="relative max-w-3xl mx-auto pl-8 sm:pl-16">
          
          {/* Background vertical gray timeline track */}
          <div className="absolute left-[7px] sm:left-[15px] top-4 bottom-4 w-[2px] bg-white/8 rounded-full" />

          {/* Animated Purple Progress Timeline Indicator */}
          <div className="absolute left-[7px] sm:left-[15px] top-4 bottom-4 w-[2px]">
            <svg className="w-[4px] h-full overflow-visible" preserveAspectRatio="none">
              <motion.line
                x1="2"
                y1="0"
                x2="2"
                y2="100%"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ pathLength }}
              />
            </svg>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, threshold: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
                className="relative bg-[#0D1117] border border-white/7 rounded-[14px] p-7 md:py-7 md:px-8 group overflow-hidden"
              >
                {/* Visual marker point on timeline line */}
                <div className="absolute left-[-32px] sm:left-[-64px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#060810] border border-[#8B5CF6] z-20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                </div>

                {/* Ghost number absolute positioned behind/near the title */}
                <div className="absolute top-2 right-6 text-white/[0.03] group-hover:text-white/[0.06] text-7xl font-mono font-bold select-none transition-colors duration-300">
                  0{step.number}
                </div>

                <div className="relative z-10">
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-[#a78bfa] uppercase mb-1.5 block">
                    Step {step.number}
                  </span>
                  
                  <h3 className="text-[17px] font-bold text-[#F8FAFC] tracking-tight mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-[13px] text-white/55 leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
