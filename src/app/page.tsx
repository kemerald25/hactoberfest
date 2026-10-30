import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { HomeClient } from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "TaskBridge | 24/7 AI Customer Support & Live Embeddable Widgets",
  description:
    "Automate customer replies, resolve tasks instantly, and boost conversions. Custom AI customer support trained on your business with live embeddable chat widgets.",
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: "TaskBridge | AI Customer Support & Live Embeddable Widgets",
    description:
      "Automate customer replies, resolve tasks instantly, and boost conversions. Custom AI customer support trained on your business with live embeddable chat widgets.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "TaskBridge - AI Customer Support & Live Embeddable Widgets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskBridge | AI Customer Support & Live Embeddable Widgets",
    description:
      "Automate customer replies, resolve tasks instantly, and boost conversions. Custom AI customer support with embeddable widgets.",
    creator: siteConfig.links.xHandle,
    images: [siteConfig.ogImage],
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        "name": siteConfig.name,
        "legalName": siteConfig.legalName,
        "url": siteConfig.url,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteConfig.url}/logo.png`,
          "width": 512,
          "height": 512,
        },
        "sameAs": [
          siteConfig.links.x,
          siteConfig.links.linkedin,
          siteConfig.links.tiktok,
        ],
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "email": siteConfig.links.supportEmail,
            "contactType": "customer service",
            "availableLanguage": ["English", "Nigerian Pidgin"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        "url": siteConfig.url,
        "name": siteConfig.name,
        "description": siteConfig.description,
        "publisher": {
          "@id": `${siteConfig.url}/#organization`,
        },
        "inLanguage": siteConfig.locale,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
