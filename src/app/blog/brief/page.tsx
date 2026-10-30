import { getBlogPosts } from "@/app/actions/blog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CTABanner } from "@/components/CTABanner";
import { BlogNewsletter } from "@/components/BlogNewsletter";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Clock, Zap, ChevronLeft, ChevronRight, ChevronRight as BreadcrumbArrow } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

interface DailyBriefPageProps {
  searchParams: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
  title: "Daily Briefs Archive | Nigerian Tech Intelligence | TaskBridge Lab",
  description:
    "Explore the complete archive of Nigerian tech morning briefs, funding alerts, regulatory updates, and ecosystem roundups.",
  alternates: {
    canonical: `${siteConfig.url}/blog/brief`,
  },
  openGraph: {
    title: "Daily Briefs Archive | TaskBridge Lab",
    description:
      "Explore the complete archive of Nigerian tech morning briefs, funding alerts, and ecosystem roundups.",
    url: `${siteConfig.url}/blog/brief`,
    siteName: siteConfig.hubName,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "TaskBridge Lab Daily Briefs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Briefs Archive | TaskBridge Lab",
    description: "Browse Nigerian tech morning intelligence briefings from TaskBridge Lab.",
    creator: siteConfig.links.xHandle,
    images: [siteConfig.ogImage],
  },
};

export default async function DailyBriefArchivePage({ searchParams }: DailyBriefPageProps) {
  const { page: pageStr } = await searchParams;
  const currentPage = parseInt(pageStr || "1", 10) || 1;

  const res = await getBlogPosts({
    category: "Daily Brief",
    page: currentPage,
    limit: 12,
  });

  const posts = res.success && res.data ? res.data : [];
  const totalPages = res.totalPages || 1;

  return (
    <main className="relative min-h-screen bg-[#060810] bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] overflow-x-hidden pt-[110px] pb-16 font-sans text-white">
      <Navbar />

      {/* Atmospheric Glow */}
      <div className="absolute top-[220px] left-1/2 -translate-x-1/2 w-[300px] sm:w-[900px] h-[300px] sm:h-[550px] bg-[radial-gradient(circle,rgba(245,158,11,0.12)_0%,transparent_60%)] pointer-events-none z-0" />

      <div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 relative z-10 space-y-10 pt-4">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 text-white/30" />
          <Link href="/blog" className="hover:text-white transition-colors">Community</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 text-white/30" />
          <span className="text-amber-400 font-semibold">Daily Briefs</span>
        </nav>

        {/* Header */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Morning Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            The Daily Brief Archive
          </h1>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed">
            Every edition of our 3-minute morning roundup covering Nigerian startup rounds, fintech policy, dev tools, and ecosystem signals.
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-[#0D1117]/40 hover:border-amber-500/30 transition-all duration-300 overflow-hidden shadow-lg h-full"
                >
                  <div className="space-y-4">
                    <div className="aspect-[16/10] overflow-hidden bg-[#0A071E] relative border-b border-white/5">
                      {post.cover_image ? (
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          unoptimized
                          referrerPolicy="no-referrer"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1C173E] to-[#0A071E] opacity-50 flex items-center justify-center">
                          <Zap className="w-12 h-12 text-amber-400/30" />
                        </div>
                      )}
                    </div>

                    <div className="px-5 space-y-2.5">
                      <div className="flex items-center gap-3 text-white/40 text-[11px] font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400/70" />
                          {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                          {post.reading_time || 2}m read
                        </span>
                      </div>

                      <h2 className="text-[17px] font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>

                      <p className="text-white/50 text-[13px] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-amber-300 hover:text-amber-200 transition-colors"
                    >
                      <span>Read Brief</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-8">
                {currentPage > 1 && (
                  <Link
                    href={`/blog/brief?page=${currentPage - 1}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Link>
                )}

                <span className="px-4 py-2 rounded-xl bg-[#0D1117] border border-white/10 text-xs font-mono text-white/60">
                  {currentPage} of {totalPages}
                </span>

                {currentPage < totalPages && (
                  <Link
                    href={`/blog/brief?page=${currentPage + 1}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#0D1117]/50 border border-white/5 rounded-3xl p-16 text-center max-w-md mx-auto space-y-3">
            <p className="text-white/40 text-sm">No Daily Briefs published yet.</p>
            <Link href="/blog" className="inline-block text-[#a78bfa] hover:underline text-xs font-semibold">
              Browse all stories →
            </Link>
          </div>
        )}

        <BlogNewsletter />
        <CTABanner />

      </div>

      <Footer />
    </main>
  );
}
