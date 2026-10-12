import { Router } from 'express';
import {
  listConnections,
  sendConnectionRequest,
  updateConnectionStatus,
  removeConnection,
  followUser,
  unfollowUser
} from '../controllers/networkController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/connections', requireAuth, listConnections);
router.post('/connections', requireAuth, sendConnectionRequest);
router.patch('/connections/:id', requireAuth, updateConnectionStatus);
router.delete('/connections/:id', requireAuth, removeConnection);

router.post('/follows', requireAuth, followUser);
router.delete('/follows/:id', requireAuth, unfollowUser);

export default router;
