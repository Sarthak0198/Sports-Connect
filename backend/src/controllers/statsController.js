import { apiSuccess } from '../utils/response.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import {
  mockUsers,
  mockOrganizations,
  mockOpportunities,
  mockApplications,
  mockSports
} from '../utils/mockStore.js';

// GET /api/v1/stats/platform
export const getPlatformStats = async (req, res, next) => {
  try {
    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const [athletesRes, coachesRes, orgsRes, oppsRes, appsRes] = await Promise.all([
        admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'athlete'),
        admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'coach'),
        admin.from('organizations').select('id', { count: 'exact', head: true }),
        admin.from('opportunities').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        admin.from('opportunity_applications').select('id', { count: 'exact', head: true })
      ]);

      return apiSuccess(res, {
        total_athletes: athletesRes.count || 0,
        total_coaches: coachesRes.count || 0,
        total_organizations: orgsRes.count || 0,
        active_opportunities: oppsRes.count || 0,
        total_applications: appsRes.count || 0
      }, 'Platform statistics retrieved');
    } else {
      // Return counts from mock store
      const athletes = mockUsers.filter(u => u.role === 'athlete').length;
      const coaches = mockUsers.filter(u => u.role === 'coach').length;
      const orgs = mockOrganizations.length;
      const opps = mockOpportunities.filter(o => o.status === 'published').length;
      const apps = mockApplications.length;

      return apiSuccess(res, {
        total_athletes: athletes,
        total_coaches: coaches,
        total_organizations: orgs,
        active_opportunities: opps,
        total_applications: apps,
        is_demo: true
      }, 'Platform statistics retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/sports
export const listSports = async (req, res, next) => {
  try {
    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('sports')
        .select('*')
        .order('is_popular', { ascending: false })
        .order('name');

      if (error) throw error;
      return apiSuccess(res, data, 'Sports retrieved');
    } else {
      return apiSuccess(res, mockSports, 'Sports retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};
