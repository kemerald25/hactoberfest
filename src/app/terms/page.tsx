"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-white/45 text-[13px] font-sans mt-2">
              Last updated: June 14, 2026
            </p>
          </div>

          {/* Body Content */}
          <div className="space-y-8 text-[14px] sm:text-[15px] leading-relaxed text-white/70 font-sans">
            {/* Section 1 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">1. Agreement to Terms</h2>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you and TaskBridge AI Systems (&ldquo;TaskBridge&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) governing your access to and use of the TaskBridge platform, including our website, AI assistant infrastructure, chat widget, standalone chat pages, and WhatsApp integration services.
              </p>
              <p className="mt-3">
                By accessing or using any TaskBridge service, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, you must not use our services.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">2. Definitions</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-white/90">&ldquo;Platform&rdquo;</strong> refers to all TaskBridge products and services, including the web application, embeddable widget, standalone chat pages, WhatsApp channel, and any related APIs or tools.
                </li>
                <li>
                  <strong className="text-white/90">&ldquo;Business Client&rdquo;</strong> refers to any individual or company that purchases a TaskBridge setup and deploys an AI assistant.
                </li>
                <li>
                  <strong className="text-white/90">&ldquo;End User&rdquo;</strong> refers to any customer who interacts with a TaskBridge-powered AI assistant on a client&apos;s deployment.
                </li>
                <li>
                  <strong className="text-white/90">&ldquo;AI Assistant&rdquo;</strong> refers to the customized, business-trained AI customer communication agent deployed on behalf of a Business Client.
                </li>
                <li>
                  <strong className="text-white/90">&ldquo;Setup Fee&rdquo;</strong> refers to the one-time payment made by a Business Client to activate and deploy their AI assistant.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">3. Eligibility</h2>
              <p className="mb-3">To use TaskBridge as a Business Client, you must:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Be at least 18 years of age</li>
                <li>Have the legal authority to enter into a binding agreement on behalf of yourself or your business</li>
                <li>Provide accurate and complete information during onboarding</li>
                <li>Not be prohibited from using AI communication services under applicable Nigerian or international law</li>
              </ul>
              <p>
                TaskBridge reserves the right to refuse service to any individual or business at our discretion.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">4. Services Provided</h2>
              <p className="mb-3">Upon payment of the Setup Fee, TaskBridge will:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Configure and train an AI assistant using business information provided by the client</li>
                <li>Deploy the assistant via a website chat widget, standalone chat link, or WhatsApp channel as agreed</li>
                <li>Test the assistant prior to going live</li>
                <li>Provide reasonable post-launch support for issues arising from the initial setup</li>
              </ul>

              <h4 className="text-[15px] font-semibold text-white/90 mb-2">What is not included:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ongoing monthly management unless separately agreed</li>
                <li>Integration with platforms not supported at the time of purchase</li>
                <li>Guaranteed response accuracy for information not provided during onboarding</li>
                <li>Liability for business outcomes, sales conversions, or lead quality</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">5. Payment Terms</h2>
              
              <div className="mb-4">
                <h4 className="text-[15px] font-semibold text-white/90 mb-1">5.1 Setup Fee</h4>
                <p>
                  The current one-time setup fee is ₦15,000, payable in full before setup begins. TaskBridge reserves the right to revise pricing at any time. Price changes will not affect active setups already paid for.
                </p>
              </div>

              <div className="mb-4">
                <h4 className="text-[15px] font-semibold text-white/90 mb-1">5.2 Payment Methods</h4>
                <p>
                  Payments are accepted via methods communicated during onboarding. All transactions are processed in Nigerian Naira (NGN).
                </p>
              </div>

              <div>
                <h4 className="text-[15px] font-semibold text-white/90 mb-1">5.3 Refund Policy</h4>
                <p>
                  Due to the custom and time-intensive nature of each AI assistant setup, all payments are <strong className="text-[#a78bfa]">non-refundable</strong> once setup work has commenced. If you cancel before any setup work begins, a full refund may be issued at our discretion. Disputes must be raised within 7 days of payment.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">6. Client Responsibilities</h2>
              <p className="mb-3">As a Business Client, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Provide accurate, complete, and lawful business information for AI training</li>
                <li>Ensure all content submitted (FAQs, service descriptions, pricing) does not violate any applicable laws or third-party rights</li>
                <li>Not use TaskBridge to deceive, mislead, or defraud end users</li>
                <li>Not deploy the AI assistant for any unlawful, abusive, or harmful purpose</li>
                <li>Comply with WhatsApp&apos;s Terms of Service when using the WhatsApp integration channel</li>
                <li>Notify your end users that they may be interacting with an AI assistant where required by applicable law</li>
                <li>Keep your contact credentials and account information up to date</li>
              </ul>
              <p>
                You are solely responsible for all content your AI assistant delivers based on information you provided.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">7. Acceptable Use Policy</h2>
              <p className="mb-3">You must not use TaskBridge to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Distribute spam, unsolicited messages, or mass marketing communications</li>
                <li>Collect user data in violation of applicable privacy laws</li>
                <li>Impersonate individuals, businesses, or institutions you are not authorized to represent</li>
                <li>Facilitate illegal transactions, fraud, money laundering, or scams</li>
                <li>Transmit harmful, defamatory, obscene, or threatening content</li>
                <li>Attempt to reverse-engineer, scrape, or exploit any part of the TaskBridge infrastructure</li>
                <li>Overload or interfere with platform systems through automated abuse or excessive API calls</li>
              </ul>
              <p className="mt-3">
                Violation of this policy may result in immediate suspension or termination of your account without refund.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">8. Messaging &amp; Channel Integrations</h2>
              <p>
                TaskBridge supports deployment of your AI assistant across multiple communication channels, including web chat widgets, standalone chat pages, and messaging platform integrations. By using any channel integration, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-3 mb-3">
                <li>
                  Comply with the terms of service and acceptable use policies of any third-party messaging platform you connect to
                </li>
                <li>
                  Not use any integration channel to send unsolicited bulk messages, spam, or communications that violate applicable platform policies
                </li>
                <li>
                  Acknowledge that TaskBridge&apos;s ability to maintain uninterrupted service on third-party platforms is subject to those platforms&apos; availability and policy decisions, which are outside our control
                </li>
              </ul>
              <p className="mt-3">
                TaskBridge continuously evaluates and upgrades its integration infrastructure to ensure reliability, compliance, and scalability as the platform grows.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">9. AI Limitations and Disclaimer</h2>
              <p className="mb-3">You acknowledge and agree that:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>AI-generated responses are probabilistic in nature and may occasionally be inaccurate, incomplete, or inappropriate</li>
                <li>TaskBridge&apos;s accuracy depends entirely on the quality and completeness of information provided during onboarding</li>
                <li>The AI assistant is not a substitute for professional legal, medical, financial, or regulatory advice</li>
                <li>TaskBridge does not guarantee specific business outcomes, including lead generation, sales conversion rates, or customer satisfaction metrics</li>
                <li>It is your responsibility to monitor your AI assistant&apos;s performance and notify us of any response issues</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">10. Intellectual Property</h2>
              
              <div className="mb-4">
                <h4 className="text-[15px] font-semibold text-white/90 mb-1">10.1 TaskBridge Ownership</h4>
                <p>
                  All platform infrastructure, design, codebase, branding, and underlying technology are the exclusive intellectual property of TaskBridge AI Systems. Nothing in these Terms transfers any ownership rights to you.
                </p>
              </div>

              <div className="mb-4">
                <h4 className="text-[15px] font-semibold text-white/90 mb-1">10.2 Client Content</h4>
                <p>
                  You retain full ownership of all business information, FAQs, and content you provide for AI training. By submitting this content, you grant TaskBridge a limited, non-exclusive license to use it solely for the purpose of configuring and operating your AI assistant.
                </p>
              </div>

              <div className="mb-4">
                <h4 className="text-[15px] font-semibold text-white/90 mb-1">10.3 Aggregated &amp; Anonymized Data</h4>
                <p>
                  TaskBridge may collect, analyze, and use aggregated, anonymized data derived from platform interactions &mdash; including conversation patterns, query categories, response outcomes, and usage behaviors &mdash; to improve, train, and develop TaskBridge&apos;s AI models, products, and services. This data will never include personally identifiable information of Business Clients or End Users, will never be attributed to any individual business, and will never be sold or licensed to third parties. All such data processing is conducted in accordance with our Privacy Policy.
                </p>
              </div>

              <div>
                <h4 className="text-[15px] font-semibold text-white/90 mb-1">10.4 Feedback</h4>
                <p>
                  Any feedback, suggestions, or improvement ideas you share with TaskBridge may be used by us to improve the platform without any obligation of compensation or attribution.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">11. Confidentiality</h2>
              <p>
                TaskBridge treats all business information submitted during onboarding as confidential. We will not share your proprietary business data, pricing, or internal FAQs with third parties except as required to operate the service or as required by law. See our Privacy Policy for full details.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">12. Partner Program</h2>
              <p className="mb-3">
                TaskBridge operates a Partner Program allowing individuals to earn commissions by referring paying clients. Partners agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Promote TaskBridge honestly and accurately</li>
                <li>Not make false claims about the platform&apos;s capabilities</li>
                <li>Not engage in spam, misleading advertising, or coercive referral tactics</li>
              </ul>
              <p>
                TaskBridge reserves the right to modify partner commission rates, tier structures, or program terms at any time with reasonable notice. Partners who violate these Terms will be removed from the program and forfeit pending commissions.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">13. Limitation of Liability</h2>
              <p className="mb-3">To the maximum extent permitted by applicable law:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>TaskBridge shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the platform</li>
                <li>Our total liability to any Business Client for any claim shall not exceed the Setup Fee paid by that client</li>
                <li>TaskBridge is not responsible for lost revenue, missed leads, or business losses resulting from service downtime, AI inaccuracies, or third-party channel disruptions</li>
              </ul>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">14. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless TaskBridge AI Systems, its founders, employees, and contractors from any claims, damages, losses, or legal costs arising from:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Your use of the platform in violation of these Terms</li>
                <li>Content you submitted that caused harm to end users or third parties</li>
                <li>Your failure to comply with applicable laws in your use of the service</li>
              </ul>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">15. Termination</h2>
              <p className="mb-2"><strong className="text-white/95">By You:</strong> You may discontinue use of TaskBridge at any time. Termination does not entitle you to a refund under the non-refundable payment policy.</p>
              <p className="mb-2"><strong className="text-white/95">By TaskBridge:</strong> We reserve the right to suspend or terminate your access immediately and without notice if you violate these Terms, engage in fraudulent activity, or pose a risk to other users or the platform&apos;s integrity.</p>
              <p>
                Upon termination, your AI assistant will be deactivated and your business data will be retained per the schedule outlined in our Privacy Policy before deletion.
              </p>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">16. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of Nigerian courts. TaskBridge will always attempt to resolve disputes amicably before any formal proceedings.
              </p>
            </section>

            {/* Section 17 */}
            <section>
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">17. Changes to These Terms</h2>
              <p className="mb-3">
                TaskBridge may update these Terms periodically. When we do, we will revise the &ldquo;Last updated&rdquo; date at the top of this page. For material changes, active Business Clients will be notified via email.
              </p>
              <p>
                Continued use of the platform after changes take effect constitutes acceptance of the revised Terms.
              </p>
            </section>

            {/* Section 18 */}
            <section className="border-t border-white/10 pt-6 mt-6">
              <h2 className="text-[18px] font-bold text-[#F8FAFC] mb-3">18. Contact</h2>
              <p className="mb-1">For questions, disputes, or legal notices regarding these Terms:</p>
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
