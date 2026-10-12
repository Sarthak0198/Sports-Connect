import { Router } from 'express';
import { getMe, syncProfile, getDemoAccounts } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, getMe);
router.post('/sync', requireAuth, syncProfile);
router.get('/demo-accounts', getDemoAccounts);

export default router;
