import { Router } from 'express';
import {
  validateReferralCodeHandler,
  createReferralCodeHandler,
  getCampaignsHandler,
} from './growth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

router.get('/referrals/:code', validateReferralCodeHandler);
router.get('/campaigns', getCampaignsHandler);

router.post(
  '/referrals',
  authenticate,
  validate([
    { field: 'code', required: true, type: 'string', min: 3 },
  ]),
  createReferralCodeHandler
);

export default router;
