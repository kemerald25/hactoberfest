export const siteConfig = {
  name: "TaskBridge",
  legalName: "TaskBridge AI Systems",
  hubName: "TaskBridge Hub",
  hubBadge: "A TaskBridge project",
  description:
    "Elevate your business with professional, 24/7 AI-powered customer support and embeddable live chat widgets that learn your brand voice and automate customer tasks.",
  hubDescription:
    "Daily intelligence, workflow automation, and tech guides for fast-growing businesses.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.taskbridge.ai",
  ogImage: "https://www.taskbridge.ai/og-image.png",
  locale: "en_US",
  links: {
    x: "https://x.com/TaskBridge_AI",
    xHandle: "@TaskBridge_AI",
    linkedin: "https://www.linkedin.com/company/taskbridge-ai/",
    tiktok: "https://www.tiktok.com/@taskbridge",
    supportEmail: "support@taskbridge.ai",
  },
  categories: [
    { name: "Funding", slug: "funding", description: "Venture deals, angel rounds, and capital flows into Nigerian tech." },
    { name: "Startups", slug: "startups", description: "New launches, product updates, and founder spotlights." },
    { name: "Fintech", slug: "fintech", description: "Payments, neobanks, FX, regulations, and financial infrastructure." },
    { name: "Web3", slug: "web3", description: "Crypto, blockchain applications, and decentralized networks." },
    { name: "Dev Tools", slug: "dev-tools", description: "Engineering tools, infrastructure, open-source, and builder guides." },
    { name: "Guides", slug: "guides", description: "Actionable tutorials, automation playbooks, and business growth." },
    { name: "Daily Brief", slug: "daily-brief", description: "Bite-sized morning intelligence and curated Nigerian tech headlines." },
  ] as const,
};

export type SiteConfig = typeof siteConfig;

// Calculate reading time from text (~200 words per minute)
export function calculateReadingTime(text: string): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
