"use client";

import { useEffect, useRef, useState } from "react";

function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const [value, setValue] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  
  useEffect(() => {
    if (started.current) return;
    
    let animationFrameId: number;
    const duration = 1500; // 1.5 seconds

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          let startTimestamp: number | null = null;
          
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // easeOutQuart easing function
            const ease = 1 - Math.pow(1 - progress, 4);
            
            setValue(ease * to);
            
            if (progress < 1) {
              animationFrameId = requestAnimationFrame(step);
            }
          };
          
          animationFrameId = requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [to]);

  return (
    <span ref={elementRef}>
      {decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString()}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="border-t border-b border-white/6 bg-transparent py-12 relative z-20">
      <div className="w-full max-w-[1120px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-white/6 [&>div]:pt-6 md:[&>div]:pt-0 first:[&>div]:pt-0">
          
          {/* Column 1: Setup Fee */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-[36px] sm:text-[48px] font-bold text-[#F8FAFC] tracking-tight leading-none">
              <span className="text-[#a78bfa]">₦</span>
              <CountUp to={15000} />
            </div>
            <span className="text-[13px] text-white/55 tracking-[0.04em] mt-1 font-sans">
              one-time setup
            </span>
          </div>

          {/* Column 2: Response time */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-[36px] sm:text-[48px] font-bold text-[#F8FAFC] tracking-tight leading-none">
              <CountUp to={1.4} decimals={1} />
              <span className="text-[#a78bfa]">s</span>
            </div>
            <span className="text-[13px] text-white/55 tracking-[0.04em] mt-1 font-sans">
              avg response time
            </span>
          </div>

          {/* Column 3: Always Online */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-[36px] sm:text-[48px] font-bold text-[#F8FAFC] tracking-tight leading-none">
              <CountUp to={24} />
              <span className="text-[#a78bfa]">/7</span>
            </div>
            <span className="text-[13px] text-white/55 tracking-[0.04em] mt-1 font-sans">
              always online
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
