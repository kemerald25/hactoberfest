"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#060810] bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] overflow-x-hidden">
      <Navbar />
      
      <div className="w-full max-w-[800px] mx-auto px-6 pt-[140px] pb-24 relative z-10">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-[#0D1117]/60 border border-white/8 rounded-2xl p-8 sm:p-12 shadow-2xl backdrop-blur-sm"
        >
          {/* Header */}
          <div className="border-b border-white/10 pb-6 mb-8">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a78bfa] block mb-2 font-mono">
              Legal
            </span>
            <h1 className="text-[32px] sm:text-[40px] font-bold tracking-tight text-[#F8FAFC] font-sans">
              Privacy Policy
            </h1>
            <p className="text-white/45 text-[13px] font-sans mt-2">
              Last updated: June 11, 2026
            </p>
          </div>

          {/* Body Content */}
          <div className="space-y-8 text-[14px] sm:text-[15px] leading-relaxed text-white/70 font-sans">
            {/* Section 1 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">1. Introduction</h2>
              <p>
                TaskBridge (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is an AI-powered customer communication platform operated by TaskBridge AI Systems. This Privacy Policy explains how we collect, use, store, and protect information when you use our platform &mdash; whether as a business client deploying an AI assistant, or as an end customer interacting with one.
              </p>
              <p className="mt-3">
                By using any TaskBridge service, you agree to the practices described in this policy.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">2. Who This Policy Applies To</h2>
              <p className="mb-2">This policy covers two types of users:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-white/90">Business Clients</strong> &mdash; companies and individuals who sign up to deploy a TaskBridge AI assistant on their website, WhatsApp, or via a standalone chat link.
                </li>
                <li>
                  <strong className="text-white/90">End Users</strong> &mdash; customers who interact with a TaskBridge-powered assistant embedded on a client&apos;s website or WhatsApp channel.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">3. Information We Collect</h2>
              
              <div className="mb-4">
                <h4 className="text-[15px] font-semibold text-white/90 mb-2">From Business Clients:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Full name, business name, and email address provided during onboarding</li>
                  <li>Business information used to train the AI assistant (FAQs, service descriptions, pricing, communication style)</li>
                  <li>Payment details processed through our payment partners (we do not store raw card data)</li>
                  <li>Communication history between you and the TaskBridge team</li>
                </ul>
              </div>

              <div>
                <h4 className="text-[15px] font-semibold text-white/90 mb-2">From End Users (via client deployments):</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Messages and queries submitted through the chat widget or standalone chat page</li>
                  <li>WhatsApp messages sent to a TaskBridge-managed number on behalf of a client business</li>
                  <li>Device and browser metadata (browser type, operating system, approximate location) collected automatically for performance monitoring</li>
                  <li>Any contact information voluntarily shared during a conversation (e.g. name, phone number, email)</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">4. How We Use Your Information</h2>
              <p className="mb-3">We use collected information to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Operate and deliver the TaskBridge service to business clients</li>
                <li>Train and personalize AI assistants with client-provided data</li>
                <li>Route and respond to customer inquiries on behalf of client businesses</li>
                <li>Facilitate WhatsApp handoffs between the AI and human agents</li>
                <li>Improve AI response quality and platform performance</li>
                <li>Send service-related communications to business clients</li>
                <li>Comply with applicable laws and resolve disputes</li>
              </ul>
              <p>
                We do <strong className="text-[#a78bfa]">not</strong> sell your personal data to third parties. We do not use end-user conversation data to train shared AI models without explicit consent.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">5. WhatsApp Messaging</h2>
              <p className="mb-3">
                TaskBridge currently operates a WhatsApp integration on behalf of business clients. When you message a TaskBridge-powered WhatsApp number:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Your messages are received and processed by our AI system</li>
                <li>Conversations may be escalated and forwarded to the business owner directly</li>
                <li>Message history may be stored temporarily to maintain conversation context</li>
                <li>TaskBridge operates this channel under the business client&apos;s identity &mdash; the business you are contacting is responsible for how they use your contact information after handoff</li>
              </ul>
              <p>
                We intend to migrate to the official WhatsApp Business API as the platform scales. Any changes to how WhatsApp data is handled will be reflected in an updated version of this policy.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">6. Data Storage and Security</h2>
              <p className="mb-3">
                All TaskBridge platform data is stored using Supabase (PostgreSQL), hosted on secure cloud infrastructure. We implement the following practices:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Data isolation between business clients (multi-tenant architecture with business-level separation)</li>
                <li>Encrypted data transmission via HTTPS/TLS</li>
                <li>Access controls limiting who within TaskBridge can view client or end-user data</li>
                <li>Regular security reviews of our infrastructure</li>
              </ul>
              <p className="mt-3">
                While we take reasonable precautions, no system is completely immune to security risks. We encourage business clients to use strong credentials and report any suspicious activity immediately.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">7. Data Sharing</h2>
              <p className="mb-3">We share data only in the following limited circumstances:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-white/95">With business clients:</strong> End-user conversation data is accessible to the business whose AI assistant handled the interaction</li>
                <li><strong className="text-white/95">With service providers:</strong> We use third-party infrastructure providers (Supabase, Cloudflare, Vercel) who process data strictly to deliver our service</li>
                <li><strong className="text-white/95">With AI providers:</strong> Conversation data may be processed by our AI model infrastructure (Cloudflare Workers AI / Meta Llama 3.1) to generate responses</li>
                <li><strong className="text-white/95">By law:</strong> When required by a valid legal order, court process, or regulatory authority in Nigeria or applicable jurisdictions</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">8. Data Retention</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Business client account data is retained for the duration of the engagement and up to 12 months after account closure</li>
                <li>End-user conversation logs are retained for up to 90 days to support conversation continuity, after which they are deleted or anonymized</li>
                <li>Business clients may request deletion of their data at any time by contacting us</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">9. Your Rights</h2>
              <p className="mb-3">Whether you are a business client or an end user, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Request access to the personal data we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data (subject to legal retention obligations)</li>
                <li>Withdraw consent where processing is based on consent</li>
                <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC) if you believe your rights have been violated</li>
              </ul>
              <p>To exercise any of these rights, contact us at the address below.</p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">10. Cookies and Tracking</h2>
              <p className="mb-3">
                The TaskBridge website uses minimal tracking to monitor performance and improve user experience. This may include:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Session cookies for site functionality</li>
                <li>Analytics data (page views, device type, referral source) collected in aggregate</li>
              </ul>
              <p className="mt-3">We do not use advertising trackers or sell browsing data.</p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">11. Children&apos;s Privacy</h2>
              <p>
                TaskBridge is not directed at individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has submitted personal data through our platform, please contact us immediately for removal.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">12. Changes to This Policy</h2>
              <p className="mb-3">
                We may update this Privacy Policy periodically to reflect changes in our services or legal obligations. When we do, we will update the &ldquo;Last updated&rdquo; date at the top of this page. For significant changes, we will notify active business clients via email.
              </p>
              <p>
                Continued use of TaskBridge after an update constitutes acceptance of the revised policy.
              </p>
            </section>

            {/* Section 13 */}
            <section className="border-t border-white/10 pt-6 mt-6">
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">13. Contact Us</h2>
              <p className="mb-1">For any privacy-related questions, data requests, or concerns:</p>
              <div className="mt-3 space-y-1 text-white/55 font-mono text-[13px]">
                <p className="text-white/80 font-bold font-sans">TaskBridge AI Systems</p>
                <p>
                  Email:{" "}
                  <a href="mailto:support@taskbridge.ai" className="text-[#a78bfa] hover:underline">
                    support@taskbridge.ai
                  </a>
                </p>
                <p>
                  Website:{" "}
                  <a href="https://www.taskbridge.ai" target="_blank" rel="noopener noreferrer" className="text-[#a78bfa] hover:underline">
                    www.taskbridge.ai
                  </a>
                </p>
                <p>Nigeria</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
