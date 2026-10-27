// ==============================================================================
// EVEREST PASAL - AUTHENTICATION CONTROLLER
// Standardized REST endpoints for full Identity & Session lifecycle
// ==============================================================================

import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function registerHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const authService = new AuthService(companyCode);
    const ip = (req as any).context?.clientIp;
    const userAgent = (req as any).context?.userAgent;

    const result = await authService.register(req.body, ip, userAgent);
    sendSuccess(res, result, 'User registered successfully', 201);
  } catch (error: any) {
    sendError(res, 'REGISTRATION_FAILED', error.message, 400);
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const authService = new AuthService(companyCode);
    const ip = (req as any).context?.clientIp;
    const userAgent = (req as any).context?.userAgent;

    const result = await authService.login(req.body, ip, userAgent);
    sendSuccess(res, result, 'Login successful', 200);
  } catch (error: any) {
    sendError(res, 'LOGIN_FAILED', error.message, 401);
  }
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const authService = new AuthService(companyCode);

    if (token) {
      await authService.logout(token);
    }
    sendSuccess(res, { loggedOut: true }, 'Successfully logged out', 200);
  } catch (error: any) {
    sendError(res, 'LOGOUT_FAILED', error.message, 400);
  }
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    if (!user) {
      sendError(res, 'UNAUTHORIZED', 'Session expired or invalid', 401);
      return;
    }
    sendSuccess(res, { user }, 'Current user profile retrieved', 200);
  } catch (error: any) {
    sendError(res, 'USER_FETCH_FAILED', error.message, 500);
  }
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    if (!user) {
      sendError(res, 'UNAUTHORIZED', 'Invalid session', 401);
      return;
    }
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const authService = new AuthService(companyCode);
    const newToken = authService.generateJwt({
      userId: user.id,
      userCode: user.userCode,
      email: user.email,
      userType: user.userType,
      companyCode,
      sessionId: user.sessionId,
    });

    sendSuccess(res, { token: newToken }, 'Session token refreshed', 200);
  } catch (error: any) {
    sendError(res, 'REFRESH_FAILED', error.message, 400);
  }
}

export async function forgotPasswordHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) {
      sendError(res, 'INVALID_INPUT', 'Email address is required', 400);
      return;
    }
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const authService = new AuthService(companyCode);
    const result = await authService.requestPasswordReset(email);
    sendSuccess(res, result, result.message, 200);
  } catch (error: any) {
    sendError(res, 'FORGOT_PASSWORD_FAILED', error.message, 400);
  }
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      sendError(res, 'INVALID_INPUT', 'Token and newPassword are required', 400);
      return;
    }
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const authService = new AuthService(companyCode);
    const result = await authService.confirmPasswordReset(token, newPassword);
    sendSuccess(res, result, result.message, 200);
  } catch (error: any) {
    sendError(res, 'RESET_PASSWORD_FAILED', error.message, 400);
  }
}

export async function requestOtpHandler(req: Request, res: Response): Promise<void> {
  try {
    const { destination, purpose } = req.body;
    if (!destination) {
      sendError(res, 'INVALID_INPUT', 'Destination is required', 400);
      return;
    }
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const authService = new AuthService(companyCode);
    const result = await authService.requestOtp(destination, purpose);
    sendSuccess(res, result, result.message, 200);
  } catch (error: any) {
    sendError(res, 'REQUEST_OTP_FAILED', error.message, 400);
  }
}

export async function verifyOtpHandler(req: Request, res: Response): Promise<void> {
  try {
    const { destination, code, purpose } = req.body;
    if (!destination || !code) {
      sendError(res, 'INVALID_INPUT', 'Destination and OTP code are required', 400);
      return;
    }
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const authService = new AuthService(companyCode);
    const result = await authService.verifyOtp(destination, code, purpose);
    if (!result.verified) {
      sendError(res, 'INVALID_OTP', 'The provided OTP code is invalid or expired', 400);
      return;
    }
    sendSuccess(res, result, 'OTP verified successfully', 200);
  } catch (error: any) {
    sendError(res, 'VERIFY_OTP_FAILED', error.message, 400);
  }
}
