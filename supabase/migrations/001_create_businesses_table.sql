-- Migration: Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    business_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    knowledge_base TEXT,
    theme_color TEXT DEFAULT '#000000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert a dummy business for testing
INSERT INTO public.businesses (business_id, name, system_prompt, knowledge_base, theme_color)
VALUES (
    'mindshift',
    'Mindshift Consulting',
    'You are a professional business consultant for Mindshift Consulting. Answer questions concisely and professionally. If asked about pricing, say we offer custom quotes.',
    'FAQ: We operate Monday to Friday 9 AM to 5 PM WAT. We offer strategy consulting and technical implementation.',
    '#3b82f6'
) ON CONFLICT (business_id) DO NOTHING;

-- Optional: Enable Row Level Security (RLS) if you want to lock it down later
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Allow public read access to business configuration (for the widget to load)
CREATE POLICY "Allow public read access" ON public.businesses
    FOR SELECT USING (true);
