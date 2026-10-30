-- Migration: Add authentication columns and password reset fields to businesses and campus_partners tables

-- 1. Add columns to businesses table
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS id UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;

-- 2. Add columns to campus_partners table
ALTER TABLE public.campus_partners
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance optimization on lookups
CREATE INDEX IF NOT EXISTS idx_businesses_reset_token ON public.businesses(reset_token);
CREATE INDEX IF NOT EXISTS idx_campus_partners_reset_token ON public.campus_partners(reset_token);
CREATE INDEX IF NOT EXISTS idx_businesses_secure_id ON public.businesses(id);
