-- Migration: Allow public read/write access for businesses table
DROP POLICY IF EXISTS "Allow public read access" ON public.businesses;

CREATE POLICY "Allow public read/write access for businesses" ON public.businesses
    FOR ALL USING (true) WITH CHECK (true);
