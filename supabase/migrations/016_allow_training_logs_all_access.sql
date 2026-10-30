-- Migration: Allow public read/write access for training_logs table
DROP POLICY IF EXISTS "Allow public all access" ON public.training_logs;

CREATE POLICY "Allow public all access" ON public.training_logs
    FOR ALL USING (true) WITH CHECK (true);
