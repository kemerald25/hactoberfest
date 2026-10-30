"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Testimonials() {
  // Animation configurations for the blueprint grid lines
  const lineHorizontal = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const lineVertical = {
    hidden: { scaleY: 0 },
    visible: { scaleY: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const contentFade = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.3 } }
  };

  return (
    <section id="testimonials" className="py-[140px] bg-transparent border-t border-white/6 relative z-10 overflow-hidden">
      
      {/* Background ambient glow behind the portrait */}
      <div className="absolute top-1/2 left-[calc(50%-260px)] -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="w-full max-w-[1120px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-[72px]">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa]">
            Behind The Code
          </span>
          <h2 className="text-[40px] font-bold tracking-[-0.025em] leading-[1.1] text-[#F8FAFC] mt-3">
            A message from the founder.
          </h2>
        </div>

        {/* Blueprint Layout Container */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, threshold: 0.15 }}
          className="relative max-w-[840px] mx-auto min-h-[320px] flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-0"
        >
          {/* ================= BACKGROUND BLUEPRINT LINES ================= */}
          
          {/* Top Horizontal Line - extends past layout */}
          <motion.div 
            variants={lineHorizontal}
            style={{ originX: 0 }}
            className="absolute top-[50px] left-[-40px] right-[-40px] h-px bg-white/[0.08] pointer-events-none hidden md:block" 
          />
          
          {/* Bottom Horizontal Line - extends past layout */}
          <motion.div 
            variants={lineHorizontal}
            style={{ originX: 0 }}
            className="absolute bottom-[50px] left-[-40px] right-[-40px] h-px bg-white/[0.08] pointer-events-none hidden md:block" 
          />
          
          {/* Left Vertical Line - extends above & below layout */}
          <motion.div 
            variants={lineVertical}
            style={{ originY: 0 }}
            className="absolute left-[50px] top-[-40px] bottom-[-40px] w-px bg-white/[0.08] pointer-events-none hidden md:block" 
          />

          {/* Middle Vertical Line (divides portrait & text) */}
          <motion.div 
            variants={lineVertical}
            style={{ originY: 0 }}
            className="absolute left-[270px] top-[-40px] bottom-[-40px] w-px bg-white/[0.08] pointer-events-none hidden md:block" 
          />

          {/* Far Right Vertical Line (bounds the text block) */}
          <motion.div 
            variants={lineVertical}
            style={{ originY: 0 }}
            className="absolute right-0 top-[-40px] bottom-[-40px] w-px bg-white/[0.08] pointer-events-none hidden md:block" 
          />

          {/* ================= CONTENT COLUMNS ================= */}

          {/* Mobile Portrait View (only visible on mobile) */}
          <div className="md:hidden w-full flex justify-center mb-6">
            <motion.div 
              variants={contentFade}
              className="w-[220px] h-[220px] rounded-[24px] overflow-hidden border border-white/[0.08] bg-[#0D1117]/60 relative z-10 shadow-2xl"
            >
              <div className="absolute inset-0 bg-[#8B5CF6]/25 mix-blend-color pointer-events-none z-20" />
              <Image 
                src="/unity.png"
                alt="Unity Ekeoba, Founder of TaskBridge"
                fill
                priority
                sizes="220px"
                className="object-cover object-center grayscale"
              />
            </motion.div>
          </div>

          {/* Desktop Portrait Column: Fills the exact height between top and bottom grid lines */}
          <div className="relative w-[270px] shrink-0 hidden md:block">
            <motion.div 
              variants={contentFade}
              className="absolute top-[50px] bottom-[50px] left-[50px] right-0 overflow-hidden border border-white/[0.08] bg-[#0D1117]/60 backdrop-blur-md z-10 shadow-2xl group"
            >
              {/* Purple Color Tint Overlay */}
              <div className="absolute inset-0 bg-[#8B5CF6]/25 mix-blend-color pointer-events-none z-20 group-hover:bg-transparent transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060810]/70 via-transparent to-transparent pointer-events-none z-20" />
              
              <Image 
                src="/unity.png"
                alt="Unity Ekeoba, Founder of TaskBridge"
                fill
                priority
                sizes="220px"
                className="object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
              />
            </motion.div>
          </div>

          {/* Right Side: Text & Credentials (Nestled between the horizontal lines) */}
          <motion.div 
            variants={contentFade}
            className="flex-1 flex flex-col justify-between py-12 md:pl-10 md:pr-8 relative z-10 text-center md:text-left"
          >
            <div>
              <span className="text-[32px] font-serif leading-none text-[#8B5CF6]/40 select-none block mb-1">“</span>
              <p className="text-[14px] md:text-[15px] text-white/70 leading-relaxed font-sans font-medium mb-6">
                We built TaskBridge to solve our own biggest bottleneck: losing hot, high-intent client leads during off-hours. By training a contextual AI co-pilot on operational data, our live embeddable widgets automate 90% of front-line inquiries and capture customer tasks instantly. Our mission is to make enterprise-grade customer automation accessible to every growing business.
              </p>
            </div>
            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[14px] font-bold text-[#F8FAFC] font-sans tracking-tight">
                Unity Ekeoba
              </h4>
              <p className="text-[12px] text-[#a78bfa] font-sans mt-0.5 uppercase tracking-wider font-semibold">
                Founder, TaskBridge
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
