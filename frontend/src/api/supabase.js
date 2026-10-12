import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your_anon_key';

export const isLiveSupabase = () => {
  return !!(
    supabaseUrl &&
    !supabaseUrl.includes('your-project') &&
    supabaseKey &&
    supabaseKey.length > 20
  );
};

// Initializes the Supabase client safely
export const supabase = isLiveSupabase()
  ? createClient(supabaseUrl, supabaseKey)
  : null;
