import { Router } from 'express';
import { listAthletes, getAthleteById } from '../controllers/profileController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public athlete directory & detail
router.get('/', optionalAuth, listAthletes);
router.get('/:id', optionalAuth, getAthleteById);

export default router;
