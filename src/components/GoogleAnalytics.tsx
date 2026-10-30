"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();

  const GA_ID = "G-4DYLY8BDSY";

  const checkConsent = () => {
    if (typeof window === "undefined") return;
    try {
      const cookies = document.cookie.split("; ");
      let consentGranted = false;
      for (let i = 0; i < cookies.length; i++) {
        if (cookies[i].indexOf("taskbridge_cookie_consent=") === 0) {
          const consentVal = JSON.parse(
            decodeURIComponent(cookies[i].substring("taskbridge_cookie_consent=".length))
          );
          if (consentVal.analytics) {
            consentGranted = true;
          }
          break;
        }
      }
      setEnabled(consentGranted);
    } catch (err) {
      setEnabled(false);
    }
  };

  useEffect(() => {
    // Check initial consent status
    checkConsent();

    // Listen for changes in consent
    window.addEventListener("cookieConsentUpdated", checkConsent);
    return () => {
      window.removeEventListener("cookieConsentUpdated", checkConsent);
    };
  }, []);

  // Track dynamic route transitions in Single Page Application layout
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !(window as any).gtag) return;
    const url = pathname + window.location.search;
    (window as any).gtag("config", GA_ID, {
      page_path: url,
    });
  }, [pathname, enabled]);

  if (!enabled) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname + window.location.search,
            });
          `,
        }}
      />
    </>
  );
}
export default GoogleAnalytics;
