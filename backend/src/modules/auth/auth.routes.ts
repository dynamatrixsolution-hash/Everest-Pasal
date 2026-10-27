// ==============================================================================
// EVEREST PASAL - AUTHENTICATION ROUTES
// ==============================================================================

import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  requestOtpHandler,
  verifyOtpHandler,
} from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

// Public routes
router.post(
  '/register',
  validate([
    { field: 'password', required: true, type: 'string', min: 6 },
    { field: 'fullName', required: false, type: 'string' },
  ]),
  registerHandler
);

router.post(
  '/login',
  validate([
    { field: 'identifier', required: true, type: 'string' },
    { field: 'password', required: true, type: 'string' },
  ]),
  loginHandler
);

router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);
router.post('/request-otp', requestOtpHandler);
router.post('/verify-otp', verifyOtpHandler);

// Protected routes
router.post('/logout', logoutHandler);
router.get('/me', authenticate, meHandler);
router.post('/refresh', authenticate, refreshHandler);

export default router;
