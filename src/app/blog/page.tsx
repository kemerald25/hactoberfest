import { getBlogPosts } from "@/app/actions/blog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogHeroCarousel } from "@/components/BlogHeroCarousel";
import { CTABanner } from "@/components/CTABanner";
import { BlogNewsletter } from "@/components/BlogNewsletter";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Clock, Sparkles, Send, Zap, ChevronLeft, ChevronRight, Rss } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60; // 60s ISR

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
    search?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Nigerian Tech News & SME AI Insights | TaskBridge Lab",
  description:
    "Daily briefs, startup funding rounds, fintech analysis, and AI automation guides for the Nigerian technology ecosystem.",
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
  openGraph: {
    title: "Nigerian Tech News & SME AI Insights | TaskBridge Lab",
    description:
      "Daily briefs, startup funding rounds, fintech analysis, and AI automation guides for the Nigerian technology ecosystem.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.hubName,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "TaskBridge Lab Community & News Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nigerian Tech News & SME AI Insights | TaskBridge Lab",
    description:
      "Daily briefs, startup funding rounds, fintech analysis, and AI automation guides for Nigerian builders.",
    creator: siteConfig.links.xHandle,
    images: [siteConfig.ogImage],
  },
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category, page: pageStr, search } = await searchParams;
  const currentPage = parseInt(pageStr || "1", 10) || 1;
  const activeCategory = category || "All";

  // Fetch articles
  const res = await getBlogPosts({
    category: activeCategory === "All" ? undefined : activeCategory,
    page: currentPage,
    limit: 9,
    search,
  });

  const posts = res.success && res.data ? res.data : [];
  const totalPages = res.totalPages || 1;

  // Featured carousel posts (on page 1 when viewing all)
  const isDefaultView = activeCategory === "All" && currentPage === 1 && !search;
  const carouselPosts = isDefaultView && posts.length >= 3 ? posts.slice(0, 3) : [];
  // Ensure all articles are visible in the grid feed
  const gridPosts = posts;

  // Fetch latest Daily Briefs for the Daily Brief strip
  const dailyBriefsRes = await getBlogPosts({
    category: "Daily Brief",
    page: 1,
    limit: 2,
  });
  const dailyBriefs = dailyBriefsRes.success ? dailyBriefsRes.data : [];

  return (
    <main className="relative min-h-screen bg-[#060810] bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] overflow-x-hidden pt-[110px] pb-16 font-sans text-white">
      <Navbar />

      {/* Atmospheric radial glow */}
      <div className="absolute top-[220px] left-1/2 -translate-x-1/2 w-[300px] sm:w-[950px] h-[300px] sm:h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.13)_0%,transparent_60%)] pointer-events-none z-0" />

      <div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 relative z-10 space-y-12 pt-4">
        
        {/* Hub Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-[#c4b5fd] text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>A TaskBridge Lab project</span>
            </Link>

            <a
              href="/blog/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs transition-colors"
              title="RSS Feed"
            >
              <Rss className="w-3 h-3 text-amber-400" />
              <span>RSS Feed</span>
            </a>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Nigerian Tech Intelligence &amp; SME Playbooks
          </h1>

          <p className="text-white/60 text-base sm:text-lg leading-relaxed">
            Curated daily briefs, startup funding disclosures, fintech analysis, and automation tutorials for modern Nigerian operators.
          </p>
        </div>

        {/* Daily Brief Strip (Morning Radar Banner) */}
        {dailyBriefs.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent p-5 sm:p-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Daily Brief Strip</span>
                    <span className="text-[11px] text-white/40">• Morning Roundups</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5 line-clamp-1">
                    {dailyBriefs[0].title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/blog/${dailyBriefs[0].slug}`}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold text-xs transition-colors"
                >
                  Read Today's Brief
                </Link>
                <Link
                  href="/blog/brief"
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-semibold text-xs transition-colors"
                >
                  Briefs Archive →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
          <Link
            href="/blog"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === "All"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-[#0D1117]/60 text-white/60 hover:text-white border border-white/5 hover:border-white/10"
            }`}
          >
            All Stories
          </Link>

          {siteConfig.categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <Link
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-[#0D1117]/60 text-white/60 hover:text-white border border-white/5 hover:border-white/10"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Hero Carousel (Only on front page default view) */}
        {carouselPosts.length > 0 && (
          <div className="pt-2">
            <BlogHeroCarousel posts={carouselPosts as any} />
          </div>
        )}

        {/* Post Grid */}
        {gridPosts.length > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeCategory === "All" ? "Latest Ecosystem Intelligence" : `${activeCategory} Feed`}
              </h3>
              <span className="text-xs text-white/40 font-mono">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post) => (
                <article
                  key={post.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-[#0D1117]/40 hover:border-[#8B5CF6]/30 transition-all duration-300 overflow-hidden shadow-lg h-full"
                >
                  <div className="space-y-4">
                    {/* Cover image */}
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
                        <div className="w-full h-full bg-gradient-to-br from-[#1C173E] to-[#0A071E] opacity-50" />
                      )}

                      {post.category && (
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-purple-300">
                          {post.category}
                        </span>
                      )}
                    </div>

                    {/* Metadata & Title */}
                    <div className="px-5 space-y-2.5">
                      <div className="flex items-center gap-3 text-white/40 text-[11px] font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#8B5CF6]/70" />
                          {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#8B5CF6]/70" />
                          {post.reading_time || 3}m read
                        </span>
                      </div>

                      <h4 className="text-[17px] font-bold text-white group-hover:text-[#a78bfa] transition-colors leading-snug line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h4>

                      <p className="text-white/50 text-[13px] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Read More link */}
                  <div className="p-5 pt-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-white group-hover:text-[#a78bfa] transition-colors"
                    >
                      <span>Read Full Story</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8B5CF6] group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-8">
                {currentPage > 1 && (
                  <Link
                    href={`/blog?${new URLSearchParams({
                      ...(activeCategory !== "All" && { category: activeCategory }),
                      page: (currentPage - 1).toString(),
                    }).toString()}`}
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
                    href={`/blog?${new URLSearchParams({
                      ...(activeCategory !== "All" && { category: activeCategory }),
                      page: (currentPage + 1).toString(),
                    }).toString()}`}
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
            <p className="text-white/40 text-sm">No stories published in this category yet.</p>
            <Link
              href="/blog"
              className="inline-block text-[#a78bfa] hover:underline text-xs font-semibold"
            >
              Browse all stories →
            </Link>
          </div>
        )}

        {/* Newsletter CTA */}
        <BlogNewsletter />

        {/* TaskBridge Conversion Banner */}
        <CTABanner />

      </div>

      <Footer />
    </main>
  );
}
