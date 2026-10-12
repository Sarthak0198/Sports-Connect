import { Router } from 'express';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import athleteRoutes from './athleteRoutes.js';
import coachRoutes from './coachRoutes.js';
import orgRoutes from './orgRoutes.js';
import opportunityRoutes from './opportunityRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import networkRoutes from './networkRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import statsRoutes from './statsRoutes.js';
import { apiSuccess } from '../utils/response.js';

const router = Router();

// Health Check Endpoint (Required by Render & Section 17/21)
router.get('/health', (req, res) => {
  return apiSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Sports Connect Express API',
    uptime: process.uptime()
  }, 'Service is operational');
});

// Version 1 API Routes (/api/v1/...)
const v1Router = Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/profiles', profileRoutes);
v1Router.use('/athletes', athleteRoutes); // Dedicated athlete directory routes
v1Router.use('/coaches', coachRoutes);
v1Router.use('/organizations', orgRoutes);
v1Router.use('/opportunities', opportunityRoutes);
v1Router.use('/applications', applicationRoutes);
v1Router.use('/network', networkRoutes);
v1Router.use('/notifications', notificationRoutes);
v1Router.use('/stats', statsRoutes);
v1Router.use('/sports', statsRoutes);

// Mount under v1
router.use('/v1', v1Router);

export default router;
