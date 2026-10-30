"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { TrustBar } from "@/components/TrustBar";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { BeforeAfter } from "@/components/BeforeAfter";
import { WidgetPreview } from "@/components/WidgetPreview";
import { UseCases } from "@/components/UseCases";
import { Testimonials } from "@/components/Testimonials";
import { Pricing } from "@/components/Pricing";
import { CTABanner } from "@/components/CTABanner";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { WidgetEmbed } from "@/components/WidgetEmbed";

// Reusable scroll reveal wrapper for high-fidelity section entrance transitions
function ScrollReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-160px" }}
      transition={{ 
        type: "spring",
        stiffness: 45,
        damping: 14,
        mass: 1.1
      }}
    >
      {children}
    </motion.div>
  );
}

export function HomeClient() {
  return (
    <main className="min-h-screen bg-[#060810] bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] overflow-x-hidden">
      <Navbar />
      <Hero />
      
      <ScrollReveal>
        <StatsBar />
      </ScrollReveal>
      
      <ScrollReveal>
        <TrustBar />
      </ScrollReveal>
      
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>
      
      <ScrollReveal>
        <Features />
      </ScrollReveal>
      
      <ScrollReveal>
        <BeforeAfter />
      </ScrollReveal>
      
      <ScrollReveal>
        <WidgetPreview />
      </ScrollReveal>
      
      <ScrollReveal>
        <UseCases />
      </ScrollReveal>
      
      <ScrollReveal>
        <Pricing />
      </ScrollReveal>
      
      <ScrollReveal>
        <CTABanner />
      </ScrollReveal>
      
      <ScrollReveal>
        <ContactForm />
      </ScrollReveal>
      
      <Footer />
      
      {/* Floating customer widget co-pilot embed */}
      <WidgetEmbed businessId="taskbridge" />
    </main>
  );
}
