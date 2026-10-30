import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Terms of Service | TaskBridge',
  description: 'Review the terms and conditions governing the use of TaskBridge AI support assistants, bridges, and setup plans.',
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | TaskBridge',
    description: 'Review terms and conditions for TaskBridge AI support assistants and setup plans.',
    url: `${siteConfig.url}/terms`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | TaskBridge',
    description: 'Review terms and conditions for TaskBridge AI support assistants and setup plans.',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
