"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useAnimationFrame } from "framer-motion";
import { usePathname } from "next/navigation";

export function LenisInit() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Skip Lenis smooth scrolling on Admin routes to prevent scrolling conflict on dashboard containers
    if (pathname?.startsWith("/admin")) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  useAnimationFrame((time: number) => {
    if (lenisRef.current) {
      lenisRef.current.raf(time);
    }
  });

  return null;
}

export function NoiseOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-1 opacity-[0.025]">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}
