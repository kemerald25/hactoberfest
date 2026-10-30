"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, User } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  author_name: string;
  published_at: string;
}

interface BlogHeroCarouselProps {
  posts: BlogPost[];
}

export function BlogHeroCarousel({ posts }: BlogHeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    
    // Autoplay implementation
    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 6000);

    return () => {
      clearInterval(intervalId);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!posts || posts.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/5 bg-[#0A071E]/40 backdrop-blur-md">
      
      {/* Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex select-none">
          {posts.map((post, idx) => (
            <div 
              key={post.id} 
              className="relative min-w-full flex-shrink-0 flex-grow-0 flex-basis-full min-h-[420px] sm:min-h-[500px] flex flex-col justify-end p-6 sm:p-12 md:p-16"
            >
              {/* Background Cover Image with Gradient Mask */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {post.cover_image ? (
                  <Image 
                    src={post.cover_image} 
                    alt={post.title} 
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                    priority={idx === 0}
                    sizes="(max-width: 1200px) 100vw, 1120px"
                    className="object-cover opacity-35 transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1C173E] to-[#0A071E] opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-[#060810]/70 to-transparent" />
              </div>

              {/* Text content card */}
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#a78bfa] text-[11px] font-semibold uppercase tracking-wider">
                  Featured Article
                </span>
                
                <h2 className="text-[26px] sm:text-[40px] font-extrabold text-white leading-tight tracking-tight hover:text-[#a78bfa] transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="text-white/60 text-[14px] sm:text-[16px] leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Metadata & CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                  <div className="flex flex-wrap items-center gap-4 text-white/40 text-[12.5px]">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      {post.author_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white hover:text-[#a78bfa] transition-colors sm:ml-auto w-fit"
                  >
                    <span>Read Full Post</span>
                    <ArrowRight className="w-4 h-4 text-[#8B5CF6]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dot indicators */}
      <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-12 z-20 flex items-center gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? "w-8 bg-[#8B5CF6]" 
                : "w-2 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
