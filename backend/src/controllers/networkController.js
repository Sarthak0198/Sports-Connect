import { apiSuccess, apiError } from '../utils/response.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import { mockConnections, mockUsers } from '../utils/mockStore.js';

// GET /api/v1/connections
export const listConnections = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('connections')
        .select(`
          *,
          requester:profiles!requester_id(id, full_name, role, city, state, avatar_url),
          receiver:profiles!receiver_id(id, full_name, role, city, state, avatar_url)
        `)
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

      if (error) throw error;
      return apiSuccess(res, data, 'Connections retrieved');
    } else {
      const list = mockConnections.map(c => ({
        ...c,
        requester: mockUsers[0],
        receiver: mockUsers[2]
      }));
      return apiSuccess(res, list, 'Connections retrieved (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/connections (Send connection request)
export const sendConnectionRequest = async (req, res, next) => {
  try {
    const requesterId = req.user.id;
    const { target_user_id } = req.body;

    if (!target_user_id) {
      return apiError(res, 'Target user ID is required', 400);
    }

    if (requesterId === target_user_id) {
      return apiError(res, 'You cannot send a connection request to yourself', 400);
    }

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('connections')
        .insert({
          requester_id: requesterId,
          receiver_id: target_user_id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return apiError(res, 'A connection request already exists between you and this user', 409);
        }
        throw error;
      }

      // Notify recipient
      await admin.from('notifications').insert({
        user_id: target_user_id,
        title: 'New Connection Request',
        message: `${req.user.full_name} wants to connect with you.`,
        type: 'connection',
        link: '/connections'
      });

      return apiSuccess(res, data, 'Connection request sent', 201);
    } else {
      const newConn = {
        id: `conn-${Date.now()}`,
        requester_id: requesterId,
        receiver_id: target_user_id,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      mockConnections.push(newConn);
      return apiSuccess(res, newConn, 'Connection request sent (Demo)', 201);
    }
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/connections/:id (Accept or decline request)
export const updateConnectionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['accepted', 'declined'].includes(status)) {
      return apiError(res, 'Status must be accepted or declined', 400);
    }

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('connections')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('receiver_id', userId)
        .select()
        .single();

      if (error) throw error;
      return apiSuccess(res, data, `Connection ${status}`);
    } else {
      const conn = mockConnections.find(c => c.id === id);
      if (conn) {
        conn.status = status;
        return apiSuccess(res, conn, `Connection ${status} (Demo)`);
      }
      return apiError(res, 'Connection request not found', 404);
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/connections/:id (Remove connection)
export const removeConnection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from('connections')
        .delete()
        .eq('id', id)
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

      if (error) throw error;
      return apiSuccess(res, null, 'Connection removed');
    } else {
      const idx = mockConnections.findIndex(c => c.id === id);
      if (idx !== -1) mockConnections.splice(idx, 1);
      return apiSuccess(res, null, 'Connection removed (Demo)');
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/follows
export const followUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { following_id } = req.body;

    if (!following_id) return apiError(res, 'Target user ID required', 400);
    if (followerId === following_id) return apiError(res, 'Cannot follow yourself', 400);

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('follows')
        .insert({ follower_id: followerId, following_id })
        .select()
        .single();
      if (error) throw error;
      return apiSuccess(res, data, 'Followed successfully', 201);
    } else {
      return apiSuccess(res, { follower_id: followerId, following_id }, 'Followed successfully (Demo)', 201);
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/follows/:id
export const unfollowUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { id: following_id } = req.params;

    if (config.isSupabaseConfigured()) {
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', following_id);
      if (error) throw error;
      return apiSuccess(res, null, 'Unfollowed successfully');
    } else {
      return apiSuccess(res, null, 'Unfollowed successfully (Demo)');
    }
  } catch (err) {
    next(err);
  }
};
