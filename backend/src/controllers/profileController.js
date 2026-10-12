import { apiSuccess, apiError } from '../utils/response.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import {
  mockUsers,
  mockAthleteProfiles,
  mockAchievements,
  mockCertificates,
  mockStatistics,
  mockSports
} from '../utils/mockStore.js';

// Calculate profile completion percentage dynamically
const calculateAthleteCompletion = (profile, athleteExt, achievements, stats, certs) => {
  let score = 20; // Base account creation
  if (profile.bio) score += 15;
  if (profile.avatar_url) score += 10;
  if (profile.city && profile.state) score += 10;
  if (athleteExt?.position) score += 10;
  if (athleteExt?.playing_level) score += 10;
  if (athleteExt?.current_team) score += 5;
  if (athleteExt?.highlight_video_url) score += 5;
  if (achievements?.length > 0) score += 5;
  if (stats?.length > 0) score += 5;
  if (certs?.length > 0) score += 5;
  return Math.min(100, score);
};

// GET /api/v1/profiles/me
export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();

      const { data: profile, error } = await admin
        .from('profiles')
        .select(`
          *,
          athlete_profiles(*, sports(id, name, slug)),
          coach_profiles(*, sports(id, name, slug))
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Also fetch achievements, certs, stats if athlete
      let achievements = [];
      let certificates = [];
      let statistics = [];

      if (profile.role === 'athlete') {
        const [achRes, certRes, statRes] = await Promise.all([
          admin.from('athlete_achievements').select('*').eq('athlete_id', userId),
          admin.from('athlete_certificates').select('*').eq('athlete_id', userId),
          admin.from('athlete_statistics').select('*').eq('athlete_id', userId)
        ]);
        achievements = achRes.data || [];
        certificates = certRes.data || [];
        statistics = statRes.data || [];
      }

      const athleteExt = profile.athlete_profiles?.[0] || profile.athlete_profiles;
      const completion = calculateAthleteCompletion(profile, athleteExt, achievements, statistics, certificates);

      return apiSuccess(res, {
        ...profile,
        achievements,
        certificates,
        statistics,
        completion_pct: completion
      }, 'Profile retrieved');
    } else {
      // Demo / Mock Mode
      const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
      const athleteExt = mockAthleteProfiles.find(a => a.id === user.id) || mockAthleteProfiles[0];
      const achievements = mockAchievements.filter(a => a.athlete_id === user.id);
      const certificates = mockCertificates.filter(c => c.athlete_id === user.id);
      const statistics = mockStatistics.filter(s => s.athlete_id === user.id);
      const completion = calculateAthleteCompletion(user, athleteExt, achievements, statistics, certificates);

      return apiSuccess(res, {
        ...user,
        athlete_profiles: athleteExt,
        achievements,
        certificates,
        statistics,
        completion_pct: completion
      }, 'Profile retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/profiles/me
export const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      full_name, city, state, bio, avatar_url, phone, visibility,
      position, playing_level, current_team, height_cm, weight_kg,
      dominant_hand, date_of_birth, education, highlight_video_url, bio_extended,
      primary_sport_id
    } = req.body;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();

      // Update base profile
      const { data: updatedBase, error: baseErr } = await admin
        .from('profiles')
        .update({
          full_name, city, state, bio, avatar_url, phone, visibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (baseErr) throw baseErr;

      // Update role-specific profile
      if (req.user.role === 'athlete') {
        await admin
          .from('athlete_profiles')
          .upsert({
            id: userId,
            primary_sport_id: primary_sport_id ? parseInt(primary_sport_id, 10) : null,
            position, playing_level, current_team,
            height_cm: height_cm ? parseFloat(height_cm) : null,
            weight_kg: weight_kg ? parseFloat(weight_kg) : null,
            dominant_hand, date_of_birth, education,
            highlight_video_url, bio_extended,
            updated_at: new Date().toISOString()
          });
      }

      return apiSuccess(res, updatedBase, 'Profile updated successfully');
    } else {
      const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
      if (full_name) user.full_name = full_name;
      if (city) user.city = city;
      if (state) user.state = state;
      if (bio) user.bio = bio;
      if (avatar_url) user.avatar_url = avatar_url;
      if (visibility) user.visibility = visibility;

      const athleteExt = mockAthleteProfiles.find(a => a.id === user.id) || mockAthleteProfiles[0];
      if (position) athleteExt.position = position;
      if (playing_level) athleteExt.playing_level = playing_level;
      if (current_team) athleteExt.current_team = current_team;

      return apiSuccess(res, { ...user, athlete_profiles: athleteExt }, 'Profile updated (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/athletes (Public directory with search & filters)
export const listAthletes = async (req, res, next) => {
  try {
    const { sport, level, state, search, page = 1, limit = 12 } = req.query;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      let query = admin
        .from('profiles')
        .select(`
          id, full_name, city, state, bio, avatar_url, visibility, is_verified,
          athlete_profiles(
            position, playing_level, current_team, highlight_video_url, profile_completion_pct,
            sports(id, name, slug)
          )
        `, { count: 'exact' })
        .eq('role', 'athlete')
        .eq('visibility', 'public');

      if (state) query = query.ilike('state', `%${state}%`);
      if (search) query = query.ilike('full_name', `%${search}%`);

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, count, error } = await query;
      if (error) throw error;

      return apiSuccess(res, data, 'Athletes retrieved', 200, { total: count, page: Number(page), limit: Number(limit) });
    } else {
      let filtered = mockUsers.filter(u => u.role === 'athlete');
      if (state) filtered = filtered.filter(u => u.state.toLowerCase().includes(state.toLowerCase()));
      if (search) filtered = filtered.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.city.toLowerCase().includes(search.toLowerCase()));

      const athletesWithDetails = filtered.map(u => {
        const ext = mockAthleteProfiles.find(a => a.id === u.id) || mockAthleteProfiles[0];
        const sportObj = mockSports.find(s => s.id === ext.primary_sport_id);
        return {
          ...u,
          athlete_profiles: {
            ...ext,
            sports: sportObj
          }
        };
      });

      return apiSuccess(res, athletesWithDetails, 'Athletes retrieved (Demo)', 200, {
        total: athletesWithDetails.length,
        page: 1,
        limit: 12
      });
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/athletes/:id (Full public digital résumé)
export const getAthleteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data: profile, error } = await admin
        .from('profiles')
        .select(`
          *,
          athlete_profiles(*, sports(*)),
          athlete_achievements(*),
          athlete_certificates(*),
          athlete_statistics(*)
        `)
        .eq('id', id)
        .single();

      if (error || !profile) {
        return apiError(res, 'Athlete not found', 404);
      }

      // Check visibility policy
      if (profile.visibility === 'private' && req.user?.id !== id) {
        return apiError(res, 'This profile is private', 403);
      }

      return apiSuccess(res, profile, 'Athlete profile retrieved');
    } else {
      const user = mockUsers.find(u => u.id === id && u.role === 'athlete') || mockUsers[0];
      const ext = mockAthleteProfiles.find(a => a.id === user.id) || mockAthleteProfiles[0];
      const sportObj = mockSports.find(s => s.id === ext.primary_sport_id);
      const achievements = mockAchievements.filter(a => a.athlete_id === user.id);
      const certificates = mockCertificates.filter(c => c.athlete_id === user.id);
      const statistics = mockStatistics.filter(s => s.athlete_id === user.id);

      return apiSuccess(res, {
        ...user,
        athlete_profiles: { ...ext, sports: sportObj },
        athlete_achievements: achievements,
        athlete_certificates: certificates,
        athlete_statistics: statistics
      }, 'Athlete profile retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/profiles/achievements
export const addAchievement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, competition_name, year, medal, description, verification_url, sport_id } = req.body;

    if (!title || !competition_name || !year) {
      return apiError(res, 'Title, competition name, and year are required', 400);
    }

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('athlete_achievements')
        .insert({
          athlete_id: userId,
          title,
          competition_name,
          year: parseInt(year, 10),
          medal: medal || 'participation',
          description,
          verification_url,
          sport_id: sport_id ? parseInt(sport_id, 10) : null
        })
        .select()
        .single();

      if (error) throw error;
      return apiSuccess(res, data, 'Achievement added', 201);
    } else {
      const newAch = {
        id: `ach-${Date.now()}`,
        athlete_id: userId,
        title,
        competition_name,
        year: parseInt(year, 10),
        medal: medal || 'winner',
        description,
        verification_url,
        created_at: new Date().toISOString()
      };
      mockAchievements.push(newAch);
      return apiSuccess(res, newAch, 'Achievement added (Demo)', 201);
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/profiles/achievements/:id
export const deleteAchievement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from('athlete_achievements')
        .delete()
        .eq('id', id)
        .eq('athlete_id', userId);

      if (error) throw error;
      return apiSuccess(res, null, 'Achievement deleted');
    } else {
      const idx = mockAchievements.findIndex(a => a.id === id && a.athlete_id === userId);
      if (idx !== -1) mockAchievements.splice(idx, 1);
      return apiSuccess(res, null, 'Achievement deleted (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/profiles/statistics
export const addStatistic = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { metric_name, metric_value, metric_unit, season_or_year, notes, sport_id } = req.body;

    if (!metric_name || !metric_value) {
      return apiError(res, 'Metric name and value are required', 400);
    }

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('athlete_statistics')
        .insert({
          athlete_id: userId,
          metric_name,
          metric_value,
          metric_unit,
          season_or_year,
          notes,
          sport_id: sport_id ? parseInt(sport_id, 10) : null
        })
        .select()
        .single();

      if (error) throw error;
      return apiSuccess(res, data, 'Statistic added', 201);
    } else {
      const newStat = {
        id: `stat-${Date.now()}`,
        athlete_id: userId,
        metric_name,
        metric_value,
        metric_unit,
        season_or_year,
        notes,
        created_at: new Date().toISOString()
      };
      mockStatistics.push(newStat);
      return apiSuccess(res, newStat, 'Statistic added (Demo)', 201);
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/profiles/statistics/:id
export const deleteStatistic = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from('athlete_statistics')
        .delete()
        .eq('id', id)
        .eq('athlete_id', userId);

      if (error) throw error;
      return apiSuccess(res, null, 'Statistic deleted');
    } else {
      const idx = mockStatistics.findIndex(s => s.id === id && s.athlete_id === userId);
      if (idx !== -1) mockStatistics.splice(idx, 1);
      return apiSuccess(res, null, 'Statistic deleted (Demo)');
    }
  } catch (err) {
    next(err);
  }
};
