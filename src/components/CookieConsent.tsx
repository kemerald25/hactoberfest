"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Settings, X, Check } from "lucide-react";

// Native Lightweight Cookie Helpers
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [view, setView] = useState<"banner" | "customize">("banner");
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  useEffect(() => {
    // Check if consent has already been saved
    const consent = getCookie("taskbridge_cookie_consent");
    if (!consent) {
      // Small timeout to let initial page load transition finish
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = { necessary: true, analytics: true };
    setCookie("taskbridge_cookie_consent", JSON.stringify(consentData), 365);
    
    // Trigger window event so scripts know they can load
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cookieConsentUpdated"));
    }
    
    setIsVisible(false);
  };

  const handleDeclineOptional = () => {
    const consentData = { necessary: true, analytics: false };
    setCookie("taskbridge_cookie_consent", JSON.stringify(consentData), 365);
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cookieConsentUpdated"));
    }
    
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const consentData = { necessary: true, analytics: analyticsConsent };
    setCookie("taskbridge_cookie_consent", JSON.stringify(consentData), 365);
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cookieConsentUpdated"));
    }
    
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md bg-[#0A071E]/95 border border-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-2xl z-50 text-white font-sans overflow-hidden"
        >
          {/* Top Decorative Border Highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent" />

          {view === "banner" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-purple-400">
                <Shield className="w-5 h-5" />
                <h4 className="font-bold text-[15px] tracking-tight">Cookie Preferences</h4>
              </div>
              <p className="text-[12.5px] text-white/60 leading-relaxed">
                We use cookies to keep you logged in, track referral commission rewards for campus ambassadors, and analyze web traffic parameters.
              </p>
              
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={handleAcceptAll}
                  className="w-full h-11 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-[13px] rounded-lg transition-colors flex items-center justify-center"
                >
                  Accept All
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDeclineOptional}
                    className="h-11 border border-white/10 hover:bg-white/5 text-white/80 font-medium text-[12.5px] rounded-lg transition-colors flex items-center justify-center"
                  >
                    Necessary Only
                  </button>
                  <button
                    onClick={() => setView("customize")}
                    className="h-11 border border-white/10 hover:bg-white/5 text-white/80 font-medium text-[12.5px] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Customize</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-purple-400">
                <h4 className="font-bold text-[15px] tracking-tight">Customize Consent Settings</h4>
                <button onClick={() => setView("banner")} className="text-white/45 hover:text-white p-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 pt-2 max-h-[200px] overflow-y-auto pr-1">
                
                {/* Category 1: Necessary */}
                <div className="flex items-start justify-between gap-4 p-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="space-y-0.5">
                    <div className="text-[12px] font-bold text-white flex items-center gap-1.5">
                      Strictly Necessary
                      <span className="text-[9px] uppercase tracking-wider bg-white/10 text-white/60 px-1 py-0.5 rounded font-mono">Required</span>
                    </div>
                    <p className="text-[10.5px] text-white/45 leading-normal">Ambassador referral codes & account authentication sessions.</p>
                  </div>
                  <div className="w-8 h-4 rounded-full bg-purple-500/20 flex items-center justify-end px-0.5 border border-purple-500/40">
                    <div className="w-3 h-3 rounded-full bg-purple-400" />
                  </div>
                </div>

                {/* Category 2: Analytics */}
                <div className="flex items-start justify-between gap-4 p-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="space-y-0.5">
                    <div className="text-[12px] font-bold text-white">Analytics & Targeting</div>
                    <p className="text-[10.5px] text-white/45 leading-normal">TikTok Pixel, LinkedIn Insight, and Google Tag analytics tags.</p>
                  </div>
                  <button
                    onClick={() => setAnalyticsConsent(!analyticsConsent)}
                    className={`w-8 h-4 rounded-full flex items-center px-0.5 border transition-all ${
                      analyticsConsent 
                        ? "bg-purple-600 border-purple-500 justify-end" 
                        : "bg-white/5 border-white/10 justify-start"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full transition-colors ${analyticsConsent ? "bg-white" : "bg-white/30"}`} />
                  </button>
                </div>

              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setView("banner")}
                  className="w-1/3 h-11 border border-white/10 hover:bg-white/5 text-white/80 font-medium text-[12.5px] rounded-lg transition-colors flex items-center justify-center"
                >
                  Back
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="w-2/3 h-11 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-[13px] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
