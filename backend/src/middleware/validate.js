import { apiError } from '../utils/response.js';

export const validateRequired = (fields = []) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return apiError(res, `Missing required fields: ${missing.join(', ')}`, 400, { missing });
    }

    next();
  };
};
