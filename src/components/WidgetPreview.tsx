"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { liveChatAssistant } from "@/ai/flows/live-chat-assistant-flow";
import { Message } from "@/types";

export function WidgetPreview() {
  // --- Browser Widget Chat State ---
  const [widgetMessages, setWidgetMessages] = useState<Message[]>([
    { role: "model", content: "Hi! I'm the TaskBridge AI widget. Ask me anything about our customer support automation and live chat widgets!" }
  ]);
  const [widgetInput, setWidgetInput] = useState("");
  const [widgetLoading, setWidgetLoading] = useState(false);
  const widgetScrollRef = useRef<HTMLDivElement>(null);

  // --- Mobile Phone Chat State ---
  const [phoneMessages, setPhoneMessages] = useState<Message[]>([
    { role: "model", content: "Welcome to TaskBridge! Ask me anything about our pricing, features, or embeddable widget setups." }
  ]);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const phoneScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic for Browser Widget
  useEffect(() => {
    if (widgetScrollRef.current) {
      widgetScrollRef.current.scrollTop = widgetScrollRef.current.scrollHeight;
    }
  }, [widgetMessages, widgetLoading]);

  // Auto-scroll logic for Mobile Phone
  useEffect(() => {
    if (phoneScrollRef.current) {
      phoneScrollRef.current.scrollTop = phoneScrollRef.current.scrollHeight;
    }
  }, [phoneMessages, phoneLoading]);

  // Handle Browser Widget message send
  const handleWidgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!widgetInput.trim() || widgetLoading) return;

    const userMessage: Message = { role: "user", content: widgetInput };
    const newMessages = [...widgetMessages, userMessage];
    setWidgetMessages(newMessages);
    setWidgetInput("");
    setWidgetLoading(true);

    try {
      const { response } = await liveChatAssistant({ history: newMessages });
      setWidgetMessages((prev) => [...prev, { role: "model", content: response }]);
    } catch (error) {
      setWidgetMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I'm experiencing connectivity issues. Please try again." }
      ]);
    } finally {
      setWidgetLoading(false);
    }
  };

  // Handle Mobile Phone message send
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim() || phoneLoading) return;

    const userMessage: Message = { role: "user", content: phoneInput };
    const newMessages = [...phoneMessages, userMessage];
    setPhoneMessages(newMessages);
    setPhoneInput("");
    setPhoneLoading(true);

    try {
      const { response } = await liveChatAssistant({ history: newMessages });
      setPhoneMessages((prev) => [...prev, { role: "model", content: response }]);
    } catch (error) {
      setPhoneMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I couldn't reach the server. Let's try again in a moment." }
      ]);
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <section id="live-widget" className="py-[120px] bg-transparent border-t border-white/6 relative z-10 scroll-mt-20">
      <div className="w-full max-w-[1120px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-[64px]">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa]">
            Live Interactive Widget
          </span>
          <h2 className="text-[40px] font-bold tracking-[-0.025em] leading-[1.1] text-[#F8FAFC] mt-3">
            See exactly how our <span className="font-['Instrument_Serif'] italic text-[#a78bfa]">widgets</span> work.
          </h2>
          <p className="text-white/50 text-[14px] max-w-lg mx-auto mt-2.5">
            Test our real-time AI assistant right here in the browser or mobile simulator.
          </p>
        </div>

        {/* Mockups Container */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-4xl mx-auto shadow-[0_0_80px_rgba(139,92,246,0.08)] p-4 rounded-[2rem] border border-white/5">
          
          {/* Left Mockup: Desktop Browser Frame */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, threshold: 0.15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full lg:w-[560px] h-[520px] bg-[#0D1117] border border-white/8 rounded-xl overflow-hidden flex flex-col justify-between"
          >
            {/* Browser Chrome Bar */}
            <div className="hidden sm:flex h-8 bg-[#111827] px-4 items-center justify-between border-b border-white/5 relative z-10 shrink-0">
              {/* Traffic Light Dots */}
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              </div>
              {/* URL Bar */}
              <div className="absolute left-1/2 -translate-x-1/2 bg-white/5 border border-white/10 rounded-md px-12 py-0.5 text-[10px] text-white/40 font-mono select-none">
                yourwebsite.com
              </div>
              <div className="w-6" />
            </div>

            {/* Page Body / Skeletal Content */}
            <div className="flex-1 p-0 sm:p-6 relative bg-[#060810]/50 overflow-hidden flex flex-col justify-end">
              {/* Mock Skeletal Lines */}
              <div className="absolute top-6 left-6 right-6 space-y-4 opacity-[0.08] select-none pointer-events-none hidden sm:block">
                <div className="h-4 w-24 bg-white rounded animate-pulse" />
                <div className="space-y-2 pt-8">
                  <div className="h-6 w-3/4 bg-white rounded" />
                  <div className="h-3 w-1/2 bg-white rounded" />
                  <div className="h-3 w-2/3 bg-white rounded" />
                </div>
              </div>

              {/* Floating Website Chat Widget */}
              <div className="relative w-full h-full sm:absolute sm:bottom-4 sm:right-4 sm:w-[320px] sm:h-auto bg-[#0D1117] border-0 sm:border border-white/10 rounded-xl sm:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-10">
                {/* Widget Header */}
                <div className="bg-[#111827] p-3.5 flex items-center justify-between border-b border-white/5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#F8FAFC] tracking-tight">TaskBridge Widget</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
                  </div>
                  <span className="text-[9px] text-[#22C55E] uppercase font-mono tracking-wider font-bold">Online</span>
                </div>

                {/* Widget Messages */}
                <div 
                  ref={widgetScrollRef}
                  className="p-4 space-y-3 flex-1 sm:h-[200px] overflow-y-auto text-[11px] flex flex-col justify-start scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent"
                >
                  <AnimatePresence initial={false}>
                    {widgetMessages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl px-3 py-2 max-w-[85%] font-sans leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#8B5CF6] text-white rounded-tr-none self-end"
                            : "bg-white/10 text-[#F8FAFC] rounded-tl-none self-start"
                        }`}
                      >
                        {msg.content}
                      </motion.div>
                    ))}
                    {widgetLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/10 text-[#F8FAFC] rounded-2xl rounded-tl-none px-3 py-2.5 max-w-[50px] self-start flex gap-1 items-center"
                      >
                        <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce" />
                        <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input Bar Form */}
                <form onSubmit={handleWidgetSubmit} className="p-3 sm:p-2 border-t border-white/5 bg-[#111827] flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={widgetInput}
                    onChange={(e) => setWidgetInput(e.target.value)}
                    placeholder="Ask our widget a question..."
                    className="flex-1 bg-transparent border-0 text-[11px] text-[#F8FAFC] placeholder:text-white/20 focus:outline-none focus:ring-0 p-0 pl-2 h-8 sm:h-7"
                  />
                  <button 
                    type="submit" 
                    disabled={!widgetInput.trim() || widgetLoading}
                    className="w-8 h-8 sm:w-7 sm:h-7 shrink-0 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] hover:bg-[#8B5CF6]/20 hover:text-white transition-all duration-150 disabled:opacity-30"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right Mockup: Mobile Phone Frame */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, threshold: 0.15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-[280px] h-[520px] border-2 border-white/12 bg-[#060810] rounded-[40px] overflow-hidden flex flex-col justify-between relative shadow-2xl"
          >
            {/* Status bar */}
            <div className="h-6 bg-[#111827]/30 px-6 flex items-center justify-between select-none shrink-0 relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#060810] rounded-b-xl z-20" />
              <span className="text-[9px] text-white/40">9:41</span>
              <div className="flex items-center gap-1 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
            </div>

            {/* Chat Interface Screen */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* Mobile Chat Header */}
              <div className="bg-[#0D1117] border-b border-white/5 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/15 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-[#a78bfa]" />
                  </div>
                  <span className="text-[12px] font-bold text-[#F8FAFC]">TaskBridge Support</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              </div>

              {/* Chat bubbles */}
              <div 
                ref={phoneScrollRef}
                className="flex-1 p-4 space-y-3 overflow-y-auto text-[11px] flex flex-col justify-start scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent"
              >
                <AnimatePresence initial={false}>
                  {phoneMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl px-3 py-2 max-w-[85%] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#8B5CF6] text-white rounded-tr-none self-end"
                          : "bg-white/10 text-[#F8FAFC] rounded-tl-none self-start"
                      }`}
                    >
                      {msg.content}
                    </motion.div>
                  ))}
                  {phoneLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white/10 text-[#F8FAFC] rounded-2xl rounded-tl-none px-3 py-2.5 max-w-[50px] self-start flex gap-1 items-center"
                    >
                      <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input Area Form Pinned to Bottom */}
              <form onSubmit={handlePhoneSubmit} className="p-3 border-t border-white/5 bg-[#0D1117] flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent border-0 text-[10px] text-[#F8FAFC] placeholder:text-white/20 focus:outline-none focus:ring-0 p-0 pl-1 h-6"
                />
                <button 
                  type="submit"
                  disabled={!phoneInput.trim() || phoneLoading}
                  className="w-6 h-6 shrink-0 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] hover:bg-[#8B5CF6]/20 hover:text-white transition-all duration-150 disabled:opacity-35"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
