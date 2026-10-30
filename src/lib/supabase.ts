import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Helper to validate if the provided string is a valid URL
const isValidUrl = (url: string | undefined): url is string => {
  if (!url || url.includes('your-project') || url.includes('YOUR_PROJECT_ID')) {
    return false;
  }
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

// Only initialize if the required environment variables are present and valid
export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey !== 'your_anon_key_here') 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

export const supabaseAdmin = (isValidUrl(supabaseUrl) && supabaseServiceKey && supabaseServiceKey !== 'your_service_role_key_here')
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
  : null;
