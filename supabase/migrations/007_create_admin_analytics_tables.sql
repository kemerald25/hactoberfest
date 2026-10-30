-- Migration: Create admin analytics, logging, and operational tables

-- 1. Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'success' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create error_logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    message TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Alter businesses table to add status, renewal, and signup attributes
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'trial' NOT NULL;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS signup_source TEXT DEFAULT 'direct' NOT NULL;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS referred_by_code TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS email_contact TEXT;

-- Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (for Server Actions anon usage)
CREATE POLICY "Allow public read/write access for transactions" ON public.transactions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read/write access for activity_logs" ON public.activity_logs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read/write access for error_logs" ON public.error_logs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read/write access for announcements" ON public.announcements
    FOR ALL USING (true) WITH CHECK (true);
