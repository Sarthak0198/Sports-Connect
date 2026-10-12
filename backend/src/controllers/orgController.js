import { apiSuccess, apiError } from '../utils/response.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import { mockOrganizations, mockOpportunities, mockApplications } from '../utils/mockStore.js';

// GET /api/v1/organizations
export const listOrganizations = async (req, res, next) => {
  try {
    const { kind, state, search, page = 1, limit = 12 } = req.query;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      let query = admin
        .from('organizations')
        .select('*', { count: 'exact' });

      if (kind) query = query.eq('kind', kind);
      if (state) query = query.ilike('state', `%${state}%`);
      if (search) query = query.ilike('name', `%${search}%`);

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, count, error } = await query;
      if (error) throw error;

      return apiSuccess(res, data, 'Organizations retrieved', 200, { total: count, page: Number(page), limit: Number(limit) });
    } else {
      let filtered = [...mockOrganizations];
      if (kind) filtered = filtered.filter(o => o.kind === kind);
      if (state) filtered = filtered.filter(o => o.state.toLowerCase().includes(state.toLowerCase()));
      if (search) filtered = filtered.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.city.toLowerCase().includes(search.toLowerCase()));

      return apiSuccess(res, filtered, 'Organizations retrieved (Demo)', 200, {
        total: filtered.length,
        page: 1,
        limit: 12
      });
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/organizations/:id
export const getOrganizationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data: org, error } = await admin
        .from('organizations')
        .select(`
          *,
          opportunities(*, sports(*)),
          organization_members(*, profiles(*))
        `)
        .eq('id', id)
        .single();

      if (error || !org) {
        return apiError(res, 'Organization not found', 404);
      }

      return apiSuccess(res, org, 'Organization retrieved');
    } else {
      const org = mockOrganizations.find(o => o.id === id || o.slug === id) || mockOrganizations[0];
      const opps = mockOpportunities.filter(op => op.org_id === org.id);

      return apiSuccess(res, {
        ...org,
        opportunities: opps,
        organization_members: []
      }, 'Organization retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/organizations
export const createOrganization = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, kind, description, logo_url, website, email, phone, city, state, address } = req.body;

    if (!name || name.trim() === '') {
      return apiError(res, 'Organization name is required', 400);
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data: org, error } = await admin
        .from('organizations')
        .insert({
          name: name.trim(),
          slug,
          kind: kind || 'academy',
          description,
          logo_url,
          website,
          email,
          phone,
          city,
          state,
          address,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner in organization_members
      await admin.from('organization_members').insert({
        organization_id: org.id,
        user_id: userId,
        role: 'owner'
      });

      return apiSuccess(res, org, 'Organization created successfully', 201);
    } else {
      const newOrg = {
        id: `org-${Date.now()}`,
        name: name.trim(),
        slug,
        kind: kind || 'academy',
        description,
        logo_url,
        website,
        email,
        phone,
        city,
        state,
        address,
        is_verified: false,
        created_by: userId,
        created_at: new Date().toISOString()
      };
      mockOrganizations.push(newOrg);
      return apiSuccess(res, newOrg, 'Organization created successfully (Demo)', 201);
    }
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/organizations/:id
export const updateOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, logo_url, website, email, phone, city, state, address } = req.body;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data: org, error } = await admin
        .from('organizations')
        .update({
          name, description, logo_url, website, email, phone, city, state, address,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return apiSuccess(res, org, 'Organization updated');
    } else {
      const org = mockOrganizations.find(o => o.id === id);
      if (org) {
        if (name) org.name = name;
        if (description) org.description = description;
        if (city) org.city = city;
        if (state) org.state = state;
        return apiSuccess(res, org, 'Organization updated (Demo)');
      }
      return apiError(res, 'Organization not found', 404);
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/organizations/mine
export const getMyOrganizations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('organizations')
        .select('*')
        .eq('created_by', userId);

      if (error) throw error;
      return apiSuccess(res, data, 'Your organizations retrieved');
    } else {
      const orgs = mockOrganizations.filter(o => o.created_by === userId || req.user.role === 'club' || req.user.role === 'organizer');
      return apiSuccess(res, orgs.length > 0 ? orgs : [mockOrganizations[0]], 'Your organizations retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};
