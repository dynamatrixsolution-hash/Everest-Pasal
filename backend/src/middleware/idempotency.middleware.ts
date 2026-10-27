import { Response, NextFunction } from 'express';
import { sendError } from '../types/context.js';

// In-memory idempotency cache (or backing to ep_integration table in production)
const idempotencyStore = new Map<string, { statusCode: number; body: any; timestamp: number }>();

export function requireIdempotency(ttlSeconds: number = 300) {
  return (req: any, res: Response, next: NextFunction): void => {
    const key = req.headers['idempotency-key'] as string;
    if (!key) {
      // If optional, proceed, but if required on checkout/payment endpoints:
      return next();
    }

    const companyCode = req.context?.companyCode || 'EP_NEPAL';
    const scopedKey = `${companyCode}:${key}`;

    const existing = idempotencyStore.get(scopedKey);
    if (existing && Date.now() - existing.timestamp < ttlSeconds * 1000) {
      res.setHeader('X-Idempotent-Replay', 'true');
      res.status(existing.statusCode).json(existing.body);
      return;
    }

    // Intercept response to store result
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        idempotencyStore.set(scopedKey, {
          statusCode: res.statusCode,
          body,
          timestamp: Date.now(),
        });
      }
      return originalJson(body);
    };

    next();
  };
}
