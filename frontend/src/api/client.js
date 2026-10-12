// Central API Client for Sports Connect Express Service & Live Supabase Cloud
import { supabase, isLiveSupabase } from './supabase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('sports_connect_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('sports_connect_token', token);
    } else {
      localStorage.removeItem('sports_connect_token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('sports_connect_token');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.error?.message || data?.message || `HTTP error ${response.status}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data?.data !== undefined ? data.data : data;
    } catch (err) {
      // In production/Vercel without live backend URL, warn and let caller fallback
      console.warn(`[API Client Note] ${options.method || 'GET'} ${endpoint}:`, err.message);
      throw err;
    }
  }

  // --- Auth & Profile ---
  async getMe() {
    try {
      return await this.request('/auth/me');
    } catch (err) {
      if (isLiveSupabase() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          return profile || user;
        }
      }
      throw err;
    }
  }

  syncProfile(profileData) {
    return this.request('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  getDemoAccounts() {
    return this.request('/auth/demo-accounts').catch(() => [
      { email: 'athlete.demo@sportsconnect.in', role: 'athlete', name: 'Aarav Sharma (Demo Athlete)' },
      { email: 'coach.vikram@sportsconnect.in', role: 'coach', name: 'Coach Vikram Rathore (Cricket)' },
      { email: 'coach.ananya@sportsconnect.in', role: 'coach', name: 'Coach Ananya Roy (Badminton)' },
      { email: 'academy.admin@sportsconnect.in', role: 'club', name: 'Satara District Kabaddi Association' },
      { email: 'organizer.delhi@sportsconnect.in', role: 'organizer', name: 'Delhi Youth Sports Foundation' }
    ]);
  }

  getMyProfile() {
    return this.request('/profiles/me').catch(async (err) => {
      if (isLiveSupabase() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('profiles').select('*, athlete_profiles(*), coach_profiles(*)').eq('id', user.id).single();
          if (data) return data;
        }
      }
      throw err;
    });
  }

  updateMyProfile(profileData) {
    return this.request('/profiles/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    }).catch(async (err) => {
      if (isLiveSupabase() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase.from('profiles').update(profileData).eq('id', user.id).select().single();
          if (!error && data) return data;
        }
      }
      throw err;
    });
  }

  // --- Athletes ---
  async listAthletes(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      return await this.request(`/athletes${qs ? `?${qs}` : ''}`);
    } catch (err) {
      if (isLiveSupabase() && supabase) {
        let q = supabase
          .from('profiles')
          .select('id, full_name, city, state, bio, avatar_url, is_verified, athlete_profiles(*, sports(*)), athlete_achievements(*)')
          .eq('role', 'athlete');

        if (params.state) q = q.ilike('state', `%${params.state}%`);
        if (params.search) q = q.ilike('full_name', `%${params.search}%`);

        const { data, error } = await q;
        if (!error && data) return data;
      }
      throw err;
    }
  }

  async getAthleteById(id) {
    try {
      return await this.request(`/athletes/${id}`);
    } catch (err) {
      if (isLiveSupabase() && supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, athlete_profiles(*, sports(*)), athlete_achievements(*), athlete_statistics(*)')
          .eq('id', id)
          .single();
        if (!error && data) return data;
      }
      throw err;
    }
  }

  addAchievement(achData) {
    return this.request('/profiles/achievements', {
      method: 'POST',
      body: JSON.stringify(achData)
    });
  }

  deleteAchievement(id) {
    return this.request(`/profiles/achievements/${id}`, {
      method: 'DELETE'
    });
  }

  addStatistic(statData) {
    return this.request('/profiles/statistics', {
      method: 'POST',
      body: JSON.stringify(statData)
    });
  }

  deleteStatistic(id) {
    return this.request(`/profiles/statistics/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Coaches ---
  async listCoaches(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      return await this.request(`/coaches${qs ? `?${qs}` : ''}`);
    } catch (err) {
      if (isLiveSupabase() && supabase) {
        let q = supabase
          .from('profiles')
          .select('id, full_name, city, state, bio, avatar_url, is_verified, coach_profiles(*, sports(*))')
          .eq('role', 'coach');

        if (params.state) q = q.ilike('state', `%${params.state}%`);
        if (params.search) q = q.ilike('full_name', `%${params.search}%`);

        const { data, error } = await q;
        if (!error && data) return data;
      }
      throw err;
    }
  }

  async getCoachById(id) {
    try {
      return await this.request(`/coaches/${id}`);
    } catch (err) {
      if (isLiveSupabase() && supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, coach_profiles(*, sports(*)), coaching_programs(*)')
          .eq('id', id)
          .single();
        if (!error && data) return data;
      }
      throw err;
    }
  }

  sendCoachingInquiry(coachId, inquiryData) {
    return this.request(`/coaches/${coachId}/inquiries`, {
      method: 'POST',
      body: JSON.stringify(inquiryData)
    });
  }

  getMyInquiries() {
    return this.request('/coaches/inquiries/me');
  }

  replyToInquiry(id, replyText) {
    return this.request(`/coaches/inquiries/${id}/reply`, {
      method: 'PATCH',
      body: JSON.stringify({ reply: replyText })
    });
  }

  // --- Organizations ---
  async listOrganizations(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      return await this.request(`/organizations${qs ? `?${qs}` : ''}`);
    } catch (err) {
      if (isLiveSupabase() && supabase) {
        let q = supabase.from('organizations').select('*');
        if (params.state) q = q.ilike('state', `%${params.state}%`);
        if (params.search) q = q.ilike('name', `%${params.search}%`);
        const { data, error } = await q;
        if (!error && data) return data;
      }
      throw err;
    }
  }

  async getOrganizationById(id) {
    try {
      return await this.request(`/organizations/${id}`);
    } catch (err) {
      if (isLiveSupabase() && supabase) {
        const { data, error } = await supabase
          .from('organizations')
          .select('*, opportunities(*, sports(*))')
          .eq('id', id)
          .single();
        if (!error && data) return data;
      }
      throw err;
    }
  }

  createOrganization(orgData) {
    return this.request('/organizations', {
      method: 'POST',
      body: JSON.stringify(orgData)
    });
  }

  updateOrganization(id, orgData) {
    return this.request(`/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(orgData)
    });
  }

  getMyOrganizations() {
    return this.request('/organizations/mine');
  }

  // --- Opportunities (Including Training Camps, Trials, Tournaments) ---
  async listOpportunities(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      return await this.request(`/opportunities${qs ? `?${qs}` : ''}`);
    } catch (err) {
      if (isLiveSupabase() && supabase) {
        let q = supabase
          .from('opportunities')
          .select('*, sports(*), organizations(*)');

        if (params.category) q = q.eq('category', params.category);
        if (params.sport_id) q = q.eq('sport_id', parseInt(params.sport_id, 10));
        if (params.state) q = q.ilike('state', `%${params.state}%`);
        if (params.city) q = q.ilike('city', `%${params.city}%`);
        if (params.search) q = q.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);

        const { data, error } = await q.order('registration_deadline', { ascending: true, nullsFirst: false });
        if (!error && data) return data;
      }
      throw err;
    }
  }

  async getOpportunityById(id) {
    try {
      return await this.request(`/opportunities/${id}`);
    } catch (err) {
      if (isLiveSupabase() && supabase) {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*, sports(*), organizations(*)')
          .eq('id', id)
          .single();
        if (!error && data) return data;
      }
      throw err;
    }
  }

  createOpportunity(oppData) {
    return this.request('/opportunities', {
      method: 'POST',
      body: JSON.stringify(oppData)
    });
  }

  updateOpportunity(id, oppData) {
    return this.request(`/opportunities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(oppData)
    });
  }

  deleteOpportunity(id) {
    return this.request(`/opportunities/${id}`, {
      method: 'DELETE'
    });
  }

  saveOpportunity(id) {
    return this.request(`/opportunities/${id}/save`, {
      method: 'POST'
    });
  }

  unsaveOpportunity(id) {
    return this.request(`/opportunities/${id}/save`, {
      method: 'DELETE'
    });
  }

  getMySavedOpportunities() {
    return this.request('/opportunities/saved/me');
  }

  // --- Applications ---
  applyForOpportunity(opportunityId, appData) {
    return this.request(`/opportunities/${opportunityId}/applications`, {
      method: 'POST',
      body: JSON.stringify(appData)
    });
  }

  getMyApplications() {
    return this.request('/applications/me');
  }

  getOpportunityApplications(opportunityId, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/opportunities/${opportunityId}/applications${qs ? `?${qs}` : ''}`);
  }

  updateApplicationStatus(applicationId, status, notes) {
    return this.request(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  }

  withdrawApplication(applicationId) {
    return this.request(`/applications/${applicationId}/withdraw`, {
      method: 'PATCH'
    });
  }

  getApplicationDetails(id) {
    return this.request(`/applications/${id}`);
  }

  // --- Networking ---
  listConnections() {
    return this.request('/network/connections');
  }

  sendConnectionRequest(targetUserId) {
    return this.request('/network/connections', {
      method: 'POST',
      body: JSON.stringify({ target_user_id: targetUserId })
    });
  }

  updateConnectionStatus(id, status) {
    return this.request(`/network/connections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  removeConnection(id) {
    return this.request(`/network/connections/${id}`, {
      method: 'DELETE'
    });
  }

  followUser(followingId) {
    return this.request('/network/follows', {
      method: 'POST',
      body: JSON.stringify({ following_id: followingId })
    });
  }

  unfollowUser(followingId) {
    return this.request(`/network/follows/${followingId}`, {
      method: 'DELETE'
    });
  }

  // --- Notifications ---
  getNotifications() {
    return this.request('/notifications');
  }

  markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH'
    });
  }

  // --- Stats & Taxonomy ---
  async getPlatformStats() {
    try {
      return await this.request('/stats/platform');
    } catch (err) {
      if (isLiveSupabase() && supabase) {
        const [p, o, c, s] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'athlete'),
          supabase.from('opportunities').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach'),
          supabase.from('sports').select('*', { count: 'exact', head: true })
        ]);
        return {
          totalAthletes: p.count || 2,
          totalOpportunities: o.count || 7,
          totalCoaches: c.count || 2,
          totalSports: s.count || 11
        };
      }
      throw err;
    }
  }

  async listSports() {
    try {
      return await this.request('/sports');
    } catch (err) {
      if (isLiveSupabase() && supabase) {
        const { data, error } = await supabase.from('sports').select('*');
        if (!error && data) return data;
      }
      throw err;
    }
  }
}

export const api = new ApiClient();
