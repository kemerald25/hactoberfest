import type { Metadata } from 'next';

import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Join the Partner Program | TaskBridge',
  description: 'Refer businesses to TaskBridge and earn up to ₦2,000 per sale. Unlock rewards and gain official ambassador status.',
  alternates: {
    canonical: `${siteConfig.url}/partners`,
  },
  openGraph: {
    title: 'Join the TaskBridge Partner Program',
    description: 'Refer businesses to TaskBridge and earn up to ₦2,000 per sale. Unlock rewards and gain official ambassador status.',
    url: `${siteConfig.url}/partners`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'TaskBridge Partner Program',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join the TaskBridge Partner Program',
    description: 'Refer businesses to TaskBridge and earn up to ₦2,000 per sale. Unlock rewards and gain official ambassador status.',
    creator: siteConfig.links.xHandle,
    images: [siteConfig.ogImage],
  },
};

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
