"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Settings, 
  Search,
  MessageSquare,
  Zap, 
  Database, 
  Share2, 
  BarChart3,
  Calendar,
  Grid
} from "lucide-react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position of the hero section relative to viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Sleek, interactive 3D rotation and scale animations synced with scrolling
  const rotateX = useTransform(scrollYProgress, [0, 0.35], [10, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.35], [0.94, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [0.7, 1]);
  const translateZ = useTransform(scrollYProgress, [0, 0.35], [-40, 0]);

  return (
    <section ref={containerRef} className="relative pt-[160px] pb-0 overflow-hidden bg-transparent">
      {/* Intense Background Purple Aura Glow (horizon glow behind mockup & text) */}
      <div className="absolute top-[260px] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[radial-gradient(circle,rgba(139,92,246,0.24)_0%,transparent_60%)] pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[400px] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_60%)] pointer-events-none z-0" />

      <div className="w-full max-w-[1120px] mx-auto px-6 relative z-10 text-center">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 text-[#a78bfa] text-[11px] font-semibold tracking-wider uppercase mb-6 cursor-default"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6] animate-pulse" />
          AI Customer Support & Automation Co-Pilot
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="text-[36px] sm:text-[52px] md:text-[68px] font-bold tracking-tight text-[#F8FAFC] leading-[1.05] max-w-4xl mx-auto mb-6"
        >
          Stop losing customers <br />
          <span className="font-['Instrument_Serif'] italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#C084FC] to-[#8B5CF6]">
            while you sleep.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="text-[16px] sm:text-[18px] text-white/55 leading-relaxed max-w-2xl mx-auto mb-10"
        >
          Deploy a custom AI assistant trained on your data in under 24 hours. Respond instantly to inquiries, qualify leads, and automate customer tasks seamlessly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <a href="/onboard" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-8 bg-white hover:bg-white/95 text-black font-semibold text-[14px] rounded-full shadow-lg transition-all duration-150">
              Launch Your Assistant
            </Button>
          </a>
          <a href="#live-widget" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-8 bg-transparent hover:bg-white/5 text-[#a78bfa] border border-[#8B5CF6]/30 font-semibold text-[14px] rounded-full transition-all duration-150 shadow-sm shadow-purple-500/10">
              Try Interactive Demo
            </Button>
          </a>
        </motion.div>

        {/* Mockup Perspective Wrapper */}
        <div className="perspective-[1500px]">
          {/* Mockup Window */}
          <motion.div
            style={{ 
              rotateX, 
              scale, 
              opacity,
              translateZ,
              transformStyle: "preserve-3d"
            }}
            className="relative max-w-5xl mx-auto rounded-2xl border border-white/[0.08] bg-[#0D1117]/80 backdrop-blur-md shadow-[0_0_120px_rgba(139,92,246,0.15)] overflow-hidden [mask-image:linear-gradient(to_bottom,white_45%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,white_45%,transparent_100%)]"
          >
            {/* Dashboard Top Header bar */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-[#0a0d14]/90 select-none">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search bar inside header */}
                <div className="flex items-center gap-2 bg-[#181d28]/70 border border-white/5 rounded-md px-3 py-1.5 w-64 text-[10px] text-white/35 font-sans">
                  <Search className="w-3.5 h-3.5 text-white/20" />
                  <span>Search...</span>
                </div>
                {/* Action button inside header */}
                <div className="w-7 h-7 rounded-md bg-[#8B5CF6]/90 flex items-center justify-center shadow-md shadow-[#8B5CF6]/15 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px] md:h-[560px] text-left relative z-10">
              
              {/* Left Sidebar */}
              <div className="hidden md:flex md:col-span-3 border-r border-white/5 bg-[#0a0d14]/40 p-5 flex-col justify-between select-none">
                <div className="space-y-6">
                  {/* Website identifier */}
                  <div className="px-2">
                    <p className="text-[11px] font-bold text-white tracking-tight">TaskBridge Console</p>
                    <p className="text-[9px] text-[#a78bfa] font-mono mt-0.5">app.taskbridge.ai</p>
                  </div>
                  
                  {/* Sidebar menu items */}
                  <div className="space-y-1">
                    {[
                      { label: "Dashboard", icon: Grid, active: true },
                      { label: "Widget Simulator", icon: MessageSquare, active: false },
                      { label: "AI Rules", icon: Zap, active: false },
                      { label: "Knowledge Base", icon: Database, active: false },
                      { label: "Embed Code", icon: Share2, active: false },
                      { label: "Analytics", icon: BarChart3, active: false },
                      { label: "Settings", icon: Settings, active: false }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer ${
                          item.active 
                            ? "bg-white/5 text-[#a78bfa]" 
                            : "text-white/45 hover:bg-white/5 hover:text-white/80"
                        }`}
                      >
                        <item.icon className={`w-3.5 h-3.5 ${item.active ? "text-[#a78bfa]" : "text-white/35"}`} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team member avatar row */}
                <div className="pt-4 border-t border-white/5 px-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#6366F1] flex items-center justify-center text-[10px] font-bold text-white">
                      TB
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-white/90">TaskBridge Org</p>
                      <p className="text-[8px] text-white/40">Enterprise Plan</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                </div>
              </div>

              {/* Right Main Content Area */}
              <div className="col-span-12 md:col-span-9 p-4 md:p-6 flex flex-col justify-between space-y-4 md:space-y-6 relative">
                
                {/* Date selection and Settings row */}
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#181d28]/70 border border-white/5 rounded-md text-[10px] text-white/55 font-sans font-medium">
                    <Calendar className="w-3.5 h-3.5 text-white/35" />
                    <span>Jun 24 → Today</span>
                  </div>
                  <div className="w-7 h-7 rounded-md border border-white/5 bg-[#181d28]/70 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                    <Settings className="w-3.5 h-3.5 text-white/45" />
                  </div>
                </div>

                {/* Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Left Card: AI Resolution Rate */}
                  <div className="col-span-12 md:col-span-7 bg-[#0c0f16]/60 border border-white/5 rounded-xl p-5 flex flex-col justify-between h-[180px] md:h-[210px] relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-white/35 uppercase font-mono tracking-wider font-semibold block mb-0.5">AI Resolution Rate</span>
                        <h4 className="text-[26px] font-bold text-white tracking-tight font-sans">
                          94.12% <span className="text-[11px] text-[#22C55E] font-semibold font-mono ml-1.5">(+5.6%)</span>
                        </h4>
                      </div>
                    </div>

                    {/* Chart Container with vertical cursor tracker and tooltip */}
                    <div className="w-full h-24 relative flex items-end">
                      {/* Vertical tracker line */}
                      <div className="absolute left-[58%] top-0 bottom-0 w-px border-l border-dashed border-white/20 pointer-events-none z-10" />
                      
                      {/* Floating Tooltip */}
                      <div className="absolute top-1 left-[61%] bg-[#0D1117] border border-white/10 rounded px-2 py-0.5 text-[8px] text-white font-mono shadow-md z-20 pointer-events-none flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                        <span>Jun 18: 93.8%</span>
                      </div>

                      <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                        <path
                          d="M0,75 Q40,70 80,55 T160,60 T240,20 T300,15"
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="2.5"
                        />
                        <path
                          d="M0,75 Q40,70 80,55 T160,60 T240,20 T300,15 L300,80 L0,80 Z"
                          fill="url(#sparkGrad)"
                          opacity="0.15"
                        />
                        <defs>
                          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="transparent" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Glowing tracker point */}
                      <div className="absolute left-[58%] bottom-[32px] -translate-x-1/2 w-2 h-2 rounded-full bg-[#8B5CF6] border-2 border-white pointer-events-none z-10 shadow-[0_0_8px_#8B5CF6]" />
                    </div>
                  </div>

                  {/* Right Card: Qualified Leads */}
                  <div className="col-span-12 md:col-span-5 bg-[#0c0f16]/60 border border-white/5 rounded-xl p-5 flex flex-col justify-between h-[180px] md:h-[210px] overflow-hidden">
                    <div>
                      <span className="text-[10px] text-white/35 uppercase font-mono tracking-wider font-semibold block mb-0.5">Qualified Leads</span>
                      <h4 className="text-[26px] font-bold text-white tracking-tight font-sans">
                        12.4K <span className="text-[11px] text-red-500 font-semibold font-mono ml-1.5">(-2.5%)</span>
                      </h4>
                    </div>

                    {/* Sources List */}
                    <div className="space-y-1.5 text-[9px] font-mono text-white/55 mt-2">
                      <p className="text-[8px] text-white/35 uppercase font-sans font-bold tracking-wider mb-1 select-none">Top Sources</p>
                      {[
                        "Website Live Widget",
                        "Link-in-Bio Social Clicks",
                        "Custom Domain Landing Page",
                        "Direct Referral Traffic"
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-white/60">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full border border-white/20 flex-shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                          <span className="text-white/20 select-none">•••</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Bottom Card: Telemetry Volume */}
                <div className="bg-[#0c0f16]/60 border border-white/5 rounded-xl p-5 flex-1 hidden md:flex flex-col justify-between relative overflow-hidden min-h-[160px] select-none">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-2">
                    <div>
                      <span className="text-[10px] text-white/35 uppercase font-mono tracking-wider font-semibold block">Telemetry Session Volume</span>
                      <h4 className="text-[20px] font-bold text-white font-sans mt-0.5">
                        48.2K <span className="text-[10px] text-[#22C55E] font-mono font-bold ml-1">(+10.7%)</span>
                      </h4>
                    </div>
                  </div>

                  {/* Wide Performance Chart with Gridlines */}
                  <div className="flex-1 w-full relative flex items-end pt-4">
                    <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                      <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                      <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                      
                      {/* Curve Path */}
                      <path
                        d="M0,105 C100,90 150,55 250,60 C350,65 400,20 500,10"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Blend Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[220px] bg-gradient-to-t from-[#060810] via-[#060810]/80 to-transparent pointer-events-none z-20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
