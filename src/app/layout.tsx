import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NoiseOverlay, LenisInit } from "@/components/GlobalAtmosphere";
import CookieConsent from "@/components/CookieConsent";
import { AlertProvider } from "@/components/AlertProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "./",
  },
  title: {
    default: `${siteConfig.name} | Intelligent Business AI & Customer Widget`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'AI assistant',
    'AI widget',
    'customer support AI',
    'TaskBridge',
    'business automation',
    'embeddable live chat',
    'workflow automation',
  ],
  authors: [{ name: 'TaskBridge Team' }],
  creator: siteConfig.name,
  publisher: siteConfig.legalName,
  robots: {
    index: process.env.VERCEL_ENV !== 'preview',
    follow: process.env.VERCEL_ENV !== 'preview',
    googleBot: {
      index: process.env.VERCEL_ENV !== 'preview',
      follow: process.env.VERCEL_ENV !== 'preview',
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.jpg',
    shortcut: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Intelligent Business AI Assistant`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Intelligent Business AI Assistant`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | Intelligent Business AI Assistant`,
    description: siteConfig.description,
    creator: siteConfig.links.xHandle,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark scroll-smooth ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Sora:wght@100..800&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // 1. Capture referral code parameter
                var urlParams = new URLSearchParams(window.location.search);
                var ref = urlParams.get('ref');
                if (ref) {
                  document.cookie = "taskbridge_ref=" + encodeURIComponent(ref) + "; path=/; max-age=" + (30 * 24 * 60 * 60) + "; SameSite=Lax; Secure";
                }

                // 2. Generate persistent device fingerprint ID
                var cookies = document.cookie.split('; ');
                var hasDeviceId = false;
                for (var i = 0; i < cookies.length; i++) {
                  if (cookies[i].indexOf('taskbridge_device_id=') === 0) {
                    hasDeviceId = true;
                    break;
                  }
                }
                if (!hasDeviceId) {
                  var randomId = 'dev-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36);
                  document.cookie = "taskbridge_device_id=" + randomId + "; path=/; max-age=" + (365 * 24 * 60 * 60) + "; SameSite=Lax; Secure";
                }

                // 3. Conditional marketing tags loader (Google Analytics / Pixels)
                function loadAnalytics() {
                  var currentCookies = document.cookie.split('; ');
                  var analyticsGranted = false;
                  for (var j = 0; j < currentCookies.length; j++) {
                    if (currentCookies[j].indexOf('taskbridge_cookie_consent=') === 0) {
                      try {
                        var consent = JSON.parse(decodeURIComponent(currentCookies[j].substring('taskbridge_cookie_consent='.length)));
                        if (consent.analytics) {
                          analyticsGranted = true;
                        }
                      } catch (err) {}
                      break;
                    }
                  }
                  if (analyticsGranted) {
                    window.TASKBRIDGE_ANALYTICS_ACTIVE = true;
                    console.log("Analytics scripts successfully loaded (TikTok/LinkedIn/Google).");
                  } else {
                    window.TASKBRIDGE_ANALYTICS_ACTIVE = false;
                  }
                }
                loadAnalytics();
                window.addEventListener('cookieConsentUpdated', loadAnalytics);
              } catch (e) {
                console.error("Failed to set tracking cookies", e);
              }
            `
          }}
        />
      </head>
      <body className="font-sans antialiased bg-[#060810] text-[#F8FAFC] overflow-x-hidden relative min-h-screen">
        <AlertProvider>
          {/* Global Atmosphere Layer */}
          <LenisInit />
          <NoiseOverlay />

          {/* Main Content */}
          <div className="relative z-10">
            {children}
          </div>

          {/* Cookie Consent Banner */}
          <CookieConsent />

          {/* Privacy-safe Google Analytics */}
          <GoogleAnalytics />
        </AlertProvider>
      </body>
    </html>
  );
}
