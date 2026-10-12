import { apiSuccess } from '../utils/response.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import { mockNotifications } from '../utils/mockStore.js';

// GET /api/v1/notifications
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return apiSuccess(res, data, 'Notifications retrieved');
    } else {
      const list = mockNotifications.filter(n => n.user_id === userId || true);
      return apiSuccess(res, list, 'Notifications retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/notifications/:id/read
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return apiSuccess(res, data, 'Notification marked as read');
    } else {
      const n = mockNotifications.find(notif => notif.id === id);
      if (n) n.is_read = true;
      return apiSuccess(res, n, 'Notification marked as read (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/notifications/read-all
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      if (error) throw error;
      return apiSuccess(res, null, 'All notifications marked as read');
    } else {
      mockNotifications.forEach(n => { n.is_read = true; });
      return apiSuccess(res, null, 'All notifications marked as read (Demo)');
    }
  } catch (err) {
    next(err);
  }
};
