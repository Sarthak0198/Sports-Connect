import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://mjrceqxnrmkvefdpwlne.supabase.co';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcmNlcXhucm1rdmVmZHB3bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NzUwNDEsImV4cCI6MjEwNzQ1MTA0MX0.rXz04_l4kXymlNhohLH3X9zq5IMVR-sk8AKu9_culis';

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
