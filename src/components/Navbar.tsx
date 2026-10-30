"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { TaskBridgeLogo } from "@/components/TaskBridgeLogo";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Live Widget", href: "/#live-widget" },
    { label: "Use Cases", href: "/#use-cases" },
    { label: "Pricing", href: "/#pricing" },
  ];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-[960px] z-[100] px-4">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`flex items-center justify-between rounded-full border border-white/8 px-6 py-2.5 shadow-2xl transition-all duration-300 relative ${
          isScrolled || isOpen
            ? "bg-[#0D1117]/90 backdrop-blur-md shadow-purple-500/5" 
            : "bg-[#0D1117]/40 backdrop-blur-sm"
        }`}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-1.5 select-none shrink-0" onClick={() => setIsOpen(false)}>
          <TaskBridgeLogo size="md" />
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden sm:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-white/50 hover:text-[#F8FAFC] transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <a href="/login" className="text-[13px] font-medium text-white/50 hover:text-[#F8FAFC] transition-colors duration-200">
            Login
          </a>
          {/* CTA Button */}
          <div className="shrink-0">
            <a href="/onboard">
              <Button className="h-8.5 px-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-[12.5px] rounded-full shadow-none transition-all duration-150">
                Get Started
              </Button>
            </a>
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="sm:hidden w-8.5 h-8.5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/5 text-[#F8FAFC] transition-all"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-[calc(100%+8px)] left-0 right-0 p-5 rounded-2xl border border-white/10 bg-[#0D1117]/95 backdrop-blur-lg shadow-2xl flex flex-col gap-4 sm:hidden"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-[14px] font-medium text-white/60 hover:text-[#F8FAFC] py-2 border-b border-white/5 last:border-0 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
