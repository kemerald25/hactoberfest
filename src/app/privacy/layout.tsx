import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Privacy Policy | TaskBridge',
  description: 'Understand how TaskBridge collects, uses, and safeguards customer data and WhatsApp conversations for Nigerian businesses.',
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | TaskBridge',
    description: 'Understand how TaskBridge protects customer data and business communications.',
    url: `${siteConfig.url}/privacy`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | TaskBridge',
    description: 'Understand how TaskBridge protects customer data and business communications.',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
