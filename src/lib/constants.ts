import { NavLink, Feature, Step, Testimonial } from "@/types";

export const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Live Demo", href: "#demo" },
  { label: "Contact", href: "#contact" },
];

export const STEPS: Step[] = [
  {
    number: 1,
    title: "Connect Business Data",
    description: "Securely upload your FAQs, documentation, and brand guidelines to train your assistant.",
  },
  {
    number: 2,
    title: "Customize Tone & Scope",
    description: "Fine-tune ARIA's personality and define exactly what she can and cannot handle.",
  },
  {
    number: 3,
    title: "Deploy Anywhere",
    description: "Embed on your site with one line of code or integrate directly into your mobile app.",
  },
];

export const FEATURES: Feature[] = [
  {
    id: "f1",
    title: "24/7 Availability",
    description: "Never miss a lead. Your assistant handles global inquiries while you sleep.",
    icon: "Clock",
  },
  {
    id: "f2",
    title: "Instant Responses",
    description: "Wait times are eliminated. ARIA responds in milliseconds with accurate info.",
    icon: "Zap",
  },
  {
    id: "f3",
    title: "Contextual Learning",
    description: "Your assistant continuously improves by learning from every interaction.",
    icon: "Brain",
  },
  {
    id: "f4",
    title: "Seamless Escalation",
    description: "Complex issues are gracefully transitioned to your human team when needed.",
    icon: "Users",
  },
  {
    id: "f5",
    title: "Analytics Dashboard",
    description: "Gain deep insights into customer pain points and interaction trends.",
    icon: "BarChart3",
  },
  {
    id: "f6",
    title: "Multi-channel Support",
    description: "Deploy across Web, iOS, Android, and popular messaging platforms.",
    icon: "MessageSquare",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote: "TaskBridge has transformed our customer support. We've seen a 40% reduction in ticket volume within the first month.",
    author: "Elena Vance",
    role: "Head of Operations",
    company: "NovaTech",
  },
  {
    id: "t2",
    quote: "The brand voice accuracy is uncanny. It feels like a senior team member is handling our basic inquiries.",
    author: "Marcus Thorne",
    role: "CEO",
    company: "PeakRetail",
  },
  {
    id: "t3",
    quote: "Finally, an AI assistant that actually helps instead of frustrating customers with generic responses.",
    author: "Sarah Chen",
    role: "Customer Success Lead",
    company: "Flowdesk",
  },
];

export const TRUST_LOGOS = [
  "NovaTech",
  "PeakRetail",
  "UrbanNest",
  "Flowdesk",
  "Crestline",
];
