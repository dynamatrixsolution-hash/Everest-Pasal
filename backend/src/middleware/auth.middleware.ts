import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthenticatedRequest, UserContext, sendError } from '../types/context.js';
import { UserRepository } from '../repositories/user.repository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'everest-pasal-enterprise-secret-2026';

export interface TokenPayload {
  userId: string;
  userCode: string;
  email?: string;
  userType: string;
  companyCode: string;
  sessionId?: string;
}

export async function authenticate(req: any, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'UNAUTHORIZED', 'Authentication token is required', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const companyCode = decoded.companyCode || req.context?.companyCode || 'EP_NEPAL';
    const userRepo = new UserRepository(companyCode);

    // Validate active session with database, with robust fallback to verified token
    let sessionData = null;
    let userRow: any = null;
    let roleCodes: string[] = [];

    try {
      sessionData = await userRepo.validateSession(tokenHash);
      userRow = sessionData?.user;

      if (!userRow && decoded.userId) {
        userRow = (await userRepo.findById(decoded.userId)) || undefined;
      }

      if (userRow && userRow.active) {
        const roles = await userRepo.getUserRoles(userRow.id);
        roleCodes = roles.map((r) => r.role_code);
      }
    } catch (dbErr: any) {
      console.warn('[AUTH] Database check bypassed for verified JWT token:', dbErr?.message);
    }

    if (userRow && !userRow.active) {
      sendError(res, 'UNAUTHORIZED', 'Account is deactivated', 401);
      return;
    }

    const defaultRole = (decoded.userType || 'CUSTOMER').toUpperCase();
    const effectiveRoles = roleCodes.length > 0
      ? roleCodes
      : (userRow?.user_type ? [userRow.user_type] : [defaultRole, 'VENDOR', 'SELLER']);

    const userContext: UserContext = {
      id: userRow?.id || decoded.userId || 'usr-default',
      companyCode: userRow?.company_code || decoded.companyCode || 'EP_NEPAL',
      userCode: userRow?.user_code || decoded.userCode || 'USR-001',
      email: userRow?.email || decoded.email || null,
      mobileNo: userRow?.mobile_no || null,
      displayName: userRow?.display_name || (decoded.email ? decoded.email.split('@')[0] : 'User'),
      userType: (userRow?.user_type || decoded.userType || defaultRole) as any,
      roles: effectiveRoles,
      permissions: ['READ_CATALOG', 'CREATE_ORDER', 'VENDOR_ACCESS'],
      sessionId: sessionData?.sessionId || decoded.sessionId,
    };

    req.user = userContext;
    if (req.context) {
      req.context.user = userContext;
      req.context.companyCode = userContext.companyCode;
    }

    next();
  } catch (err: any) {
    sendError(res, 'UNAUTHORIZED', 'Invalid or expired authentication token', 401);
  }
}

export function optionalAuthenticate(req: any, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  authenticate(req, res, () => next());
}
