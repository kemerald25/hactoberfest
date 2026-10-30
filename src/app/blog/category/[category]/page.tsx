import { getBlogPosts } from "@/app/actions/blog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CTABanner } from "@/components/CTABanner";
import { BlogNewsletter } from "@/components/BlogNewsletter";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Clock, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

function findCategory(slug: string) {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  return siteConfig.categories.find(
    (c) => c.slug.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
  );
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = findCategory(category);

  if (!cat) {
    return {
      title: "Category Not Found | TaskBridge Lab",
    };
  }

  const pageUrl = `${siteConfig.url}/blog/category/${cat.slug}`;
  const title = `${cat.name} News & Analysis | TaskBridge Lab`;
  const description = `${cat.description} Follow the latest Nigerian technology ecosystem developments on TaskBridge Lab.`;

  return {
    title: title.slice(0, 60),
    description: description.slice(0, 155),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: title.slice(0, 60),
      description: description.slice(0, 155),
      url: pageUrl,
      siteName: siteConfig.hubName,
      locale: siteConfig.locale,
      type: "website",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${cat.name} on TaskBridge Lab`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title.slice(0, 60),
      description: description.slice(0, 155),
      creator: siteConfig.links.xHandle,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const { page: pageStr } = await searchParams;
  const cat = findCategory(category);

  if (!cat) {
    notFound();
  }

  const currentPage = parseInt(pageStr || "1", 10) || 1;

  const res = await getBlogPosts({
    category: cat.name,
    page: currentPage,
    limit: 12,
  });

  const posts = res.success && res.data ? res.data : [];
  const totalPages = res.totalPages || 1;

  return (
    <main className="relative min-h-screen bg-[#060810] bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] overflow-x-hidden pt-[110px] pb-16 font-sans text-white">
      <Navbar />

      {/* Glow */}
      <div className="absolute top-[220px] left-1/2 -translate-x-1/2 w-[300px] sm:w-[900px] h-[300px] sm:h-[550px] bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_60%)] pointer-events-none z-0" />

      <div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 relative z-10 space-y-10 pt-4">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <Link href="/blog" className="hover:text-white transition-colors">Community</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[#a78bfa] font-semibold">{cat.name}</span>
        </nav>

        {/* Category Header */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold uppercase tracking-wider text-[#c4b5fd]">
            Category Archive
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {cat.name}
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            {cat.description}
          </p>
        </div>

        {/* Category Bar for switching */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0D1117]/60 text-white/60 hover:text-white border border-white/5 hover:border-white/10 whitespace-nowrap transition-colors"
          >
            ← All Stories
          </Link>
          {siteConfig.categories.map((c) => {
            const isActive = c.slug === cat.slug;
            return (
              <Link
                key={c.slug}
                href={`/blog/category/${c.slug}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-[#0D1117]/60 text-white/60 hover:text-white border border-white/5 hover:border-white/10"
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-[#0D1117]/40 hover:border-[#8B5CF6]/30 transition-all duration-300 overflow-hidden shadow-lg h-full"
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
                        <div className="w-full h-full bg-gradient-to-br from-[#1C173E] to-[#0A071E] opacity-50" />
                      )}
                    </div>

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

                      <h2 className="text-[17px] font-bold text-white group-hover:text-[#a78bfa] transition-colors leading-snug line-clamp-2">
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
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-white group-hover:text-[#a78bfa] transition-colors"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8B5CF6] group-hover:translate-x-0.5 transition-transform" />
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
                    href={`/blog/category/${cat.slug}?page=${currentPage - 1}`}
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
                    href={`/blog/category/${cat.slug}?page=${currentPage + 1}`}
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
            <p className="text-white/40 text-sm">No stories published in {cat.name} yet.</p>
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
