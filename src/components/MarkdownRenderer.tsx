"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Defensive sanitization: strip any leaked JSON keys or code wrappers
  let cleanContent = content.trim();
  if (
    /^\{?\s*"title"\s*:/i.test(cleanContent) ||
    /^\{?\s*"slug"\s*:/i.test(cleanContent) ||
    /^\{?\s*"category"\s*:/i.test(cleanContent)
  ) {
    const nestedMatch = cleanContent.match(/"content"\s*:\s*"([\s\S]*)/i);
    if (nestedMatch) {
      cleanContent = nestedMatch[1]
        .replace(/"\s*,\s*"tags"[\s\S]*$/i, "")
        .replace(/"\s*\}\s*$/i, "")
        .replace(/"\s*$/i, "");
    } else {
      cleanContent = cleanContent.replace(/^[^{]*\{/, "").replace(/\}[^}]*$/, "");
    }
    cleanContent = cleanContent
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\"/g, '"')
      .trim();
  }

  // Split content into blocks by double newlines
  const blocks = cleanContent.split(/\r?\n\r?\n/);

  return (
    <div className="prose prose-invert max-w-none text-white/70 leading-relaxed space-y-6 text-[15px] sm:text-[17px] font-normal font-sans">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // --- YOUTUBE EMBED DETECTION ---
        // Match YouTube watch URLs, short URLs, or custom embed tags
        const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
        const ytMatch = trimmed.match(ytRegex);
        
        // If it's a YouTube link
        if (ytMatch && (trimmed === ytMatch[0] || trimmed.startsWith("https://www.youtube.com") || trimmed.startsWith("https://youtu.be"))) {
          const videoId = ytMatch[1];
          return (
            <div key={index} className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/5 my-8 shadow-2xl bg-[#0D1117]">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          );
        }

        // --- HEADINGS ---
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={index} className="text-white font-extrabold text-[28px] sm:text-[34px] tracking-tight pt-4 font-sans leading-tight">
              {renderInline(trimmed.substring(2))}
            </h1>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={index} className="text-white font-bold text-[22px] sm:text-[26px] tracking-tight pt-4 border-b border-white/5 pb-2 font-sans leading-tight">
              {renderInline(trimmed.substring(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={index} className="text-white font-semibold text-[18px] sm:text-[22px] tracking-tight pt-3 font-sans leading-tight">
              {renderInline(trimmed.substring(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={index} className="text-white font-semibold text-[16px] sm:text-[18px] tracking-tight pt-2 font-sans leading-tight">
              {renderInline(trimmed.substring(5))}
            </h4>
          );
        }

        // --- IMAGE ---
        // Format: ![alt](url)
        const imgRegex = /^!\[([^\]]*)\]\(([^)]+)\)$/;
        const imgMatch = trimmed.match(imgRegex);
        if (imgMatch) {
          const alt = imgMatch[1];
          const src = imgMatch[2];
          return (
            <div key={index} className="my-8 flex flex-col items-center">
              <img src={src} alt={alt} className="rounded-2xl border border-white/5 max-h-[500px] object-cover w-full shadow-2xl" />
              {alt && <span className="text-white/40 text-[12px] mt-2 font-medium italic">{alt}</span>}
            </div>
          );
        }

        // --- BLOCKQUOTE ---
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={index} className="border-l-4 border-purple-500 bg-[#8B5CF6]/5 px-5 py-4 rounded-r-xl my-4 text-white/95 italic font-medium">
              {renderInline(trimmed.replace(/^>\s+/, ""))}
            </blockquote>
          );
        }

        // --- LISTS ---
        // Bullet list
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split(/\r?\n[-*]\s+/);
          items[0] = items[0].replace(/^[-*]\s+/, "");
          return (
            <ul key={index} className="list-disc list-inside pl-4 space-y-2.5 text-white/80 my-4">
              {items.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        // Numbered list
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = trimmed.split(/\r?\n\d+\.\s+/);
          items[0] = items[0].replace(/^\d+\.\s+/, "");
          return (
            <ol key={index} className="list-decimal list-inside pl-4 space-y-2.5 text-white/80 my-4">
              {items.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        // --- DEFAULT PARAGRAPH ---
        return (
          <p key={index} className="leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Inline parser helper
function renderInline(text: string) {
  // Split input text by markdown inline tokens
  const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx} className="text-white italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={idx} className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-pink-400 font-mono text-[13.5px]">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const linkText = match[1];
        const url = match[2];
        return (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 hover:underline-offset-2 transition-all duration-250"
          >
            {linkText}
          </a>
        );
      }
    }
    return part;
  });
}
