"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Activity, X } from "lucide-react";

type AlertType = "info" | "confirm" | "error" | "success";

interface AlertOptions {
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
}

interface AlertContextProps {
  showAlert: (title: string, message: string, type?: "info" | "error" | "success") => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertOptions | null>(null);

  useEffect(() => {
    if (alertState) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [alertState]);

  const showAlert = (title: string, message: string, type: "info" | "error" | "success" = "info") => {
    setAlertState({ type, title, message });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setAlertState({ type: "confirm", title, message, onConfirm });
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alertState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div 
            className="absolute inset-0" 
            onClick={() => {
              if (alertState.type !== "confirm") setAlertState(null);
            }} 
          />
          
          <div className="relative w-full max-w-sm bg-[#0E0B25] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center">
            {/* Header Icon */}
            <div className="mb-4">
              {alertState.type === "error" && (
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/35 flex items-center justify-center text-red-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              {alertState.type === "success" && (
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              {alertState.type === "confirm" && (
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/35 flex items-center justify-center text-amber-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}
              {alertState.type === "info" && (
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/35 flex items-center justify-center text-blue-500">
                  <Activity className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Title & Description */}
            <h4 className="text-[16px] font-bold text-white mb-2">{alertState.title}</h4>
            <p className="text-[12.5px] text-white/60 leading-relaxed mb-6 font-sans">{alertState.message}</p>

            {/* Actions Panel */}
            <div className="flex gap-3 w-full">
              {alertState.type === "confirm" ? (
                <>
                  <button
                    onClick={() => setAlertState(null)}
                    className="flex-1 h-10 border border-white/10 hover:bg-white/5 text-white font-semibold text-[13px] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (alertState.onConfirm) alertState.onConfirm();
                      setAlertState(null);
                    }}
                    className={`flex-1 h-10 font-semibold text-[13px] rounded-lg transition-colors ${
                      alertState.title.toLowerCase().includes("delete") || 
                      alertState.title.toLowerCase().includes("clear")
                        ? "bg-red-600 hover:bg-red-500 text-white" 
                        : "bg-purple-600 hover:bg-purple-500 text-white"
                    }`}
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAlertState(null)}
                  className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[13px] rounded-lg transition-colors"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
