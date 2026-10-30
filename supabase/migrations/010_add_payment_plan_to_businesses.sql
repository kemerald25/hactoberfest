-- Migration: Add payment plan and installment tracking columns to businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS payment_plan TEXT DEFAULT 'trial' NOT NULL;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS installments_paid INTEGER DEFAULT 0 NOT NULL;
