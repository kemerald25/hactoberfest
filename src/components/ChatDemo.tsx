"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Message } from "@/types";
import { liveChatAssistant } from "@/ai/flows/live-chat-assistant-flow";

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
}

export function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Hello! I'm your TaskBridge AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { response } = await liveChatAssistant({ history: newMessages });
      setMessages((prev) => [...prev, { role: "model", content: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="demo" className="py-[120px] relative overflow-hidden bg-[#060810] border-t border-white/6 z-10">
      <div className="w-full max-w-[1120px] mx-auto px-6 relative z-10">
        <div className="text-center mb-[64px]">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa]">
            Interactive Demo
          </span>
          <h2 className="text-[40px] font-bold tracking-[-0.025em] leading-[1.1] text-[#F8FAFC] mt-3">
            Experience the <span className="font-['Instrument_Serif'] italic text-[#a78bfa]">Intelligence</span>
          </h2>
          <p className="text-white/55 max-w-xl mx-auto mt-4 text-[16px]">
            Talk to our TaskBridge assistant now. She's trained on business data to show you exactly how she handles customers.
          </p>
        </div>

        {/* Outer Chat Box Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, threshold: 0.15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl mx-auto bg-[#0D1117] border border-white/8 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]"
        >
          {/* Header */}
          <div className="bg-[#060810]/40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/20">
                  <Sparkles className="text-[#8B5CF6] h-5 w-5" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-[#0D1117]" />
              </div>
              <div>
                <h4 className="font-bold text-[#F8FAFC] text-sm font-sans">TaskBridge Assistant</h4>
                <p className="text-[9px] text-[#22C55E] uppercase tracking-widest font-bold flex items-center gap-1">
                  Always Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/20" />
              <span className="w-2 h-2 rounded-full bg-white/20" />
              <span className="w-2 h-2 rounded-full bg-white/20" />
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 p-6 space-y-4 overflow-y-auto font-sans scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent"
          >
            <AnimatePresence initial={false}>
              {messages.map((message, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 max-w-[85%] ${
                    message.role === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  {message.role === "model" && (
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/8 mt-1">
                      <Bot size={14} className="text-[#a78bfa]" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                      message.role === "user"
                        ? "bg-[#8B5CF6] text-white rounded-tr-none"
                        : "bg-white/5 border border-white/8 text-[#F8FAFC] rounded-tl-none"
                    }`}
                  >
                    {message.role === "model" && i === messages.length - 1 ? (
                      <TypewriterText text={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 max-w-[85%]"
              >
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/8 mt-1">
                  <Bot size={14} className="text-[#a78bfa]" />
                </div>
                <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-6 py-2 flex gap-2 overflow-x-auto border-t border-white/5 bg-[#060810]/20 scrollbar-none">
            {[
              "What are your setup prices?",
              "Can I embed the chat widget on my site?",
              "How does it automate customer tasks?",
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInput(prompt)}
                className="text-[11px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border border-white/5"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-white/5 bg-[#060810]/40 relative flex items-center"
          >
            <div className="relative w-full">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask TaskBridge anything..."
                className="w-full bg-[#060810]/40 border-white/10 text-white rounded-full h-12 pr-12 focus:border-[#8B5CF6]/50 transition-all placeholder:text-white/20"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 top-1.5 w-9 h-9 bg-[#8B5CF6] text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
