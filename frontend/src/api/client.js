// Central API Client for Sports Connect Express Service
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
      console.warn(`[API Client Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
      throw err;
    }
  }

  // --- Auth & Profile ---
  getMe() {
    return this.request('/auth/me');
  }

  syncProfile(profileData) {
    return this.request('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  getDemoAccounts() {
    return this.request('/auth/demo-accounts');
  }

  getMyProfile() {
    return this.request('/profiles/me');
  }

  updateMyProfile(profileData) {
    return this.request('/profiles/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    });
  }

  // --- Athletes ---
  listAthletes(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/athletes${qs ? `?${qs}` : ''}`);
  }

  getAthleteById(id) {
    return this.request(`/athletes/${id}`);
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
  listCoaches(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/coaches${qs ? `?${qs}` : ''}`);
  }

  getCoachById(id) {
    return this.request(`/coaches/${id}`);
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
  listOrganizations(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/organizations${qs ? `?${qs}` : ''}`);
  }

  getOrganizationById(id) {
    return this.request(`/organizations/${id}`);
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

  // --- Opportunities ---
  listOpportunities(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/opportunities${qs ? `?${qs}` : ''}`);
  }

  getOpportunityById(id) {
    return this.request(`/opportunities/${id}`);
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
  getPlatformStats() {
    return this.request('/stats/platform');
  }

  listSports() {
    return this.request('/sports');
  }
}

export const api = new ApiClient();
