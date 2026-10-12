import { apiError } from '../utils/response.js';

// Require one of the specified roles
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiError(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return apiError(
        res,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'`,
        403
      );
    }

    next();
  };
};

// Check if user is organizer or club academy
export const requireOrganizerOrClub = (req, res, next) => {
  return requireRole('organizer', 'club')(req, res, next);
};

// Check if user is athlete
export const requireAthlete = (req, res, next) => {
  return requireRole('athlete')(req, res, next);
};

// Check if user is coach
export const requireCoach = (req, res, next) => {
  return requireRole('coach')(req, res, next);
};
