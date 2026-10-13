import { apiSuccess, apiError } from '../utils/response.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import {
  mockApplications,
  mockApplicationHistory,
  mockOpportunities,
  mockUsers,
  mockNotifications
} from '../utils/mockStore.js';

// POST /api/v1/opportunities/:id/applications (Apply for opportunity)
export const applyForOpportunity = async (req, res, next) => {
  try {
    const { id: opportunityId } = req.params;
    const applicantId = req.user.id;
    const { message, contact_phone, contact_email, resume_url } = req.body;

    if (contact_phone) {
      const cleanPhone = String(contact_phone).replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return apiError(res, 'Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9', 400);
      }
    }

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();

      // Check deadline
      const { data: opp, error: oppErr } = await admin
        .from('opportunities')
        .select('*')
        .eq('id', opportunityId)
        .single();

      if (oppErr || !opp) {
        return apiError(res, 'Opportunity not found', 404);
      }

      if (opp.status !== 'published') {
        return apiError(res, 'This opportunity is no longer open for applications', 400);
      }

      if (opp.registration_deadline && new Date(opp.registration_deadline) < new Date()) {
        return apiError(res, 'The registration deadline for this opportunity has passed', 400);
      }

      // Check duplicate application
      const { data: existingApp } = await admin
        .from('opportunity_applications')
        .select('id')
        .eq('opportunity_id', opportunityId)
        .eq('applicant_id', applicantId)
        .maybeSingle();

      if (existingApp) {
        return apiError(res, 'You have already submitted an application for this opportunity', 409);
      }

      // Insert application
      const { data: application, error: appInsertErr } = await admin
        .from('opportunity_applications')
        .insert({
          opportunity_id: opportunityId,
          applicant_id: applicantId,
          status: 'submitted',
          message,
          contact_phone: contact_phone || req.user.phone,
          contact_email: contact_email || req.user.email,
          resume_url
        })
        .select()
        .single();

      if (appInsertErr) throw appInsertErr;

      // Notify organizer
      await admin.from('notifications').insert({
        user_id: opp.created_by,
        title: 'New Applicant Received',
        message: `${req.user.full_name} applied for "${opp.title}".`,
        type: 'application',
        link: `/opportunities/${opportunityId}/applications`
      });

      return apiSuccess(res, application, 'Application submitted successfully', 201);
    } else {
      // Demo / Mock
      const opp = mockOpportunities.find(o => o.id === opportunityId) || mockOpportunities[0];
      const existing = mockApplications.find(a => a.opportunity_id === opportunityId && a.applicant_id === applicantId);

      if (existing) {
        return apiError(res, 'You have already applied for this opportunity', 409);
      }

      const newApp = {
        id: `app-${Date.now()}`,
        opportunity_id: opportunityId,
        applicant_id: applicantId,
        status: 'submitted',
        message: message || 'I am excited to participate in this opportunity.',
        contact_phone: contact_phone || '+91 98230 11223',
        contact_email: contact_email || req.user.email,
        resume_url: resume_url || null,
        created_at: new Date().toISOString(),
        opportunity: opp,
        applicant: req.user
      };

      mockApplications.push(newApp);
      mockApplicationHistory.push({
        id: `hist-${Date.now()}`,
        application_id: newApp.id,
        status: 'submitted',
        notes: 'Application submitted by athlete',
        changed_by: applicantId,
        created_at: new Date().toISOString()
      });

      return apiSuccess(res, newApp, 'Application submitted successfully (Demo)', 201);
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/applications/me (List current user's applications)
export const getMyApplications = async (req, res, next) => {
  try {
    const applicantId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('opportunity_applications')
        .select(`
          *,
          opportunity:opportunities(
            id, title, category, city, state, starts_on, registration_deadline,
            sports(id, name),
            organizations(id, name, logo_url)
          )
        `)
        .eq('applicant_id', applicantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return apiSuccess(res, data, 'Your applications retrieved');
    } else {
      const myApps = mockApplications.filter(a => a.applicant_id === applicantId || req.user.role === 'athlete');
      return apiSuccess(res, myApps, 'Your applications retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/opportunities/:id/applications (Organizer reviews applicants)
export const getOpportunityApplications = async (req, res, next) => {
  try {
    const { id: opportunityId } = req.params;
    const { status } = req.query;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      let query = admin
        .from('opportunity_applications')
        .select(`
          *,
          applicant:profiles(
            id, full_name, email, city, state, avatar_url, phone,
            athlete_profiles(position, playing_level, current_team, highlight_video_url)
          )
        `)
        .eq('opportunity_id', opportunityId);

      if (status) query = query.eq('status', status);
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return apiSuccess(res, data, 'Opportunity applications retrieved');
    } else {
      let list = mockApplications.filter(a => a.opportunity_id === opportunityId || true);
      if (status) list = list.filter(a => a.status === status);

      return apiSuccess(res, list, 'Opportunity applications retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/applications/:id/status (Organizer updates status)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const reviewerId = req.user.id;

    const validStatuses = ['submitted', 'under_review', 'shortlisted', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return apiError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data: updated, error } = await admin
        .from('opportunity_applications')
        .update({
          status,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`*, opportunities(title), applicant:profiles(full_name)`)
        .single();

      if (error) throw error;

      // Note: Triggers automatically record history and send applicant notification
      return apiSuccess(res, updated, `Status updated to ${status}`);
    } else {
      const app = mockApplications.find(a => a.id === id) || mockApplications[0];
      app.status = status;
      app.reviewed_by = reviewerId;
      app.reviewed_at = new Date().toISOString();

      mockApplicationHistory.push({
        id: `hist-${Date.now()}`,
        application_id: app.id,
        status,
        notes: notes || `Status changed to ${status}`,
        changed_by: reviewerId,
        created_at: new Date().toISOString()
      });

      return apiSuccess(res, app, `Status updated to ${status} (Demo)`);
    }
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/applications/:id/withdraw (Athlete withdraws own application)
export const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const applicantId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('opportunity_applications')
        .update({
          status: 'withdrawn',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('applicant_id', applicantId)
        .select()
        .single();

      if (error) throw error;
      return apiSuccess(res, data, 'Application withdrawn successfully');
    } else {
      const app = mockApplications.find(a => a.id === id);
      if (app) {
        app.status = 'withdrawn';
        return apiSuccess(res, app, 'Application withdrawn successfully (Demo)');
      }
      return apiError(res, 'Application not found', 404);
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/applications/:id (Get application details & audit history)
export const getApplicationDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data: application, error } = await admin
        .from('opportunity_applications')
        .select(`
          *,
          opportunity:opportunities(*, sports(*), organizations(*)),
          applicant:profiles(*, athlete_profiles(*, sports(*)), athlete_achievements(*), athlete_statistics(*)),
          history:application_status_history(*)
        `)
        .eq('id', id)
        .single();

      if (error || !application) {
        return apiError(res, 'Application not found', 404);
      }

      return apiSuccess(res, application, 'Application details retrieved');
    } else {
      const app = mockApplications.find(a => a.id === id) || mockApplications[0];
      const history = mockApplicationHistory.filter(h => h.application_id === app.id);
      return apiSuccess(res, {
        ...app,
        history
      }, 'Application details retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};
