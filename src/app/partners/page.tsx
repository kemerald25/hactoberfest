"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Users, 
  DollarSign, 
  Award, 
  ArrowRight, 
  Lock, 
  Unlock,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Layers,
  GraduationCap
} from "lucide-react";
import { 
  registerPartner, 
  loginPartner, 
  logoutPartner, 
  getPartnerDashboardData 
} from "@/app/actions/partners";
import { useAlert } from "@/components/AlertProvider";

// Types
interface Partner {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  university: string;
  faculty: string;
  department: string;
  referral_code: string;
  created_at: string;
  is_ambassador?: boolean;
}

interface Referral {
  id: string;
  business_name: string;
  email: string;
  status: string;
  created_at: string;
}

interface Metrics {
  totalReferrals: number;
  payingReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  currentTier: string;
  tierNumber: number;
  nextTier: string;
  referralsNeededForNext: number;
}

export default function PartnersPage() {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<"info" | "auth" | "dashboard">("info");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  
  // Dashboard & Auth states
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  
  // Form error/success states
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simulator state
  const [simReferrals, setSimReferrals] = useState(3);

  // Check login on load
  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true);
      const res = await getPartnerDashboardData();
      if (res.success && res.partner && res.metrics) {
        setPartner(res.partner);
        setReferrals(res.referrals || []);
        setMetrics(res.metrics);
        setActiveTab("dashboard");
      } else {
        setPartner(null);
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const handleCopyLink = () => {
    if (!partner) return;
    const link = `${window.location.origin}/onboard?ref=${partner.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError("");
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await registerPartner(formData);
    
    if (res.success && res.partner) {
      // Refresh dashboard data
      const dataRes = await getPartnerDashboardData();
      if (dataRes.success && dataRes.partner && dataRes.metrics) {
        setPartner(dataRes.partner);
        setReferrals(dataRes.referrals || []);
        setMetrics(dataRes.metrics);
      }
      setActiveTab("dashboard");
    } else {
      setFormError(res.error || "An error occurred during registration.");
    }
    setIsSubmitting(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError("");
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await loginPartner(formData);
    
    if (res.success && res.partner) {
      const dataRes = await getPartnerDashboardData();
      if (dataRes.success && dataRes.partner && dataRes.metrics) {
        setPartner(dataRes.partner);
        setReferrals(dataRes.referrals || []);
        setMetrics(dataRes.metrics);
      }
      setActiveTab("dashboard");
    } else {
      setFormError(res.error || "Invalid email or password.");
    }
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await logoutPartner();
    setPartner(null);
    setReferrals([]);
    setMetrics(null);
    setActiveTab("info");
    setAuthMode("login");
    setIsLoading(false);
  };

  // Commission math for simulator
  const getSimCommission = (count: number) => {
    let cash = 0;
    let perks = [];
    const isAmb = partner?.is_ambassador || false;
    for (let i = 1; i <= count; i++) {
      if (i >= 10) cash += 2500;
      else if (i >= 5) cash += 2000;
      else cash += isAmb ? 2000 : 1500;
    }
    if (count >= 1) perks.push(`Tier 1: ₦${isAmb ? "2,000" : "1,500"} cash per business`);
    if (count >= 3) perks.push("Tier 2: 1 Free TaskBridge setup");
    if (count >= 5) perks.push("Tier 3: Campus Partner status (₦2,000 commission, Letter, Priority Opportunities)");
    if (count >= 10) perks.push("Tier 4: Senior Campus Partner (₦2,500 commission, Featured post, Faculty lead)");
    
    return { cash, perks };
  };

  const simData = getSimCommission(simReferrals);

  return (
    <main className="relative min-h-screen bg-[#060810] bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] overflow-x-hidden pt-[110px] pb-16">
      <Navbar />

      <div className="absolute top-[260px] left-1/2 -translate-x-1/2 w-[300px] sm:w-[900px] h-[300px] sm:h-[550px] bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,transparent_60%)] pointer-events-none z-0" />

      <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 relative z-10 pb-20 sm:pb-32">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-[#0D1117] border border-white/5 p-1 rounded-full flex items-center gap-0.5 sm:gap-1 max-w-full">
            <button 
              onClick={() => setActiveTab("info")}
              className={`px-2.5 sm:px-5 py-1 sm:py-2 rounded-full text-[11px] sm:text-[13px] font-medium transition-all ${
                activeTab === "info" 
                  ? "bg-[#8B5CF6] text-white" 
                  : "text-white/50 hover:text-white"
              }`}
            >
              Partner Program
            </button>
            <button 
              onClick={() => {
                if (partner) {
                  setActiveTab("dashboard");
                } else {
                  setActiveTab("auth");
                }
              }}
              className={`px-2.5 sm:px-5 py-1 sm:py-2 rounded-full text-[11px] sm:text-[13px] font-medium transition-all ${
                activeTab === "auth" || activeTab === "dashboard"
                  ? "bg-[#8B5CF6] text-white" 
                  : "text-white/50 hover:text-white"
              }`}
            >
              {partner ? "Dashboard" : "Join / Login"}
            </button>
          </div>
        </div>

        {/* Tab 1: Info & Simulator */}
        {activeTab === "info" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 text-[#a78bfa] text-[11px] font-semibold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-[#8B5CF6] animate-pulse" />
                TaskBridge Partner Program
              </span>
              <h1 className="text-[32px] sm:text-[54px] font-bold tracking-tight text-white leading-tight">
                Earn cash, gain status, and <br />
                <span className="font-['Instrument_Serif'] italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#C084FC] to-[#8B5CF6]">
                  level up your career.
                </span>
              </h1>
              <p className="text-white/50 text-[16px] sm:text-[17px] leading-relaxed">
                Empower businesses on your campus or in your city with 24/7 AI-powered support. Build your portfolio as a TaskBridge Partner and unlock tiered bonuses and leadership opportunities.
              </p>
              <div className="pt-2">
                <Button 
                  onClick={() => {
                    if (partner) setActiveTab("dashboard");
                    else {
                      setAuthMode("register");
                      setActiveTab("auth");
                    }
                  }}
                  className="h-11 px-8 bg-white hover:bg-white/95 text-black font-semibold text-[14px] rounded-full shadow-lg"
                >
                  {partner ? "Go to Dashboard" : "Apply as Partner Now"}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>

            {/* Interactive Simulator Section */}
            <div className="bg-[#0D1117]/80 border border-white/8 rounded-2xl p-4 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-[400px] h-[250px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_60%)] pointer-events-none" />
              
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side: Controls */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a78bfa] block">
                      Earnings Estimator
                    </span>
                    <h2 className="text-[26px] font-bold text-white tracking-tight">
                      See how much you can unlock
                    </h2>
                    <p className="text-white/45 text-[13.5px]">
                      Move the slider to simulate referring paying businesses to TaskBridge and watch your tier and cash commission grow.
                    </p>
                  </div>

                  <div className="bg-[#060810]/60 p-4 sm:p-6 rounded-xl border border-white/5 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[14px] font-medium">
                      <span className="text-white/60">Number of Paying Referrals</span>
                      <span className="text-[#8B5CF6] font-bold text-[18px]">{simReferrals} {simReferrals === 1 ? 'business' : 'businesses'}</span>
                    </div>

                    <input 
                      type="range" 
                      min="1" 
                      max="15" 
                      value={simReferrals} 
                      onChange={(e) => setSimReferrals(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                    />

                    <div className="flex justify-between text-[10px] text-white/35 font-mono">
                      <span>1 ref</span>
                      <span>5 refs</span>
                      <span>10 refs</span>
                      <span>15 refs</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] text-white/30 uppercase font-mono tracking-wider">Unlocked benefits at this level:</p>
                    <div className="space-y-1.5">
                      {simData.perks.map((perk, i) => (
                        <div key={i} className="flex items-center gap-2 text-[12.5px] text-white/70">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Visual Projection */}
                <div className="bg-[#060810]/70 border border-white/5 p-4 sm:p-8 rounded-2xl flex flex-col justify-between items-center text-center h-full relative overflow-hidden">
                  <div className="absolute top-4 left-4">
                    <TrendingUp className="w-5 h-5 text-[#8B5CF6]/60" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[12px] font-semibold tracking-widest uppercase text-white/35">
                      Estimated Earnings
                    </span>
                    <h3 className="text-[36px] sm:text-[56px] font-black text-white tracking-tight leading-none">
                      ₦{simData.cash.toLocaleString()}
                    </h3>
                    <p className="text-white/40 text-[12px] font-mono">
                      Calculated using tiered commission matrix
                    </p>
                  </div>

                  <div className="w-full border-t border-white/5 my-6" />

                  <div className="space-y-3 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-left sm:text-right text-[12.5px]">
                      <span className="text-white/45">Partner Status Level</span>
                      <Badge className="bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/20 text-[#a78bfa] border-none px-3 py-1 font-semibold rounded-full w-fit">
                        {simReferrals >= 10 ? "Senior Partner" : simReferrals >= 5 ? "Campus Partner" : simReferrals >= 3 ? "Tier 2 Setup" : "Standard Partner"}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-left sm:text-right text-[12.5px]">
                      <span className="text-white/45">TaskBridge Setup Commission</span>
                      <span className="text-white/80 font-bold">{simReferrals >= 3 ? "1 FREE setup unlocked" : "Locked"}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-left sm:text-right text-[12.5px]">
                      <span className="text-white/45">Official Recognition Letter</span>
                      <span className="text-white/80">{simReferrals >= 5 ? "Yes (Priority Consideration)" : "No"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tiers List Grid */}
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#a78bfa]">Progression</span>
                <h2 className="text-[28px] font-bold text-white tracking-tight">Four tiers of scaling rewards</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    tier: "Tier 1",
                    title: "Referral Reward",
                    requirement: "Refer 1 paying business",
                    payout: partner?.is_ambassador ? "₦2,000 payout" : "₦1,500 payout",
                    desc: "Immediate cash incentive to get you up and running.",
                    accent: "from-blue-500/10 to-indigo-500/10",
                  },
                  {
                    tier: "Tier 2",
                    title: "Free Setup Reward",
                    requirement: "Refer 3 paying businesses",
                    payout: "1 Free TaskBridge setup",
                    desc: "Perfect for personal portfolios, side hustles, or client sites.",
                    accent: "from-indigo-500/10 to-purple-500/10",
                  },
                  {
                    tier: "Tier 3",
                    title: "Campus Partner",
                    requirement: "Refer 5 paying businesses",
                    payout: "₦2,000 commission/sale",
                    desc: "Official TaskBridge Certificate, priority consideration for internship/roles.",
                    accent: "from-purple-500/10 to-pink-500/10",
                  },
                  {
                    tier: "Tier 4",
                    title: "Senior Partner",
                    requirement: "Refer 10 paying businesses",
                    payout: "₦2,500 commission/sale",
                    desc: "Featured on social media, lead roles in your faculty, and partner resources.",
                    accent: "from-pink-500/10 to-rose-500/10",
                  },
                ].map((t, idx) => (
                  <div 
                    key={idx} 
                    className={`bg-gradient-to-br ${t.accent} border border-white/5 hover:border-[#8B5CF6]/30 p-6 rounded-2xl space-y-4 transition-all duration-300 flex flex-col justify-between`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-[#a78bfa] tracking-wider font-mono">{t.tier}</span>
                        <Badge variant="outline" className="border-white/10 text-white/50 text-[9px] font-mono">{t.requirement}</Badge>
                      </div>
                      <h4 className="text-[18px] font-bold text-white tracking-tight">{t.title}</h4>
                      <p className="text-white/40 text-[12.5px] leading-relaxed">{t.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[13px] font-bold text-white">{t.payout}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Authentication (Login / Register) */}
        {activeTab === "auth" && !partner && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[480px] mx-auto"
          >
            <div className="bg-[#0D1117] border border-white/8 p-4 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-[200px] h-[150px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_60%)] pointer-events-none" />
              
              {/* Header Toggle */}
              <div className="flex justify-center border-b border-white/5 pb-6 mb-6">
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setAuthMode("register");
                      setFormError("");
                    }}
                    className={`text-[15px] font-bold transition-colors ${authMode === "register" ? "text-white" : "text-white/40 hover:text-white/60"}`}
                  >
                    Register
                  </button>
                  <button 
                    onClick={() => {
                      setAuthMode("login");
                      setFormError("");
                    }}
                    className={`text-[15px] font-bold transition-colors ${authMode === "login" ? "text-white" : "text-white/40 hover:text-white/60"}`}
                  >
                    Portal Login
                  </button>
                </div>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[12.5px] mb-4">
                  {formError}
                </div>
              )}

              {authMode === "register" ? (
                // REGISTER FORM
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Full Name</label>
                    <Input name="name" required placeholder="Alexander Cole" className="bg-[#060810]/40 border-white/8 text-white h-10 rounded-lg placeholder:text-white/20" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Email Address</label>
                      <Input name="email" type="email" required placeholder="alex@unilag.edu" className="bg-[#060810]/40 border-white/8 text-white h-10 rounded-lg placeholder:text-white/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">WhatsApp Number</label>
                      <Input name="whatsapp" required placeholder="+234 80 123 4567" className="bg-[#060810]/40 border-white/8 text-white h-10 rounded-lg placeholder:text-white/20" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Create Password</label>
                    <Input name="password" type="password" required placeholder="••••••" className="bg-[#060810]/40 border-white/8 text-white h-10 rounded-lg placeholder:text-white/20" />
                  </div>

                   <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">University / Institution</label>
                    <Input name="university" required placeholder="University of Lagos" className="bg-[#060810]/40 border-white/8 text-white h-10 rounded-lg placeholder:text-white/20" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Faculty</label>
                      <Input name="faculty" required placeholder="Science" className="bg-[#060810]/40 border-white/8 text-white h-10 rounded-lg placeholder:text-white/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Department</label>
                      <Input name="department" required placeholder="Computer Science" className="bg-[#060810]/40 border-white/8 text-white h-10 rounded-lg placeholder:text-white/20" />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-10.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-[13.5px] rounded-lg mt-4 shadow-none">
                    {isSubmitting ? "Submitting application..." : "Apply & Create Account"}
                  </Button>
                </form>
              ) : (
                // LOGIN FORM
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Registered Email</label>
                    <Input name="email" type="email" required placeholder="alex@unilag.edu" className="bg-[#060810]/40 border-white/8 text-white h-10 rounded-lg placeholder:text-white/20" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Password</label>
                    <Input name="password" type="password" required placeholder="••••••" className="bg-[#060810]/40 border-white/8 text-white h-10 rounded-lg placeholder:text-white/20" />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-10.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-[13.5px] rounded-lg mt-4 shadow-none">
                    {isSubmitting ? "Verifying..." : "Enter Workspace"}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Partner Dashboard */}
        {activeTab === "dashboard" && partner && metrics && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full min-w-0"
          >
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[12px] text-white/40 font-mono">PARTNER WORKSPACE</p>
                  {partner.is_ambassador && (
                    <span className="text-[9px] font-bold tracking-wider uppercase bg-purple-500/10 border border-purple-500/30 text-[#c084fc] px-2 py-0.5 rounded-full">
                      Ambassador
                    </span>
                  )}
                </div>
                <h1 className="text-[22px] sm:text-[26px] font-bold text-white tracking-tight break-words mt-1">Welcome back, {partner.name}!</h1>
                {partner.university && (
                  <p className="text-[12.5px] text-white/50 flex flex-wrap items-center gap-1.5 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                    <span>{partner.university} • {partner.faculty} ({partner.department})</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="h-9 border-white/10 hover:bg-white/5 text-white/70 hover:text-white font-medium text-[12.5px] rounded-lg"
                >
                  Log out
                </Button>
              </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Earnings */}
              <div className="bg-[#0D1117] border border-white/5 p-4 sm:p-6 rounded-2xl flex items-center gap-3 sm:gap-4 relative overflow-hidden">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl flex items-center justify-center text-[#22C55E] shrink-0">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] sm:text-[10px] text-white/35 uppercase tracking-wider block">Total Earnings</span>
                  <h4 className="text-[20px] sm:text-[24px] font-bold text-white leading-none mt-1 truncate">₦{metrics.totalEarnings.toLocaleString()}</h4>
                  <p className="text-[10px] sm:text-[10.5px] text-white/40 mt-1 font-mono">Paid directly monthly</p>
                </div>
                <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[radial-gradient(circle,rgba(34,197,94,0.04)_0%,transparent_60%)] pointer-events-none" />
              </div>

              {/* Referrals Count */}
              <div className="bg-[#0D1117] border border-white/5 p-4 sm:p-6 rounded-2xl flex items-center gap-3 sm:gap-4 relative overflow-hidden">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl flex items-center justify-center text-[#8B5CF6] shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] sm:text-[10px] text-white/35 uppercase tracking-wider block">Paying / Total Leads</span>
                  <h4 className="text-[20px] sm:text-[24px] font-bold text-white leading-none mt-1">{metrics.payingReferrals} <span className="text-white/40 text-[12px] sm:text-[14px]">/ {metrics.totalReferrals}</span></h4>
                  <p className="text-[10px] sm:text-[10.5px] text-white/40 mt-1">{metrics.pendingReferrals} lead{metrics.pendingReferrals === 1 ? '' : 's'} pending trial</p>
                </div>
                <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[radial-gradient(circle,rgba(139,92,246,0.04)_0%,transparent_60%)] pointer-events-none" />
              </div>

              {/* Current Status Badge */}
              <div className="bg-[#0D1117] border border-white/5 p-4 sm:p-6 rounded-2xl flex items-center gap-3 sm:gap-4 relative overflow-hidden">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] sm:text-[10px] text-white/35 uppercase tracking-wider block">Partner Level</span>
                  <h4 className="text-[18px] sm:text-[20px] font-bold text-white leading-none mt-1.5 truncate">{metrics.tierNumber >= 3 ? "Campus Partner" : metrics.tierNumber >= 1 ? "Standard Partner" : "Inactive"}</h4>
                  <p className="text-[10px] sm:text-[10.5px] text-white/40 mt-1 truncate">{metrics.currentTier}</p>
                </div>
                <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[radial-gradient(circle,rgba(245,158,11,0.04)_0%,transparent_60%)] pointer-events-none" />
              </div>
            </div>

            {/* Dashboard main layout grid */}
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
              
              {/* Left Column (2 parts): Referral link + progress */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0 w-full">
                
                {/* Link Box */}
                <div className="bg-[#0D1117] border border-white/5 p-4 sm:p-6 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-white">Your Unique Referral Link</h3>
                    <p className="text-white/45 text-[12.5px] mt-0.5">Send this link to business owners. When they sign up or submit an inquiry, they will be attributed to you.</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="w-full min-w-0 overflow-hidden bg-[#060810] border border-white/5 px-3 py-2.5 rounded-lg text-white/70 text-[12px] font-mono select-all truncate">
                      {typeof window !== 'undefined' ? `${window.location.origin}/onboard?ref=${partner.referral_code}` : `https://www.taskbridge.ai/onboard?ref=${partner.referral_code}`}
                    </div>
                    <Button 
                      onClick={handleCopyLink}
                      className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] h-10 px-4 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-none"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? "Copied!" : "Copy Link"}</span>
                    </Button>
                  </div>
                </div>

                {/* Progress Card */}
                {metrics.nextTier && (
                  <div className="bg-[#0D1117] border border-white/5 p-4 sm:p-6 rounded-2xl space-y-4 w-full min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <h3 className="text-[15px] font-bold text-white">Road to Next Level</h3>
                        <p className="text-white/45 text-[12.5px] mt-0.5">Unlock {metrics.nextTier} perks</p>
                      </div>
                      <span className="text-[12px] font-bold font-mono text-[#a78bfa]">
                        {metrics.payingReferrals} / {metrics.tierNumber === 0 ? 1 : metrics.tierNumber === 1 ? 3 : metrics.tierNumber === 2 ? 5 : 10} referrals
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Progress 
                        value={
                          metrics.tierNumber === 0 
                            ? (metrics.payingReferrals / 1) * 100 
                            : metrics.tierNumber === 1 
                              ? (metrics.payingReferrals / 3) * 100 
                              : metrics.tierNumber === 2 
                                ? (metrics.payingReferrals / 5) * 100 
                                : (metrics.payingReferrals / 10) * 100
                        } 
                        className="bg-white/5 h-2 rounded-full"
                      />
                      <p className="text-white/50 text-[12px] leading-relaxed flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        <span>Refer <strong>{metrics.referralsNeededForNext}</strong> more paying business{metrics.referralsNeededForNext === 1 ? '' : 'es'} to unlock the next level!</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Referrals table */}
                <div className="bg-[#0D1117] border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-white/5">
                    <h3 className="text-[15px] font-bold text-white">Attributed Businesses</h3>
                    <p className="text-white/45 text-[12.5px] mt-0.5">Businesses that joined using your referral link</p>
                  </div>
                  
                  {referrals.length === 0 ? (
                    <div className="p-10 text-center space-y-2">
                      <p className="text-white/30 text-[13.5px]">No referrals tracked yet.</p>
                      <p className="text-[#a78bfa] text-[12px]">Share your link to get your first referral!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px] text-left border-collapse text-[12.5px]">
                        <thead>
                          <tr className="bg-white/2 border-b border-white/5 text-white/40 font-mono font-medium">
                            <th className="py-3 px-5">Business Name</th>
                            <th className="py-3 px-5">Contact</th>
                            <th className="py-3 px-5">Status</th>
                            <th className="py-3 px-5 text-right">Referral Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white/70">
                          {referrals.map((ref) => (
                            <tr key={ref.id} className="hover:bg-white/1 transition-all">
                              <td className="py-3.5 px-5 font-medium text-white">{ref.business_name}</td>
                              <td className="py-3.5 px-5">{ref.email}</td>
                              <td className="py-3.5 px-5">
                                <Badge className={`border-none px-2 py-0.5 rounded text-[10px] ${
                                  ref.status === "paying" 
                                    ? "bg-green-500/10 text-green-400" 
                                    : "bg-amber-500/10 text-amber-400"
                                }`}>
                                  {ref.status === "paying" ? "Paying / Active" : "Pending Trial"}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-5 text-right text-white/45">{new Date(ref.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Perks and Resources Workspace */}
              <div className="space-y-4 sm:space-y-6 min-w-0 w-full">
                
                {/* Perks Status Check */}
                <div className="bg-[#0D1117] border border-white/5 p-4 sm:p-6 rounded-2xl space-y-4">
                  <h3 className="text-[15px] font-bold text-white">Partner Program Perks</h3>
                  <p className="text-white/45 text-[12.5px]">Unlock higher-value rewards by introducing more businesses to TaskBridge.</p>
                  
                  <div className="space-y-3.5 pt-2">
                    {[
                      { tier: 1, label: partner?.is_ambassador ? "₦2,000 Cash Payout" : "₦1,500 Cash Payout", desc: "Per paying referral" },
                      { tier: 2, label: "1 Free TaskBridge Setup", desc: "For your site or portfolio" },
                      { tier: 3, label: "Official Campus Partner Status", desc: "₦2,000 commission, cert, and letter" },
                      { tier: 4, label: "Senior Campus Partner Status", desc: "₦2,500 commission, socials feature" }
                    ].map((p, i) => {
                      const isUnlocked = metrics.tierNumber >= p.tier;
                      return (
                        <div 
                          key={i} 
                          className={`flex items-start gap-3 transition-opacity duration-300 ${
                            isUnlocked ? "opacity-100" : "opacity-45"
                          }`}
                        >
                          <div className={`mt-0.5 p-1 rounded ${
                            isUnlocked ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-white/5 text-white/35 border border-white/10"
                          }`}>
                            {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-white leading-snug">{p.label}</p>
                            <p className="text-[11px] text-white/40">{p.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resource Downloads */}
                <div className="bg-[#0D1117] border border-white/5 p-4 sm:p-6 rounded-2xl space-y-4">
                  <h3 className="text-[15px] font-bold text-white">Partner Resources</h3>
                  <p className="text-white/45 text-[12.5px]">Marketing collateral to help you pitches and refer clients.</p>
                  
                  <div className="space-y-2">
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); showAlert("Resource Link", "collateral download placeholder", "info"); }}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#060810]/60 border border-white/5 hover:border-[#8B5CF6]/30 text-white/70 hover:text-white transition-all text-[12.5px]"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#8B5CF6]" />
                        <span>TaskBridge Sales Deck</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </a>

                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); showAlert("Resource Link", "flyer download placeholder", "info"); }}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#060810]/60 border border-white/5 hover:border-[#8B5CF6]/30 text-white/70 hover:text-white transition-all text-[12.5px]"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#8B5CF6]" />
                        <span>Social Media Graphics Kit</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </a>

                    {/* Locked Official Documents (Needs Tier 3+) */}
                    <div 
                      className={`flex items-center justify-between p-3 rounded-xl border border-dashed text-[12.5px] select-none ${
                        metrics.tierNumber >= 3 
                          ? "bg-[#060810]/60 border-white/5 cursor-pointer hover:border-[#8B5CF6]/30 text-white/70 hover:text-white" 
                          : "bg-white/1 border-white/5 text-white/20"
                      }`}
                      onClick={() => {
                        if (metrics.tierNumber < 3) {
                          showAlert("Access Denied", "Unlock this resource by reaching Campus Partner status (5 paying referrals).", "error");
                        } else {
                          showAlert("Certificate Request", "Official Partner Certificate Letter generation.", "success");
                        }
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <Award className={`w-4 h-4 ${metrics.tierNumber >= 3 ? "text-[#8B5CF6]" : "text-white/15"}`} />
                        <span>Partner Certificate PDF</span>
                      </span>
                      {metrics.tierNumber >= 3 ? <ChevronRight className="w-4 h-4 text-white/20" /> : <Lock className="w-3.5 h-3.5 text-white/15" />}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        )}

      </div>
      <Footer />
    </main>
  );
}
