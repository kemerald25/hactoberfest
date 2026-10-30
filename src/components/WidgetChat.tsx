"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { liveChatAssistant } from "@/ai/flows/live-chat-assistant-flow";
import { getPublicSessionMessages } from "@/app/actions/business";
import { Message } from "@/types";
import { Send, User, Sparkles, X } from "lucide-react";

export function WidgetChat({ businessId, themeColor, businessName, isStandalone = false }: { businessId: string, themeColor?: string, businessName?: string, isStandalone?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: `Hello! How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      const key = `taskbridge_session_${businessId}`;
      let id = localStorage.getItem(key);
      if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        localStorage.setItem(key, id);
      }
      return id;
    }
    return "unknown";
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const actualThemeColor = themeColor || "#3b82f6";
  const actualBusinessName = businessName || "AI Assistant";

  useEffect(() => {
    const fetchHistory = async () => {
      if (sessionId && sessionId !== "unknown") {
        try {
          const res = await getPublicSessionMessages(businessId, sessionId);
          if (res.success && res.messages && res.messages.length > 0) {
            setMessages(res.messages);
          }
        } catch (err) {
          console.error("Error restoring chat history:", err);
        }
      }
    };
    fetchHistory();
  }, [businessId, sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { response } = await liveChatAssistant({
        businessId,
        history: newMessages,
        channel: isStandalone ? "standalone" : "widget",
        sessionId,
      });
      setMessages((prev) => [...prev, { role: "model", content: response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", content: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a1018] font-sans overflow-hidden">
      {/* Header */}
      <div 
        className="px-4 py-4 flex items-center justify-between text-white shadow-md flex-shrink-0"
        style={{ backgroundColor: actualThemeColor }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="text-white h-5 w-5" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-transparent animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm leading-tight">{actualBusinessName}</h4>
            <p className="text-[10px] text-white/80 uppercase tracking-widest font-bold mt-0.5">Online</p>
          </div>
        </div>
        {!isStandalone && (
          <button 
            onClick={() => window.parent.postMessage({ type: 'CLOSE_WIDGET' }, '*')}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close widget"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-[#0a1018]"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, x: msg.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div 
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white"
                  style={{ backgroundColor: msg.role === "user" ? "#4b5563" : actualThemeColor }}
                >
                  {msg.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === "user" 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-white/5 text-white/80 rounded-tl-none border border-white/10"
                }`}>
                  <Linkify text={msg.content} />
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: actualThemeColor }}
                >
                  <Sparkles size={16} className="animate-spin" />
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0a1018] border-t border-white/10 flex-shrink-0">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="relative flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-1 transition-all"
            style={{ '--tw-ring-color': actualThemeColor } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0"
            style={{ backgroundColor: actualThemeColor }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

// Helper to safely render URLs and mailto links as clickable anchors
function Linkify({ text }: { text: string }) {
  // Regex to match URLs and mailto links, ignoring trailing punctuation like dots or commas
  const urlRegex = /(https?:\/\/[^\s]+[^\s.,!?;:]|mailto:[^\s]+[^\s.,!?;:])/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          // Make it look clean by removing the mailto: prefix in the display text if it's an email
          const displayText = part.startsWith('mailto:') ? part.replace('mailto:', '') : part;
          return (
            <a 
              key={i} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-medium hover:opacity-80 transition-opacity text-blue-600 dark:text-blue-400"
            >
              {displayText}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
