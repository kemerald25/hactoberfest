"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  LayoutDashboard, MessageSquare, Sparkles, Code, CreditCard, Lock, 
  LogOut, ChevronRight, Menu, X, Check, Copy, RefreshCw, Languages, 
  Hourglass, Calendar, Phone, Mail, Globe, User, MessageCircle
} from "lucide-react";
import { 
  getBusinessDashboardData, getSessionMessages, 
  updateBusinessKbFromDashboard, changeBusinessPassword, logoutBusiness 
} from "@/app/actions/business";
import Image from "next/image";

export default function BusinessDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;

  // Sidebar / Navigation State
  const [activeTab, setActiveTab] = useState<"overview" | "chats" | "ai-config" | "integrations" | "billing" | "security">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState("");

  // Chats Tab States
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");

  // KB Form States
  const [systemPrompt, setSystemPrompt] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [kbSaving, setKbSaving] = useState(false);
  const [kbMessage, setKbMessage] = useState("");
  const [kbError, setKbError] = useState("");
  const [testerKey, setTesterKey] = useState(0); // Used to reload the iframe tester

  // Change Password Form States
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  // Copy Clipboard States
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Load Dashboard Data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getBusinessDashboardData(businessId);
      if (res.success) {
        setBusiness(res.business);
        setThreads(res.threads || []);
        setMetrics(res.metrics);
        setSystemPrompt(res.business.system_prompt || "");
        setKnowledgeBase(res.business.knowledge_base || "");
      } else {
        setError(res.error || "Failed to load dashboard data.");
        // Redirect to login if unauthorized
        if (res.error?.includes("Unauthorized")) {
          router.push(`/login?redirect=/business/${businessId}`);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching dashboard details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  // Load Specific Thread Messages
  const selectThread = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setMessagesLoading(true);
    setMessagesError("");
    try {
      const res = await getSessionMessages(businessId, sessionId);
      if (res.success) {
        setMessages(res.messages || []);
      } else {
        setMessagesError(res.error || "Failed to load messages.");
      }
    } catch (err) {
      setMessagesError("Could not retrieve thread history.");
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handle KB Update
  const handleKbSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setKbSaving(true);
    setKbMessage("");
    setKbError("");
    try {
      const res = await updateBusinessKbFromDashboard(businessId, { systemPrompt, knowledgeBase });
      if (res.success) {
        setKbMessage("Knowledge Base and AI configurations saved successfully!");
        setTesterKey(prev => prev + 1); // Reload tester iframe
      } else {
        setKbError(res.error || "Failed to save settings.");
      }
    } catch (err) {
      setKbError("An error occurred while saving.");
    } finally {
      setKbSaving(false);
    }
  };

  // Handle Password Change
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true);
    setPwSuccess("");
    setPwError("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newPass = formData.get("newPassword")?.toString();
    const confPass = formData.get("confirmPassword")?.toString();

    if (newPass !== confPass) {
      setPwError("New passwords do not match.");
      setPwSaving(false);
      return;
    }

    try {
      const res = await changeBusinessPassword(businessId, formData);
      if (res.success) {
        setPwSuccess("Password updated successfully!");
        (e.target as HTMLFormElement).reset();
      } else {
        setPwError(res.error || "Failed to update password.");
      }
    } catch (err) {
      setPwError("An error occurred while saving your password.");
    } finally {
      setPwSaving(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logoutBusiness();
    router.push("/login");
  };

  const copyToClipboard = (text: string, type: "url" | "embed") => {
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060810] flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-8 w-8 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-white/40 text-[13.5px]">Authorizing dashboard access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#060810] flex flex-col items-center justify-center p-4">
        <div className="bg-[#0D1117] border border-white/8 p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <h3 className="text-red-400 font-bold text-[18px]">Portal Error</h3>
          <p className="text-white/50 text-[13.5px] leading-relaxed">{error}</p>
          <Button onClick={() => router.push("/login")} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6">
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "chats", label: "Conversation Logs", icon: MessageSquare },
    { id: "ai-config", label: "AI Configuration", icon: Sparkles },
    { id: "integrations", label: "Integrations & Setup", icon: Code },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
    { id: "security", label: "Account Settings", icon: Lock },
  ] as const;

  return (
    <div className="min-h-screen bg-[#060810] text-[#CBD5E1] font-sans flex flex-col justify-between">
      
      {/* Dashboard Top bar */}
      <header className="bg-[#0D1117]/85 border-b border-white/5 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden text-white/70 hover:text-white p-1.5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-white tracking-tight hidden xs:block">
              Task<span className="text-[#a78bfa]">Bridge</span> <span className="text-[#a78bfa] font-light italic font-['Instrument_Serif'] text-[15px]">Biz</span>
            </span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 hidden xs:block" />
          <span className="text-[12.5px] font-semibold text-white/80 bg-white/5 border border-white/8 px-2.5 py-0.5 rounded-full">
            {business?.name}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-1.5 text-[11.5px] font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span>Assistant Online</span>
          </span>
          
          <button 
            onClick={handleLogout}
            className="text-white/40 hover:text-red-400 transition-colors flex items-center gap-1.5 text-[12.5px] font-medium border border-white/5 hover:border-red-500/20 px-3 py-1.5 rounded-lg bg-white/2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex relative">
        
        {/* Navigation Sidebar */}
        <aside className={`
          fixed inset-y-16 left-0 z-40 w-64 bg-[#0D1117]/90 border-r border-white/5 p-4 flex flex-col gap-1 transition-transform duration-200 transform sm:translate-x-0 sm:static sm:h-auto
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  active 
                    ? "bg-[#8B5CF6] text-white shadow-lg shadow-purple-500/10" 
                    : "text-white/50 hover:text-white/90 hover:bg-white/3"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            );
          })}
        </aside>

        {/* Dashboard Area */}
        <main className="flex-1 p-4 sm:p-8 min-w-0 overflow-y-auto">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[20px] font-bold text-white">Dashboard Overview</h2>
                <p className="text-[12.5px] text-white/40 mt-1">A real-time snapshot of your AI customer support assistant performance.</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#0D1117] border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
                  <div className="w-10 h-10 bg-[#8B5CF6]/10 text-[#a78bfa] rounded-lg flex items-center justify-center border border-[#8B5CF6]/20">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-white/30 font-semibold">Total Conversations</div>
                    <div className="text-[22px] font-extrabold text-white mt-0.5">{metrics?.totalChats || 0}</div>
                  </div>
                </div>

                <div className="bg-[#0D1117] border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
                  <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center border border-green-500/20">
                    <Hourglass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-white/30 font-semibold">Avg AI Response Speed</div>
                    <div className="text-[22px] font-extrabold text-white mt-0.5">{(metrics?.avgResponseTime / 1000).toFixed(2)}s</div>
                  </div>
                </div>

                <div className="bg-[#0D1117] border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/20">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-white/30 font-semibold">Total Messages Processed</div>
                    <div className="text-[22px] font-extrabold text-white mt-0.5">{metrics?.totalMessages || 0}</div>
                  </div>
                </div>
              </div>

              {/* Lower Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Channel Split */}
                <div className="bg-[#0D1117] border border-white/5 p-6 rounded-xl space-y-4">
                  <h3 className="text-[14px] font-bold text-white">Active Channels Split</h3>
                  
                  <div className="space-y-3 pt-2">
                    {["widget", "whatsapp", "standalone"].map((chan) => {
                      const count = metrics?.channelDistribution[chan] || 0;
                      const percentage = metrics?.totalMessages > 0 ? Math.round((count / metrics.totalMessages) * 100) : 0;
                      return (
                        <div key={chan} className="space-y-1">
                          <div className="flex justify-between text-[12px] font-medium">
                            <span className="capitalize text-white/60">{chan === "widget" ? "Embedded Widget" : chan === "standalone" ? "Direct Chat Webpage" : "WhatsApp Automation"}</span>
                            <span className="text-white/80">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-[#060810] h-2 rounded-full overflow-hidden">
                            <div className="bg-[#8B5CF6] h-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Languages breakdown */}
                <div className="bg-[#0D1117] border border-white/5 p-6 rounded-xl space-y-4">
                  <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                    <Languages className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Language Metrics</span>
                  </h3>
                  <p className="text-white/40 text-[12px]">TaskBridge local language translation breakdown (Yoruba, Hausa, Igbo, English).</p>
                  
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {Object.entries(metrics?.languageDistribution || {}).map(([lang, count]) => (
                      <div 
                        key={lang} 
                        className="bg-[#060810] border border-white/5 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-[12px] font-medium"
                      >
                        <span className="w-2 h-2 bg-[#8B5CF6] rounded-full" />
                        <span className="uppercase text-white/50">{lang}</span>
                        <span className="text-white font-semibold">{count as number}</span>
                      </div>
                    ))}
                    {Object.keys(metrics?.languageDistribution || {}).length === 0 && (
                      <span className="text-white/30 text-[12px] italic">No local translation statistics accumulated yet.</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. CONVERSATION LOGS TAB */}
          {activeTab === "chats" && (
            <div className="space-y-4 h-[calc(100vh-12rem)] flex flex-col">
              <div>
                <h2 className="text-[20px] font-bold text-white">Conversation Logs</h2>
                <p className="text-[12.5px] text-white/40 mt-1">Review live and historical interactions handled by your AI assistant.</p>
              </div>

              <div className="flex-1 flex gap-6 bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden min-h-0">
                {/* Threads list */}
                <div className="w-[320px] border-r border-white/5 flex flex-col shrink-0">
                  <div className="p-3 border-b border-white/5 bg-black/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/35">Available Threads ({threads.length})</span>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                    {threads.map((thread) => {
                      const active = selectedSessionId === thread.session_id;
                      return (
                        <button
                          key={thread.session_id}
                          onClick={() => selectThread(thread.session_id)}
                          className={`w-full text-left p-3.5 transition-colors text-[13px] block space-y-1 ${
                            active ? "bg-[#8B5CF6]/10 border-l-2 border-[#8B5CF6]" : "hover:bg-white/2"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-white truncate max-w-[150px]">
                              {thread.session_id.substring(0, 15)}...
                            </span>
                            <span className="text-[10px] bg-white/5 border border-white/8 px-1.5 py-0.5 rounded text-white/50 font-medium capitalize shrink-0">
                              {thread.channel}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-white/35 text-[11px]">
                            <span>{thread.message_count} messages</span>
                            <span>{new Date(thread.last_active).toLocaleDateString()}</span>
                          </div>
                        </button>
                      );
                    })}
                    {threads.length === 0 && (
                      <div className="text-center py-12 text-[12px] text-white/30 italic">No logs found.</div>
                    )}
                  </div>
                </div>

                {/* Message display panel */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#060810]/30">
                  {selectedSessionId ? (
                    <>
                      <div className="p-4 border-b border-white/5 bg-black/10 flex items-center justify-between shrink-0">
                        <span className="text-[12.5px] font-bold text-white truncate">
                          Session: <span className="font-mono text-[#a78bfa]">{selectedSessionId}</span>
                        </span>
                        <Button 
                          onClick={() => selectThread(selectedSessionId)}
                          className="w-7 h-7 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-md p-0"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="flex-1 p-6 overflow-y-auto space-y-4 min-w-0">
                        {messagesLoading ? (
                          <div className="h-full flex flex-col items-center justify-center space-y-2">
                            <svg className="animate-spin h-5 w-5 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-white/30 text-[12px]">Loading message logs...</span>
                          </div>
                        ) : messagesError ? (
                          <div className="text-red-400 text-[12.5px] text-center py-12">{messagesError}</div>
                        ) : (
                          messages.map((msg, i) => {
                            const isUser = msg.role === "user";
                            return (
                              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] rounded-xl p-3.5 text-[13px] leading-relaxed shadow-lg ${
                                  isUser 
                                    ? "bg-[#1E1B4B] border border-indigo-500/10 text-white rounded-br-none" 
                                    : "bg-[#0D1117] border border-white/8 text-[#CBD5E1] rounded-bl-none"
                                }`}>
                                  <div className="font-semibold text-[10px] text-white/40 mb-1 flex items-center justify-between gap-4">
                                    <span>{isUser ? "Customer" : "AI Assistant"}</span>
                                    <span className="text-[9.5px]">
                                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/35 text-[12.5px] italic">
                      Select a conversation thread from the left column to view the chat history logs.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. AI CONFIGURATION TAB */}
          {activeTab === "ai-config" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[20px] font-bold text-white">AI Configuration</h2>
                <p className="text-[12.5px] text-white/40 mt-1">Train and direct your AI assistant. Changes reflect instantly on your channels.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Form fields */}
                <form onSubmit={handleKbSave} className="lg:col-span-7 bg-[#0D1117] border border-white/5 p-6 rounded-xl space-y-5">
                  <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Knowledge Base & Persona Settings</span>
                  </h3>

                  {kbMessage && (
                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-green-400 text-[12.5px]">
                      {kbMessage}
                    </div>
                  )}

                  {kbError && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[12.5px]">
                      {kbError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/45">System Prompt & Persona</label>
                    <Textarea 
                      rows={6}
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="e.g. You are a friendly AI support assistant. Provide short, concise answers."
                      className="bg-[#060810]/40 border-white/8 text-white rounded-lg text-[13px] leading-relaxed placeholder:text-white/10"
                    />
                    <span className="text-[11px] text-white/30 block">Defines the attitude, rules, response style, and identity of the bot.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/45">Knowledge Base Info</label>
                    <Textarea 
                      rows={12}
                      value={knowledgeBase}
                      onChange={(e) => setKnowledgeBase(e.target.value)}
                      placeholder="Insert FAQs, pricing, product lines, return policies, contacts..."
                      className="bg-[#060810]/40 border-white/8 text-white rounded-lg text-[13px] leading-relaxed placeholder:text-white/10"
                    />
                    <span className="text-[11px] text-white/30 block">Paste raw text information about your company. The AI queries this information to answer customers.</span>
                  </div>

                  <Button
                    type="submit"
                    disabled={kbSaving}
                    className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#8B5CF6]/50 text-white font-semibold text-[13px] h-11 rounded-lg shadow-none"
                  >
                    {kbSaving ? "Saving Knowledge Base..." : "Save AI Configuration"}
                  </Button>
                </form>

                {/* Live Tester side panel */}
                <div className="lg:col-span-5 bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden space-y-4">
                  <div className="p-4 border-b border-white/5 bg-black/10 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-white">Live Tester Panel</span>
                    <Button 
                      onClick={() => setTesterKey(prev => prev + 1)}
                      className="w-7 h-7 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-md p-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  
                  <div className="px-4 pb-4">
                    <p className="text-white/40 text-[11.5px] leading-relaxed mb-4">
                      Test your chatbot in real time below. This loads your live embed widget. Save your changes to see them work here!
                    </p>
                    
                    {/* Embedded iframe widget for instant testing */}
                    <div className="border border-white/8 rounded-xl overflow-hidden bg-[#060810] h-[460px] relative">
                      <iframe 
                        key={testerKey}
                        src={`/widget/${businessId}`} 
                        className="w-full h-full border-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 4. INTEGRATIONS TAB */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[20px] font-bold text-white">Integrations & Setup</h2>
                <p className="text-[12.5px] text-white/40 mt-1">Connect your AI assistant to your website, social links, or WhatsApp channels.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Web Integration Card */}
                <div className="bg-[#0D1117] border border-white/5 p-6 rounded-xl space-y-5">
                  <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Website & Custom Widgets</span>
                  </h3>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-white/40 uppercase">Direct Customer Chat Link</span>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={`https://www.taskbridge.ai/c/${businessId}`}
                          className="bg-[#060810]/40 border-white/8 text-white h-10 text-[12.5px]"
                        />
                        <Button
                          onClick={() => copyToClipboard(`https://www.taskbridge.ai/c/${businessId}`, "url")}
                          className="h-10 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg flex items-center gap-1.5 shadow-none shrink-0"
                        >
                          {copiedUrl ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[12px]">{copiedUrl ? "Copied" : "Copy"}</span>
                        </Button>
                      </div>
                      <span className="text-[11px] text-white/25 block">Share this direct chat link on your Instagram Bio, Twitter, or Linktree.</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-white/40 uppercase">Iframe Embed Code Snippet</span>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={`<iframe src="https://www.taskbridge.ai/widget/${businessId}" width="100%" height="600px" style="border:none;border-radius:12px;"></iframe>`}
                          className="bg-[#060810]/40 border-white/8 text-white h-10 text-[12.5px]"
                        />
                        <Button
                          onClick={() => copyToClipboard(`<iframe src="https://www.taskbridge.ai/widget/${businessId}" width="100%" height="600px" style="border:none;border-radius:12px;"></iframe>`, "embed")}
                          className="h-10 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg flex items-center gap-1.5 shadow-none shrink-0"
                        >
                          {copiedEmbed ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[12px]">{copiedEmbed ? "Copied" : "Copy"}</span>
                        </Button>
                      </div>
                      <span className="text-[11px] text-white/25 block">Paste this HTML iframe tag into your website editor to show the chatbot inside any page.</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Integration Card */}
                <div className="bg-[#0D1117] border border-white/5 p-6 rounded-xl space-y-4">
                  <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#8B5CF6]" />
                    <span>WhatsApp Business Automation</span>
                  </h3>
                  
                  <div className="bg-[#060810]/40 border border-white/5 p-4 rounded-lg space-y-3 pt-2 text-[12.5px] leading-relaxed">
                    <div className="font-semibold text-white">Your WhatsApp configuration status:</div>
                    <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-2.5 rounded-md text-[12px]">
                      <span>WhatsApp Number:</span>
                      <span className="font-mono text-white">{business?.phone || "Not configured"}</span>
                    </div>
                    
                    <p className="text-white/50 text-[11.5px]">
                      To link your TaskBridge AI assistant directly to your WhatsApp Business number, you must connect it to our WhatsApp bridge.
                    </p>
                    
                    <div className="space-y-2 pt-1.5">
                      <div className="flex gap-2">
                        <span className="text-[#8B5CF6] font-bold">1.</span>
                        <p className="text-white/70 text-[12px]">Verify the registered WhatsApp number above matches your Business number.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#8B5CF6] font-bold">2.</span>
                        <p className="text-white/70 text-[12px]">Configure your webhook URL in your Meta Developer portal to route messages to our API handler.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#8B5CF6] font-bold">3.</span>
                        <p className="text-white/70 text-[12px]">Reach out to <a href="mailto:support@taskbridge.ai" className="text-[#a78bfa] underline">support@taskbridge.ai</a> to finish setting up authentication access tokens.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 5. BILLING & PLANS TAB */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[20px] font-bold text-white">Billing & Subscription</h2>
                <p className="text-[12.5px] text-white/40 mt-1">Review subscription plans, balance reminders, installments, and billing details.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Plan status */}
                <div className="bg-[#0D1117] border border-white/5 p-6 rounded-xl space-y-4 lg:col-span-2">
                  <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Plan Breakdown</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-[#060810]/40 border border-white/5 p-4 rounded-lg space-y-1">
                      <span className="text-[11px] font-semibold text-white/40 uppercase">Active Package</span>
                      <div className="text-[16px] font-bold text-white capitalize">{business?.payment_plan || "Trial Mode"}</div>
                    </div>

                    <div className="bg-[#060810]/40 border border-white/5 p-4 rounded-lg space-y-1">
                      <span className="text-[11px] font-semibold text-white/40 uppercase">Renewal Date</span>
                      <div className="text-[16px] font-bold text-white flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-white/40" />
                        <span>{business?.renewal_date ? new Date(business.renewal_date).toLocaleDateString() : "End of Trial"}</span>
                      </div>
                    </div>

                    <div className="bg-[#060810]/40 border border-white/5 p-4 rounded-lg space-y-1">
                      <span className="text-[11px] font-semibold text-white/40 uppercase">Installments Cleared</span>
                      <div className="text-[16px] font-bold text-white">{business?.installments_paid || 0} installments paid</div>
                    </div>

                    <div className="bg-[#060810]/40 border border-white/5 p-4 rounded-lg space-y-1">
                      <span className="text-[11px] font-semibold text-white/40 uppercase">Signup Source</span>
                      <div className="text-[16px] font-bold text-white flex items-center gap-1.5 capitalize">
                        <User className="w-4 h-4 text-white/40" />
                        <span>{business?.signup_source || "Direct"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact support billing */}
                <div className="bg-[#0D1117] border border-white/5 p-6 rounded-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-[14px] font-bold text-white">Need Billing Assistance?</h3>
                    <p className="text-white/45 text-[12px] leading-relaxed">
                      If you need to make payment balances, settle installments, upgrade your plan, or query a billing charge, contact our support team.
                    </p>
                  </div>

                  <a 
                    href="mailto:support@taskbridge.ai?subject=Billing%20Support%20Request"
                    className="w-full text-center py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-[12.5px] rounded-lg mt-4 block"
                  >
                    Contact Billing Support
                  </a>
                </div>

              </div>
            </div>
          )}

          {/* 6. ACCOUNT SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[20px] font-bold text-white">Account Security Settings</h2>
                <p className="text-[12.5px] text-white/40 mt-1">Configure your login passwords to prevent unauthorized access to your records.</p>
              </div>

              <div className="max-w-md bg-[#0D1117] border border-white/5 p-6 rounded-xl space-y-5">
                <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Change Password</span>
                </h3>

                {pwSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-green-400 text-[12.5px]">
                    {pwSuccess}
                  </div>
                )}

                {pwError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[12.5px]">
                    {pwError}
                  </div>
                )}

                <form onSubmit={handlePasswordSave} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Current Password</label>
                    <Input 
                      type="password"
                      name="currentPassword"
                      required
                      placeholder="••••••••"
                      className="bg-[#060810]/40 border-white/8 text-white h-10 text-[13px] rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">New Password</label>
                    <Input 
                      type="password"
                      name="newPassword"
                      required
                      placeholder="••••••••"
                      className="bg-[#060810]/40 border-white/8 text-white h-10 text-[13px] rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Confirm New Password</label>
                    <Input 
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="••••••••"
                      className="bg-[#060810]/40 border-white/8 text-white h-10 text-[13px] rounded-lg"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={pwSaving}
                    className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#8B5CF6]/50 text-white font-semibold text-[13px] h-10 rounded-lg shadow-none"
                  >
                    {pwSaving ? "Saving Password..." : "Update Password"}
                  </Button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      <Footer showNewsletter={false} />
    </div>
  );
}
