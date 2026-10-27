import { Request, Response, NextFunction } from 'express';
import { sendError } from '../types/context.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal server error';

  if (status === 500) {
    console.error(`[ERROR] [${(req as any).context?.requestId || 'NO-REQ-ID'}] ${req.method} ${req.originalUrl}:`, err);
  }

  sendError(res, code, message, status, err.details);
}
