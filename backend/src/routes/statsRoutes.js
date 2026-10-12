import { Router } from 'express';
import { getPlatformStats, listSports } from '../controllers/statsController.js';

const router = Router();

router.get('/platform', getPlatformStats);
router.get('/sports', listSports);
router.get('/', listSports);

export default router;
