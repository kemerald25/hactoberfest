"use client";

import React, { useState } from "react";
import { Twitter, Linkedin, Link as LinkIcon, Check } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

interface BlogShareProps {
  title: string;
  slug: string;
}

export function BlogShare({ title, slug }: BlogShareProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : siteConfig.url;
  const canonicalPostUrl = `${baseUrl}/blog/${slug}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${title} — Read on TaskBridge Lab: ${canonicalPostUrl}?utm_source=whatsapp&utm_medium=social&utm_campaign=community`
  )}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(
    `${canonicalPostUrl}?utm_source=twitter&utm_medium=social&utm_campaign=community`
  )}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    `${canonicalPostUrl}?utm_source=linkedin&utm_medium=social&utm_campaign=community`
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${canonicalPostUrl}?utm_source=copylink&utm_medium=social&utm_campaign=community`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-b border-white/5 py-6 my-10 gap-4">
      <div className="text-[13px] font-semibold uppercase tracking-[0.1em] text-white/35">
        Share this article
      </div>
      <div className="flex items-center gap-3">
        {/* WhatsApp (First) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-white/10 bg-[#0D0B21]/50 hover:bg-[#25D366]/15 hover:border-[#25D366]/40 flex items-center justify-center text-white/60 hover:text-[#25D366] transition-all duration-300"
          title="Share on WhatsApp"
        >
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>

        {/* Twitter / X */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-white/10 bg-[#0D0B21]/50 hover:bg-[#8B5CF6]/15 hover:border-[#8B5CF6]/30 flex items-center justify-center text-white/60 hover:text-white transition-all duration-300"
          title="Share on X"
        >
          <Twitter className="w-4 h-4" />
        </a>

        {/* LinkedIn */}
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-white/10 bg-[#0D0B21]/50 hover:bg-[#0A66C2]/15 hover:border-[#0A66C2]/40 flex items-center justify-center text-white/60 hover:text-[#0A66C2] transition-all duration-300"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="h-10 px-4 rounded-full border border-white/10 bg-[#0D0B21]/50 hover:bg-[#8B5CF6]/15 hover:border-[#8B5CF6]/30 flex items-center gap-2 text-white/60 hover:text-white text-[13px] font-medium transition-all duration-300"
          title="Copy Link with UTM"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
