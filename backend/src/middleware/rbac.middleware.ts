import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendError } from '../types/context.js';

export function requireRoles(...allowedRoles: string[]) {
  return (req: any, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const hasRole = user.roles.some((role: string) => allowedRoles.includes(role)) ||
                    allowedRoles.includes(user.userType) ||
                    user.roles.includes('SUPER_ADMIN') ||
                    user.userType === 'ADMIN';

    if (!hasRole) {
      sendError(res, 'FORBIDDEN', 'You do not have the required role to access this resource', 403);
      return;
    }

    next();
  };
}

export function requireUserType(...allowedTypes: string[]) {
  return (req: any, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    if (!allowedTypes.includes(user.userType) && user.userType !== 'ADMIN') {
      sendError(res, 'FORBIDDEN', `Access restricted to ${allowedTypes.join(', ')}`, 403);
      return;
    }

    next();
  };
}

export function enforceCompanyScope(req: any, res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user) {
    return next();
  }

  // If user is not global super admin, restrict company_code in context to their authenticated company
  if (user.userType !== 'ADMIN' || !user.roles.includes('SUPER_ADMIN')) {
    req.context.companyCode = user.companyCode;
  }
  next();
}
