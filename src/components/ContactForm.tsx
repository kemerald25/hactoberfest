"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { submitContactForm } from "@/app/actions/contact";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await submitContactForm(formData);
      if (result.success) {
        setIsSuccess(true);
        // Fallback open mailto if direct send had an issue or for backup
        if (result.mailto) {
          window.location.href = result.mailto;
        }
      } else {
        setError(result.error || "Failed to submit. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-[120px] bg-transparent border-t border-white/6 relative z-10">
      <div className="w-full max-w-[1120px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, threshold: 0.15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa] block mb-4">
              Get In Touch
            </span>
            <h2 className="text-[40px] font-bold tracking-[-0.025em] leading-[1.1] text-[#F8FAFC] mb-6">
              Let's build your <span className="font-['Instrument_Serif'] italic text-[#a78bfa]">perfect</span> assistant.
            </h2>
            <p className="text-white/55 text-[16px] leading-relaxed max-w-md mb-8">
              Whether you're a startup or an enterprise, we'll help you deploy an AI widget solution that actually drives results.
            </p>
            
            <div className="space-y-4">
              {[
                "Custom tailored personas",
                "Seamless live widget integration",
                "White-glove onboarding"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80">
                  <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/20 flex-shrink-0">
                    <CheckCircle2 className="text-[#8B5CF6] w-3.5 h-3.5" />
                  </div>
                  <span className="text-[14px] font-medium font-sans">{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Form Container */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, threshold: 0.15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0D1117] border border-white/8 p-6 sm:p-10 rounded-2xl text-center shadow-2xl"
              >
                <div className="w-16 h-16 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-[#8B5CF6] w-8 h-8" />
                </div>
                <h3 className="text-[20px] font-bold text-[#F8FAFC] mb-2 font-sans">Inquiry Received</h3>
                <p className="text-white/45 text-[14px] mb-8 font-sans">We can't wait to connect with you!</p>
                <Button
                  onClick={() => setIsSuccess(false)}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[13px] rounded-lg"
                >
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[#0D1117] border border-white/8 p-6 sm:p-8 rounded-2xl space-y-4 shadow-2xl">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Full Name</label>
                    <Input name="name" required placeholder="John Doe" className="bg-[#060810]/40 border-white/8 text-[#F8FAFC] placeholder:text-white/20 h-10 rounded-lg focus:border-[#8B5CF6]/50 focus-visible:ring-0 focus-visible:ring-offset-0" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Work Email</label>
                    <Input name="email" type="email" required placeholder="john@company.com" className="bg-[#060810]/40 border-white/8 text-[#F8FAFC] placeholder:text-white/20 h-10 rounded-lg focus:border-[#8B5CF6]/50 focus-visible:ring-0 focus-visible:ring-offset-0" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Company Name</label>
                  <Input name="company" required placeholder="Enterprise Co." className="bg-[#060810]/40 border-white/8 text-[#F8FAFC] placeholder:text-white/20 h-10 rounded-lg focus:border-[#8B5CF6]/50 focus-visible:ring-0 focus-visible:ring-offset-0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">How can we help?</label>
                  <Textarea name="message" required placeholder="Tell us about your support needs..." className="bg-[#060810]/40 border-white/8 text-[#F8FAFC] placeholder:text-white/20 min-h-[100px] rounded-lg focus:border-[#8B5CF6]/50 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none" />
                </div>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[12px] font-sans">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full h-11 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-[14px] rounded-lg shadow-none transition-all duration-150 mt-2"
                >
                  {isSubmitting ? "Sending..." : "Submit Inquiry"}
                </Button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
