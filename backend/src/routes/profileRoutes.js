import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  listAthletes,
  getAthleteById,
  addAchievement,
  deleteAchievement,
  addStatistic,
  deleteStatistic
} from '../controllers/profileController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Current user profile
router.get('/me', requireAuth, getMyProfile);
router.patch('/me', requireAuth, updateMyProfile);

// Athlete achievements & statistics management
router.post('/achievements', requireAuth, addAchievement);
router.delete('/achievements/:id', requireAuth, deleteAchievement);
router.post('/statistics', requireAuth, addStatistic);
router.delete('/statistics/:id', requireAuth, deleteStatistic);

// Public directory & detail
router.get('/athletes', optionalAuth, listAthletes);
router.get('/athletes/:id', optionalAuth, getAthleteById);

export default router;
