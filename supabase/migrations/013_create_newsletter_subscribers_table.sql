-- Migration: Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public users to subscribe (INSERT only)
CREATE POLICY "Allow public insert to newsletter_subscribers" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- Allow full read/write/delete access for admin queries (matching ReplyIQ's standard anon client configuration, with auth enforced in server actions)
CREATE POLICY "Allow admin read/write/delete access to newsletter_subscribers" ON public.newsletter_subscribers
    FOR ALL USING (true) WITH CHECK (true);
