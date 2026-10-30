import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const revalidate = 3600; // Revalidate sitemap at most every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // 1. Core static marketing and product pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/onboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 2. Blog category archive pages
  const categoryRoutes: MetadataRoute.Sitemap = siteConfig.categories.map((cat) => ({
    url: `${baseUrl}/blog/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  // 3. Dynamic published blog articles
  let postRoutes: MetadataRoute.Sitemap = [];
  const client = supabaseAdmin || supabase;
  if (client) {
    try {
      const { data: posts, error } = await client
        .from('blog_posts')
        .select('slug, updated_at, published_at')
        .eq('status', 'published');

      if (!error && posts && posts.length > 0) {
        postRoutes = posts.map((post) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at || post.published_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
      }
    } catch (err) {
      console.error('Failed to load blog posts for sitemap:', err);
    }
  }

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
