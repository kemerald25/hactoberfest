-- Migration: Create marketing leads table for tracking and outreach funnels
CREATE TABLE IF NOT EXISTS public.marketing_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    email TEXT NOT NULL,
    source TEXT DEFAULT 'CSV Upload',
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'fetching', 'fetched', 'sending', 'sent', 'failed'
    ai_subject TEXT,
    ai_body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for marketing_leads (same as contact_leads/referrals)
CREATE POLICY "Allow public read/write access for marketing_leads" ON public.marketing_leads
    FOR ALL USING (true) WITH CHECK (true);
