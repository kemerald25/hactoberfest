import { getBlogPostBySlug, getRelatedPosts } from "@/app/actions/blog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CTABanner } from "@/components/CTABanner";
import { BlogShare } from "@/components/BlogShare";
import { BlogNewsletter } from "@/components/BlogNewsletter";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowLeft, Clock, ExternalLink, ChevronRight, Sparkles, Bot } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig, calculateReadingTime } from "@/lib/site-config";

export const revalidate = 60; // Revalidate dynamic content every 60 seconds

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getBlogPostBySlug(slug);

  if (!res.success || !res.data) {
    return {
      title: "Article Not Found | TaskBridge",
      description: "The requested article could not be found.",
      robots: { index: false, follow: true },
    };
  }

  const post = res.data;
  const pageUrl = `${siteConfig.url}/blog/${post.slug}`;
  const rawTitle = post.seo_title || post.title;
  const title = rawTitle.length > 55 ? `${rawTitle.slice(0, 52)}...` : rawTitle;
  const rawDesc = post.seo_description || post.excerpt || post.content.replace(/[#*`_\[\]]/g, "").substring(0, 155);
  const description = rawDesc.length > 155 ? `${rawDesc.slice(0, 152)}...` : rawDesc;
  const coverImage = post.cover_image || siteConfig.ogImage;

  return {
    title: `${title} | TaskBridge`,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${title} | TaskBridge`,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "article",
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: [post.author_name || "TaskBridge Team"],
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | TaskBridge`,
      description,
      creator: siteConfig.links.xHandle,
      images: [coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const res = await getBlogPostBySlug(slug);

  if (!res.success || !res.data) {
    return (
      <main className="relative min-h-screen bg-[#060810] text-white flex flex-col pt-[120px] pb-16 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto relative z-10">
          <h1 className="text-[28px] font-extrabold">Article Not Found</h1>
          <p className="text-white/45 text-[14px]">
            The article you are looking for does not exist or has been removed.
          </p>
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-1.5 text-[#8B5CF6] hover:text-[#7C3AED] font-bold text-[13.5px] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community Hub
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const post = res.data;
  const postUrl = `${siteConfig.url}/blog/${post.slug}`;
  const coverImage = post.cover_image || siteConfig.ogImage;
  const readingTime = post.reading_time || calculateReadingTime(post.content);

  // Fetch related articles
  const relatedRes = await getRelatedPosts(post.category, post.slug, 3);
  const relatedPosts = relatedRes.success ? relatedRes.data : [];

  // Parse source URLs if stored as array or string
  let sources: Array<{ title: string; url: string; publisher?: string }> = [];
  if (Array.isArray(post.source_urls)) {
    sources = post.source_urls;
  } else if (typeof post.source_urls === "string") {
    try {
      sources = JSON.parse(post.source_urls);
    } catch {
      sources = [];
    }
  }

  // JSON-LD Structured Data Schema for Google (Article + BreadcrumbList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${postUrl}#article`,
        "isPartOf": {
          "@type": "WebPage",
          "@id": postUrl,
          "url": postUrl,
          "name": post.title,
          "inLanguage": siteConfig.locale,
        },
        "headline": post.title.slice(0, 110),
        "description": post.excerpt || post.content.substring(0, 155),
        "image": coverImage,
        "datePublished": post.published_at || post.created_at,
        "dateModified": post.updated_at || post.created_at,
        "inLanguage": siteConfig.locale,
        "mainEntityOfPage": postUrl,
        "author": {
          "@type": "Person",
          "name": post.author_name || "TaskBridge Team",
        },
        "publisher": {
          "@type": "Organization",
          "name": siteConfig.name,
          "url": siteConfig.url,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteConfig.url}/logo.png`,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${postUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteConfig.url,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Community",
            "item": `${siteConfig.url}/blog`,
          },
          ...(post.category
            ? [
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": post.category,
                  "item": `${siteConfig.url}/blog/category/${post.category.toLowerCase().replace(/\s+/g, "-")}`,
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": post.title,
                  "item": postUrl,
                },
              ]
            : [
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": post.title,
                  "item": postUrl,
                },
              ]),
        ],
      },
    ],
  };

  return (
    <main className="relative min-h-screen bg-[#060810] bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] overflow-x-hidden pt-[110px] pb-16 font-sans text-white">
      <Navbar />

      {/* JSON-LD Script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background radial glow */}
      <div className="absolute top-[260px] left-1/2 -translate-x-1/2 w-[300px] sm:w-[900px] h-[300px] sm:h-[550px] bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_60%)] pointer-events-none z-0" />

      <article className="w-full max-w-[820px] mx-auto px-4 sm:px-6 relative z-10 space-y-8 pt-6">
        
        {/* Top Meta Bar: Breadcrumbs + Lab Project Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-white/5 pb-4">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-white/50 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            <Link href="/blog" className="hover:text-white transition-colors">Community</Link>
            {post.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                <Link 
                  href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="hover:text-[#a78bfa] transition-colors"
                >
                  {post.category}
                </Link>
              </>
            )}
          </nav>

          {/* TaskBridge Lab Project Badge */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/20 text-[#c4b5fd] text-[11px] font-semibold transition-all shrink-0 w-fit"
            title="Explore TaskBridge AI WhatsApp Assistant"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>A TaskBridge Lab project</span>
          </Link>
        </div>

        {/* Heading Section */}
        <div className="space-y-4 pt-2">
          {post.category && (
            <Link
              href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, "-")}`}
              className="inline-block px-3 py-1 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#c4b5fd] text-xs font-semibold uppercase tracking-wider hover:bg-[#8B5CF6]/25 transition-colors"
            >
              {post.category}
            </Link>
          )}

          <h1 className="text-[28px] sm:text-[44px] font-extrabold text-white leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Author/Date/Reading Time Info Box */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/50 text-[13px] border-b border-white/5 pb-5">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#8B5CF6]" />
              <span className="font-semibold text-white/80">{post.author_name}</span>
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#8B5CF6]" />
              <span>
                {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </span>
            </span>

            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8B5CF6]" />
              <span>{readingTime} min read</span>
            </span>

            {post.ai_generated && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <Bot className="w-3 h-3" />
                <span>AI Automated & Curated</span>
              </span>
            )}
          </div>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-white/70 text-[17px] sm:text-[19px] leading-relaxed italic font-medium pt-1">
            {post.excerpt}
          </p>
        )}

        {/* Cover Image */}
        {post.cover_image && (
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/5 bg-[#0D1117]/50 shadow-2xl relative">
            <Image 
              src={post.cover_image} 
              alt={post.title} 
              fill
              priority
              unoptimized
              referrerPolicy="no-referrer"
              sizes="(max-width: 820px) 100vw, 820px"
              className="object-cover"
            />
          </div>
        )}

        {/* Markdown Rendered Content */}
        <div className="pt-4">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Sources / Outbound References List */}
        {sources && sources.length > 0 && (
          <div className="mt-12 p-6 rounded-2xl border border-white/10 bg-[#0A071E]/50 backdrop-blur-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Sources & Outbound References</span>
            </h4>
            <ul className="space-y-2 text-sm">
              {sources.map((source, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400/60 select-none">•</span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-[#a78bfa] underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                  >
                    <span>{source.title || source.url}</span>
                    {source.publisher && (
                      <span className="text-white/40 text-xs">({source.publisher})</span>
                    )}
                    <ExternalLink className="w-3 h-3 text-white/30 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Social Media Sharing & Copy Link */}
        <BlogShare title={post.title} slug={post.slug} />

        {/* End of Article Newsletter */}
        <BlogNewsletter />

        {/* Related Posts Section */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="pt-10 border-t border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Related Stories & Intelligence</h3>
              {post.category && (
                <Link
                  href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  View more in {post.category} →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedPosts.map((related: any) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-white/5 bg-[#0D1117]/40 hover:border-[#8B5CF6]/30 p-4 transition-all duration-200"
                >
                  <div className="space-y-3">
                    {related.cover_image && (
                      <div className="aspect-[16/10] rounded-lg overflow-hidden relative bg-[#0A071E]">
                        <Image
                          src={related.cover_image}
                          alt={related.title}
                          fill
                          unoptimized
                          referrerPolicy="no-referrer"
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <h4 className="text-sm font-bold text-white group-hover:text-[#a78bfa] transition-colors line-clamp-2">
                      {related.title}
                    </h4>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5">
                    <span>{related.reading_time || 3} min read</span>
                    <span className="text-[#8B5CF6] group-hover:translate-x-1 transition-transform">Read →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>

      {/* Conversion CTABanner */}
      <CTABanner />

      <Footer />
    </main>
  );
}
