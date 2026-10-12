import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

let adminClient = null;

// Privileged server-side client using secret/service-role key
export const getSupabaseAdmin = () => {
  if (!config.isSupabaseConfigured()) {
    return null;
  }
  if (!adminClient) {
    adminClient = createClient(config.supabase.url, config.supabase.secretKey || config.supabase.publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return adminClient;
};

// Request-scoped client authenticated with user's JWT token (respects RLS)
export const createScopedSupabaseClient = (accessToken) => {
  if (!config.isSupabaseConfigured() || !accessToken) {
    return null;
  }
  return createClient(config.supabase.url, config.supabase.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};
