-- Migration: Create partner program tables
CREATE TABLE IF NOT EXISTS public.campus_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT NOT NULL,
    university TEXT NOT NULL,
    faculty TEXT NOT NULL,
    department TEXT NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.partner_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.campus_partners(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.contact_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.campus_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- Allow all public/anon access for the Next.js API client / server actions (which use the anon key)
CREATE POLICY "Allow public read/write access for campus_partners" ON public.campus_partners
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read/write access for partner_referrals" ON public.partner_referrals
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read/write access for contact_leads" ON public.contact_leads
    FOR ALL USING (true) WITH CHECK (true);
