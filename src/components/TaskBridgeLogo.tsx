"use client";

import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TaskBridgeLogo({ className = "", showText = true, size = "md" }: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const textSizes = {
    sm: "text-[15px]",
    md: "text-[17px]",
    lg: "text-[21px]",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-tech Bridge Icon with glowing purple gradient */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        {/* Ambient Purple Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#8B5CF6]/30 to-[#6366F1]/30 blur-[6px]" />
        
        {/* Core Icon SVG */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-[0_2px_8px_rgba(139,92,246,0.35)]"
        >
          <defs>
            <linearGradient id="tbGradientPurple" x1="2" y1="4" x2="34" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="tbAccentPurple" x1="8" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#DDD6FE" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>

          {/* Rounded Shield Base */}
          <rect
            x="2"
            y="2"
            width="32"
            height="32"
            rx="9"
            fill="#0F0C1B"
            stroke="url(#tbGradientPurple)"
            strokeWidth="1.75"
          />

          {/* Connected Bridge Arch & Nodes */}
          {/* Left Tower / Node */}
          <circle cx="11" cy="18" r="3.2" fill="url(#tbGradientPurple)" />
          {/* Right Tower / Node */}
          <circle cx="25" cy="18" r="3.2" fill="url(#tbAccentPurple)" />

          {/* Bridge Arch Cable */}
          <path
            d="M11 18C14 11 22 11 25 18"
            stroke="url(#tbGradientPurple)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Task Flow Beam */}
          <path
            d="M11 23H25"
            stroke="url(#tbAccentPurple)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />

          {/* Center Pulse */}
          <circle cx="18" cy="13.5" r="1.8" fill="#C084FC" className="animate-pulse" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight text-[#F8FAFC] font-sans ${textSizes[size]}`}>
            Task<span className="text-[#A78BFA]">Bridge</span>
          </span>
          <span className="text-[9.5px] font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
            AI
          </span>
        </div>
      )}
    </div>
  );
}
