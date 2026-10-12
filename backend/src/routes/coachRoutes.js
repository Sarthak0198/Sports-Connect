import { Router } from 'express';
import {
  listCoaches,
  getCoachById,
  sendCoachingInquiry,
  getMyInquiries,
  replyToInquiry
} from '../controllers/coachController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireCoach } from '../middleware/role.js';

const router = Router();

router.get('/', optionalAuth, listCoaches);
router.get('/inquiries/me', requireAuth, getMyInquiries);
router.patch('/inquiries/:id/reply', requireAuth, requireCoach, replyToInquiry);
router.get('/:id', optionalAuth, getCoachById);
router.post('/:id/inquiries', requireAuth, sendCoachingInquiry);

export default router;
