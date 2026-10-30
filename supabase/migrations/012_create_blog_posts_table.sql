-- Migration: Create blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published')),
    author_name TEXT DEFAULT 'ReplyIQ Team' NOT NULL,
    author_avatar TEXT DEFAULT '/favicon.jpg' NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for blog_posts table (matching ReplyIQ's standard anon client configuration, with auth enforced in server actions)
CREATE POLICY "Allow public read/write access for blog_posts" ON public.blog_posts
    FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for blog cover images and assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-assets', 'blog-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the blog-assets bucket
CREATE POLICY "Public Read Access for blog-assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'blog-assets');

CREATE POLICY "Allow Insert for blog-assets" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'blog-assets');

CREATE POLICY "Allow Delete for blog-assets" ON storage.objects
    FOR DELETE USING (bucket_id = 'blog-assets');
