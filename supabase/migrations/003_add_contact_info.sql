-- Migration: Add contact fields to businesses table
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS support_email TEXT;

-- Update existing demo business 'mindshift' with dummy contact data
UPDATE public.businesses
SET 
  whatsapp_number = '+1 (555) 123-4567',
  support_email = 'support@mindshift.com'
WHERE business_id = 'mindshift';

-- Update existing demo business 'replyiq' with dummy contact data
UPDATE public.businesses
SET 
  whatsapp_number = '+1 (555) 987-6543',
  support_email = 'hello@replyiq.com'
WHERE business_id = 'replyiq';
