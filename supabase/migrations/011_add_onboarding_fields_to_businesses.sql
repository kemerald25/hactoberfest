-- Migration: Add onboarding fields to businesses table
-- Supports self-service business onboarding via /onboard page

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS owner_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS website_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS business_description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS setup_status TEXT DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS signup_source TEXT DEFAULT 'direct';

-- Backfill: all existing businesses are already live
UPDATE public.businesses SET setup_status = 'live' WHERE setup_status IS NULL OR setup_status = '';

-- Note: referred_by_code column already added by earlier migration (010)
-- signup_source already added by earlier migration (admin.ts createBusiness logic)
-- These columns are safe no-ops if already present due to IF NOT EXISTS
