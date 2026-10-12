import { apiSuccess, apiError } from '../utils/response.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import { mockUsers } from '../utils/mockStore.js';

export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return apiError(res, 'Not authenticated', 401);
    }
    return apiSuccess(res, req.user, 'Current user retrieved');
  } catch (err) {
    next(err);
  }
};

export const syncProfile = async (req, res, next) => {
  try {
    const { full_name, role, city, state, bio, primary_sport_id } = req.body;
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();

      // Upsert profile
      const { data: profile, error } = await admin
        .from('profiles')
        .upsert({
          id: userId,
          email: req.user.email,
          full_name: full_name || req.user.full_name,
          role: role || req.user.role,
          city: city || null,
          state: state || null,
          bio: bio || null,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Also initialize athlete or coach specific profile
      if (role === 'athlete') {
        await admin.from('athlete_profiles').upsert({
          id: userId,
          primary_sport_id: primary_sport_id ? parseInt(primary_sport_id, 10) : null
        });
      } else if (role === 'coach') {
        await admin.from('coach_profiles').upsert({
          id: userId,
          primary_sport_id: primary_sport_id ? parseInt(primary_sport_id, 10) : null
        });
      }

      return apiSuccess(res, profile, 'Profile synchronized successfully');
    } else {
      // Mock update
      const existing = mockUsers.find(u => u.id === userId);
      if (existing) {
        if (full_name) existing.full_name = full_name;
        if (city) existing.city = city;
        if (state) existing.state = state;
        if (bio) existing.bio = bio;
        return apiSuccess(res, existing, 'Profile updated (Demo mode)');
      }
      return apiSuccess(res, req.user, 'Profile synchronized');
    }
  } catch (err) {
    next(err);
  }
};

export const getDemoAccounts = (req, res) => {
  const accounts = mockUsers.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    name: u.full_name,
    city: u.city,
    state: u.state,
    demoToken: `demo-token-${u.role}`
  }));
  return apiSuccess(res, accounts, 'Demo accounts retrieved');
};
