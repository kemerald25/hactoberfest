"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function BeforeAfter() {
  const [cycleStep, setCycleStep] = useState(0);
  const [typedText, setTypedText] = useState("");

  const fullText =
    "Hi Sarah! Yes, we have standard suites available on Oct 14. What time works best for your check-in?";

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (cycleStep === 0) {
      // Step 0: User message arrives
      setTypedText("");
      timeout = setTimeout(() => {
        setCycleStep(1);
      }, 1500);
    } else if (cycleStep === 1) {
      // Step 1: AI typing begins
      let currentLength = 0;
      const interval = setInterval(() => {
        if (currentLength < fullText.length) {
          currentLength++;
          setTypedText(fullText.slice(0, currentLength));
        } else {
          clearInterval(interval);
          setCycleStep(2);
        }
      }, 25);

      return () => clearInterval(interval);
    } else if (cycleStep === 2) {
      // Step 2: Full reply shown + tags appear
      timeout = setTimeout(() => {
        setCycleStep(3);
      }, 3500);
    } else if (cycleStep === 3) {
      // Step 3: Pause then reset
      timeout = setTimeout(() => {
        setCycleStep(0);
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [cycleStep, fullText]);

  return (
    <section className="py-[120px] bg-transparent border-t border-white/6 relative z-10 overflow-hidden">
      <div className="w-full max-w-[1120px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-[64px]">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa]">
            The Difference
          </span>
          <h2 className="text-[40px] font-bold tracking-[-0.025em] leading-[1.1] text-[#F8FAFC] mt-3">
            What happens when no one replies?
          </h2>
        </div>

        {/* 50/50 Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          
          {/* Left Card: Without TaskBridge */}
          <div className="bg-[#0D1117] border border-white/8 rounded-2xl overflow-hidden flex flex-col justify-between min-h-[380px] md:h-[380px]">
            {/* Header bar */}
            <div className="bg-[#EF4444]/[0.08] border-b border-[#EF4444]/15 px-6 py-4 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#EF4444] tracking-wider uppercase">
                Without TaskBridge
              </span>
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            </div>

            {/* Chat Body */}
            <div className="p-6 flex flex-col space-y-4">
              <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[80%] text-[14px] text-white/80 self-start">
                Do you have standard suites available on Oct 14?
              </div>
              <div className="text-[12px] text-white/30 font-mono pl-1">
                2:14 PM &bull; Sent
              </div>
              <div className="text-[12px] text-white/20 font-mono italic pl-1">
                ... 4 hours later, no response
              </div>
              <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[80%] text-[14px] text-white/40 self-start">
                Never mind, I booked with someone else.
              </div>
              <div className="text-[12px] text-white/30 font-mono pl-1">
                6:18 PM &bull; Customer lost
              </div>
            </div>

            {/* Footer Outcome Bar */}
            <div className="p-4 bg-[#EF4444]/[0.05] border-t border-[#EF4444]/10 text-center text-[12px] text-[#EF4444] font-medium font-mono">
              Outcome: Lost booking &bull; Lost revenue &bull; Poor impression
            </div>
          </div>

          {/* Right Card: With TaskBridge */}
          <div className="bg-[#0D1117] border border-white/8 rounded-2xl overflow-hidden flex flex-col justify-between min-h-[380px] md:h-[380px]">
            {/* Header bar */}
            <div className="bg-[#22C55E]/[0.08] border-b border-[#22C55E]/15 px-6 py-4 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#22C55E] tracking-wider uppercase">
                With TaskBridge
              </span>
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            </div>

            {/* Chat Body */}
            <div className="p-6 flex flex-col space-y-4 flex-1">
              <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[80%] text-[14px] text-white/80 self-start">
                Do you have standard suites available on Oct 14?
              </div>
              <div className="text-[12px] text-white/30 font-mono pl-1">
                2:14 PM &bull; Sent
              </div>

              {/* Typing indicator */}
              {cycleStep === 1 && (
                <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tr-none px-3 py-2 max-w-[60px] self-end flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              {/* AI Response Message */}
              {cycleStep >= 2 && (
                <div className="bg-[#8B5CF6] text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%] text-[14px] self-end leading-relaxed">
                  {typedText}
                </div>
              )}

              {/* Live Tags */}
              {cycleStep >= 2 && (
                <div className="flex flex-wrap gap-2 pt-2 justify-end">
                  <span className="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-[11px] font-semibold rounded-full px-2.5 py-0.5">
                    Lead qualified
                  </span>
                  <span className="bg-[#8B5CF6]/10 text-[#a78bfa] border border-[#8B5CF6]/20 text-[11px] font-semibold rounded-full px-2.5 py-0.5">
                    Task resolved
                  </span>
                  <span className="bg-[#a78bfa]/10 text-[#a78bfa] border border-white/10 text-[11px] font-semibold rounded-full px-2.5 py-0.5">
                    Follow-up scheduled
                  </span>
                </div>
              )}
            </div>

            {/* Footer Outcome Bar */}
            <div className="p-4 bg-[#22C55E]/[0.05] border-t border-[#22C55E]/10 text-center text-[12px] text-[#22C55E] font-medium font-mono">
              Outcome: Booking secured in 4 seconds &bull; Zero human effort
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
