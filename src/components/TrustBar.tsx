"use client";

import { motion } from "framer-motion";
import { TRUST_LOGOS } from "@/lib/constants";

export function TrustBar() {
  return (
    <section className="py-12 border-b border-white/6 bg-transparent relative z-10">
      <div className="w-full max-w-[1120px] mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[11px] uppercase tracking-[0.12em] text-white/35 font-semibold mb-8"
        >
          Powering support teams at leading companies
        </motion.p>
        
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-24">
          {TRUST_LOGOS.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
              className="text-lg md:text-xl font-bold tracking-tight text-white/30 hover:text-[#a78bfa] transition-colors duration-200 cursor-default"
            >
              {name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
