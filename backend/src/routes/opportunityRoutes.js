import { Router } from 'express';
import {
  listOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  saveOpportunity,
  unsaveOpportunity,
  getMySavedOpportunities
} from '../controllers/opportunityController.js';
import {
  applyForOpportunity,
  getOpportunityApplications
} from '../controllers/applicationController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireOrganizerOrClub, requireAthlete } from '../middleware/role.js';

const router = Router();

// Marketplace listing & detail
router.get('/', optionalAuth, listOpportunities);
router.get('/saved/me', requireAuth, getMySavedOpportunities);
router.get('/:id', optionalAuth, getOpportunityById);

// Organizer operations
router.post('/', requireAuth, requireOrganizerOrClub, createOpportunity);
router.patch('/:id', requireAuth, requireOrganizerOrClub, updateOpportunity);
router.delete('/:id', requireAuth, requireOrganizerOrClub, deleteOpportunity);

// Athlete applications & saving
router.post('/:id/applications', requireAuth, requireAthlete, applyForOpportunity);
router.get('/:id/applications', requireAuth, requireOrganizerOrClub, getOpportunityApplications);
router.post('/:id/save', requireAuth, saveOpportunity);
router.delete('/:id/save', requireAuth, unsaveOpportunity);

export default router;
