import { getSupabaseAdmin, createScopedSupabaseClient } from '../config/supabase.js';
import { config } from '../config/env.js';
import { apiError } from '../utils/response.js';
import { mockUsers } from '../utils/mockStore.js';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return apiError(res, 'Authentication token required. Format: Authorization: Bearer <token>', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return apiError(res, 'Bearer token is missing', 401);
  }

  try {
    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      // Verifies the JWT cryptographically with Supabase Auth service
      const { data, error } = await admin.auth.getUser(token);

      if (error || !data?.user) {
        return apiError(res, error?.message || 'Invalid or expired authentication token', 401);
      }

      // Fetch user profile from database to determine role and profile attributes
      const { data: profile, error: profileErr } = await admin
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      req.user = {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || data.user.user_metadata?.role || 'athlete',
        full_name: profile?.full_name || data.user.user_metadata?.full_name || 'User',
        city: profile?.city || null,
        state: profile?.state || null,
        profile
      };
      req.accessToken = token;
      req.scopedSupabase = createScopedSupabaseClient(token);
      return next();
    } else {
      // Offline/Demo Mode token verification
      // Matches demo tokens or mock user IDs
      let matchedUser = mockUsers.find(u => token.includes(u.id) || token.includes(u.role));
      if (!matchedUser) {
        // Default to first athlete or mock token parser
        if (token.startsWith('demo-token-')) {
          const role = token.replace('demo-token-', '');
          matchedUser = mockUsers.find(u => u.role === role) || mockUsers[0];
        } else {
          matchedUser = mockUsers[0];
        }
      }

      req.user = {
        id: matchedUser.id,
        email: matchedUser.email,
        role: matchedUser.role,
        full_name: matchedUser.full_name,
        city: matchedUser.city,
        state: matchedUser.state,
        profile: matchedUser
      };
      req.accessToken = token;
      req.scopedSupabase = null;
      return next();
    }
  } catch (err) {
    console.error('Auth verification error:', err);
    return apiError(res, 'Authentication verification failed', 500);
  }
};

// Optional auth: attaches req.user if token is present, continues anyway
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  return requireAuth(req, res, (err) => {
    if (err) req.user = null;
    next();
  });
};
