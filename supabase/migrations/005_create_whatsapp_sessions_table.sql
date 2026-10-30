-- Migration: Create whatsapp_sessions table
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
    phone TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(business_id) ON DELETE CASCADE,
    history JSONB DEFAULT '[]'::jsonb NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all public/anon access for the Next.js API client (which uses the anon key)
CREATE POLICY "Allow public all access" ON public.whatsapp_sessions
    FOR ALL USING (true) WITH CHECK (true);
