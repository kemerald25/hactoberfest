import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Get Started with TaskBridge | Setup in 5 Minutes',
  description: 'Launch your AI WhatsApp assistant. Select your plan, configure business details, and start automating customer replies today.',
  alternates: {
    canonical: `${siteConfig.url}/onboard`,
  },
  openGraph: {
    title: 'Get Started with TaskBridge | Setup in 5 Minutes',
    description: 'Launch your AI WhatsApp assistant. Select your plan, configure business details, and start automating customer replies today.',
    url: `${siteConfig.url}/onboard`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'TaskBridge Onboarding',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Started with TaskBridge | Setup in 5 Minutes',
    description: 'Launch your AI WhatsApp assistant. Select your plan and automate support today.',
    creator: siteConfig.links.xHandle,
    images: [siteConfig.ogImage],
  },
};

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
