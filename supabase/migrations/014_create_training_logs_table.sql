-- Migration: Create training_logs table
CREATE TABLE IF NOT EXISTS public.training_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    business_id TEXT NOT NULL REFERENCES public.businesses(business_id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('widget', 'standalone', 'whatsapp')),
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_consented BOOLEAN DEFAULT true NOT NULL,
    raw_context JSONB DEFAULT '[]'::jsonb NOT NULL
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_training_logs_business_id ON public.training_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_training_logs_channel ON public.training_logs(channel);

-- Enable Row Level Security (RLS)
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;

-- Note: No policies are created, meaning client-side/anon/authenticated users are blocked from all read/write operations.
-- Only the service_role key bypasses RLS and can read/write.
