// ==============================================================================
// EVEREST PASAL - REQUEST CONTEXT & API TYPES
// ==============================================================================

import { Request, Response } from 'express';

export interface UserContext {
  id: string;
  companyCode: string;
  userCode: string;
  email: string | null;
  mobileNo: string | null;
  displayName: string;
  userType: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'RIDER' | 'AGENT' | 'INFLUENCER' | 'SYSTEM';
  roles: string[];
  permissions: string[];
  vendorId?: string | null;
  customerId?: string | null;
  sessionId?: string;
}

export interface RequestContext {
  requestId: string;
  companyCode: string;
  clientIp: string;
  userAgent: string;
  timestamp: Date;
  user?: UserContext;
}

export interface AuthenticatedRequest extends Request {
  context: RequestContext;
  user?: UserContext;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}

export function sendSuccess<T>(res: Response, data: T, message: string = 'Success', status: number = 200, meta?: any): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
  res.status(status).json(response);
}

export function sendError(res: Response, code: string, message: string, status: number = 400, details?: any[]): void {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  res.status(status).json(response);
}
