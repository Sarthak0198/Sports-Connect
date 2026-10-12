import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[Unhandled Error]:', err);

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || ['field'];
      return sendError(
        res,
        `Duplicate entry: A record with this ${target.join(', ')} already exists.`,
        409
      );
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Record not found.', 404);
    }
    if (err.code === 'P2003') {
      return sendError(res, 'Foreign key constraint violated.', 400);
    }
  }

  // Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File size exceeds allowed limit (5MB maximum).', 400);
    }
    return sendError(res, err.message, 400);
  }

  // Fallback generic 500 error without leaking internal stack traces
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message || 'Internal server error'
      : 'An unexpected internal server error occurred.';

  return sendError(res, message, 500);
};
