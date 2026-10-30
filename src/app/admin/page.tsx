"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  checkAdminSession, 
  getAdminDashboardData, 
  logoutAdmin, 
  toggleReferralStatus, 
  addManualTransaction, 
  createAnnouncement, 
  createBusiness,
  updateBusiness, 
  updateBusinessSetupStatus,
  deletePartner, 
  deleteBusiness, 
  deleteLead, 
  deleteWhatsAppSession, 
  deleteTransaction, 
  clearAllErrorLogs,
  getVercelLogs,
  sendNewsletterBroadcast,
  deleteNewsletterSubscriber,
  togglePartnerAmbassadorStatus,
  sendPersonalizedAmbassadorEmail,
  importMarketingLeads,
  generateAiMarketingOutreach,
  sendColdOutboundEmails,
  deleteMarketingLead,
  clearAllMarketingLeads,
  resetMarketingLeadPitch
} from "@/app/actions/admin";
import { 
  getBlogPosts, 
  saveBlogPost, 
  deleteBlogPost, 
  getPendingAgentDrafts, 
  updatePostStatus, 
  getAgentSettings, 
  setAgentSettings,
  getDraftPreviewUrl,
  broadcastPublishedPostToTelegram,
  broadcastPublishedPostToLinkedIn,
  sendTelegramGroupTestMessage,
  testLinkedInPageConnection
} from "@/app/actions/blog";
import { siteConfig } from "@/lib/site-config";
import { supabase } from "@/lib/supabase";
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  DollarSign, 
  Search, 
  Trash2, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Megaphone, 
  Shield, 
  ChevronRight, 
  TrendingUp, 
  LogOut, 
  Activity, 
  AlertTriangle,
  FileText,
  Terminal,
  Menu,
  Mail,
  Send,
  Sparkles,
  Check,
  Play,
  Pause,
  ExternalLink,
  RefreshCw,
  Share2
} from "lucide-react";
import { useAlert } from "@/components/AlertProvider";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("analytics");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();

  // Search & Filter States
  const [partnerSearch, setPartnerSearch] = useState("");
  const [businessSearch, setBusinessSearch] = useState("");
  const [leadSearch, setLeadSearch] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  // Modals & Drawers States
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [selectedPartnerReferrals, setSelectedPartnerReferrals] = useState<any>(null);
  const [selectedChatHistory, setSelectedChatHistory] = useState<any>(null);
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Newsletter States
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterBody, setNewsletterBody] = useState("");
  const [customRecipients, setCustomRecipients] = useState("");
  const [newsletterTarget, setNewsletterTarget] = useState<"both" | "subscribers" | "manual">("both");
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);

  // Marketing Leads & Outreach States
  const [marketingSearch, setMarketingSearch] = useState("");
  const [marketingDirectory, setMarketingDirectory] = useState<"pending" | "drafted" | "sent">("pending");
  const [marketingPage, setMarketingPage] = useState(1);
  const [selectedMarketingLeads, setSelectedMarketingLeads] = useState<string[]>([]);
  const [isScrapingLeads, setIsScrapingLeads] = useState(false);
  const [isSendingLeads, setIsSendingLeads] = useState(false);
  const [showMarketingLeadModal, setShowMarketingLeadModal] = useState<any>(null);
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewBody, setPreviewBody] = useState("");
  const [uploadingCSV, setUploadingCSV] = useState(false);

  // Ambassador Mailer States
  const [selectedAmbassadorId, setSelectedAmbassadorId] = useState("");
  const [ambassadorEmail, setAmbassadorEmail] = useState("");
  const [ambassadorSubject, setAmbassadorSubject] = useState("");
  const [ambassadorBody, setAmbassadorBody] = useState("");
  const [isSendingAmbassadorEmail, setIsSendingAmbassadorEmail] = useState(false);

  // Forms States
  const [newTxBusiness, setNewTxBusiness] = useState("");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [showTxBusinessDropdown, setShowTxBusinessDropdown] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnTarget, setNewAnnTarget] = useState("all_businesses");
  const [newAnnTargetId, setNewAnnTargetId] = useState("");

  // Business Creation States
  const [showAddBizModal, setShowAddBizModal] = useState(false);
  const [addBizName, setAddBizName] = useState("");
  const [addBizPrompt, setAddBizPrompt] = useState("");
  const [addBizKB, setAddBizKB] = useState("");
  const [addBizTheme, setAddBizTheme] = useState("#3B82F6");
  const [addBizWhatsapp, setAddBizWhatsapp] = useState("");
  const [addBizEmail, setAddBizEmail] = useState("");
  const [addBizStatus, setAddBizStatus] = useState("trial");
  const [addBizPaymentPlan, setAddBizPaymentPlan] = useState<"trial" | "full" | "installment_2x" | "installment_3x" | "starter" | "professional" | "enterprise">("trial");
  const [addBizRefCode, setAddBizRefCode] = useState("");

  // Business Configuration Edit States
  const [editName, setEditName] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editKB, setEditKB] = useState("");
  const [editTheme, setEditTheme] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPaymentPlan, setEditPaymentPlan] = useState<"trial" | "full" | "installment_2x" | "installment_3x" | "starter" | "professional" | "enterprise">("trial");
  const [editInstallmentsPaid, setEditInstallmentsPaid] = useState(0);
  const [editRenewalDate, setEditRenewalDate] = useState("");

  // Blog States
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [blogSearch, setBlogSearch] = useState("");
  const [selectedBlogPost, setSelectedBlogPost] = useState<any>(null);
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCoverImage, setBlogCoverImage] = useState("");
  const [blogStatus, setBlogStatus] = useState<"draft" | "pending_approval" | "published" | "rejected">("draft");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [blogAuthorName, setBlogAuthorName] = useState("ReplyIQ Team");
  const [blogAuthorAvatar, setBlogAuthorAvatar] = useState("");
  const [blogCategory, setBlogCategory] = useState<string>("AI & Tech");
  const [blogTags, setBlogTags] = useState<string>("");
  const [blogSources, setBlogSources] = useState<string>("");
  const [blogSeoTitle, setBlogSeoTitle] = useState<string>("");
  const [blogSeoDescription, setBlogSeoDescription] = useState<string>("");

  // Agent Drafts States
  const [agentDrafts, setAgentDrafts] = useState<any[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState<boolean>(false);
  const [agentPaused, setAgentPaused] = useState<boolean>(false);
  const [togglingAgent, setTogglingAgent] = useState<boolean>(false);
  const [curatingNews, setCuratingNews] = useState<boolean>(false);
  const [draftSearch, setDraftSearch] = useState<string>("");
  const [testingTelegramGroup, setTestingTelegramGroup] = useState<boolean>(false);
  const [testingLinkedIn, setTestingLinkedIn] = useState<boolean>(false);

  // Form Submitting States
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Vercel Logs States
  const [vercelLogs, setVercelLogs] = useState<any[]>([]);
  const [loadingVercelLogs, setLoadingVercelLogs] = useState(false);
  const [vercelLogsError, setVercelLogsError] = useState<string | null>(null);
  const [vercelLogsConfigError, setVercelLogsConfigError] = useState<string | null>(null);
  const [vercelLogsSearch, setVercelLogsSearch] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const { showAlert, showConfirm } = useAlert();

  useEffect(() => {
    async function init() {
      const isAuth = await checkAdminSession();
      if (!isAuth) {
        router.push("/admin/login");
      } else {
        setIsAuthenticated(true);
        loadData();
      }
    }
    init();
  }, [router]);

  useEffect(() => {
    if (activeTab === "vercel_logs") {
      loadVercelLogs();
    }
    if (activeTab === "agent_drafts") {
      loadAgentDraftsData();
    }
  }, [activeTab]);

  useEffect(() => {
    const isAnyModalOpen = !!(
      selectedBusiness ||
      selectedPartnerReferrals ||
      selectedChatHistory ||
      showAddTxModal ||
      showAnnouncementModal ||
      showAddBizModal ||
      showAddBlogModal ||
      showMarketingLeadModal
    );
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [
    selectedBusiness,
    selectedPartnerReferrals,
    selectedChatHistory,
    showAddTxModal,
    showAnnouncementModal,
    showAddBizModal,
    showAddBlogModal,
    showMarketingLeadModal
  ]);

  async function loadAgentDraftsData() {
    setLoadingDrafts(true);
    try {
      const [draftsRes, settingsRes] = await Promise.all([
        getPendingAgentDrafts(),
        getAgentSettings(),
      ]);
      if (draftsRes.success && draftsRes.data) {
        setAgentDrafts(draftsRes.data);
      }
      if (settingsRes.success) {
        setAgentPaused(!!settingsRes.paused);
      }
    } catch (err) {
      console.error("Failed to load agent drafts:", err);
    } finally {
      setLoadingDrafts(false);
    }
  }

  async function loadData() {
    setLoading(true);
    const res = await getAdminDashboardData();
    if (res.success && res.data) {
      setDashboardData(res.data);
    } else {
      console.error("Failed to load dashboard data:", res.error);
    }
    const blogRes = await getBlogPosts(true);
    if (blogRes.success && blogRes.data) {
      setBlogPosts(blogRes.data);
    } else {
      console.error("Failed to load blog posts:", blogRes.error);
    }
    await loadAgentDraftsData();
    setLoading(false);
  }

  async function loadVercelLogs() {
    setLoadingVercelLogs(true);
    setVercelLogsError(null);
    setVercelLogsConfigError(null);
    try {
      const res = await getVercelLogs();
      if (res.success && res.logs) {
        setVercelLogs(res.logs);
      } else {
        if (res.error === "Vercel configuration missing") {
          setVercelLogsConfigError(res.details || "Ensure VERCEL_AUTH_TOKEN and VERCEL_PROJECT_ID environment variables are set.");
        } else {
          setVercelLogsError(res.error || "Failed to load Vercel logs.");
        }
      }
    } catch (err: any) {
      setVercelLogsError(err.message || "Failed to retrieve Vercel logs.");
    } finally {
      setLoadingVercelLogs(false);
    }
  }

  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/admin/login");
  };

  if (isAuthenticated === null || loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-6 font-sans text-white">
        <div className="relative w-12 h-12 mb-4">
          <svg className="animate-spin h-full w-full text-[#8B5CF6]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="text-white/45 text-[14px]">Loading operations data...</p>
      </div>
    );
  }

  const {
    partners = [],
    referrals = [],
    businesses = [],
    leads = [],
    chats = [],
    transactions = [],
    activities = [],
    errors = [],
    announcements = [],
    subscribers = [],
    pendingSetupCount = 0,
    inProgressCount = 0,
    marketingLeads = [],
  } = dashboardData || {};

  // CALCULATE SUMMARY STATS
  const totalPartnersCount = partners.length;
  const totalBusinessesCount = businesses.length;
  const totalLeadsCount = leads.length;
  const totalRevenue = transactions.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);

  // DYNAMIC CALCULATIONS FOR CHASSIS METRICS
  const getBusinessAnalytics = (bizId: string, createdDateStr: string) => {
    const bizChats = chats.filter((c: any) => c.business_id === bizId);
    
    // Usage Metrics
    const totalConversations = bizChats.length;
    let totalMessages = 0;
    let messagesThisMonth = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const dayOfWeekCounts: Record<string, number> = {};

    bizChats.forEach((c: any) => {
      const history = c.history || [];
      totalMessages += history.length;
      
      history.forEach((m: any) => {
        const msgDate = new Date(m.timestamp);
        if (msgDate.getMonth() === currentMonth && msgDate.getFullYear() === currentYear) {
          messagesThisMonth++;
        }
        const dayName = msgDate.toLocaleDateString("en-US", { weekday: "long" });
        dayOfWeekCounts[dayName] = (dayOfWeekCounts[dayName] || 0) + 1;
      });
    });

    let mostActiveDay = "None";
    let maxDayCount = 0;
    Object.entries(dayOfWeekCounts).forEach(([day, count]) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        mostActiveDay = day;
      }
    });

    const daysSinceCreation = Math.max(1, Math.round((Date.now() - new Date(createdDateStr).getTime()) / (1000 * 60 * 60 * 24)));
    const avgMessagesPerDay = (totalMessages / daysSinceCreation).toFixed(1);

    // Performance Metrics
    const totalAIResponses = bizChats.reduce((acc: number, curr: any) => {
      return acc + (curr.history || []).filter((h: any) => h.role === "model").length;
    }, 0);
    const whatsappHandoffs = activities.filter((a: any) => a.business_id === bizId && a.event_type === "whatsapp_handoff").length;
    const emailHandoffs = activities.filter((a: any) => a.business_id === bizId && a.event_type === "email_handoff").length;
    const unknownQuestions = activities.filter((a: any) => a.business_id === bizId && a.event_type === "unknown_question").length;

    // Lead Gen Metrics
    const leadsGenerated = referrals.filter((r: any) => r.business_name.toLowerCase() === bizId.toLowerCase() || r.email.toLowerCase().includes(bizId.toLowerCase())).length;

    // KB Completeness
    const biz = businesses.find((b: any) => b.business_id === bizId) || {};
    const kbChecklist = {
      name: !!biz.name,
      prompt: !!biz.system_prompt,
      faq: !!biz.knowledge_base && biz.knowledge_base.length > 20,
      whatsapp: !!biz.whatsapp_phone,
      email: !!biz.email_contact
    };
    const completedKbFields = Object.values(kbChecklist).filter(Boolean).length;
    const kbCompletenessPercentage = Math.round((completedKbFields / 5) * 100);

    // Health Score calculation
    let healthScore = 0;
    healthScore += Math.min(25, totalConversations * 3); // activity points (max 25)
    healthScore += Math.max(0, 25 - (unknownQuestions * 3)); // quality points (max 25)
    healthScore += Math.round((completedKbFields / 5) * 25); // KB completeness points (max 25)
    healthScore += Math.min(25, (whatsappHandoffs + emailHandoffs) * 4); // Handoff success (max 25)
    
    // Fallbacks if no activity exists, to reflect baseline config
    if (totalConversations === 0) healthScore += 15;

    let healthColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    let healthLabel = "Healthy";
    if (healthScore < 50) {
      healthColor = "text-red-400 bg-red-500/10 border-red-500/20";
      healthLabel = "Attention Required";
    } else if (healthScore < 80) {
      healthColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      healthLabel = "Moderate";
    }

    return {
      totalConversations,
      totalMessages,
      messagesThisMonth,
      avgMessagesPerDay,
      mostActiveDay,
      totalAIResponses,
      whatsappHandoffs,
      emailHandoffs,
      unknownQuestions,
      leadsGenerated,
      kbChecklist,
      kbCompletenessPercentage,
      healthScore,
      healthColor,
      healthLabel
    };
  };

  // ANALYTICS GRAPH DATA COMPILING
  const getGrowthChartData = () => {
    // 30 Days trend
    const dataPoints: Record<string, { date: string; partners: number; businesses: number; chats: number; revenue: number }> = {};
    const now = new Date();
    
    // Seed last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dataPoints[dateStr] = { date: dateStr, partners: 0, businesses: 0, chats: 0, revenue: 0 };
    }

    // Accumulate Partners
    partners.forEach((p: any) => {
      const dateStr = new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dataPoints[dateStr]) dataPoints[dateStr].partners++;
    });

    // Accumulate Businesses
    businesses.forEach((b: any) => {
      const dateStr = new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dataPoints[dateStr]) dataPoints[dateStr].businesses++;
    });

    // Accumulate Chats
    chats.forEach((c: any) => {
      const dateStr = new Date(c.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dataPoints[dateStr]) dataPoints[dateStr].chats++;
    });

    // Accumulate Revenue
    transactions.forEach((t: any) => {
      const dateStr = new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dataPoints[dateStr]) dataPoints[dateStr].revenue += Number(t.amount || 0);
    });

    // Make cumulative
    let runningPartners = 1;
    let runningBusinesses = 1;
    let runningChats = 2;
    let runningRevenue = 30000;

    return Object.values(dataPoints).map(dp => {
      runningPartners += dp.partners;
      runningBusinesses += dp.businesses;
      runningChats += dp.chats;
      runningRevenue += dp.revenue;
      return {
        ...dp,
        partners: runningPartners,
        businesses: runningBusinesses,
        chats: runningChats,
        revenue: runningRevenue
      };
    });
  };

  const getSourceDistributionData = () => {
    const distribution: Record<string, number> = {
      direct: 0,
      tiktok: 0,
      linkedin: 0,
      referral: 0,
      partner: 0
    };
    
    businesses.forEach((b: any) => {
      const src = (b.signup_source || "direct").toLowerCase();
      if (distribution[src] !== undefined) {
        distribution[src]++;
      } else {
        distribution.direct++;
      }
    });

    return [
      { name: "Direct", value: distribution.direct, color: "#8B5CF6" },
      { name: "TikTok", value: distribution.tiktok, color: "#EC4899" },
      { name: "LinkedIn", value: distribution.linkedin, color: "#3B82F6" },
      { name: "Referral", value: distribution.referral, color: "#F59E0B" },
      { name: "Partners", value: distribution.partner, color: "#10B981" }
    ].filter(item => item.value > 0);
  };

  // ACTIONS HANDLERS
  const handleToggleReferral = async (refId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "paying" ? "pending" : "paying";
    const res = await toggleReferralStatus(refId, nextStatus);
    if (res.success) {
      loadData();
      if (selectedPartnerReferrals) {
        const updated = selectedPartnerReferrals.map((r: any) => 
          r.id === refId ? { ...r, status: nextStatus } : r
        );
        setSelectedPartnerReferrals(updated);
      }
    } else {
      showAlert("Operation Failed", "Failed to toggle status: " + res.error, "error");
    }
  };

  const handleAddTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxBusiness || !newTxAmount) return;
    setFormSubmitting(true);
    const res = await addManualTransaction(newTxBusiness, Number(newTxAmount));
    if (res.success) {
      setNewTxBusiness("");
      setNewTxAmount("");
      setShowAddTxModal(false);
      loadData();
      showAlert("Success", "Manual transaction logged successfully", "success");
    } else {
      showAlert("Operation Failed", "Error adding transaction: " + res.error, "error");
    }
    setFormSubmitting(false);
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    setFormSubmitting(true);
    const res = await createAnnouncement(newAnnTitle, newAnnContent, newAnnTarget, newAnnTargetId || undefined);
    if (res.success) {
      setNewAnnTitle("");
      setNewAnnContent("");
      setNewAnnTargetId("");
      setShowAnnouncementModal(false);
      loadData();
      showAlert("Announcement Sent", "Broadcast notification sent successfully", "success");
    } else {
      showAlert("Operation Failed", "Error broadcasting: " + res.error, "error");
    }
    setFormSubmitting(false);
  };

  const handleCreateBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addBizName || !addBizPrompt) return;
    setFormSubmitting(true);
    const res = await createBusiness({
      name: addBizName,
      systemPrompt: addBizPrompt,
      knowledgeBase: addBizKB,
      themeColor: addBizTheme,
      whatsappPhone: addBizWhatsapp,
      emailContact: addBizEmail,
      status: addBizStatus,
      paymentPlan: addBizPaymentPlan,
      referredByCode: addBizRefCode || undefined
    });
    if (res.success) {
      setAddBizName("");
      setAddBizPrompt("");
      setAddBizKB("");
      setAddBizTheme("#3B82F6");
      setAddBizWhatsapp("");
      setAddBizEmail("");
      setAddBizStatus("trial");
      setAddBizPaymentPlan("trial");
      setAddBizRefCode("");
      setShowAddBizModal(false);
      loadData();
      showAlert("Assistant Created", `Business configuration created successfully. Slug ID: ${res.businessId}`, "success");
    } else {
      showAlert("Operation Failed", "Error creating business: " + res.error, "error");
    }
    setFormSubmitting(false);
  };

  const handleUpdateBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness) return;
    setFormSubmitting(true);
    const res = await updateBusiness(selectedBusiness.business_id, {
      name: editName,
      systemPrompt: editPrompt,
      knowledgeBase: editKB,
      themeColor: editTheme,
      whatsappPhone: editWhatsapp,
      emailContact: editEmail,
      status: editStatus,
      paymentPlan: editPaymentPlan,
      installmentsPaid: editInstallmentsPaid,
      renewalDateStr: editRenewalDate
    });
    if (res.success) {
      setSelectedBusiness(null);
      loadData();
      showAlert("Assistant Updated", "Business configurations updated successfully", "success");
    } else {
      showAlert("Operation Failed", "Error updating assistant configuration: " + res.error, "error");
    }
    setFormSubmitting(false);
  };

  const handleSelectAmbassador = (partnerId: string) => {
    setSelectedAmbassadorId(partnerId);
    if (!partnerId) {
      setAmbassadorEmail("");
      return;
    }
    const p = partners.find((x: any) => x.id === partnerId);
    if (p) {
      setAmbassadorEmail(p.email || "");
    }
  };

  const handleSendAmbassadorEmail = async () => {
    if (!ambassadorEmail.trim() || !ambassadorSubject.trim() || !ambassadorBody.trim()) {
      showAlert("Missing Fields", "Please specify a recipient email, subject and message.", "error");
      return;
    }
    setIsSendingAmbassadorEmail(true);

    const res = await sendPersonalizedAmbassadorEmail(
      ambassadorEmail,
      ambassadorSubject,
      ambassadorBody
    );
    
    if (res.success) {
      showAlert("Email Sent", `Successfully sent email to ${ambassadorEmail}`, "success");
      setSelectedAmbassadorId("");
      setAmbassadorEmail("");
      setAmbassadorSubject("");
      setAmbassadorBody("");
    } else {
      showAlert("Send Failed", "Error: " + res.error, "error");
    }
    setIsSendingAmbassadorEmail(false);
  };

  const handleToggleAmbassadorStatus = async (id: string, isAmbassador: boolean) => {
    const res = await togglePartnerAmbassadorStatus(id, isAmbassador);
    if (res.success) {
      loadData();
      showAlert("Updated", `Ambassador status updated successfully`, "success");
    } else {
      showAlert("Failed", "Failed to update: " + res.error, "error");
    }
  };

  // DELETE BUTTON HANDLERS
  const handleDeletePartner = async (id: string) => {
    showConfirm(
      "Delete Ambassador",
      "Are you sure you want to delete this ambassador? Deleting them will clear their referral reports but will NOT delete their referred businesses.",
      async () => {
        const res = await deletePartner(id);
        if (res.success) {
          loadData();
          showAlert("Deleted", "Ambassador deleted successfully", "success");
        } else {
          showAlert("Failed", "Failed to delete: " + res.error, "error");
        }
      }
    );
  };

  const handleDeleteBusiness = async (id: string) => {
    showConfirm(
      "Delete Assistant",
      "Are you sure you want to delete this business config? This removes their assistant parameters and WhatsApp chats but does NOT remove their transactions.",
      async () => {
        const res = await deleteBusiness(id);
        if (res.success) {
          setSelectedBusiness(null);
          loadData();
          showAlert("Deleted", "Business assistant deleted successfully", "success");
        } else {
          showAlert("Failed", "Failed to delete: " + res.error, "error");
        }
      }
    );
  };

  const handleDeleteLead = async (id: string) => {
    showConfirm(
      "Delete Lead",
      "Are you sure you want to delete this contact lead?",
      async () => {
        const res = await deleteLead(id);
        if (res.success) {
          loadData();
          showAlert("Deleted", "Lead deleted successfully", "success");
        } else {
          showAlert("Failed", "Failed to delete: " + res.error, "error");
        }
      }
    );
  };

  const handleDeleteSubscriber = async (id: string) => {
    showConfirm(
      "Delete Subscriber",
      "Are you sure you want to unsubscribe this email address from the newsletter?",
      async () => {
        const res = await deleteNewsletterSubscriber(id);
        if (res.success) {
          loadData();
          showAlert("Deleted", "Subscriber removed successfully", "success");
        } else {
          showAlert("Failed", "Failed to delete: " + res.error, "error");
        }
      }
    );
  };

  const handleSendNewsletter = async () => {
    if (!newsletterSubject.trim()) {
      showAlert("Missing Subject", "Please add a subject line for the newsletter", "error");
      return;
    }
    if (!newsletterBody.trim()) {
      showAlert("Missing Content", "Please add some content for the newsletter", "error");
      return;
    }

    showConfirm(
      "Send Newsletter Broadcast",
      `Are you sure you want to broadcast this newsletter? This action cannot be undone.`,
      async () => {
        setIsSendingNewsletter(true);
        try {
          const res = await sendNewsletterBroadcast(newsletterSubject, newsletterBody, customRecipients, newsletterTarget);
          if (res.success) {
            setNewsletterSubject("");
            setNewsletterBody("");
            setCustomRecipients("");
            setNewsletterTarget("both");
            loadData();
            showAlert("Broadcasted", `Newsletter successfully sent to ${res.count} recipients!`, "success");
          } else {
            showAlert("Failed", "Failed to send broadcast: " + res.error, "error");
          }
        } catch (err: any) {
          showAlert("Error", err.message || "An unexpected error occurred", "error");
        } finally {
          setIsSendingNewsletter(false);
        }
      }
    );
  };

  const handleDeleteChat = async (phone: string) => {
    showConfirm(
      "Delete Chat Session",
      "Are you sure you want to delete this active chat session and history?",
      async () => {
        const res = await deleteWhatsAppSession(phone);
        if (res.success) {
          loadData();
          showAlert("Deleted", "Chat session history deleted successfully", "success");
        } else {
          showAlert("Failed", "Failed to delete: " + res.error, "error");
        }
      }
    );
  };

  const handleDeleteTx = async (id: string) => {
    showConfirm(
      "Delete Transaction Log",
      "Are you sure you want to delete this transaction log?",
      async () => {
        const res = await deleteTransaction(id);
        if (res.success) {
          loadData();
          showAlert("Deleted", "Transaction log deleted successfully", "success");
        } else {
          showAlert("Failed", "Failed to delete: " + res.error, "error");
        }
      }
    );
  };

  const handleClearErrors = async () => {
    showConfirm(
      "Clear Error Logs",
      "Are you sure you want to clear all error logs?",
      async () => {
        const res = await clearAllErrorLogs();
        if (res.success) {
          loadData();
          showAlert("Cleared", "All error logs cleared", "success");
        } else {
          showAlert("Failed", "Failed to clear error logs: " + res.error, "error");
        }
      }
    );
  };



  const handleSaveBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogContent) {
      showAlert("Validation Error", "Title and content are required.", "error");
      return;
    }
    setFormSubmitting(true);

    const generatedSlug = selectedBlogPost?.slug || blogTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const parsedTags = blogTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedSources = blogSources
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        if (parts.length >= 2) {
          return { title: parts[0], url: parts[1], publisher: parts[2] || undefined };
        }
        return { title: line, url: line };
      });

    const res = await saveBlogPost({
      id: selectedBlogPost?.id,
      title: blogTitle,
      slug: generatedSlug,
      content: blogContent,
      excerpt: blogExcerpt,
      cover_image: blogCoverImage,
      category: blogCategory,
      tags: parsedTags,
      source_urls: parsedSources,
      seo_title: blogSeoTitle || undefined,
      seo_description: blogSeoDescription || undefined,
      status: blogStatus,
      author_name: blogAuthorName,
      author_avatar: blogAuthorAvatar,
    });
    if (res.success) {
      setBlogTitle("");
      setBlogExcerpt("");
      setBlogContent("");
      setBlogCoverImage("");
      setBlogCategory("AI & Tech");
      setBlogTags("");
      setBlogSources("");
      setBlogSeoTitle("");
      setBlogSeoDescription("");
      setBlogStatus("draft");
      setBlogAuthorName("ReplyIQ Team");
      setBlogAuthorAvatar("");
      setShowAddBlogModal(false);
      setSelectedBlogPost(null);
      loadData();
      loadAgentDraftsData();
      showAlert("Success", selectedBlogPost ? "Blog post updated successfully" : "Blog post created successfully", "success");
    } else {
      showAlert("Operation Failed", "Error saving blog post: " + res.error, "error");
    }
    setFormSubmitting(false);
  };

  const handleApproveDraft = async (id: string) => {
    const res = await updatePostStatus(id, "published");
    if (res.success) {
      showAlert("Published", "Article approved and published to the live hub!", "success");
      loadAgentDraftsData();
      loadData();
    } else {
      showAlert("Failed", "Failed to approve draft: " + res.error, "error");
    }
  };

  const handleRejectDraft = async (id: string) => {
    showConfirm(
      "Reject Draft",
      "Are you sure you want to reject this automated draft?",
      async () => {
        const res = await updatePostStatus(id, "rejected");
        if (res.success) {
          showAlert("Rejected", "Draft status set to rejected.", "success");
          loadAgentDraftsData();
          loadData();
        } else {
          showAlert("Failed", "Failed to reject draft: " + res.error, "error");
        }
      }
    );
  };

  const handleToggleAgentPause = async () => {
    setTogglingAgent(true);
    const nextPaused = !agentPaused;
    const res = await setAgentSettings(nextPaused);
    if (res.success) {
      setAgentPaused(nextPaused);
      showAlert(
        nextPaused ? "Ingestion Paused" : "Ingestion Resumed",
        nextPaused 
          ? "Automated ingestion paused. Incoming webhook drafts will be rejected with 403."
          : "Automated ingestion active. News agent can submit drafts.",
        "success"
      );
    } else {
      showAlert("Failed", "Could not update agent settings: " + res.error, "error");
    }
    setTogglingAgent(false);
  };

  const handleTriggerCuration = async () => {
    setCuratingNews(true);
    try {
      const res = await fetch("/api/cron/curate-news", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        if (data.created) {
          showAlert(
            "Curation Complete",
            `New draft curated: "${data.title}"! ${data.telegramNotified ? "Telegram alert sent." : ""}`,
            "success"
          );
        } else {
          showAlert("Curation Checked", data.message || "Feeds checked, no new uncurated news stories found.", "info");
        }
        await loadAgentDraftsData();
      } else {
        showAlert("Curation Failed", data.error || data.message || "Failed to curate news.", "error");
      }
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to trigger curation.", "error");
    } finally {
      setCuratingNews(false);
    }
  };

  const handleOpenPreview = async (id: string) => {
    const res = await getDraftPreviewUrl(id);
    if (res.success && res.url) {
      window.open(res.url, "_blank");
    } else {
      showAlert("Error", res.error || "Failed to open preview.", "error");
    }
  };

  const handleBroadcastToTelegram = async (id: string, title: string) => {
    showConfirm(
      "Broadcast to Telegram Group",
      `Are you sure you want to broadcast "${title}" to your connected Telegram group/channel?`,
      async () => {
        const res = await broadcastPublishedPostToTelegram(id);
        if (res.success) {
          showAlert("Broadcast Sent", res.message || "Article announced to Telegram group successfully!", "success");
        } else {
          showAlert("Broadcast Failed", res.error || "Failed to broadcast to Telegram group.", "error");
        }
      }
    );
  };

  const handleBroadcastToLinkedIn = async (id: string, title: string) => {
    showConfirm(
      "Share to LinkedIn Page",
      `Are you sure you want to share "${title}" to your official ReplyIQ LinkedIn Company Page?`,
      async () => {
        const res = await broadcastPublishedPostToLinkedIn(id);
        if (res.success) {
          showAlert("Shared to LinkedIn", res.message || "Article shared to LinkedIn successfully!", "success");
        } else {
          showAlert("LinkedIn Error", res.error || "Failed to share to LinkedIn.", "error");
        }
      }
    );
  };

  const handleTestTelegramGroup = async () => {
    setTestingTelegramGroup(true);
    try {
      const res = await sendTelegramGroupTestMessage();
      if (res.success) {
        showAlert("Telegram Connected", res.message || "Test message sent to group successfully!", "success");
      } else {
        showAlert("Telegram Error", res.error || "Failed to send test message.", "error");
      }
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to test group.", "error");
    } finally {
      setTestingTelegramGroup(false);
    }
  };

  const handleTestLinkedIn = async () => {
    setTestingLinkedIn(true);
    try {
      const res = await testLinkedInPageConnection();
      if (res.success) {
        showAlert("LinkedIn Connected", res.message || "Connected to LinkedIn successfully!", "success");
      } else {
        showAlert("LinkedIn Error", res.error || "Failed to verify LinkedIn connection.", "error");
      }
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to test LinkedIn.", "error");
    } finally {
      setTestingLinkedIn(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    showConfirm(
      "Delete Blog Post",
      "Are you sure you want to delete this blog post? This action cannot be undone.",
      async () => {
        const res = await deleteBlogPost(id);
        if (res.success) {
          loadData();
          showAlert("Deleted", "Blog post deleted successfully", "success");
        } else {
          showAlert("Failed", "Failed to delete: " + res.error, "error");
        }
      }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!supabase) {
      showAlert("Upload Error", "Supabase client is not initialized.", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error } = await supabase.storage
        .from("blog-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("blog-assets")
        .getPublicUrl(filePath);

      setBlogCoverImage(publicUrl);
      showAlert("Success", "Cover image uploaded successfully!", "success");
    } catch (err: any) {
      showAlert("Upload Failed", err.message || "Failed to upload image.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditBlogPost = (post: any) => {
    setSelectedBlogPost(post);
    setBlogTitle(post.title || "");
    setBlogExcerpt(post.excerpt || "");
    setBlogContent(post.content || "");
    setBlogCoverImage(post.cover_image || "");
    setBlogCategory(post.category || "AI & Tech");
    setBlogTags(Array.isArray(post.tags) ? post.tags.join(", ") : "");
    const formattedSources = Array.isArray(post.source_urls)
      ? post.source_urls
          .map((s: any) => (typeof s === "string" ? s : `${s.title || s.url} | ${s.url}`))
          .join("\n")
      : "";
    setBlogSources(formattedSources);
    setBlogSeoTitle(post.seo_title || "");
    setBlogSeoDescription(post.seo_description || "");
    setBlogStatus(post.status || "draft");
    setBlogAuthorName(post.author_name || "ReplyIQ Team");
    setBlogAuthorAvatar(post.author_avatar || "");
    setShowAddBlogModal(true);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCSV(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/);
        if (lines.length === 0) {
          showAlert("Import Error", "Empty CSV file.", "error");
          setUploadingCSV(false);
          return;
        }

        // Simple CSV parser supporting quotes
        const parseLine = (line: string) => {
          const result = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/["']/g, "").trim());
        
        const nameIdx = headers.findIndex(h => h.includes("name"));
        const catIdx = headers.findIndex(h => h.includes("category") || h.includes("industry"));
        const addrIdx = headers.findIndex(h => h.includes("address") || h.includes("location"));
        const phoneIdx = headers.findIndex(h => h.includes("phone") || h.includes("mobile"));
        const webIdx = headers.findIndex(h => h.includes("website") || h.includes("url"));
        const emailIdx = headers.findIndex(h => h.includes("email") || h.includes("mail"));
        const srcIdx = headers.findIndex(h => h.includes("source"));

        if (emailIdx === -1 || nameIdx === -1) {
          showAlert("Validation Error", "CSV must contain at least 'Name' and 'Email' columns.", "error");
          setUploadingCSV(false);
          return;
        }

        const importedLeads = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = parseLine(line);
          const name = values[nameIdx] || "";
          const email = values[emailIdx] || "";
          
          if (!name || !email) continue;

          importedLeads.push({
            name,
            email,
            category: catIdx !== -1 ? values[catIdx] : "",
            address: addrIdx !== -1 ? values[addrIdx] : "",
            phone: phoneIdx !== -1 ? values[phoneIdx] : "",
            website: webIdx !== -1 ? values[webIdx] : "",
            source: srcIdx !== -1 ? values[srcIdx] : "CSV Upload",
            status: "pending"
          });
        }

        if (importedLeads.length === 0) {
          showAlert("Import Error", "No valid leads found in CSV.", "error");
          setUploadingCSV(false);
          return;
        }

        const res = await importMarketingLeads(importedLeads);
        if (res.success) {
          showAlert("Success", `Successfully imported ${res.count} marketing leads!`, "success");
          loadData();
        } else {
          showAlert("Import Failed", res.error || "Failed to import leads.", "error");
        }
      } catch (err: any) {
        showAlert("Parse Error", `Error parsing CSV: ${err.message}`, "error");
      } finally {
        setUploadingCSV(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleEnrichLeads = async () => {
    if (selectedMarketingLeads.length === 0) return;
    if (selectedMarketingLeads.length > 10) {
      showAlert("Enrichment Limit", "Please select a maximum of 10 leads at a time for AI enrichment.", "error");
      return;
    }

    setIsScrapingLeads(true);
    try {
      const res = await generateAiMarketingOutreach(selectedMarketingLeads);
      if (res.success) {
        const failures = res.results?.filter(r => !r.success) || [];
        if (failures.length > 0) {
          showAlert("Partial Success", `Enrichment completed with some errors: ${failures.length} failed. Check status logs.`, "info");
        } else {
          showAlert("Success", "AI outreach copy generated successfully for selected leads!", "success");
        }
        setSelectedMarketingLeads([]);
        loadData();
      } else {
        showAlert("Enrichment Failed", res.error || "Failed to run AI enrichment.", "error");
      }
    } catch (err: any) {
      showAlert("Enrichment Error", err.message || "Failed to enrich leads.", "error");
    } finally {
      setIsScrapingLeads(false);
    }
  };

  const handleSendOutbound = async () => {
    if (selectedMarketingLeads.length === 0) return;
    if (selectedMarketingLeads.length > 10) {
      showAlert("Outbound Limit", "Please select a maximum of 10 leads at a time.", "error");
      return;
    }

    const selectedObjects = marketingLeads.filter((l: any) => selectedMarketingLeads.includes(l.id));
    const unprepped = selectedObjects.filter((l: any) => l.status !== "fetched" && l.status !== "sent");
    if (unprepped.length > 0) {
      showAlert("Status Error", `${unprepped.length} selected leads do not have their AI pitch generated yet. Please enrich them first.`, "error");
      return;
    }

    setIsSendingLeads(true);
    try {
      const leadsToSend = selectedObjects.map((l: any) => ({
        id: l.id,
        email: l.email,
        subject: l.ai_subject,
        body: l.ai_body
      }));

      const res = await sendColdOutboundEmails(leadsToSend);
      if (res.success) {
        const failures = res.results?.filter(r => !r.success) || [];
        if (failures.length > 0) {
          showAlert("Partial Success", `Broadcast finished. ${failures.length} emails failed to send.`, "info");
        } else {
          showAlert("Success", `Personalized outreach sent successfully to ${leadsToSend.length} businesses!`, "success");
        }
        setSelectedMarketingLeads([]);
        loadData();
      } else {
        showAlert("Sending Failed", res.error || "Failed to send outreach.", "error");
      }
    } catch (err: any) {
      showAlert("Sending Error", err.message || "Failed to broadcast emails.", "error");
    } finally {
      setIsSendingLeads(false);
    }
  };

  const handleDeleteMarketingLead = (id: string) => {
    showConfirm(
      "Delete Prospect Lead",
      "Are you sure you want to delete this prospect lead? This cannot be undone.",
      async () => {
        const res = await deleteMarketingLead(id);
        if (res.success) {
          loadData();
          showAlert("Deleted", "Lead deleted successfully.", "success");
        } else {
          showAlert("Failed", "Failed to delete lead: " + res.error, "error");
        }
      }
    );
  };

  const handleClearAllLeads = () => {
    showConfirm(
      "Delete All Leads",
      "Are you sure you want to delete ALL marketing leads? This action is permanent and irreversible.",
      async () => {
        const res = await clearAllMarketingLeads();
        if (res.success) {
          loadData();
          showAlert("Cleared", "All marketing leads deleted successfully.", "success");
        } else {
          showAlert("Failed", "Failed to clear leads: " + res.error, "error");
        }
      }
    );
  };

  const handleResetLeadPitch = (id: string) => {
    showConfirm(
      "Reset AI Pitch",
      "Are you sure you want to delete this AI pitch? The status will reset to Pending so you can regenerate it.",
      async () => {
        const res = await resetMarketingLeadPitch(id);
        if (res.success) {
          loadData();
          showAlert("Reset Complete", "AI pitch deleted and status reset to Pending.", "success");
        } else {
          showAlert("Failed", "Failed to reset pitch: " + res.error, "error");
        }
      }
    );
  };

  const handleSingleResend = async (lead: any) => {
    setIsSendingLeads(true);
    try {
      const res = await sendColdOutboundEmails([{
        id: lead.id,
        email: lead.email,
        subject: lead.ai_subject,
        body: lead.ai_body
      }]);
      if (res.success && res.results?.[0]?.success) {
        showAlert("Success", `Email resent successfully to ${lead.email}!`, "success");
        loadData();
      } else {
        const err = res.results?.[0]?.error || res.error || "Failed to resend.";
        showAlert("Failed", err, "error");
      }
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to resend.", "error");
    } finally {
      setIsSendingLeads(false);
    }
  };

  const handleOpenLeadModal = (lead: any) => {
    setShowMarketingLeadModal(lead);
    setPreviewSubject(lead.ai_subject || `Partnering with ${lead.name}`);
    setPreviewBody(lead.ai_body || `Hi Team,\n\nI was looking at your website...`);
  };

  const handleSaveLeadPitch = async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("marketing_leads")
        .update({ ai_subject: previewSubject, ai_body: previewBody })
        .eq("id", showMarketingLeadModal.id);
      
      if (error) throw error;
      showAlert("Saved", "Outreach pitch copy updated successfully.", "success");
      loadData();
      setShowMarketingLeadModal(null);
    } catch (err: any) {
      showAlert("Failed", "Failed to save updates: " + err.message, "error");
    }
  };

  // FILTERED LISTINGS FOR SEARCHES
  const filteredPartners = partners.filter((p: any) => 
    p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(partnerSearch.toLowerCase()) ||
    p.university.toLowerCase().includes(partnerSearch.toLowerCase()) ||
    p.referral_code.toLowerCase().includes(partnerSearch.toLowerCase())
  );

  const filteredBusinesses = businesses.filter((b: any) => 
    b.name.toLowerCase().includes(businessSearch.toLowerCase()) ||
    b.business_id.toLowerCase().includes(businessSearch.toLowerCase())
  );

  const filteredLeads = leads.filter((l: any) => 
    l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.company.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.email.toLowerCase().includes(leadSearch.toLowerCase())
  );

  const filteredChats = chats.filter((c: any) => 
    c.phone.includes(chatSearch) ||
    c.business_id.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const filteredActivities = activities.filter((a: any) => 
    a.description.toLowerCase().includes(auditSearch.toLowerCase()) ||
    a.event_type.toLowerCase().includes(auditSearch.toLowerCase())
  );

  const subscribersList = subscribers;
  const filteredSubscribers = subscribers.filter((s: any) =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  const tabsList = [
    { id: "analytics", label: "Analytics Charts", icon: TrendingUp, desc: "Real-time registration statistics, activity log curves, and growth metrics." },
    { id: "businesses", label: "AI Assistants", icon: Briefcase, desc: "Manage tenant configurations, prompts, knowledge bases, and WhatsApp sessions." },
    { id: "partners", label: "Ambassadors", icon: Users, desc: "Monitor campus partner referrals, university reps, and payouts." },
    { id: "transactions", label: "Transactions", icon: DollarSign, desc: "Review platform payouts, subscription fees, and installment records." },
    { id: "chats", label: "WhatsApp Conversations", icon: MessageSquare, desc: "Active customer live chat sessions, histories, and business touchpoints." },
    { id: "activities", label: "Audit Trails", icon: Activity, desc: "Administrative event logs tracking updates and sign-ins." },
    { id: "errors", label: "Error Logs", icon: AlertTriangle, desc: "Database exception tracker, webhook errors, and API faults." },
    { id: "vercel_logs", label: "Vercel Logs", icon: Terminal, desc: "Direct runtime console streams from the Vercel server deployment." },
    { id: "blog", label: "Blog Posts", icon: FileText, desc: "Write, draft, edit, and publish articles directly to the ReplyIQ blog." },
    { id: "agent_drafts", label: "Agent Drafts", icon: Sparkles, desc: "Review, edit, approve, or reject automated news drafts from n8n/Make agents." },
    { id: "newsletter", label: "Newsletter Manager", icon: Mail, desc: "Manage subscribers, draft themed newsletters, and broadcast emails." },
    { id: "ambassador_mailer", label: "Ambassador Mailer", icon: Send, desc: "Send personalized welcome and onboarding emails to offline campus ambassadors." },
    { id: "marketing_leads", label: "Lead Outreach & Tracking", icon: Megaphone, desc: "Upload CSV lists, auto-enrich via AI, and broadcast targeted cold pitches." },
    { id: "site_analytics", label: "Site Traffic (GA4)", icon: TrendingUp, desc: "Embedded Looker Studio dashboard mapping Google Analytics parameters." },
  ];

  const currentTabInfo = tabsList.find((t) => t.id === activeTab) || tabsList[0];

  return (
    <div className="h-screen w-screen bg-[#030014] text-[#F8FAFC] font-sans flex overflow-hidden relative select-text">
      
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. LEFT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col justify-between bg-[#09071A]/90 border-r border-white/5 backdrop-blur-md z-20">
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Brand/Console Title */}
          <div className="h-16 px-6 border-b border-white/5 flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-black/40 border border-white/10 p-1 flex-shrink-0">
              <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
            </div>
            <div>
              <h1 className="text-[13px] font-bold tracking-tight text-white flex items-center whitespace-nowrap">
                ReplyIQ <span className="text-[9px] uppercase font-mono tracking-wider bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1 rounded ml-1">Admin</span>
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
            {tabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-[#8B5CF6]/15 text-[#A78BFA] border-l-2 border-[#8B5CF6] font-semibold shadow-[0_0_15px_rgba(139,92,246,0.08)] shadow-[inset_0_0_8px_rgba(139,92,246,0.1)]" 
                      : "text-white/45 hover:text-white/80 hover:bg-white/[0.02]"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#8B5CF6]' : ''}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile/Session info */}
        <div className="p-4 border-t border-white/5 bg-black/20 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-1">
            <Shield className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span className="text-[10.5px] text-white/40 font-mono truncate font-semibold">unityekeoba18@gmail.com</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all py-2 rounded-lg border border-white/5 text-[11.5px] font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer panel */}
          <aside className="relative flex w-full max-w-xs flex-1 flex-col justify-between bg-[#09071A] border-r border-white/10 p-6 shadow-2xl animate-in slide-in-from-left duration-200">
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/60"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col flex-1 min-h-0 pt-4">
              <div className="flex items-center gap-3 pb-6 border-b border-white/5 mb-6">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-black/40 border border-white/10 p-1 flex-shrink-0">
                  <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
                </div>
                <h1 className="text-[14px] font-bold text-white">ReplyIQ Admin</h1>
              </div>

              <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
                {tabsList.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium transition-all ${
                        isActive 
                          ? "bg-[#8B5CF6]/10 text-[#A78BFA] border-l-2 border-[#8B5CF6] font-semibold" 
                          : "text-white/45 hover:text-white/80 hover:bg-white/[0.01]"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10.5px] text-white/40 font-mono truncate">unityekeoba18@gmail.com</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all py-2 rounded-lg border border-white/5 text-[11.5px] font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. RIGHT MAIN PANE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Right Pane Header */}
        <header className="h-16 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            
            <div className="min-w-0">
              <h2 className="text-[13.5px] font-bold text-white flex items-center gap-2">
                {currentTabInfo.label}
              </h2>
              <p className="text-[10.5px] text-white/40 mt-0.5 font-medium truncate hidden sm:block">{currentTabInfo.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <span className="text-[9px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider font-semibold shadow-[0_0_10px_rgba(139,92,246,0.1)]">
              <Shield className="w-2.5 h-2.5 text-purple-400" />
              SECURE ACCESS
            </span>
          </div>
        </header>

        {/* Scrollable Core Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-text scrollbar-thin">
          
          {/* TAB WORKSPACE CONTENT */}
          <div className="space-y-6">
            
            {/* If tab is analytics, we embed the stats boxes here */}
            {activeTab === "analytics" && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                
                {/* Revenue */}
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/45 text-[11px] font-semibold uppercase tracking-wider">Total Revenue</p>
                    <h3 className="text-[20px] md:text-[24px] font-bold text-white mt-1">₦{totalRevenue.toLocaleString()}</h3>
                  </div>
                </div>

                {/* Partners */}
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/45 text-[11px] font-semibold uppercase tracking-wider">Ambassadors</p>
                    <h3 className="text-[20px] md:text-[24px] font-bold text-white mt-1">{totalPartnersCount}</h3>
                  </div>
                </div>

                {/* Businesses */}
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/45 text-[11px] font-semibold uppercase tracking-wider">Assistants</p>
                    <h3 className="text-[20px] md:text-[24px] font-bold text-white mt-1">{totalBusinessesCount}</h3>
                  </div>
                </div>

                {/* Leads */}
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
                  <div className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-lg">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/45 text-[11px] font-semibold uppercase tracking-wider">Platform Leads</p>
                    <h3 className="text-[20px] md:text-[24px] font-bold text-white mt-1">{totalLeadsCount}</h3>
                  </div>
                </div>

                {/* Pending Setup — new */}
                <div className={`bg-white/[0.02] border p-5 rounded-xl flex items-center gap-4 relative overflow-hidden ${pendingSetupCount > 0 ? "border-amber-500/30 bg-amber-500/[0.03]" : "border-white/5"}`}>
                  <div className={`p-3 rounded-lg ${pendingSetupCount > 0 ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" : "bg-white/5 border border-white/10 text-white/30"}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/45 text-[11px] font-semibold uppercase tracking-wider">Pending Setup</p>
                    <h3 className={`text-[20px] md:text-[24px] font-bold mt-1 ${pendingSetupCount > 0 ? "text-amber-400" : "text-white"}`}>{pendingSetupCount}</h3>
                    {inProgressCount > 0 && <p className="text-[10px] text-white/30 mt-0.5">{inProgressCount} in progress</p>}
                  </div>
                </div>

              </div>
            )}

          {/* TAB 1: ANALYTICS CHARTS */}
          {activeTab === "analytics" && (
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Left Column: Line Graph Growth Trends */}
              <div className="lg:col-span-2 bg-[#0D0B21]/50 border border-white/5 p-6 rounded-2xl space-y-6">
                <div>
                  <h4 className="text-[16px] font-bold">Platform Metrics Trend</h4>
                  <p className="text-white/45 text-[12px] mt-1">Real-time cumulative registration and user activity log curves</p>
                </div>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getGrowthChartData()}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff/5" />
                      <XAxis dataKey="date" stroke="#ffffff/20" style={{ fontSize: 10 }} />
                      <YAxis stroke="#ffffff/20" style={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0D0B21", border: "1px solid rgba(255,255,255,0.08)" }} />
                      <Legend />
                      <Area type="monotone" name="Chats" dataKey="chats" stroke="#3B82F6" strokeWidth={2} fillOpacity={0} />
                      <Area type="monotone" name="Businesses" dataKey="businesses" stroke="#10B981" strokeWidth={2} fillOpacity={0} />
                      <Area type="monotone" name="Revenue (x100 ₦)" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Column: Source Attribution Pie Chart */}
              <div className="bg-[#0D0B21]/50 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-[16px] font-bold">Lead Acquisition Sources</h4>
                  <p className="text-white/45 text-[12px] mt-1">Attribution breakdown for registered clients</p>
                </div>
                
                <div className="h-[220px] w-full flex items-center justify-center relative my-4">
                  {getSourceDistributionData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getSourceDistributionData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {getSourceDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-white/20 text-[13px]">No signup attribution data yet</span>
                  )}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[28px] font-extrabold">{businesses.length}</span>
                    <span className="text-white/30 text-[10px] uppercase tracking-wider font-semibold">Total Client</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  {getSourceDistributionData().map((src, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }} />
                      <span className="text-white/60">{src.name}:</span>
                      <span className="font-bold">{src.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Broadcast Notification Panel */}
              <div className="lg:col-span-3 bg-[#0D0B21]/50 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1">
                  <h4 className="text-[15px] font-bold flex items-center gap-2 text-purple-400">
                    <Megaphone className="w-4 h-4" />
                    Internal Announcement Broadcaster
                  </h4>
                  <p className="text-white/45 text-[12px]">Broadcast updates, schedule maintenance messages directly to businesses or partners.</p>
                </div>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-[13px] px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap self-stretch md:self-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Compose Notice
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: AI ASSISTANTS (BUSINESSES) */}
          {activeTab === "businesses" && (
            <div className="space-y-6">
              
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center bg-[#0D0B21]/50 border border-white/5 rounded-lg px-4 py-2 w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-white/35 mr-3" />
                  <input
                    type="text"
                    placeholder="Search business name or ID..."
                    value={businessSearch}
                    onChange={(e) => setBusinessSearch(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none focus:ring-0 text-[13px] w-full placeholder:text-white/20"
                  />
                </div>
                <button
                  onClick={() => setShowAddBizModal(true)}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-[13px] px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Assistant
                </button>
              </div>

              {/* ── PENDING ONBOARDING QUEUE ───────────────────────────── */}
              {businesses.filter((b: any) => b.setup_status === "pending_setup" || b.setup_status === "in_progress").length > 0 && (
                <div className="bg-amber-500/[0.04] border border-amber-500/20 rounded-2xl overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-amber-500/10 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h4 className="text-[14px] font-bold text-amber-300 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Pending Onboarding Requests
                      </h4>
                      <p className="text-[12px] text-white/40 mt-0.5">
                        Businesses that submitted via /onboard — reach out and set them up
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/20">
                      {businesses.filter((b: any) => b.setup_status === "pending_setup" || b.setup_status === "in_progress").length} pending
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[12.5px] min-w-[700px]">
                      <thead>
                        <tr className="border-b border-amber-500/10 text-white/35 font-semibold text-[11px] uppercase tracking-wider">
                          <th className="p-4">Business / Owner</th>
                          <th className="p-4">WhatsApp</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Referral</th>
                          <th className="p-4">Submitted</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {businesses
                          .filter((b: any) => b.setup_status === "pending_setup" || b.setup_status === "in_progress")
                          .map((biz: any) => (
                            <tr key={biz.business_id} className="hover:bg-white/[0.01] transition-all">
                              <td className="p-4">
                                <p className="font-semibold text-white text-[13px]">{biz.name}</p>
                                <p className="text-white/40 text-[11px] mt-0.5">{biz.owner_name || "—"}</p>
                              </td>
                              <td className="p-4">
                                {biz.phone ? (
                                  <a href={`https://wa.me/${biz.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                                    className="text-green-400 hover:text-green-300 font-mono text-[12px] transition-colors">
                                    {biz.phone}
                                  </a>
                                ) : <span className="text-white/25">—</span>}
                              </td>
                              <td className="p-4 text-white/60 font-mono text-[11.5px]">{biz.email_contact || "—"}</td>
                              <td className="p-4">
                                {biz.referred_by_code ? (
                                  <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/20 text-purple-300 font-mono text-[10.5px]">
                                    {biz.referred_by_code}
                                  </span>
                                ) : <span className="text-white/25 text-[11px]">Direct</span>}
                              </td>
                              <td className="p-4 text-white/40 text-[11px]">
                                {biz.created_at ? new Date(biz.created_at).toLocaleDateString() : "—"}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  biz.setup_status === "in_progress"
                                    ? "bg-blue-500/15 border border-blue-500/20 text-blue-300"
                                    : "bg-amber-500/15 border border-amber-500/20 text-amber-300"
                                }`}>
                                  {biz.setup_status === "in_progress" ? "In Progress" : "Pending"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2 justify-end flex-wrap">
                                  {biz.setup_status === "pending_setup" && (
                                    <button
                                      onClick={async () => {
                                        const res = await updateBusinessSetupStatus(biz.business_id, "in_progress");
                                        if (res.success) { loadData(); showAlert("Updated", "Marked as In Progress", "success"); }
                                        else showAlert("Failed", res.error || "Update failed", "error");
                                      }}
                                      className="text-[11px] px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 transition-colors font-medium"
                                    >
                                      Start Setup
                                    </button>
                                  )}
                                  {(biz.setup_status === "pending_setup" || biz.setup_status === "in_progress") && (
                                    <button
                                      onClick={async () => {
                                        const res = await updateBusinessSetupStatus(biz.business_id, "live");
                                        if (res.success) { loadData(); showAlert("Live!", `${biz.name} is now live.`, "success"); }
                                        else showAlert("Failed", res.error || "Update failed", "error");
                                      }}
                                      className="text-[11px] px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-300 transition-colors font-medium"
                                    >
                                      Mark Live ✓
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Table / Grid */}
              <div className="bg-[#0D0B21]/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-white/5 text-white/35 font-semibold">
                        <th className="p-4">Business / Assistant</th>
                        <th className="p-4">Health Status</th>
                        <th className="p-4">KB Completeness</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4">Subscription</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBusinesses.map((b: any) => {
                        const analytics = getBusinessAnalytics(b.business_id, b.created_at);
                        return (
                          <tr key={b.business_id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                            <td className="p-4">
                              <div className="font-semibold text-white">{b.name}</div>
                              <div className="text-[11px] text-white/35 mt-0.5 font-mono">ID: {b.business_id}</div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${analytics.healthColor}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-currentColor" />
                                {analytics.healthScore}/100 — {analytics.healthLabel}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-white/5 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-[#8B5CF6] h-full rounded-full" style={{ width: `${analytics.kbCompletenessPercentage}%` }} />
                                </div>
                                <span className="font-mono text-white/60">{analytics.kbCompletenessPercentage}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-white/45">
                              {new Date(b.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                                b.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                b.status === "suspended" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}>
                                {b.status}
                              </span>
                              {b.payment_plan && (
                                <div className="text-[10px] text-white/50 mt-1 capitalize font-mono">
                                  Plan: {b.payment_plan}
                                </div>
                              )}
                              {b.renewal_date && (
                                <div className="text-[10px] text-white/30 mt-1 font-mono">
                                  Renews: {new Date(b.renewal_date).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedBusiness(b);
                                    setEditName(b.name || "");
                                    setEditPrompt(b.system_prompt || "");
                                    setEditKB(b.knowledge_base || "");
                                    setEditTheme(b.theme_color || "#3B82F6");
                                    setEditWhatsapp(b.whatsapp_phone || "");
                                    setEditEmail(b.email_contact || "");
                                    setEditStatus(b.status || "trial");
                                    setEditPaymentPlan(b.payment_plan || "trial");
                                    setEditInstallmentsPaid(b.installments_paid || 0);
                                    setEditRenewalDate(b.renewal_date ? b.renewal_date.substring(0, 10) : "");
                                  }}
                                  className="text-purple-400 hover:text-purple-300 font-semibold px-3 py-1.5 rounded bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                                >
                                  Manage Controls
                                </button>
                                <button
                                  onClick={() => handleDeleteBusiness(b.business_id)}
                                  className="text-white/30 hover:text-red-400 p-1.5 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredBusinesses.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-white/20">No matching business assistants found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: AMBASSADORS (PARTNERS) */}
          {activeTab === "partners" && (
            <div className="space-y-6">
              
              {/* Search Bar */}
              <div className="flex items-center bg-[#0D0B21]/50 border border-white/5 rounded-lg px-4 py-2 max-w-md">
                <Search className="w-4 h-4 text-white/35 mr-3" />
                <input
                  type="text"
                  placeholder="Search ambassador name or university..."
                  value={partnerSearch}
                  onChange={(e) => setPartnerSearch(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none focus:ring-0 text-[13px] w-full placeholder:text-white/20"
                />
              </div>

              {/* Table */}
              <div className="bg-[#0D0B21]/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-white/5 text-white/35 font-semibold">
                        <th className="p-4">Ambassador Details</th>
                        <th className="p-4">Institution Info</th>
                        <th className="p-4">Referral Code</th>
                        <th className="p-4">Activity Date</th>
                        <th className="p-4">Referred Deals</th>
                        <th className="p-4">Total Commission</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPartners.map((p: any) => {
                        const partnerReferrals = referrals.filter((r: any) => r.partner_id === p.id);
                        const payingCount = partnerReferrals.filter((r: any) => r.status === "paying").length;
                        const suspiciousCount = partnerReferrals.filter((r: any) => r.is_suspicious).length;

                        // Tiered commission payout calculator
                        let commission = 0;
                        const isAmb = p.is_ambassador || false;
                        for (let i = 1; i <= payingCount; i++) {
                          if (i >= 10) commission += 2500;
                          else if (i >= 5) commission += 2000;
                          else commission += isAmb ? 2000 : 1500;
                        }

                        return (
                          <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-white">{p.name}</div>
                                {p.is_ambassador && (
                                  <span className="text-[9px] font-bold tracking-wider uppercase bg-purple-500/10 border border-purple-500/30 text-[#c084fc] px-1.5 py-0.5 rounded">
                                    Ambassador
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-white/35 mt-0.5">{p.email}</div>
                              <div className="text-[11px] text-white/35 font-mono">{p.whatsapp}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-white/80">{p.university}</div>
                              <div className="text-[11px] text-white/35 mt-0.5">{p.faculty} — {p.department}</div>
                            </td>
                            <td className="p-4 font-mono font-bold text-[#a78bfa]">
                              {p.referral_code}
                            </td>
                            <td className="p-4 text-white/45">
                              {new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                            <td className="p-4 font-sans">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{payingCount} approved</span>
                                <span className="text-white/30">/</span>
                                <span className="text-white/45">{partnerReferrals.length} total</span>
                              </div>
                              {suspiciousCount > 0 && (
                                <div className="text-[10px] text-red-400 font-semibold mt-1 flex items-center gap-1">
                                  <span>⚠️</span> {suspiciousCount} suspicious
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-semibold text-emerald-400 font-mono">
                              ₦{commission.toLocaleString()}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => handleToggleAmbassadorStatus(p.id, !p.is_ambassador)}
                                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded transition-all border ${
                                    p.is_ambassador 
                                      ? "bg-purple-500/15 border-purple-500/35 text-purple-300 hover:bg-purple-500/25" 
                                      : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                                  }`}
                                >
                                  {p.is_ambassador ? "Make Partner" : "Make Ambassador"}
                                </button>
                                <button
                                  onClick={() => setSelectedPartnerReferrals(partnerReferrals)}
                                  className="text-purple-400 hover:text-purple-300 font-semibold px-3 py-1.5 rounded bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                                >
                                  View Referrals
                                </button>
                                <button
                                  onClick={() => handleDeletePartner(p.id)}
                                  className="text-white/30 hover:text-red-400 p-1.5 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPartners.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-white/20">No matching campus ambassadors found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: TRANSACTIONS & REVENUE */}
          {activeTab === "transactions" && (
            <div className="space-y-6">
              
              {/* Header and buttons */}
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="text-[16px] font-bold">Payments Ledger</h4>
                  <p className="text-white/45 text-[12px]">All completed setups, monthly software rentals, and manual additions.</p>
                </div>
                <button
                  onClick={() => setShowAddTxModal(true)}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-[13px] px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </button>
              </div>

              {/* Table */}
              <div className="bg-[#0D0B21]/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-white/5 text-white/35 font-semibold">
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4">Business / Account</th>
                        <th className="p-4">Payment Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t: any) => (
                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 font-mono text-white/45">
                            {t.id.substring(0, 13)}
                          </td>
                          <td className="p-4 font-semibold text-white">
                            {t.business_name}
                          </td>
                          <td className="p-4 text-white/45">
                            {new Date(t.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="p-4">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
                              {t.status}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-white font-mono">
                            ₦{Number(t.amount || 0).toLocaleString()}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteTx(t.id)}
                              className="text-white/30 hover:text-red-400 p-1.5 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-white/20">No transactions recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: WHATSAPP CONVERSATIONS */}
          {activeTab === "chats" && (
            <div className="space-y-6">
              
              {/* Search Bar */}
              <div className="flex items-center bg-[#0D0B21]/50 border border-white/5 rounded-lg px-4 py-2 max-w-md">
                <Search className="w-4 h-4 text-white/35 mr-3" />
                <input
                  type="text"
                  placeholder="Search telephone or business ID..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none focus:ring-0 text-[13px] w-full placeholder:text-white/20"
                />
              </div>

              {/* Table */}
              <div className="bg-[#0D0B21]/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-white/5 text-white/35 font-semibold">
                        <th className="p-4">User Contact (WhatsApp Phone)</th>
                        <th className="p-4">Assigned AI Assistant</th>
                        <th className="p-4">Total Messages Exchange</th>
                        <th className="p-4">Last Interaction Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChats.map((c: any) => (
                        <tr key={c.phone} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 font-mono font-bold text-white">
                            {c.phone}
                          </td>
                          <td className="p-4">
                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[11px] font-mono">
                              {c.business_id}
                            </span>
                          </td>
                          <td className="p-4 text-white/80 font-mono font-medium">
                            {(c.history || []).length} messages
                          </td>
                          <td className="p-4 text-white/45">
                            {new Date(c.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedChatHistory(c)}
                                className="text-purple-400 hover:text-purple-300 font-semibold px-3 py-1.5 rounded bg-purple-500/5 hover:bg-purple-500/10 transition-colors flex items-center gap-1"
                              >
                                <span>Read Log</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteChat(c.phone)}
                                className="text-white/30 hover:text-red-400 p-1.5 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredChats.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center p-8 text-white/20">No active conversations found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: AUDIT LOGS */}
          {activeTab === "activities" && (
            <div className="space-y-6">
              
              {/* Search Bar */}
              <div className="flex items-center bg-[#0D0B21]/50 border border-white/5 rounded-lg px-4 py-2 max-w-md">
                <Search className="w-4 h-4 text-white/35 mr-3" />
                <input
                  type="text"
                  placeholder="Filter logs by event type or text..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none focus:ring-0 text-[13px] w-full placeholder:text-white/20"
                />
              </div>

              {/* Log stream */}
              <div className="bg-[#0D0B21]/50 border border-white/5 rounded-2xl p-5 space-y-3 font-mono text-[12px] max-h-[500px] overflow-y-auto">
                {filteredActivities.map((act: any) => (
                  <div key={act.id} className="py-2 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[#a78bfa] font-bold font-mono">[{act.event_type.toUpperCase()}]</span>
                        {act.business_id && (
                          <span className="bg-white/5 text-white/60 px-1.5 py-0.5 rounded text-[10px]">Client: {act.business_id}</span>
                        )}
                      </div>
                      <p className="text-white/80">{act.description}</p>
                    </div>
                    <span className="text-white/30 text-[11px] whitespace-nowrap">
                      {new Date(act.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
                {filteredActivities.length === 0 && (
                  <div className="text-center p-8 text-white/20">No system events logged in audit trails.</div>
                )}
              </div>

            </div>
          )}

          {/* TAB 7: ERROR MONITORING */}
          {activeTab === "errors" && (
            <div className="space-y-6">
              
              {/* Header and clear */}
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="text-[16px] font-bold">Exceptions Tracker</h4>
                  <p className="text-white/45 text-[12px]">Tracks active webhooks errors, AI model failures, or Supabase anomalies.</p>
                </div>
                <button
                  onClick={handleClearErrors}
                  className="border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-white font-semibold text-[13px] px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Exceptions
                </button>
              </div>

              {/* Table */}
              <div className="bg-[#0D0B21]/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-white/5 text-white/35 font-semibold">
                        <th className="p-4">Occurred Date</th>
                        <th className="p-4">Failed Area</th>
                        <th className="p-4">Message Log</th>
                        <th className="p-4">Details / Stack</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errors.map((e: any) => (
                        <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 text-white/45 font-mono whitespace-nowrap">
                            {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="p-4">
                            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase font-mono">
                              {e.source}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-white">
                            {e.message}
                          </td>
                          <td className="p-4 font-mono text-white/45 text-[11px] max-w-xs truncate" title={e.details}>
                            {e.details || "None provided"}
                          </td>
                        </tr>
                      ))}
                      {errors.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center p-8 text-white/20">Clean build: No error exception events detected.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: VERCEL LOGS */}
          {activeTab === "vercel_logs" && (
            <div className="space-y-6">
              
              {/* Header and Refresh */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h4 className="text-[16px] font-bold">Vercel Runtime Logs</h4>
                  <p className="text-white/45 text-[12px]">Direct live console log events from your Vercel server deployment.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center bg-[#0D0B21]/50 border border-white/5 rounded-lg px-4 py-2 w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-white/35 mr-3" />
                    <input
                      type="text"
                      placeholder="Filter logs (e.g. error, fetch, llama)..."
                      value={vercelLogsSearch}
                      onChange={(e) => setVercelLogsSearch(e.target.value)}
                      className="bg-transparent border-none text-white focus:outline-none focus:ring-0 text-[13px] w-full placeholder:text-white/20"
                    />
                  </div>
                  <button
                    onClick={loadVercelLogs}
                    disabled={loadingVercelLogs}
                    className="border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-[13px] px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                  >
                    <svg className={`w-4 h-4 ${loadingVercelLogs ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
                    </svg>
                    {loadingVercelLogs ? "Refreshing..." : "Refresh Logs"}
                  </button>
                </div>
              </div>

              {/* Vercel Configuration Missing Wizard */}
              {vercelLogsConfigError && (
                <div className="bg-amber-500/[0.03] border border-amber-500/20 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-amber-400">
                    <AlertTriangle className="w-6 h-6" />
                    <h5 className="font-bold text-[15px]">Connect Vercel Integration Required</h5>
                  </div>
                  <div className="text-[13px] text-white/70 space-y-2 leading-relaxed">
                    <p>To pull runtime console logs and API errors directly into this dashboard panel, you must configure your Vercel Project keys in your environment variables:</p>
                    <ol className="list-decimal pl-5 space-y-2 text-white/80 font-mono text-[12px] bg-black/30 p-4 rounded-xl border border-white/5">
                      <li>
                        <strong className="text-white">VERCEL_AUTH_TOKEN</strong>: Your Vercel Personal Access Token. Create one in your{" "}
                        <a href="https://vercel.com/account/tokens" target="_blank" rel="noreferrer" className="text-[#8B5CF6] underline hover:text-[#7C3AED]">
                          Vercel Account Settings &rarr; Tokens
                        </a>.
                      </li>
                      <li>
                        <strong className="text-white">VERCEL_PROJECT_ID</strong>: The project identifier. Found in Vercel project settings, or under your repository details.
                      </li>
                      <li>
                        <strong className="text-white">VERCEL_TEAM_ID</strong>: (Optional) Required only if your project belongs to a Vercel Organization / Team account instead of a personal hobby plan.
                      </li>
                    </ol>
                    <p className="pt-2 text-[12px] text-white/50">Once you add these to your environment configuration (e.g. Vercel dashboard Env Variables or local `.env` file), redeploy or restart your server to apply them.</p>
                  </div>
                </div>
              )}

              {/* Vercel Logs Error */}
              {vercelLogsError && !vercelLogsConfigError && (
                <div className="bg-red-500/[0.03] border border-red-500/20 rounded-2xl p-6 flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-[13px]">
                    <span className="font-bold">Error retrieving Vercel logs:</span> {vercelLogsError}
                  </div>
                </div>
              )}

              {/* Live Terminal Output */}
              {!vercelLogsConfigError && !vercelLogsError && (
                <div className="bg-[#020014] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  {/* Console Header */}
                  <div className="bg-[#09071A] px-4 py-3 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-white/30">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="ml-2 font-bold text-white/40">VERCEL_LOG_DRAIN // DEPLOYMENT_STREAM</span>
                    </div>
                    <div>
                      {vercelLogs.length > 0 && (
                        <span>Showing {vercelLogs.filter(log => {
                          if (!vercelLogsSearch) return true;
                          const s = vercelLogsSearch.toLowerCase();
                          return (log.message || "").toLowerCase().includes(s) || (log.level || "").toLowerCase().includes(s);
                        }).length} logs</span>
                      )}
                    </div>
                  </div>

                  {/* Terminal Rows */}
                  <div className="p-4 max-h-[600px] overflow-y-auto font-mono text-[12.5px] leading-relaxed space-y-1.5 scrollbar-thin select-text">
                    {vercelLogs.filter(log => {
                      if (!vercelLogsSearch) return true;
                      const s = vercelLogsSearch.toLowerCase();
                      return (log.message || "").toLowerCase().includes(s) || (log.level || "").toLowerCase().includes(s) || (log.requestPath || "").toLowerCase().includes(s);
                    }).map((log, idx) => {
                      const hasError = log.level === "error" || (log.message || "").toLowerCase().includes("error") || (log.message || "").toLowerCase().includes("fail") || (log.message || "").toLowerCase().includes("deprecated");
                      const hasWarn = log.level === "warn" || (log.message || "").toLowerCase().includes("warning");
                      const isExpanded = expandedLogId === `${log.rowId}-${idx}`;
                      
                      let badgeColor = "bg-white/5 border-white/10 text-white/50";
                      if (log.level === "error" || hasError) badgeColor = "bg-red-500/10 border-red-500/20 text-red-400";
                      else if (log.level === "warn" || hasWarn) badgeColor = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                      else if (log.level === "info") badgeColor = "bg-blue-500/10 border-blue-500/20 text-blue-400";

                      const timestamp = log.timestampInMs 
                        ? new Date(log.timestampInMs).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
                        : "LOG";

                      return (
                        <div key={`${log.rowId}-${idx}`} className="group border-b border-white/[0.02] last:border-b-0 pb-1.5 last:pb-0">
                          <div 
                            onClick={() => setExpandedLogId(isExpanded ? null : `${log.rowId}-${idx}`)}
                            className="flex items-start gap-3 hover:bg-white/[0.02] p-1.5 rounded cursor-pointer transition-colors"
                          >
                            <span className="text-white/20 select-none text-[11px] pt-0.5">{timestamp}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase font-mono flex-shrink-0 ${badgeColor}`}>
                              {log.level || "LOG"}
                            </span>
                            
                            <div className="flex-1 min-w-0">
                              {log.requestPath && (
                                <span className="text-purple-400 text-[11px] mr-2 font-semibold">
                                  [{log.requestMethod || "GET"} {log.requestPath}] {log.responseStatusCode ? `(Status: ${log.responseStatusCode})` : ""}
                                </span>
                              )}
                              <span className={`break-all ${hasError ? 'text-red-300 font-semibold' : hasWarn ? 'text-amber-300' : 'text-white/80'}`}>
                                {log.message || (log.requestPath ? `Request to ${log.requestPath} handled successfully.` : "Log event captured without message payload.")}
                              </span>
                            </div>
                          </div>

                          {/* Expanded detail section */}
                          {isExpanded && (
                            <div className="ml-12 mr-2 my-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg text-[11.5px] text-white/60 space-y-1.5 overflow-x-auto">
                              <div className="text-white/40 border-b border-white/5 pb-1 mb-1 font-bold text-[10px] uppercase">Log Details Metadata</div>
                              <div><strong>Source:</strong> {log.source || "Unknown"}</div>
                              {log.domain && <div><strong>Domain:</strong> {log.domain}</div>}
                              {log.requestPath && (
                                <>
                                  <div><strong>Path:</strong> {log.requestPath}</div>
                                  <div><strong>Method:</strong> {log.requestMethod}</div>
                                  {log.responseStatusCode && <div><strong>Status:</strong> {log.responseStatusCode}</div>}
                                </>
                              )}
                              <div><strong>Timestamp:</strong> {log.timestampInMs ? new Date(log.timestampInMs).toISOString() : "N/A"}</div>
                              <div className="mt-2 text-white/30 text-[10.5px]">Click logging row again to collapse.</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {vercelLogs.length === 0 && !loadingVercelLogs && (
                      <div className="text-center py-12 text-white/20">No runtime console logs fetched. Click "Refresh Logs" to query.</div>
                    )}
                    {loadingVercelLogs && vercelLogs.length === 0 && (
                      <div className="text-center py-12 text-white/30 flex flex-col items-center justify-center gap-2">
                        <svg className="animate-spin h-6 w-6 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Retrieving deployment stream...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 8: BLOG POSTS */}
          {activeTab === "blog" && (
            <div className="space-y-6">
              
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center bg-[#0D0B21]/50 border border-white/5 rounded-lg px-4 py-2 w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-white/35 mr-3" />
                  <input
                    type="text"
                    placeholder="Search post title or slug..."
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none focus:ring-0 text-[13px] w-full placeholder:text-white/20"
                  />
                </div>
                <button
                  onClick={() => {
                    setSelectedBlogPost(null);
                    setBlogTitle("");
                    setBlogExcerpt("");
                    setBlogContent("");
                    setBlogCoverImage("");
                    setBlogCategory("AI & Tech");
                    setBlogTags("");
                    setBlogSources("");
                    setBlogSeoTitle("");
                    setBlogSeoDescription("");
                    setBlogStatus("draft");
                    setBlogAuthorName("ReplyIQ Team");
                    setBlogAuthorAvatar("");
                    setShowAddBlogModal(true);
                  }}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-[13px] px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Article
                </button>
              </div>

              {/* Table */}
              <div className="bg-[#0D0B21]/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-white/5 text-white/35 font-semibold">
                        <th className="p-4">Article Title</th>
                        <th className="p-4">Author</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogPosts
                        .filter((post: any) =>
                          post.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
                          post.slug.toLowerCase().includes(blogSearch.toLowerCase())
                        )
                        .map((post: any) => (
                          <tr key={post.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                            <td className="p-4">
                              <div className="font-semibold text-white">{post.title}</div>
                              <div className="text-[11px] text-white/35 mt-0.5 font-mono">/{post.slug}</div>
                            </td>
                            <td className="p-4 text-white/80">
                              {post.author_name}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                                post.status === "published" 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}>
                                {post.status}
                              </span>
                              {post.published_at && (
                                <div className="text-[10px] text-white/30 mt-1 font-mono">
                                  Published: {new Date(post.published_at).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-white/45">
                              {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {post.status === "published" && (
                                  <>
                                    <button
                                      onClick={() => handleBroadcastToTelegram(post.id, post.title)}
                                      className="text-sky-400 hover:text-sky-300 text-[12px] font-semibold px-2 py-1 rounded bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-colors flex items-center gap-1"
                                      title="Broadcast this article to your Telegram group"
                                    >
                                      <Send className="w-3 h-3" />
                                      <span>Telegram</span>
                                    </button>
                                    <button
                                      onClick={() => handleBroadcastToLinkedIn(post.id, post.title)}
                                      className="text-blue-400 hover:text-blue-300 text-[12px] font-semibold px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                                      title="Share this article to ReplyIQ LinkedIn Company Page"
                                    >
                                      <Share2 className="w-3 h-3" />
                                      <span>LinkedIn</span>
                                    </button>
                                    <a
                                      href={`/blog/${post.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#8B5CF6] hover:text-[#7C3AED] text-[12px] font-semibold px-2 py-1 rounded bg-[#8B5CF6]/5 border border-[#8B5CF6]/10 transition-colors"
                                    >
                                      View Page
                                    </a>
                                  </>
                                )}
                                <button
                                  onClick={() => handleEditBlogPost(post)}
                                  className="text-purple-400 hover:text-purple-300 font-semibold px-3 py-1.5 rounded bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteBlog(post.id)}
                                  className="text-white/30 hover:text-red-400 p-1.5 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {blogPosts.filter((post: any) =>
                        post.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
                        post.slug.toLowerCase().includes(blogSearch.toLowerCase())
                      ).length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center p-8 text-white/20">No matching articles found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8.2: AGENT DRAFTS QUEUE */}
          {activeTab === "agent_drafts" && (
            <div className="space-y-6">
              
              {/* Top Bar with Status and Toggle */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0D0B21]/60 border border-white/5 p-5 rounded-2xl backdrop-blur-xl">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Automated Agent Drafts
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Review and curate incoming Nigerian tech news and startup briefs ingested by n8n / Make webhooks.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                    agentPaused 
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${agentPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
                    <span>{agentPaused ? "Ingestion Paused (403)" : "Ingestion Active (200)"}</span>
                  </div>

                  <button
                    onClick={handleToggleAgentPause}
                    disabled={togglingAgent}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
                      agentPaused
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {togglingAgent ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : agentPaused ? (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>{agentPaused ? "Resume Ingestion" : "Pause Agent Ingestion"}</span>
                  </button>

                  <button
                    onClick={handleTriggerCuration}
                    disabled={curatingNews || agentPaused}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
                    title="Scrape feeds and generate daily brief draft now"
                  >
                    {curatingNews ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>{curatingNews ? "Curating News..." : "Curate Daily Brief Now"}</span>
                  </button>

                  <button
                    onClick={loadAgentDraftsData}
                    disabled={loadingDrafts}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                    title="Refresh Drafts"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingDrafts ? "animate-spin text-purple-400" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Telegram Community Auto-Broadcast Connection Card */}
              <div className="bg-[#0D0B21]/60 border border-sky-500/20 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-white">Telegram Group Auto-Broadcast</h4>
                    <span className="text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-full">
                      Connected via Env
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Approved daily briefs automatically broadcast to your Telegram community with cover card and direct links.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={handleTestTelegramGroup}
                    disabled={testingTelegramGroup}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold whitespace-nowrap transition-all shadow-md shadow-sky-600/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {testingTelegramGroup ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Test Group Ping</span>
                  </button>
                </div>
              </div>

              {/* LinkedIn Auto-Broadcast Connection Card */}
              <div className="bg-[#0D0B21]/60 border border-blue-500/20 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-white">LinkedIn Auto-Broadcast</h4>
                    <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full">
                      Connected via Env
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Approved daily briefs automatically broadcast to LinkedIn with link preview, SME breakdown, and ReplyIQ branding.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={handleTestLinkedIn}
                    disabled={testingLinkedIn}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {testingLinkedIn ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    <span>Test LinkedIn Connection</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center bg-[#0D0B21]/50 border border-white/5 rounded-lg px-4 py-2 w-full sm:max-w-md">
                <Search className="w-4 h-4 text-white/35 mr-3" />
                <input
                  type="text"
                  placeholder="Filter pending drafts by title or slug..."
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none focus:ring-0 text-[13px] w-full placeholder:text-white/20"
                />
              </div>

              {/* Drafts Table */}
              <div className="bg-[#0D0B21]/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-white/5 text-white/35 font-semibold">
                        <th className="p-4">Draft Article</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Sources</th>
                        <th className="p-4">Ingested At</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentDrafts
                        .filter((d: any) =>
                          d.title.toLowerCase().includes(draftSearch.toLowerCase()) ||
                          d.slug.toLowerCase().includes(draftSearch.toLowerCase())
                        )
                        .map((draft: any) => (
                          <tr key={draft.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 max-w-md">
                              <div className="font-semibold text-white line-clamp-1">{draft.title}</div>
                              <div className="text-[11px] text-white/35 mt-0.5 font-mono">/{draft.slug}</div>
                              {draft.excerpt && (
                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{draft.excerpt}</p>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 whitespace-nowrap">
                                {draft.category || "AI & Tech"}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400 text-xs">
                              {Array.isArray(draft.source_urls) && draft.source_urls.length > 0 ? (
                                <span className="font-mono">{draft.source_urls.length} link{draft.source_urls.length > 1 ? "s" : ""}</span>
                              ) : (
                                <span className="text-white/20">—</span>
                              )}
                            </td>
                            <td className="p-4 text-white/45 text-xs font-mono whitespace-nowrap">
                              {new Date(draft.created_at).toLocaleString("en-NG", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenPreview(draft.id)}
                                  className="text-amber-300 hover:text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-colors flex items-center gap-1"
                                  title="Open secret preview in new tab"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  onClick={() => handleEditBlogPost(draft)}
                                  className="text-purple-300 hover:text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleApproveDraft(draft.id)}
                                  className="text-white bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectDraft(draft.id)}
                                  className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {agentDrafts.filter((d: any) =>
                        d.title.toLowerCase().includes(draftSearch.toLowerCase()) ||
                        d.slug.toLowerCase().includes(draftSearch.toLowerCase())
                      ).length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-white/30">
                            <Sparkles className="w-8 h-8 text-white/10 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">No pending agent drafts in queue.</p>
                            <p className="text-xs text-white/25 mt-1">Articles posted by your n8n or Make webhooks will show up here for one-click approval.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8.5: NEWSLETTER MANAGER */}
          {activeTab === "newsletter" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-400" />
                    Newsletter Manager
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Compose styled emails and broadcast updates to your subscriber base.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#0D0B21]/50 border border-white/5 px-4 py-2 rounded-xl text-slate-300 text-sm">
                    Total Subscribers: <span className="text-purple-400 font-bold">{subscribersList.length}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COMPOSE SECTION */}
                <div className="lg:col-span-7 bg-[#0D0B21]/40 border border-white/5 p-6 rounded-2xl space-y-6 backdrop-blur-xl">
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="font-bold text-white text-base">Compose Broadcast</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Draft the message body. HTML and linebreaks are supported.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject Line</label>
                      <input
                        type="text"
                        placeholder="e.g. Introducing Automated Live Chat Widgets!"
                        value={newsletterSubject}
                        onChange={(e) => setNewsletterSubject(e.target.value)}
                        className="w-full bg-[#030014]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Additional/Manual Recipients (Optional, comma-separated)
                      </label>
                      <textarea
                        rows={2}
                        disabled={newsletterTarget === "subscribers"}
                        placeholder={
                          newsletterTarget === "subscribers"
                            ? "Manual input is disabled under Subscribers Only selection"
                            : "e.g. email1@domain.com, email2@domain.com (allows sending to non-subscribers)"
                        }
                        value={customRecipients}
                        onChange={(e) => setCustomRecipients(e.target.value)}
                        className="w-full bg-[#030014]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all resize-y disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Recipient Target Group
                      </label>
                      <select
                        value={newsletterTarget}
                        onChange={(e) => setNewsletterTarget(e.target.value as any)}
                        className="w-full bg-[#030014]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all cursor-pointer"
                      >
                        <option value="both" className="bg-[#0D0B21]">Both (Subscribers + Additional Manual Emails)</option>
                        <option value="subscribers" className="bg-[#0D0B21]">Subscribers Only (Ignore Manual Field)</option>
                        <option value="manual" className="bg-[#0D0B21]">Manual Inputs Only (Ignore Existing Subscribers)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Body (HTML/Text)</label>
                      <textarea
                        rows={10}
                        placeholder="Draft your email content here. You can use standard HTML markup tags like <p>, <a>, <strong>, <ul>, etc."
                        value={newsletterBody}
                        onChange={(e) => setNewsletterBody(e.target.value)}
                        className="w-full bg-[#030014]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 font-mono transition-all resize-y"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Sent from: support@replyiq.cv
                    </div>
                    <button
                      onClick={handleSendNewsletter}
                      disabled={
                        isSendingNewsletter ||
                        (newsletterTarget === "subscribers" && subscribersList.length === 0) ||
                        (newsletterTarget === "manual" && !customRecipients.trim()) ||
                        (newsletterTarget === "both" && subscribersList.length === 0 && !customRecipients.trim())
                      }
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSendingNewsletter ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending Broadcast...
                        </>
                      ) : (
                        <>
                          <Megaphone className="w-4 h-4" />
                          Send Broadcast
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* PREVIEW & SUBSCRIBERS */}
                <div className="lg:col-span-5 space-y-6">
                  {/* PREVIEW */}
                  <div className="bg-[#0D0B21]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
                    <h4 className="font-bold text-white text-sm border-b border-white/5 pb-3 mb-4">Live Design Preview</h4>
                    <div className="bg-[#030014] rounded-xl border border-white/5 overflow-hidden">
                      <div className="p-4 bg-[#030014] border-b border-white/5 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                        <span className="text-[10px] text-slate-500 ml-2 font-mono">ReplyIQ Email Sandbox</span>
                      </div>
                      <div className="p-5 bg-[#060810] text-center max-h-[300px] overflow-y-auto scrollbar-thin">
                        <div className="bg-[#030014] py-3 px-4 rounded-xl inline-block mb-5 border border-white/5">
                          <img src="https://replyiq.cv/logo.png" alt="ReplyIQ" className="h-6 mx-auto" />
                        </div>
                        <h2 className="text-base font-bold text-purple-400 mb-3 text-left">
                          {newsletterSubject || "Subject Line Placeholder"}
                        </h2>
                        <div 
                          className="text-xs text-slate-300 text-left line-clamp-6 leading-relaxed space-y-2"
                          dangerouslySetInnerHTML={{ 
                            __html: newsletterBody.replace(/\n/g, "<br/>") || "Design canvas is ready. Draft something to preview." 
                          }} 
                        />
                        <div className="border-t border-white/5 mt-5 pt-4">
                          <p className="text-[9px] text-slate-500 leading-normal">
                            You are receiving this because you subscribed to the ReplyIQ newsletter.
                          </p>
                          <p className="text-[9px] text-slate-600 mt-1">
                            ReplyIQ Inc. • support@replyiq.cv
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUBSCRIBERS LIST */}
                  <div className="bg-[#0D0B21]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl flex flex-col max-h-[400px]">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                      <h4 className="font-bold text-white text-sm">Subscriber Base</h4>
                      <div className="relative w-40">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={subscriberSearch}
                          onChange={(e) => setSubscriberSearch(e.target.value)}
                          className="w-full bg-[#030014]/60 border border-white/10 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                        />
                      </div>
                    </div>

                    <div className="overflow-y-auto flex-1 scrollbar-thin pr-1 space-y-2">
                      {filteredSubscribers.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-xs">
                          No subscribers found.
                        </div>
                      ) : (
                        filteredSubscribers.map((sub: any) => (
                          <div key={sub.id} className="flex justify-between items-center p-3 bg-[#030014]/40 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                            <div className="truncate pr-2">
                              <p className="text-xs font-medium text-slate-200 truncate">{sub.email}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {new Date(sub.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteSubscriber(sub.id)}
                              className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                              title="Unsubscribe"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8.6: AMBASSADOR MAILER */}
          {activeTab === "ambassador_mailer" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-purple-400" />
                    Ambassador Mailer
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Send personalized onboarding and welcome emails to offline onboarded campus ambassadors.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COMPOSE SECTION */}
                <div className="lg:col-span-7 bg-[#0D0B21]/40 border border-white/5 p-6 rounded-2xl space-y-6 backdrop-blur-xl">
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="font-bold text-white text-base">Compose Ambassador Welcome</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Send a personalized email. The subject and body will be sent exactly as composed.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Ambassador Quick Select Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Existing Partner (Pre-fills email)</label>
                      <select
                        value={selectedAmbassadorId}
                        onChange={(e) => handleSelectAmbassador(e.target.value)}
                        className="w-full bg-[#030014]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all cursor-pointer"
                      >
                        <option value="" className="bg-[#0D0B21]">-- Choose Partner (Optional) --</option>
                        {partners.map((p: any) => (
                          <option key={p.id} value={p.id} className="bg-[#0D0B21]">
                            {p.name} ({p.email}) {p.is_ambassador ? "[Ambassador]" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recipient Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. john@university.edu"
                        value={ambassadorEmail}
                        onChange={(e) => setAmbassadorEmail(e.target.value)}
                        className="w-full bg-[#030014]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject Line</label>
                      <input
                        type="text"
                        placeholder="e.g. Welcome to ReplyIQ!"
                        value={ambassadorSubject}
                        onChange={(e) => setAmbassadorSubject(e.target.value)}
                        className="w-full bg-[#030014]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Body (HTML/Text with newlines preserved)</label>
                      <textarea
                        rows={10}
                        placeholder="Draft the onboarding details..."
                        value={ambassadorBody}
                        onChange={(e) => setAmbassadorBody(e.target.value)}
                        className="w-full bg-[#030014]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 font-mono transition-all resize-y"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Sent from: support@replyiq.cv
                    </div>
                    <button
                      onClick={handleSendAmbassadorEmail}
                      disabled={isSendingAmbassadorEmail || !ambassadorEmail.trim()}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSendingAmbassadorEmail ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending Onboarding Email...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Onboarding Email
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* PREVIEW */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-[#0D0B21]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
                    <h4 className="font-bold text-white text-sm border-b border-white/5 pb-3 mb-4 font-sans">Live Design Preview</h4>
                    <div className="bg-[#030014] rounded-xl border border-white/5 overflow-hidden">
                      <div className="p-4 bg-[#030014] border-b border-white/5 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                        <span className="text-[10px] text-slate-500 ml-2 font-mono">ReplyIQ Email Sandbox</span>
                      </div>
                      <div className="p-5 bg-[#060810] text-center max-h-[450px] overflow-y-auto scrollbar-thin">
                        <div className="bg-[#030014] py-3 px-4 rounded-xl inline-block mb-5 border border-white/5">
                          <img src="https://replyiq.cv/logo.png" alt="ReplyIQ" className="h-6 mx-auto" />
                        </div>
                        <h2 className="text-base font-bold text-purple-400 mb-3 text-left font-sans">
                          {ambassadorSubject || "(No Subject)"}
                        </h2>
                        <div 
                          className="text-xs text-slate-300 text-left leading-relaxed space-y-2 font-sans"
                          dangerouslySetInnerHTML={{ 
                            __html: ambassadorBody ? ambassadorBody.replace(/\n/g, "<br/>") : '<span class="text-slate-500">(Empty message body)</span>'
                          }} 
                        />
                        <div className="border-t border-white/5 mt-5 pt-4">
                          <p className="text-[9px] text-slate-500 leading-normal">
                            This onboarding message was generated for the ReplyIQ Campus Partner Ambassador.
                          </p>
                          <p className="text-[9px] text-slate-600 mt-1">
                            ReplyIQ Inc. • support@replyiq.cv
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LEAD OUTREACH & TRACKING */}
          {activeTab === "marketing_leads" && (
            <div className="space-y-6">
              
              {/* Header and Stats Cards */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-purple-400" />
                    Lead Outreach & Tracking
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Upload prospect lists via CSV, auto-generate sales emails using web scraping, and broadcast cold pitches.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClearAllLeads}
                    disabled={marketingLeads.length === 0}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-40"
                  >
                    Clear All Leads
                  </button>
                </div>
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0D0B21]/40 border border-white/5 p-5 rounded-2xl relative overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Prospects</p>
                  <p className="text-3xl font-black text-white mt-2">{marketingLeads.length}</p>
                </div>

                <div className="bg-[#0D0B21]/40 border border-white/5 p-5 rounded-2xl relative overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Outreach</p>
                  <p className="text-3xl font-black text-blue-400 mt-2">
                    {marketingLeads.filter((l: any) => l.status === "pending" || l.status === "failed" || l.status === "fetching").length}
                  </p>
                </div>

                <div className="bg-[#0D0B21]/40 border border-white/5 p-5 rounded-2xl relative overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Pitch Prepped</p>
                  <p className="text-3xl font-black text-amber-400 mt-2">
                    {marketingLeads.filter((l: any) => l.status === "fetched").length}
                  </p>
                </div>

                <div className="bg-[#0D0B21]/40 border border-white/5 p-5 rounded-2xl relative overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contacted / Sent</p>
                  <p className="text-3xl font-black text-emerald-400 mt-2">
                    {marketingLeads.filter((l: any) => l.status === "sent").length}
                  </p>
                </div>
              </div>

              {/* Main Directory Container */}
              <div className="bg-[#0D0B21]/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                
                {/* Search & Tabs Toolbar */}
                <div className="p-5 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#030014]/40">
                  {/* Directory Tabs */}
                  <div className="flex bg-[#030014]/60 border border-white/10 rounded-xl p-1 w-full md:w-auto overflow-x-auto">
                    <button
                      onClick={() => {
                        setMarketingDirectory("pending");
                        setMarketingPage(1);
                        setSelectedMarketingLeads([]);
                      }}
                      className={`flex-shrink-0 text-xs font-semibold px-5 py-2.5 rounded-lg transition-all ${
                        marketingDirectory === "pending"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Pending ({marketingLeads.filter((l: any) => l.status === "pending" || l.status === "failed" || l.status === "fetching").length})
                    </button>
                    <button
                      onClick={() => {
                        setMarketingDirectory("drafted");
                        setMarketingPage(1);
                        setSelectedMarketingLeads([]);
                      }}
                      className={`flex-shrink-0 text-xs font-semibold px-5 py-2.5 rounded-lg transition-all ${
                        marketingDirectory === "drafted"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      AI Prepped ({marketingLeads.filter((l: any) => l.status === "fetched").length})
                    </button>
                    <button
                      onClick={() => {
                        setMarketingDirectory("sent");
                        setMarketingPage(1);
                        setSelectedMarketingLeads([]);
                      }}
                      className={`flex-shrink-0 text-xs font-semibold px-5 py-2.5 rounded-lg transition-all ${
                        marketingDirectory === "sent"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Sent Directory ({marketingLeads.filter((l: any) => l.status === "sent").length})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="flex items-center bg-[#030014]/60 border border-white/10 rounded-xl px-4 py-2.5 w-full md:max-w-xs transition-all focus-within:border-purple-500/50">
                    <Search className="w-4 h-4 text-slate-500 mr-2.5" />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={marketingSearch}
                      onChange={(e) => {
                        setMarketingSearch(e.target.value);
                        setMarketingPage(1);
                      }}
                      className="bg-transparent border-none text-white focus:outline-none text-[13px] w-full placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* CSV File Upload Section (Only shown in Pending Directory when list is empty) */}
                {marketingDirectory === "pending" && marketingLeads.filter((l: any) => l.status === "pending" || l.status === "failed" || l.status === "fetching").length === 0 && (
                  <div className="p-10 border-b border-white/5 text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                      <Mail className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="text-white font-bold text-base">Import Outreach Prospect List</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
                      Upload a CSV file containing columns: <span className="font-semibold text-purple-300">Name, Category, Address, Phone, Website, Email, Source</span>.
                    </p>
                    <label className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/10 animate-none">
                      {uploadingCSV ? "Uploading & Parsing..." : "Upload CSV File"}
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                        disabled={uploadingCSV}
                      />
                    </label>
                  </div>
                )}

                {/* Local computations for directory tabs & search filtering */}
                {(() => {
                  const directoryLeads = marketingLeads.filter((l: any) => {
                    if (marketingDirectory === "pending") {
                      return l.status === "pending" || l.status === "failed" || l.status === "fetching";
                    }
                    if (marketingDirectory === "drafted") {
                      return l.status === "fetched";
                    }
                    return l.status === "sent";
                  });

                  const searchedLeads = directoryLeads.filter((l: any) => {
                    const search = marketingSearch.toLowerCase();
                    return (
                      l.name.toLowerCase().includes(search) ||
                      l.email.toLowerCase().includes(search) ||
                      (l.category && l.category.toLowerCase().includes(search)) ||
                      (l.website && l.website.toLowerCase().includes(search))
                    );
                  });

                  const PAGE_SIZE = 50;
                  const totalPages = Math.ceil(searchedLeads.length / PAGE_SIZE) || 1;
                  const paginatedLeads = searchedLeads.slice(
                    (marketingPage - 1) * PAGE_SIZE,
                    marketingPage * PAGE_SIZE
                  );

                  return (
                    <>
                      {/* Action Bar (When rows are selected) */}
                      {selectedMarketingLeads.length > 0 && (
                        <div className="bg-purple-950/20 border-b border-purple-500/20 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="text-xs text-purple-200">
                            Selected <span className="font-bold text-white">{selectedMarketingLeads.length}</span> lead{selectedMarketingLeads.length > 1 ? 's' : ''} (Max 10 per batch)
                          </div>
                          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            {marketingDirectory === "pending" && (
                              <button
                                onClick={handleEnrichLeads}
                                disabled={isScrapingLeads || isSendingLeads || selectedMarketingLeads.length > 10}
                                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-40 flex items-center gap-1.5"
                              >
                                {isScrapingLeads ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    Generating Pitches...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Enrich via AI
                                  </>
                                )}
                              </button>
                            )}
                            {marketingDirectory === "drafted" && (
                              <button
                                onClick={handleSendOutbound}
                                disabled={isScrapingLeads || isSendingLeads || selectedMarketingLeads.length > 10}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-40 flex items-center gap-1.5"
                              >
                                {isSendingLeads ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3.5 h-3.5" />
                                    Send Outreach
                                  </>
                                )}
                              </button>
                            )}
                            {marketingDirectory === "sent" && (
                              <button
                                onClick={handleSendOutbound}
                                disabled={isScrapingLeads || isSendingLeads || selectedMarketingLeads.length > 10}
                                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-40 flex items-center gap-1.5"
                              >
                                {isSendingLeads ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    Resending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3.5 h-3.5" />
                                    Resend Outreach
                                  </>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedMarketingLeads([])}
                              className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-3 py-2 rounded-lg border border-white/5 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Table View */}
                      {searchedLeads.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-[12.5px] min-w-[900px]">
                            <thead>
                              <tr className="border-b border-white/5 text-white/35 font-semibold text-[11px] uppercase tracking-wider bg-[#030014]/20">
                                <th className="px-6 py-4 w-12 text-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      paginatedLeads.length > 0 &&
                                      paginatedLeads.slice(0, 10).every((l: any) => selectedMarketingLeads.includes(l.id))
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const batch = paginatedLeads.slice(0, 10).map((l: any) => l.id);
                                        setSelectedMarketingLeads(batch);
                                      } else {
                                        setSelectedMarketingLeads([]);
                                      }
                                    }}
                                    className="w-3.5 h-3.5 rounded border-white/10 bg-[#030014] text-purple-600 focus:ring-purple-500/50"
                                  />
                                </th>
                                <th className="px-6 py-4">Business / Email</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Website</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4 min-w-[160px]">Outreach Status</th>
                                <th className="px-6 py-4 min-w-[270px] text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {paginatedLeads.map((lead: any) => {
                                const isSelected = selectedMarketingLeads.includes(lead.id);
                                return (
                                  <tr key={lead.id} className={`hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-purple-500/[0.03]' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            if (selectedMarketingLeads.length >= 10) {
                                              showAlert("Limit Reached", "You can select a maximum of 10 leads at a time.", "info");
                                              return;
                                            }
                                            setSelectedMarketingLeads([...selectedMarketingLeads, lead.id]);
                                          } else {
                                            setSelectedMarketingLeads(selectedMarketingLeads.filter(id => id !== lead.id));
                                          }
                                        }}
                                        className="w-3.5 h-3.5 rounded border-white/10 bg-[#030014] text-purple-600 focus:ring-purple-500/50"
                                      />
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="font-bold text-white">{lead.name}</div>
                                      <div className="text-[11px] text-slate-400 mt-0.5">{lead.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{lead.category || "—"}</td>
                                    <td className="px-6 py-4">
                                      {lead.website ? (
                                        <a
                                          href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-purple-400 hover:underline flex items-center gap-1"
                                        >
                                          {lead.website.replace(/^https?:\/\/(www\.)?/, "").substring(0, 24)}
                                        </a>
                                      ) : (
                                        <span className="text-slate-500">—</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{lead.source || "CSV Upload"}</td>
                                    <td className="px-6 py-4 min-w-[160px]">
                                      {lead.status === "pending" && (
                                        <span className="px-2.5 py-1 text-[10px] rounded-md font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                          Pending AI Pitch
                                        </span>
                                      )}
                                      {lead.status === "fetching" && (
                                        <span className="px-2.5 py-1 text-[10px] rounded-md font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse flex items-center gap-1.5 w-max">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                          AI Scraping...
                                        </span>
                                      )}
                                      {lead.status === "fetched" && (
                                        <span className="px-2.5 py-1 text-[10px] rounded-md font-bold bg-purple-500/15 text-purple-300 border border-purple-500/20 flex items-center gap-1 w-max">
                                          AI Prepped
                                        </span>
                                      )}
                                      {lead.status === "failed" && (
                                        <span className="px-2.5 py-1 text-[10px] rounded-md font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                          Failed / Retry
                                        </span>
                                      )}
                                      {lead.status === "sent" && (
                                        <div className="flex flex-col gap-0.5">
                                          <span className="px-2.5 py-1 text-[10px] rounded-md font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-max">
                                            Broadcast Sent
                                          </span>
                                          {lead.sent_at && (
                                            <span className="text-[9px] text-slate-500">
                                              {new Date(lead.sent_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 min-w-[270px] text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {lead.status === "fetched" && (
                                          <>
                                            <button
                                              onClick={() => handleOpenLeadModal(lead)}
                                              className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 text-xs px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                            >
                                              Edit AI Pitch
                                            </button>
                                            <button
                                              onClick={() => handleResetLeadPitch(lead.id)}
                                              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                            >
                                              Reset Pitch
                                            </button>
                                          </>
                                        )}
                                        {lead.status === "sent" && (
                                          <>
                                            <button
                                              onClick={() => handleOpenLeadModal(lead)}
                                              className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                            >
                                              View Sent Copy
                                            </button>
                                            <button
                                              onClick={() => handleSingleResend(lead)}
                                              className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 text-xs px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                            >
                                              Resend Mail
                                            </button>
                                          </>
                                        )}
                                        <button
                                          onClick={() => handleDeleteMarketingLead(lead.id)}
                                          className="bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 p-1.5 rounded-lg transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Empty States */}
                      {searchedLeads.length === 0 && (
                        <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center">
                          {marketingDirectory === "pending" && (
                            <>
                              <Mail className="w-6 h-6 text-slate-600 mb-2" />
                              {marketingSearch ? "No pending leads matched your search query." : "No pending leads found. Upload a CSV to start!"}
                            </>
                          )}
                          {marketingDirectory === "drafted" && (
                            <>
                              <Sparkles className="w-6 h-6 text-slate-600 mb-2" />
                              {marketingSearch ? "No drafted leads matched your search query." : "No AI pitches have been prepped yet. Select pending leads above and enrich them!"}
                            </>
                          )}
                          {marketingDirectory === "sent" && (
                            <>
                              <Send className="w-6 h-6 text-slate-600 mb-2" />
                              {marketingSearch ? "No sent leads matched your search query." : "No messages have been sent yet. Prep some leads and hit broadcast!"}
                            </>
                          )}
                        </div>
                      )}

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="p-5 border-t border-white/5 flex items-center justify-between bg-[#030014]/20">
                          <span className="text-[11px] text-slate-400">
                            Showing <span className="text-white font-semibold">{(marketingPage - 1) * PAGE_SIZE + 1}</span> to{" "}
                            <span className="text-white font-semibold">
                              {Math.min(marketingPage * PAGE_SIZE, searchedLeads.length)}
                            </span>{" "}
                            of <span className="text-white font-semibold">{searchedLeads.length}</span> leads
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setMarketingPage(prev => Math.max(prev - 1, 1));
                                setSelectedMarketingLeads([]);
                              }}
                              disabled={marketingPage === 1}
                              className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 border border-white/10 text-slate-300 text-xs px-3.5 py-1.5 rounded-lg transition-all"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => {
                                setMarketingPage(prev => Math.min(prev + 1, totalPages));
                                setSelectedMarketingLeads([]);
                              }}
                              disabled={marketingPage === totalPages}
                              className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 border border-white/10 text-slate-300 text-xs px-3.5 py-1.5 rounded-lg transition-all"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* CSV File Upload Footer (Only shown in Pending Directory when lists are loaded) */}
                {marketingDirectory === "pending" && marketingLeads.filter((l: any) => l.status === "pending" || l.status === "failed" || l.status === "fetching").length > 0 && (
                  <div className="p-4 bg-[#030014]/20 border-t border-white/5 flex justify-between items-center flex-wrap gap-3">
                    <span className="text-[11px] text-slate-400">
                      Need to add more? Upload another CSV to append leads.
                    </span>
                    <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs px-4 py-2 rounded-xl transition-all">
                      {uploadingCSV ? "Importing..." : "Append CSV List"}
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                        disabled={uploadingCSV}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: SITE TRAFFIC (GA4 LOOKER STUDIO) */}
          {activeTab === "site_analytics" && (() => {
            const lookerStudioUrl = process.env.NEXT_PUBLIC_LOOKER_STUDIO_URL || "https://datastudio.google.com/embed/reporting/eecbf3c6-0306-40bb-a099-f536faf04911/page/kIV1C";
            return (
              <div className="bg-[#0D0B21]/50 border border-white/5 p-6 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
                  <div>
                    <h4 className="text-[16px] font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      Google Analytics Report
                    </h4>
                    <p className="text-white/45 text-[12px] mt-1">
                      Live demographics, acquisition sources, page path views, and user paths.
                    </p>
                  </div>
                  <div className="text-[11px] text-white/35 max-w-xs sm:text-right font-mono">
                    Report ID: <span className="text-purple-400">eecbf3c6-0306...</span>
                  </div>
                </div>

                <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-white/10 bg-[#030014]/60 relative shadow-inner">
                  <iframe
                    src={lookerStudioUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  />
                </div>
              </div>
            );
          })()}

          </div>

          {/* FOOTER */}
          <footer className="border-t border-white/5 bg-black/20 py-4 text-center text-[11px] text-white/20 flex-shrink-0 mt-8">
            &copy; {new Date().getFullYear()} ReplyIQ Systems. Secure Console.
          </footer>

        </main>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: BUSINESS CONTROLS DRAWER */}
      {selectedBusiness && (() => {
        const stats = getBusinessAnalytics(selectedBusiness.business_id, selectedBusiness.created_at);
        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setSelectedBusiness(null)} />
            
            <div className="relative w-full max-w-lg bg-[#0A071E] border-l border-white/10 h-full overflow-y-auto p-6 md:p-8 flex flex-col justify-between shadow-2xl">
              
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[20px] font-bold text-white">{selectedBusiness.name}</h3>
                    <p className="text-[12px] text-white/45 font-mono mt-0.5">ID: {selectedBusiness.business_id}</p>
                  </div>
                  <button onClick={() => setSelectedBusiness(null)} className="text-white/45 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <hr className="border-white/5" />

                {/* HEALTH SCORE DISPLAY */}
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                  <div className={`text-[28px] font-extrabold px-3 py-1 rounded-lg border ${stats.healthColor}`}>
                    {stats.healthScore}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-white/35">Business Health Score</div>
                    <div className="text-[13px] font-bold text-white mt-0.5">{stats.healthLabel}</div>
                  </div>
                </div>

                {/* KB COMPLETENESS CHECKLIST */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="text-[12px] font-semibold uppercase tracking-wider text-white/45">Knowledge Completeness</h5>
                    <span className="text-[12px] font-bold text-[#a78bfa]">{stats.kbCompletenessPercentage}%</span>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-2.5">
                    {[
                      { id: "name", label: "Business Description & Persona Setup", ok: stats.kbChecklist.name },
                      { id: "prompt", label: "AI Personality Prompts Defined", ok: stats.kbChecklist.prompt },
                      { id: "faq", label: "Knowledge Base FAQs Uploaded", ok: stats.kbChecklist.faq },
                      { id: "whatsapp", label: "WhatsApp Contact Linked", ok: stats.kbChecklist.whatsapp },
                      { id: "email", label: "Email Contact Connected", ok: stats.kbChecklist.email }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-[12.5px]">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${item.ok ? "text-emerald-400" : "text-white/10"}`} />
                        <span className={item.ok ? "text-white/80" : "text-white/30"}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI USAGE STATS CARD */}
                <div className="space-y-3">
                  <h5 className="text-[12px] font-semibold uppercase tracking-wider text-white/45">AI Interaction Analytics</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                      <div className="text-white/45 text-[11px]">Total Conversations</div>
                      <div className="text-[16px] font-bold text-white mt-0.5 font-mono">{stats.totalConversations}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                      <div className="text-white/45 text-[11px]">Total Exchange Messages</div>
                      <div className="text-[16px] font-bold text-white mt-0.5 font-mono">{stats.totalMessages}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                      <div className="text-white/45 text-[11px]">Messages (Current Month)</div>
                      <div className="text-[16px] font-bold text-white mt-0.5 font-mono">{stats.messagesThisMonth}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                      <div className="text-white/45 text-[11px]">Avg Daily Volume</div>
                      <div className="text-[16px] font-bold text-white mt-0.5 font-mono">{stats.avgMessagesPerDay}</div>
                    </div>
                  </div>
                </div>

                {/* PERFORMANCE AND HANDOFF CARD */}
                <div className="space-y-3">
                  <h5 className="text-[12px] font-semibold uppercase tracking-wider text-white/45">Performance & Lead conversion</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                      <div className="text-white/45 text-[11px]">Total Handoff Clicks</div>
                      <div className="text-[16px] font-bold text-white mt-0.5 font-mono">{stats.whatsappHandoffs + stats.emailHandoffs}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                      <div className="text-white/45 text-[11px]">Unknown Questions</div>
                      <div className="text-[16px] font-bold text-white mt-0.5 font-mono">{stats.unknownQuestions}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                      <div className="text-white/45 text-[11px]">Leads Generated</div>
                      <div className="text-[16px] font-bold text-white mt-0.5 font-mono">{stats.leadsGenerated}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                      <div className="text-white/45 text-[11px]">Handoff Target Phone</div>
                      <div className="text-[13px] font-semibold text-white mt-0.5 font-mono truncate">{selectedBusiness.whatsapp_phone || "Not set"}</div>
                    </div>
                  </div>
                </div>

                {/* CONFIGURATION & BILLING CONSOLE */}
                <form onSubmit={handleUpdateBusinessSubmit} className="space-y-4">
                  <h5 className="text-[12px] font-semibold uppercase tracking-wider text-white/45">Assistant Details</h5>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/45 uppercase tracking-wider">Business Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-9 px-3 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/45 uppercase tracking-wider">WhatsApp Phone</label>
                      <input
                        type="text"
                        value={editWhatsapp}
                        onChange={(e) => setEditWhatsapp(e.target.value)}
                        className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-9 px-3 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/45 uppercase tracking-wider">Email Contact</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-9 px-3 rounded-lg focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/45 uppercase tracking-wider">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-9 px-2.5 rounded-lg focus:outline-none focus:border-purple-500"
                      >
                        <option value="trial">Trial</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/45 uppercase tracking-wider">Renewal Date</label>
                      <input
                        type="date"
                        value={editRenewalDate}
                        onChange={(e) => setEditRenewalDate(e.target.value)}
                        className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-9 px-2.5 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/45 uppercase tracking-wider">Theme Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editTheme}
                        onChange={(e) => setEditTheme(e.target.value)}
                        className="bg-transparent border border-white/10 rounded-lg w-9 h-9 p-0.5 cursor-pointer animate-none"
                      />
                      <input
                        type="text"
                        value={editTheme}
                        onChange={(e) => setEditTheme(e.target.value)}
                        className="flex-1 bg-[#030014] border border-white/10 text-white text-[13px] h-9 px-3 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/45 uppercase tracking-wider">AI System Prompt</label>
                    <textarea
                      required
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      className="w-full bg-[#030014] border border-white/10 text-white text-[13px] p-2.5 rounded-lg h-24 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/45 uppercase tracking-wider">Knowledge Base FAQ Text</label>
                    <textarea
                      value={editKB}
                      onChange={(e) => setEditKB(e.target.value)}
                      className="w-full bg-[#030014] border border-white/10 text-white text-[13px] p-2.5 rounded-lg h-32 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  {/* BILLING & INSTALLMENTS */}
                  <div className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                    <h5 className="text-[12px] font-semibold uppercase tracking-wider text-white/45">Billing & Payment Tracking</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/45 uppercase tracking-wider">Payment Plan</label>
                        <select
                          value={editPaymentPlan}
                          onChange={(e) => {
                            setEditPaymentPlan(e.target.value as any);
                          }}
                          className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-9 px-2.5 rounded-lg focus:outline-none focus:border-purple-500"
                        >
                          <option value="trial">Trial / Free</option>
                          <option value="starter">Starter Setup (₦5,000)</option>
                          <option value="professional">Professional Setup (₦15,000)</option>
                          <option value="enterprise">Enterprise Setup (₦25,000)</option>
                          <option value="full">Paid in Full (₦15,000) [Legacy]</option>
                          <option value="installment_2x">2x Installments (₦7,500 each) [Legacy]</option>
                          <option value="installment_3x">3x Installments (₦5,000 each) [Legacy]</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-white/45 uppercase tracking-wider">Installments Paid</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={
                              editPaymentPlan === 'installment_3x' ? 3 :
                              editPaymentPlan === 'installment_2x' ? 2 :
                              editPaymentPlan === 'trial' ? 0 : 1
                            }
                            value={editInstallmentsPaid}
                            onChange={(e) => setEditInstallmentsPaid(parseInt(e.target.value) || 0)}
                            className="w-16 bg-[#030014] border border-white/10 text-white text-[13px] h-9 px-2 rounded-lg focus:outline-none focus:border-purple-500 text-center font-mono"
                          />
                          <span className="text-[11px] text-white/40">
                            {editPaymentPlan === 'installment_3x' ? '/ 3' :
                             editPaymentPlan === 'installment_2x' ? '/ 2' :
                             editPaymentPlan === 'trial' ? '/ 0' : '/ 1'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick increment button */}
                    {editPaymentPlan !== 'trial' && (() => {
                      const maxInstallmentsMap: Record<string, number> = {
                        full: 1, installment_2x: 2, installment_3x: 3,
                        starter: 1, professional: 1, enterprise: 1
                      };
                      const amountPerMap: Record<string, number> = {
                        full: 15000, installment_2x: 7500, installment_3x: 5000,
                        starter: 5000, professional: 15000, enterprise: 25000
                      };
                      const maxInstallments = maxInstallmentsMap[editPaymentPlan] || 1;
                      const amountPer = amountPerMap[editPaymentPlan] || 15000;
                      if (editInstallmentsPaid < maxInstallments) {
                        return (
                          <button
                            type="button"
                            onClick={() => setEditInstallmentsPaid(prev => Math.min(prev + 1, maxInstallments))}
                            className="w-full mt-2 h-8 border border-purple-500/30 hover:bg-purple-500/10 text-purple-300 font-semibold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Record Next Installment Payment (₦{amountPer.toLocaleString()})
                          </button>
                        );
                      }
                      return (
                        <div className="text-[11.5px] text-emerald-400 font-semibold flex items-center gap-1 mt-2">
                          <CheckCircle2 className="w-4 h-4" /> Fully Paid / Completed
                        </div>
                      );
                    })()}
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full h-10 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    Save Configuration Changes
                  </button>
                </form>

              </div>

              <div className="pt-6 border-t border-white/5 mt-6">
                <button
                  onClick={() => handleDeleteBusiness(selectedBusiness.business_id)}
                  className="w-full h-10 border border-red-500/20 hover:bg-red-500/10 text-red-400 font-semibold text-[13px] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Permanently Delete Business Account
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* MODAL 2: REFERRALS SUB-SHEET MODAL */}
      {selectedPartnerReferrals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setSelectedPartnerReferrals(null)} />
          
          <div className="relative w-full max-w-2xl bg-[#0D0B21] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[18px] font-bold text-white">Ambassador Referral Reports</h3>
                <p className="text-white/45 text-[12px] mt-0.5">Toggle business registration status to trigger setups and update balance</p>
              </div>
              <button onClick={() => setSelectedPartnerReferrals(null)} className="text-white/45 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <hr className="border-white/5 mb-4" />

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {selectedPartnerReferrals.map((ref: any) => (
                <div key={ref.id} className={`bg-white/[0.02] border p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${
                  ref.is_suspicious 
                    ? "border-red-500/20 bg-red-500/[0.02]" 
                    : "border-white/5"
                }`}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-[14px] text-white">{ref.business_name}</h5>
                      {ref.is_suspicious && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                          ⚠️ Self-Referral Warning
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-white/45 mt-0.5">{ref.email}</p>
                    {ref.is_suspicious && (
                      <p className="text-[10.5px] text-red-400/80 font-mono mt-1 leading-relaxed">
                        Device footprint signature matches the referring ambassador's sign-up device.
                      </p>
                    )}
                    <p className="text-[10px] text-white/30 mt-1.5 font-mono">Referred: {new Date(ref.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                      ref.status === "paying" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {ref.status}
                    </span>
                    <button
                      onClick={() => handleToggleReferral(ref.id, ref.status)}
                      className={`text-[12px] px-3.5 py-1.5 rounded-lg border font-semibold transition-colors ${
                        ref.status === "paying" 
                          ? "border-amber-500/25 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {ref.status === "paying" ? "Mark Pending" : "Mark Approved / Paying"}
                    </button>
                  </div>
                </div>
              ))}
              {selectedPartnerReferrals.length === 0 && (
                <div className="text-center py-8 text-white/20">No deals referred yet.</div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CHAT DIALOG LOGS BUBBLE STREAM */}
      {selectedChatHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setSelectedChatHistory(null)} />
          
          <div className="relative w-full max-w-lg bg-[#0D0B21] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[75vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#a78bfa] font-mono text-[14px]">
                  WA
                </div>
                <div>
                  <h4 className="font-bold text-[14px] leading-tight">{selectedChatHistory.phone}</h4>
                  <p className="text-[10px] text-white/45 mt-0.5">Speaking with Assistant ID: {selectedChatHistory.business_id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedChatHistory(null)} className="text-white/45 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bubble logs body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#060413]/60">
              {(selectedChatHistory.history || []).map((msg: any, i: number) => {
                const isUser = msg.role === "user";
                return (
                  <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[13px] leading-normal shadow-sm ${
                      isUser 
                        ? "bg-[#25233A] text-white rounded-br-none" 
                        : "bg-[#8B5CF6] text-white rounded-bl-none"
                    }`}>
                      <p className="font-sans break-words">{msg.content}</p>
                      <span className={`block text-[9px] text-right mt-1 opacity-40 font-mono`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {(selectedChatHistory.history || []).length === 0 && (
                <div className="text-center py-12 text-white/20">No messages logged in this conversation.</div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ADD TRANSACTION */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setShowAddTxModal(false)} />
          
          <div className="relative w-full max-w-md bg-[#0D0B21] border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[16px] font-bold text-white">Record Custom Payment</h3>
              <button onClick={() => setShowAddTxModal(false)} className="text-white/45 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddTransactionSubmit} className="space-y-4">
              <div className="space-y-1.5 relative">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Business Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="Search configured business or type name..."
                  value={newTxBusiness}
                  onChange={(e) => {
                    setNewTxBusiness(e.target.value);
                    setShowTxBusinessDropdown(true);
                  }}
                  onFocus={() => setShowTxBusinessDropdown(true)}
                  className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20"
                />
                
                {showTxBusinessDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowTxBusinessDropdown(false)} />
                    <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#0F0D28] border border-white/10 rounded-lg shadow-xl z-20 scrollbar-none">
                      {businesses.filter((b: any) => 
                        b.name.toLowerCase().includes(newTxBusiness.toLowerCase()) ||
                        b.business_id.toLowerCase().includes(newTxBusiness.toLowerCase())
                      ).length > 0 ? (
                        businesses.filter((b: any) => 
                          b.name.toLowerCase().includes(newTxBusiness.toLowerCase()) ||
                          b.business_id.toLowerCase().includes(newTxBusiness.toLowerCase())
                        ).map((b: any) => (
                          <button
                            key={b.business_id}
                            type="button"
                            onClick={() => {
                              setNewTxBusiness(b.name);
                              setShowTxBusinessDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-[12px] hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 block"
                          >
                            <span className="font-semibold text-white block">{b.name}</span>
                            <span className="text-[10px] text-white/40 block font-mono">ID: {b.business_id}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2.5 text-[11px] text-white/30 italic">
                          No matching configured businesses. You can still type a custom name.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Transaction Amount (₦)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full h-10 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                Log Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: WRITE ANNOUNCEMENT */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setShowAnnouncementModal(false)} />
          
          <div className="relative w-full max-w-md bg-[#0D0B21] border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[16px] font-bold text-white flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-purple-400" />
                Compose Notice
              </h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-white/45 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Target Audience</label>
                  <select
                    value={newAnnTarget}
                    onChange={(e) => setNewAnnTarget(e.target.value)}
                    className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-2 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="all_businesses">All Businesses</option>
                    <option value="all_partners">All Ambassadors</option>
                    <option value="specific_business">Specific Business ID</option>
                  </select>
                </div>

                {newAnnTarget === "specific_business" && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Business ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. swiftlog"
                      value={newAnnTargetId}
                      onChange={(e) => setNewAnnTargetId(e.target.value)}
                      className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Service Maintenance"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Content Message</label>
                <textarea
                  required
                  placeholder="Write announcement body message..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full bg-[#030014] border border-white/10 text-white text-[13px] p-3 rounded-lg h-24 focus:outline-none focus:border-purple-500 placeholder:text-white/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full h-10 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                Broadcast Announcement
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ============================================================== */}
      {/* MODAL 6: ADD ASSISTANT */}
      {showAddBizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setShowAddBizModal(false)} />
          
          <div className="relative w-full max-w-2xl bg-[#0D0B21] border border-white/10 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start mb-4 flex-shrink-0">
              <h3 className="text-[16px] font-bold text-white flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-purple-400" />
                Configure New Assistant
              </h3>
              <button onClick={() => setShowAddBizModal(false)} className="text-white/45 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateBusinessSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Consulting Ltd"
                    value={addBizName}
                    onChange={(e) => setAddBizName(e.target.value)}
                    className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Theme Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={addBizTheme}
                      onChange={(e) => setAddBizTheme(e.target.value)}
                      className="bg-transparent border border-white/10 rounded-lg w-10 h-10 p-0.5 cursor-pointer animate-none"
                    />
                    <input
                      type="text"
                      placeholder="#3B82F6"
                      value={addBizTheme}
                      onChange={(e) => setAddBizTheme(e.target.value)}
                      className="flex-1 bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">WhatsApp Phone (Handoff)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2348012345678"
                    value={addBizWhatsapp}
                    onChange={(e) => setAddBizWhatsapp(e.target.value)}
                    className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Email Contact (Handoff)</label>
                  <input
                    type="email"
                    placeholder="e.g. support@apex.com"
                    value={addBizEmail}
                    onChange={(e) => setAddBizEmail(e.target.value)}
                    className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Initial Status</label>
                  <select
                    value={addBizStatus}
                    onChange={(e) => setAddBizStatus(e.target.value)}
                    className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-2 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Payment Plan</label>
                  <select
                    value={addBizPaymentPlan}
                    onChange={(e) => setAddBizPaymentPlan(e.target.value as any)}
                    className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-2 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="trial">Trial / Free</option>
                    <option value="starter">Starter Setup (₦5,000)</option>
                    <option value="professional">Professional Setup (₦15,000)</option>
                    <option value="enterprise">Enterprise Setup (₦25,000)</option>
                    <option value="full">Paid in Full (₦15,000) [Legacy]</option>
                    <option value="installment_2x">2x Installments (₦7,500 each) [Legacy]</option>
                    <option value="installment_3x">3x Installments (₦5,000 each) [Legacy]</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Referral Code (Ambassador)</label>
                  <input
                    type="text"
                    placeholder="e.g. AMB-102"
                    value={addBizRefCode}
                    onChange={(e) => setAddBizRefCode(e.target.value)}
                    className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">AI System Prompt *</label>
                <textarea
                  required
                  placeholder="Tell the AI assistant how to behave, e.g., You are a friendly assistant for Apex Consulting..."
                  value={addBizPrompt}
                  onChange={(e) => setAddBizPrompt(e.target.value)}
                  className="w-full bg-[#030014] border border-white/10 text-white text-[13px] p-3 rounded-lg h-24 focus:outline-none focus:border-purple-500 placeholder:text-white/20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Knowledge Base FAQ Text</label>
                <textarea
                  placeholder="Paste FAQ questions, pricing plans, business guidelines, etc. that the AI should query."
                  value={addBizKB}
                  onChange={(e) => setAddBizKB(e.target.value)}
                  className="w-full bg-[#030014] border border-white/10 text-white text-[13px] p-3 rounded-lg h-32 focus:outline-none focus:border-purple-500 placeholder:text-white/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
              >
                Create Assistant Configuration
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 7: ADD/EDIT BLOG POST */}
      {showAddBlogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setShowAddBlogModal(false)} />
          
          <div className="relative w-full max-w-3xl bg-[#0D0B21] border border-white/10 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start mb-4 flex-shrink-0">
              <h3 className="text-[16px] font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-400" />
                {selectedBlogPost ? "Edit Blog Article" : "Compose New Blog Article"}
              </h3>
              <button onClick={() => setShowAddBlogModal(false)} className="text-white/45 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveBlogSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Ways AI is Revolutionizing Customer Support"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Category *</label>
                  <select
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                    className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    {siteConfig.categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. fintech, nigerian banks, paystack"
                    value={blogTags}
                    onChange={(e) => setBlogTags(e.target.value)}
                    className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Cover Image URL</label>
                    {uploadingImage && <span className="text-[10px] text-purple-400 font-semibold animate-pulse">Uploading cover...</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      value={blogCoverImage}
                      onChange={(e) => setBlogCoverImage(e.target.value)}
                      className="flex-1 bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20"
                    />
                    <label className="flex items-center justify-center bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[13px] font-semibold h-10 px-4 rounded-lg cursor-pointer transition-colors whitespace-nowrap">
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Author Name</label>
                    <input
                      type="text"
                      placeholder="ReplyIQ Team"
                      value={blogAuthorName}
                      onChange={(e) => setBlogAuthorName(e.target.value)}
                      className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Publish Status</label>
                    <select
                      value={blogStatus}
                      onChange={(e) => setBlogStatus(e.target.value as any)}
                      className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-2 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">SEO Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="Defaults to Article Title"
                    value={blogSeoTitle}
                    onChange={(e) => setBlogSeoTitle(e.target.value)}
                    className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">SEO Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Defaults to Article Excerpt"
                    value={blogSeoDescription}
                    onChange={(e) => setBlogSeoDescription(e.target.value)}
                    className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Source Attributions (One per line)</label>
                  <span className="text-[10px] text-white/30">Format: Publisher | https://article-url</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="e.g. TechCabal | https://techcabal.com/example&#10;BusinessDay | https://businessday.ng/example"
                  value={blogSources}
                  onChange={(e) => setBlogSources(e.target.value)}
                  className="w-full bg-[#030014] border border-white/10 text-white text-[13px] p-2.5 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20 font-mono resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Short Excerpt (SEO Description) *</label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  placeholder="Write a brief summary for the preview card and Google search results (max 160 chars)..."
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  className="w-full bg-[#030014] border border-white/10 text-white text-[13px] h-10 px-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20"
                />
              </div>

              <div className="space-y-1.5 flex-1 flex flex-col min-h-[200px]">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35">Article Content (Markdown) *</label>
                  <span className="text-[10px] text-white/20">Supports **bold**, [links](url), images, and YouTube embeds like: `https://www.youtube.com/watch?v=ID`</span>
                </div>
                <textarea
                  required
                  placeholder="# Enter your markdown text here..."
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full flex-1 bg-[#030014] border border-white/10 text-white text-[13px] p-3 rounded-lg focus:outline-none focus:border-purple-500 placeholder:text-white/20 resize-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
              >
                {selectedBlogPost ? "Save Changes" : "Publish Blog Article"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI OUTREACH COPY MODAL */}
      {showMarketingLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#030014] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#070512]">
              <div>
                <h3 className="font-bold text-white text-base">
                  {showMarketingLeadModal.status === "sent" ? "Sent Outbound Copy" : "Edit Generated AI Pitch"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  For: {showMarketingLeadModal.name} ({showMarketingLeadModal.email})
                </p>
              </div>
              <button
                onClick={() => setShowMarketingLeadModal(null)}
                className="text-white/45 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {showMarketingLeadModal.status !== "sent" ? (
                // EDITABLE MODE
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject Line</label>
                    <input
                      type="text"
                      value={previewSubject}
                      onChange={(e) => setPreviewSubject(e.target.value)}
                      className="w-full bg-[#030014]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Body Paragraphs</label>
                    <textarea
                      rows={10}
                      value={previewBody}
                      onChange={(e) => setPreviewBody(e.target.value)}
                      className="w-full bg-[#030014]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-sans resize-y"
                    />
                  </div>
                  <div className="bg-purple-950/15 border border-purple-500/10 p-3.5 rounded-xl text-[11px] text-purple-300 leading-normal flex items-start gap-2">
                    <span className="font-bold">Note:</span> Outbound template automatically appends a branded ReplyIQ dark logo header at the top and Unity Ekeoba's signature footer at the bottom.
                  </div>
                </>
              ) : (
                // READ-ONLY SENT MODE
                <div className="space-y-4 bg-white/5 border border-white/5 rounded-xl p-5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Subject Line</span>
                    <h4 className="text-white font-bold text-sm mt-1">{showMarketingLeadModal.ai_subject}</h4>
                  </div>
                  <hr className="border-white/5" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Email Content</span>
                    <p className="text-slate-200 text-xs leading-relaxed white-space: pre-wrap mt-2.5 font-sans whitespace-pre-wrap">{showMarketingLeadModal.ai_body}</p>
                  </div>
                  <hr className="border-white/5" />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Sent From: Unity Ekeoba &lt;unity@replyiq.cv&gt;</span>
                    {showMarketingLeadModal.sent_at && (
                      <span>Date: {new Date(showMarketingLeadModal.sent_at).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 bg-[#070512] flex justify-between items-center">
              {showMarketingLeadModal.status !== "sent" ? (
                <button
                  onClick={() => {
                    handleResetLeadPitch(showMarketingLeadModal.id);
                    setShowMarketingLeadModal(null);
                  }}
                  className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  Delete & Reset AI Pitch
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMarketingLeadModal(null)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold px-5 py-2.5 rounded-xl border border-white/5 transition-all"
                >
                  Close
                </button>
                {showMarketingLeadModal.status !== "sent" && (
                  <button
                    onClick={handleSaveLeadPitch}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/10 transition-all"
                  >
                    Save Pitch Details
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
