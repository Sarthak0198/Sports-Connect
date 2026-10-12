import { apiError } from '../utils/response.js';
import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const details = config.env === 'development' ? {
    stack: err.stack,
    details: err.details || null
  } : null;

  return apiError(res, message, status, details);
};

export const notFoundHandler = (req, res) => {
  return apiError(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
};
