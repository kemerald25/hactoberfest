"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink, Loader2, Copy, Check } from "lucide-react";
import { updatePostStatusViaToken } from "@/app/actions/blog";
import Link from "next/link";

interface BlogPreviewBannerProps {
  postId: string;
  token: string;
  slug: string;
  initialStatus: string;
}

export function BlogPreviewBanner({ postId, token, slug, initialStatus }: BlogPreviewBannerProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve and publish this article live to the public?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await updatePostStatusViaToken(postId, token, "published");
      if (res.success) {
        setStatus("published");
      } else {
        setError(res.error || "Failed to publish article.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to approve article.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this draft? It will be archived.")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await updatePostStatusViaToken(postId, token, "rejected");
      if (res.success) {
        setStatus("rejected");
      } else {
        setError(res.error || "Failed to reject article.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reject article.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-[850px] bg-[#0c0e18]/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl px-4 sm:px-6 py-3.5 shadow-[0_12px_45px_rgba(0,0,0,0.85)] ring-1 ring-white/10 transition-all">
      <div className="w-full flex flex-wrap items-center justify-between gap-3 text-sm">
        
        {/* Status badge & info */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold text-xs tracking-wide uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Draft Preview Mode</span>
          </div>

          <span className="hidden sm:inline text-white/50 text-xs">
            Status:{" "}
            <span
              className={`font-mono font-medium ${
                status === "published"
                  ? "text-emerald-400"
                  : status === "rejected"
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              {status.toUpperCase()}
            </span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-rose-400 text-xs hidden md:inline font-medium">
              {error}
            </span>
          )}

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-colors"
            title="Copy Preview Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy Link"}</span>
          </button>

          {status === "published" ? (
            <Link
              href={`/blog/${slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              <span>View Live Article</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          ) : status === "rejected" ? (
            <span className="text-rose-400 font-semibold text-xs py-1.5 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
              Draft Rejected
            </span>
          ) : (
            <>
              <button
                onClick={handleReject}
                disabled={loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Reject</span>
              </button>

              <button
                onClick={handleApprove}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold transition-all shadow-md shadow-purple-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Approve &amp; Publish</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
