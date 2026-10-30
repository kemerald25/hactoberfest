-- Migration 019: Tech Hub & Community Extensions, Schema Constraints, and Strict RLS
-- Run this migration in your Supabase SQL Editor.

-- 1. Add new fields to public.blog_posts
ALTER TABLE public.blog_posts
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[],
    ADD COLUMN IF NOT EXISTS source_urls JSONB DEFAULT '[]'::JSONB,
    ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS seo_title TEXT,
    ADD COLUMN IF NOT EXISTS seo_description TEXT,
    ADD COLUMN IF NOT EXISTS reading_time INT DEFAULT 3;

-- 2. Update status constraint to include ('draft', 'pending_approval', 'published', 'rejected')
ALTER TABLE public.blog_posts 
    DROP CONSTRAINT IF EXISTS blog_posts_status_check;

ALTER TABLE public.blog_posts
    ADD CONSTRAINT blog_posts_status_check 
    CHECK (status IN ('draft', 'pending_approval', 'published', 'rejected'));

-- Set default status
ALTER TABLE public.blog_posts 
    ALTER COLUMN status SET DEFAULT 'draft';

-- Backfill legacy posts with default category 'Guides' if category is null
UPDATE public.blog_posts 
    SET category = 'Guides' 
    WHERE category IS NULL;

-- 3. High-performance indexes for feeds and lookup
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at 
    ON public.blog_posts (status, published_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_slug 
    ON public.blog_posts (slug);

CREATE INDEX IF NOT EXISTS idx_blog_posts_category 
    ON public.blog_posts (category);

-- 4. Secure Row Level Security (RLS) Policies
-- Ensure RLS is active
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop the old overly permissive public read/write policy
DROP POLICY IF EXISTS "Allow public read/write access for blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public select published posts" ON public.blog_posts;

-- Public (anon) can SELECT ONLY rows with status = 'published'
-- (All writes and draft queries happen via server-side service role key)
CREATE POLICY "Allow public select published posts" ON public.blog_posts
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published');

-- 5. System settings table (for agent_paused toggle and community hub state)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read of non-sensitive settings (e.g. system status)
DROP POLICY IF EXISTS "Allow public read app_settings" ON public.app_settings;
CREATE POLICY "Allow public read app_settings" ON public.app_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Initialize agent settings if not present
INSERT INTO public.app_settings (key, value)
VALUES ('agent_settings', '{"agent_paused": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;
