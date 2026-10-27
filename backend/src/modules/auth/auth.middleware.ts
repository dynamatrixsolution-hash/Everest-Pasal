// ==============================================================================
// EVEREST PASAL - AUTHENTICATION & ACCESS CONTROL MIDDLEWARE
// Enforces session validation and RBAC permission checks
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { AuthenticatedUser } from './auth.types.js';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  rawToken?: string;
}

/**
 * Extracts Bearer session token and attaches validated user context.
 */
export async function authenticateSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication token required.',
    });
    return;
  }

  const rawToken = authHeader.substring(7).trim();
  const user = await authService.validateSession(rawToken);

  if (!user) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Invalid, expired, or revoked session.',
    });
    return;
  }

  req.user = user;
  req.rawToken = rawToken;
  next();
}

/**
 * Requires the user to have specific permissions.
 */
export function requirePermissions(...requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
      return;
    }

    const hasAll = requiredPermissions.every((perm) => req.user!.permissions.includes(perm));
    if (!hasAll) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not have permission to perform this action.',
        requiredPermissions,
      });
      return;
    }

    next();
  };
}

/**
 * Requires the user to hold one of the specified roles.
 */
export function requireRoles(...requiredRoles: (UserRole | string)[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
      return;
    }

    const flatRoles = requiredRoles.map((r) => String(r).toUpperCase());
    const hasRole = req.user.roles.some((r) => flatRoles.includes(String(r.role).toUpperCase()));
    if (!hasRole) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Insufficient role privilege.',
        requiredRoles,
      });
      return;
    }

    next();
  };
}

// Aliases for unified naming convention
export const authenticateUser = authenticateSession;
export const requireRole = (...roles: (string | string[] | UserRole | UserRole[])[]) => {
  const flattened = roles.flat() as (UserRole | string)[];
  return requireRoles(...flattened);
};
