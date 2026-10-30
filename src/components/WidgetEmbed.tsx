"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function WidgetEmbed({ businessId }: { businessId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Listen for messages from the iframe to close it
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CLOSE_WIDGET') {
        setIsOpen(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-[9999] shadow-2xl rounded-[24px] overflow-hidden bg-background border border-border"
            style={{ width: '400px', height: '600px', maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100vh - 120px)' }}
          >
            <iframe 
              src={`/widget/${businessId}`}
              className="w-full h-full border-none"
              title="AI Assistant"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-purple-500/30 border border-white/20"
        aria-label="Open TaskBridge Widget"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
