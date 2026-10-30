"use client";

import { motion } from "framer-motion";
import { Activity, Search, SlidersHorizontal, ArrowRight, ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";

const TorusCanvas = dynamic(() => import("./Bento3DAssets").then((mod) => mod.TorusCanvas), {
  ssr: false,
  loading: () => <div className="w-full h-[180px] bg-white/[0.01] rounded-lg animate-pulse" />
});

const ConeCanvas = dynamic(() => import("./Bento3DAssets").then((mod) => mod.ConeCanvas), {
  ssr: false,
  loading: () => <div className="w-full h-[180px] bg-white/[0.01] rounded-lg animate-pulse" />
});

export function Features() {
  return (
    <section id="features" className="py-[120px] bg-transparent border-t border-white/6 relative z-10 overflow-hidden">
      
      {/* Background purple accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8B5CF6]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[1120px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-[64px]">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa]">
            Core Capabilities
          </span>
          <h2 className="text-[40px] font-bold tracking-[-0.025em] leading-[1.1] text-[#F8FAFC] mt-3">
            Harness the power of AI. <span className="font-['Instrument_Serif'] italic text-[#a78bfa]">Everything</span> you need.
          </h2>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* CARD 1: 1/3 Width (Metallic Torus) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, threshold: 0.15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-[#0D1117]/40 border border-white/8 rounded-2xl p-6 flex flex-col justify-between h-[380px] shadow-xl hover:border-[#8B5CF6]/30 transition-colors duration-300"
          >
            {/* Realtime 3D Torus */}
            <TorusCanvas />
            
            <div className="mt-4">
              <h3 className="text-[16px] font-bold text-[#F8FAFC] mb-2 font-sans">
                Context Engine
              </h3>
              <p className="text-[13px] text-white/50 leading-relaxed font-sans">
                Trained directly on your FAQs, website URLs, and document uploads to respond in your precise brand voice.
              </p>
            </div>
          </motion.div>

          {/* CARD 2: 2/3 Width (Dashboard Table UI Mockup) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, threshold: 0.15 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-2 bg-[#0D1117]/40 border border-white/8 rounded-2xl p-6 flex flex-col justify-between h-[380px] shadow-xl hover:border-[#8B5CF6]/30 transition-colors duration-300 overflow-hidden"
          >
            {/* Simulated Dashboard Table Interface */}
            <div className="bg-[#060810]/60 border border-white/5 rounded-xl p-4 flex-1 flex flex-col justify-between overflow-hidden relative font-mono text-[11px] text-white/60">
              
              {/* Table search & filter actions */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3 shrink-0">
                <div className="flex items-center gap-2 bg-[#0c0f16]/80 border border-white/5 rounded-md px-2.5 py-1 w-48 text-[10px] text-white/30">
                  <Search className="w-3 h-3 text-white/20" />
                  <span>Search inquiries...</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0c0f16]/80 border border-white/5 rounded-md px-2 py-1 text-[10px] text-white/45 cursor-pointer hover:text-white transition-colors">
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Filter</span>
                </div>
              </div>

              {/* Table Body / Rows */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {[
                  { name: "Adebayo K.", channel: "Live Widget", time: "Just now", status: "Active Support", color: "text-[#a78bfa] bg-[#8B5CF6]/10 border-[#8B5CF6]/20" },
                  { name: "Chidi O.", channel: "Web Widget", time: "3m ago", status: "Lead Qualified", color: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20" },
                  { name: "Sarah A.", channel: "Bio Link", time: "12m ago", status: "FAQ Resolved", color: "text-white/40 bg-white/5 border-white/10" }
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0c0f16]/30 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white/80">{row.name}</span>
                      <span className="text-white/30 text-[9px] uppercase">{row.channel}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/30 text-[9px] hidden sm:inline">{row.time}</span>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${row.color}`}>
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[16px] font-bold text-[#F8FAFC] mb-2 font-sans flex items-center justify-between">
                <span>Task Automation Console</span>
                <ArrowUpRight className="w-4 h-4 text-white/35" />
              </h3>
              <p className="text-[13px] text-white/50 leading-relaxed font-sans">
                Monitors conversation threads automatically, classifying client intent and automating customer workflows.
              </p>
            </div>
          </motion.div>

          {/* CARD 3: 2/3 Width (Telemetry & Analytics Mock UI Graph) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, threshold: 0.15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-2 bg-[#0D1117]/40 border border-white/8 rounded-2xl p-6 flex flex-col justify-between h-[380px] shadow-xl hover:border-[#8B5CF6]/30 transition-colors duration-300 overflow-hidden"
          >
            {/* Custom SVG Line Chart */}
            <div className="bg-[#060810]/60 border border-white/5 rounded-xl p-4 flex-1 flex flex-col justify-between overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#a78bfa]" />
                  <span className="text-[11px] font-semibold text-white/60 font-mono">TELEMETRY & CONVERSION</span>
                </div>
                <span className="text-[10px] text-[#22C55E] font-bold font-mono">+94.2%</span>
              </div>

              {/* SVG Curve */}
              <div className="flex-1 w-full relative flex items-end pt-4 select-none">
                <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                  <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                  
                  {/* Curve Path */}
                  <path
                    d="M0,110 C80,95 120,60 200,50 C280,40 320,15 400,10"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M0,110 C80,95 120,60 200,50 C280,40 320,15 400,10 L400,120 L0,120 Z"
                    fill="url(#grad)"
                    opacity="0.1"
                  />
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>

                  {/* Highlights */}
                  <circle cx="200" cy="50" r="4" fill="#a78bfa" />
                  <circle cx="400" cy="10" r="4" fill="#8B5CF6" />
                </svg>

                {/* Floating tooltip */}
                <div className="absolute top-4 right-8 bg-[#0D1117] border border-white/10 rounded px-2.5 py-1 text-[9px] text-[#F8FAFC] font-mono shadow-md">
                  Conversion: 91.4%
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[16px] font-bold text-[#F8FAFC] mb-2 font-sans">
                Conversion Telemetry
              </h3>
              <p className="text-[13px] text-white/50 leading-relaxed font-sans">
                Deep analytics tracking message performance, conversion metrics, response latency, and drop-off rates.
              </p>
            </div>
          </motion.div>

          {/* CARD 4: 1/3 Width (Metallic Cone) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, threshold: 0.15 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="bg-[#0D1117]/40 border border-white/8 rounded-2xl p-6 flex flex-col justify-between h-[380px] shadow-xl hover:border-[#8B5CF6]/30 transition-colors duration-300"
          >
            {/* Realtime 3D Cone */}
            <ConeCanvas />

            <div className="mt-4">
              <h3 className="text-[16px] font-bold text-[#F8FAFC] mb-2 font-sans flex items-center gap-2">
                Multi-Channel Support
              </h3>
              <p className="text-[13px] text-white/50 leading-relaxed font-sans">
                Deploy your AI assistant across embeddable live chat widgets, Link-in-Bio, or custom landing pages to capture and qualify leads 24/7.
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
