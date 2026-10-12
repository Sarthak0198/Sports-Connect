import { Router } from 'express';
import {
  getMyApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationDetails
} from '../controllers/applicationController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrganizerOrClub, requireAthlete } from '../middleware/role.js';

const router = Router();

router.get('/me', requireAuth, getMyApplications);
router.get('/:id', requireAuth, getApplicationDetails);
router.patch('/:id/status', requireAuth, requireOrganizerOrClub, updateApplicationStatus);
router.patch('/:id/withdraw', requireAuth, requireAthlete, withdrawApplication);

export default router;
