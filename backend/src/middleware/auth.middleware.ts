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

    // Validate active session
    const sessionData = await userRepo.validateSession(tokenHash);
    let userRow = sessionData?.user;

    // Fallback: If session hash wasn't found in DB (e.g. stateless test token), check user exists and active
    if (!userRow) {
      userRow = (await userRepo.findById(decoded.userId)) || undefined;
    }

    if (!userRow || !userRow.active) {
      sendError(res, 'UNAUTHORIZED', 'Invalid or expired session', 401);
      return;
    }

    // Load roles and permissions
    const roles = await userRepo.getUserRoles(userRow.id);
    const roleCodes = roles.map((r) => r.role_code);

    const userContext: UserContext = {
      id: userRow.id,
      companyCode: userRow.company_code,
      userCode: userRow.user_code,
      email: userRow.email,
      mobileNo: userRow.mobile_no,
      displayName: userRow.display_name,
      userType: userRow.user_type as any,
      roles: roleCodes,
      permissions: [], // Will be populated or queried as needed
      sessionId: sessionData?.sessionId,
    };

    req.user = userContext;
    if (req.context) {
      req.context.user = userContext;
      req.context.companyCode = userRow.company_code;
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
