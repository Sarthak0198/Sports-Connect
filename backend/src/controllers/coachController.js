import { apiSuccess, apiError } from '../utils/response.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import { mockUsers, mockCoachProfiles, mockSports, mockInquiries } from '../utils/mockStore.js';

// GET /api/v1/coaches
export const listCoaches = async (req, res, next) => {
  try {
    const { sport, state, search, page = 1, limit = 12 } = req.query;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      let query = admin
        .from('profiles')
        .select(`
          id, full_name, city, state, bio, avatar_url, is_verified,
          coach_profiles(
            specializations, qualifications, experience_years, coaching_level, hourly_rate, philosophy, is_accepting_trainees,
            sports(id, name, slug)
          )
        `, { count: 'exact' })
        .eq('role', 'coach');

      if (state) query = query.ilike('state', `%${state}%`);
      if (search) query = query.ilike('full_name', `%${search}%`);

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, count, error } = await query;
      if (error) throw error;

      return apiSuccess(res, data, 'Coaches retrieved', 200, { total: count, page: Number(page), limit: Number(limit) });
    } else {
      let filtered = mockUsers.filter(u => u.role === 'coach');
      if (state) filtered = filtered.filter(u => u.state.toLowerCase().includes(state.toLowerCase()));
      if (search) filtered = filtered.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.city.toLowerCase().includes(search.toLowerCase()));

      const coachesWithDetails = filtered.map(u => {
        const ext = mockCoachProfiles.find(c => c.id === u.id) || mockCoachProfiles[0];
        const sportObj = mockSports.find(s => s.id === ext.primary_sport_id);
        return {
          ...u,
          coach_profiles: {
            ...ext,
            sports: sportObj
          }
        };
      });

      return apiSuccess(res, coachesWithDetails, 'Coaches retrieved (Demo)', 200, {
        total: coachesWithDetails.length,
        page: 1,
        limit: 12
      });
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/coaches/:id
export const getCoachById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data: coach, error } = await admin
        .from('profiles')
        .select(`
          *,
          coach_profiles(*, sports(*)),
          coaching_programs(*)
        `)
        .eq('id', id)
        .eq('role', 'coach')
        .single();

      if (error || !coach) {
        return apiError(res, 'Coach not found', 404);
      }

      return apiSuccess(res, coach, 'Coach profile retrieved');
    } else {
      const user = mockUsers.find(u => u.id === id && u.role === 'coach') || mockUsers[2];
      const ext = mockCoachProfiles.find(c => c.id === user.id) || mockCoachProfiles[0];
      const sportObj = mockSports.find(s => s.id === ext.primary_sport_id);

      return apiSuccess(res, {
        ...user,
        coach_profiles: { ...ext, sports: sportObj },
        coaching_programs: []
      }, 'Coach profile retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/coaches/:id/inquiries (Send coaching inquiry)
export const sendCoachingInquiry = async (req, res, next) => {
  try {
    const { id: coachId } = req.params;
    const userId = req.user.id;
    const { message, sport_id } = req.body;

    if (!message || message.trim() === '') {
      return apiError(res, 'Inquiry message is required', 400);
    }

    if (coachId === userId) {
      return apiError(res, 'You cannot send a coaching inquiry to yourself', 400);
    }

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('coaching_inquiries')
        .insert({
          coach_id: coachId,
          user_id: userId,
          message: message.trim(),
          sport_id: sport_id ? parseInt(sport_id, 10) : null
        })
        .select()
        .single();

      if (error) throw error;

      // Notify coach
      await admin.from('notifications').insert({
        user_id: coachId,
        title: 'New Coaching Inquiry',
        message: `${req.user.full_name} sent you a coaching inquiry.`,
        type: 'inquiry',
        link: '/inquiries'
      });

      return apiSuccess(res, data, 'Inquiry sent successfully', 201);
    } else {
      const newInq = {
        id: `inq-${Date.now()}`,
        coach_id: coachId,
        user_id: userId,
        message: message.trim(),
        status: 'pending',
        reply: null,
        created_at: new Date().toISOString(),
        coach: mockUsers.find(u => u.id === coachId) || mockUsers[2],
        athlete: req.user
      };
      mockInquiries.push(newInq);
      return apiSuccess(res, newInq, 'Inquiry sent successfully (Demo)', 201);
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/coaches/inquiries/me (List inquiries for coach or athlete)
export const getMyInquiries = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('coaching_inquiries')
        .select(`
          *,
          coach:profiles!coach_id(id, full_name, avatar_url, city),
          athlete:profiles!user_id(id, full_name, avatar_url, city)
        `)
        .or(`coach_id.eq.${userId},user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return apiSuccess(res, data, 'Inquiries retrieved');
    } else {
      const list = mockInquiries.filter(i => i.coach_id === userId || i.user_id === userId || req.user.role === 'coach');
      return apiSuccess(res, list, 'Inquiries retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/coaches/inquiries/:id/reply
export const replyToInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const coachId = req.user.id;

    if (!reply || reply.trim() === '') {
      return apiError(res, 'Reply message is required', 400);
    }

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('coaching_inquiries')
        .update({
          reply: reply.trim(),
          status: 'replied',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('coach_id', coachId)
        .select()
        .single();

      if (error) throw error;
      return apiSuccess(res, data, 'Reply sent');
    } else {
      const inq = mockInquiries.find(i => i.id === id);
      if (inq) {
        inq.reply = reply.trim();
        inq.status = 'replied';
        return apiSuccess(res, inq, 'Reply sent (Demo)');
      }
      return apiError(res, 'Inquiry not found', 404);
    }
  } catch (err) {
    next(err);
  }
};
