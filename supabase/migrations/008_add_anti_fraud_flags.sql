-- Alter campus_partners to add device_id
ALTER TABLE IF EXISTS public.campus_partners 
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Alter partner_referrals to add device_id and is_suspicious flags
ALTER TABLE IF EXISTS public.partner_referrals 
ADD COLUMN IF NOT EXISTS device_id TEXT,
ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT false;
