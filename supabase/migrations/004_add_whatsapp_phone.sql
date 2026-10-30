-- Migration: Add whatsapp_phone column to businesses table
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT UNIQUE;

COMMENT ON COLUMN public.businesses.whatsapp_phone IS 'The unique WhatsApp admin bot phone number in E.164 format for this business tenant (if any).';
