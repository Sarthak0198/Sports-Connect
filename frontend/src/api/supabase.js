import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://yxqdmjtavnddtzxhyodf.supabase.co';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cWRtanRhdm5kZHR6eGh5b2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3OTQ1MDIsImV4cCI6MjEwNzM3MDUwMn0.A_EeYrnlCE20YcR6SrbK1rbR3UcZmrzWCaHVH4QL7FE';

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
