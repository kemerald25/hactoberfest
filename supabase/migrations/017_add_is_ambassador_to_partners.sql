-- Migration: Add is_ambassador column to campus_partners table
ALTER TABLE public.campus_partners ADD COLUMN IF NOT EXISTS is_ambassador BOOLEAN DEFAULT FALSE;
