"use client";

import { Twitter, Linkedin } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { TaskBridgeLogo } from "./TaskBridgeLogo";

export function Footer() {
  return (
    <footer className="py-16 border-t border-white/6 bg-transparent relative z-10">
      <div className="w-full max-w-[1120px] mx-auto px-6">

        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          
          {/* Logo and brief description */}
          <div className="max-w-xs">
            <div className="flex items-center gap-1.5 mb-4 select-none">
              <TaskBridgeLogo size="md" />
            </div>
            <p className="text-white/45 text-[13px] leading-relaxed font-sans">
              Elevating business communications with contextual, 24/7 AI-powered embeddable customer widgets and task automation.
            </p>
          </div>
          
          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
            
            {/* Column 1 */}
            <div className="space-y-4">
              <h5 className="text-[#F8FAFC] font-semibold text-[13px] font-sans">Product</h5>
              <ul className="space-y-2">
                <li><a href="/onboard" className="text-white/45 hover:text-[#a78bfa] transition-colors duration-200 text-[13px] font-sans">Get Started</a></li>
                <li><a href="/#features" className="text-white/45 hover:text-[#a78bfa] transition-colors duration-200 text-[13px] font-sans">Features</a></li>
                <li><a href="/#how-it-works" className="text-white/45 hover:text-[#a78bfa] transition-colors duration-200 text-[13px] font-sans">How it works</a></li>
                <li><a href="/#live-widget" className="text-white/45 hover:text-[#a78bfa] transition-colors duration-200 text-[13px] font-sans">Live Widget</a></li>
                <li><a href="/#pricing" className="text-white/45 hover:text-[#a78bfa] transition-colors duration-200 text-[13px] font-sans">Pricing</a></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <h5 className="text-[#F8FAFC] font-semibold text-[13px] font-sans">Legal</h5>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-white/45 hover:text-[#a78bfa] transition-colors duration-200 text-[13px] font-sans">Privacy</a></li>
                <li><a href="/terms" className="text-white/45 hover:text-[#a78bfa] transition-colors duration-200 text-[13px] font-sans">Terms</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <h5 className="text-[#F8FAFC] font-semibold text-[13px] font-sans">Connect</h5>
              <div className="flex items-center gap-5">
                <a 
                  href={siteConfig.links.x} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/45 hover:text-[#a78bfa] transition-colors duration-200"
                  aria-label="Twitter / X"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href={siteConfig.links.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/45 hover:text-[#a78bfa] transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href={siteConfig.links.tiktok} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/45 hover:text-[#a78bfa] transition-colors duration-200"
                  aria-label="TikTok"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
        
        {/* Bottom footer area */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-[12px] font-sans">
            &copy; {new Date().getFullYear()} TaskBridge AI Systems. All rights reserved.
          </p>
          <span className="text-white/30 text-[11px] uppercase tracking-wider font-semibold font-sans">
            Automating customer workflows with AI widgets
          </span>
        </div>

      </div>
    </footer>
  );
}
