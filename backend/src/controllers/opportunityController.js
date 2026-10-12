import { apiSuccess, apiError } from '../utils/response.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import {
  mockOpportunities,
  mockSports,
  mockOrganizations,
  mockSavedOpportunities
} from '../utils/mockStore.js';

// GET /api/v1/opportunities
export const listOpportunities = async (req, res, next) => {
  try {
    const { category, sport_id, state, city, search, status = 'published', page = 1, limit = 12 } = req.query;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      let query = admin
        .from('opportunities')
        .select(`
          *,
          sports(id, name, slug, category),
          organizations(id, name, logo_url, city, state, is_verified)
        `, { count: 'exact' });

      if (status) query = query.eq('status', status);
      if (category) query = query.eq('category', category);
      if (sport_id) query = query.eq('sport_id', parseInt(sport_id, 10));
      if (state) query = query.ilike('state', `%${state}%`);
      if (city) query = query.ilike('city', `%${city}%`);
      if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to).order('registration_deadline', { ascending: true, nullsFirst: false });

      const { data, count, error } = await query;
      if (error) throw error;

      return apiSuccess(res, data, 'Opportunities retrieved', 200, { total: count, page: Number(page), limit: Number(limit) });
    } else {
      let filtered = [...mockOpportunities];
      if (status) filtered = filtered.filter(o => o.status === status);
      if (category) filtered = filtered.filter(o => o.category === category);
      if (sport_id) filtered = filtered.filter(o => o.sport_id === parseInt(sport_id, 10));
      if (state) filtered = filtered.filter(o => o.state?.toLowerCase().includes(state.toLowerCase()));
      if (city) filtered = filtered.filter(o => o.city?.toLowerCase().includes(city.toLowerCase()));
      if (search) filtered = filtered.filter(o =>
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        (o.description && o.description.toLowerCase().includes(search.toLowerCase()))
      );

      return apiSuccess(res, filtered, 'Opportunities retrieved (Demo)', 200, {
        total: filtered.length,
        page: Number(page),
        limit: Number(limit)
      });
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/opportunities/:id
export const getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data: opp, error } = await admin
        .from('opportunities')
        .select(`
          *,
          sports(*),
          organizations(*)
        `)
        .eq('id', id)
        .single();

      if (error || !opp) {
        return apiError(res, 'Opportunity not found', 404);
      }

      return apiSuccess(res, opp, 'Opportunity retrieved');
    } else {
      const opp = mockOpportunities.find(o => o.id === id) || mockOpportunities[0];
      return apiSuccess(res, opp, 'Opportunity retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/opportunities
export const createOpportunity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title, description, sport_id, category, org_id,
      city, state, venue_address, starts_on, ends_on,
      registration_deadline, eligibility, min_age, max_age,
      skill_level, available_positions, application_fee, instructions, status = 'published'
    } = req.body;

    if (!title || !category) {
      return apiError(res, 'Title and category are required', 400);
    }

    if (starts_on && ends_on && ends_on < starts_on) {
      return apiError(res, 'End date cannot be earlier than start date', 400);
    }

    if (starts_on && registration_deadline && registration_deadline > starts_on) {
      return apiError(res, 'Registration deadline must be before or on the start date', 400);
    }

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data: opp, error } = await admin
        .from('opportunities')
        .insert({
          created_by: userId,
          org_id: org_id || null,
          title,
          description,
          sport_id: sport_id ? parseInt(sport_id, 10) : null,
          category,
          city,
          state,
          venue_address,
          starts_on: starts_on || null,
          ends_on: ends_on || null,
          registration_deadline: registration_deadline || null,
          eligibility,
          min_age: min_age ? parseInt(min_age, 10) : null,
          max_age: max_age ? parseInt(max_age, 10) : null,
          skill_level,
          available_positions,
          application_fee: application_fee || 'Free',
          instructions,
          status
        })
        .select()
        .single();

      if (error) throw error;
      return apiSuccess(res, opp, 'Opportunity created successfully', 201);
    } else {
      const newOpp = {
        id: `opp-${Date.now()}`,
        created_by: userId,
        org_id: org_id || mockOrganizations[0].id,
        title,
        description,
        sport_id: sport_id ? parseInt(sport_id, 10) : 1,
        category,
        city: city || 'Pune',
        state: state || 'Maharashtra',
        venue_address: venue_address || 'Sports Complex',
        starts_on: starts_on || '2026-12-01',
        ends_on: ends_on || '2026-12-05',
        registration_deadline: registration_deadline || '2026-11-20',
        eligibility: eligibility || 'Open to all',
        min_age: min_age ? parseInt(min_age, 10) : 16,
        max_age: max_age ? parseInt(max_age, 10) : 22,
        skill_level: skill_level || 'Intermediate',
        available_positions: available_positions || 'All',
        application_fee: application_fee || 'Free',
        instructions: instructions || 'Follow venue guidelines',
        status,
        created_at: new Date().toISOString(),
        organization: mockOrganizations[0],
        sport: mockSports.find(s => s.id === (sport_id ? parseInt(sport_id, 10) : 1)) || mockSports[0]
      };
      mockOpportunities.unshift(newOpp);
      return apiSuccess(res, newOpp, 'Opportunity created successfully (Demo)', 201);
    }
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/opportunities/:id
export const updateOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data: opp, error } = await admin
        .from('opportunities')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return apiSuccess(res, opp, 'Opportunity updated');
    } else {
      const opp = mockOpportunities.find(o => o.id === id);
      if (opp) {
        Object.assign(opp, updates);
        return apiSuccess(res, opp, 'Opportunity updated (Demo)');
      }
      return apiError(res, 'Opportunity not found', 404);
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/opportunities/:id
export const deleteOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return apiSuccess(res, null, 'Opportunity deleted');
    } else {
      const idx = mockOpportunities.findIndex(o => o.id === id);
      if (idx !== -1) mockOpportunities.splice(idx, 1);
      return apiSuccess(res, null, 'Opportunity deleted (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/opportunities/:id/save
export const saveOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('saved_opportunities')
        .upsert({ user_id: userId, opportunity_id: id })
        .select()
        .single();

      if (error) throw error;
      return apiSuccess(res, data, 'Opportunity bookmarked');
    } else {
      const existing = mockSavedOpportunities.find(s => s.user_id === userId && s.opportunity_id === id);
      if (!existing) {
        mockSavedOpportunities.push({
          id: `save-${Date.now()}`,
          user_id: userId,
          opportunity_id: id,
          created_at: new Date().toISOString()
        });
      }
      return apiSuccess(res, { saved: true }, 'Opportunity bookmarked (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/opportunities/:id/save
export const unsaveOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from('saved_opportunities')
        .delete()
        .eq('user_id', userId)
        .eq('opportunity_id', id);

      if (error) throw error;
      return apiSuccess(res, null, 'Opportunity unbookmarked');
    } else {
      const idx = mockSavedOpportunities.findIndex(s => s.user_id === userId && s.opportunity_id === id);
      if (idx !== -1) mockSavedOpportunities.splice(idx, 1);
      return apiSuccess(res, { saved: false }, 'Opportunity unbookmarked (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/opportunities/saved/me
export const getMySavedOpportunities = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('saved_opportunities')
        .select(`
          id, created_at,
          opportunities(
            *,
            sports(*),
            organizations(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return apiSuccess(res, data, 'Saved opportunities retrieved');
    } else {
      const saved = mockSavedOpportunities
        .filter(s => s.user_id === userId)
        .map(s => {
          const opp = mockOpportunities.find(o => o.id === s.opportunity_id) || mockOpportunities[1];
          return {
            id: s.id,
            created_at: s.created_at,
            opportunities: opp
          };
        });
      return apiSuccess(res, saved, 'Saved opportunities retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};
