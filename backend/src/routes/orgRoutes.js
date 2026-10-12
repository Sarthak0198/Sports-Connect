import { Router } from 'express';
import {
  listOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  getMyOrganizations
} from '../controllers/orgController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireOrganizerOrClub } from '../middleware/role.js';

const router = Router();

router.get('/', optionalAuth, listOrganizations);
router.get('/mine', requireAuth, getMyOrganizations);
router.post('/', requireAuth, requireOrganizerOrClub, createOrganization);
router.get('/:id', optionalAuth, getOrganizationById);
router.patch('/:id', requireAuth, requireOrganizerOrClub, updateOrganization);

export default router;
