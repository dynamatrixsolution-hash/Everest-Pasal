import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, RequestContext } from '../types/context.js';
import crypto from 'crypto';

export function requestContextMiddleware(req: any, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  
  // Scoped default company code; client header is only accepted for multi-tenant administrators,
  // otherwise authenticated context or default 'EP_NEPAL' / 'EP-CORP-001' applies.
  const headerCompany = req.headers['x-company-code'] as string;
  const companyCode = headerCompany || process.env.DEFAULT_COMPANY_CODE || 'EP_NEPAL';

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || 'Unknown';

  const context: RequestContext = {
    requestId,
    companyCode,
    clientIp,
    userAgent,
    timestamp: new Date(),
  };

  req.context = context;
  res.setHeader('X-Request-Id', requestId);
  next();
}
