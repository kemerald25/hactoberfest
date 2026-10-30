import { getBlogPostForPreview } from "@/app/actions/blog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CTABanner } from "@/components/CTABanner";
import { BlogPreviewBanner } from "@/components/BlogPreviewBanner";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowLeft, Clock, ExternalLink, Bot, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Draft Preview | TaskBridge Lab",
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default async function BlogPreviewPage({ params, searchParams }: PreviewPageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="relative min-h-screen bg-[#060810] text-white flex flex-col pt-[120px] pb-16 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto relative z-10">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-[26px] font-extrabold">Preview Token Missing</h1>
          <p className="text-white/45 text-[14px]">
            This draft requires an authorized cryptographic preview token from your Telegram bot notification.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[#8B5CF6] hover:text-[#7C3AED] font-bold text-[13.5px] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tech Hub
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const res = await getBlogPostForPreview(id, token);

  if (!res.success || !res.data) {
    return (
      <main className="relative min-h-screen bg-[#060810] text-white flex flex-col pt-[120px] pb-16 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto relative z-10">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-[26px] font-extrabold">Unauthorized Preview</h1>
          <p className="text-white/45 text-[14px]">
            {res.error || "The preview token is invalid or this draft has expired."}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[#8B5CF6] hover:text-[#7C3AED] font-bold text-[13.5px] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tech Hub
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const post = res.data;
  const postDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const readingTime = post.reading_time || 3;

  return (
    <main className="relative min-h-screen bg-[#060810] text-white flex flex-col pt-[130px] pb-16 font-sans">
      <Navbar />

      {/* Secret Preview Action Banner */}
      <BlogPreviewBanner
        postId={post.id}
        token={token}
        slug={post.slug}
        initialStatus={post.status}
      />

      <article className="flex-1 w-full max-w-[820px] mx-auto px-4 sm:px-6 relative z-10 space-y-8 mt-4 pb-28">
        
        {/* Navigation Breadcrumb & Notice */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Link href="/blog" className="hover:text-white transition-colors">
              Tech Hub
            </Link>
            <span>/</span>
            <span className="text-purple-400 font-medium">Draft Preview</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Unpublished Draft</span>
          </span>
        </div>

        {/* Header Block */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {post.category && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                {post.category}
              </span>
            )}
            {post.ai_generated && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Bot className="w-3 h-3" />
                <span>AI Curated</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-white/70 leading-relaxed font-normal">
              {post.excerpt}
            </p>
          )}

          {/* Author & Meta Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/10 text-xs sm:text-sm text-white/50">
            <div className="flex items-center gap-2">
              {post.author_avatar ? (
                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-white/10">
                  <Image
                    src={post.author_avatar}
                    alt={post.author_name || "Author"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <User className="w-4 h-4 text-purple-400" />
              )}
              <span className="text-white/80 font-medium">{post.author_name || "TaskBridge Lab"}</span>
            </div>

            <span>•</span>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-white/40" />
              <span>{postDate}</span>
            </div>

            <span>•</span>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-white/40" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>

        {/* Featured Cover Image */}
        {post.cover_image && (
          <div className="relative w-full aspect-video sm:aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              unoptimized
              referrerPolicy="no-referrer"
              className="object-cover"
              sizes="(max-width: 820px) 100vw, 820px"
            />
          </div>
        )}

        {/* Body Content */}
        <div className="pt-4 border-t border-white/5">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Source Citations */}
        {post.source_urls && post.source_urls.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
              Original Sources &amp; Attribution
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              {post.source_urls.map((src, i) => (
                <li key={i} className="flex items-center gap-1.5 text-white/70">
                  <span className="text-purple-400">•</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 hover:text-purple-200 underline underline-offset-2 inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{src.title || src.publisher || src.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {src.publisher && src.title && (
                    <span className="text-white/40">({src.publisher})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Product CTA */}
        <div className="pt-8">
          <CTABanner />
        </div>
      </article>

      <Footer />
    </main>
  );
}
