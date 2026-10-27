import { Router } from 'express';
import {
  getPaymentProvidersHandler,
  createPaymentIntentHandler,
  recordPaymentTransactionHandler,
  paymentWebhookHandler,
  createRefundHandler,
} from './payment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { requireIdempotency } from '../../middleware/idempotency.middleware.js';

const router = Router();

// Public / Providers
router.get('/providers', getPaymentProvidersHandler);
router.post('/webhooks/:providerCode', paymentWebhookHandler);
router.post('/webhooks', paymentWebhookHandler);

// Protected routes
router.post(
  '/intents',
  authenticate,
  requireIdempotency(300),
  validate([
    { field: 'orderId', required: true, type: 'uuid' },
    { field: 'amount', required: true, type: 'number', min: 1 },
    { field: 'paymentMethod', required: true, type: 'string' },
  ]),
  createPaymentIntentHandler
);

router.post(
  '/transactions',
  authenticate,
  validate([
    { field: 'intentId', required: true, type: 'uuid' },
    { field: 'amount', required: true, type: 'number', min: 1 },
    { field: 'txnType', required: true, type: 'string' },
    { field: 'status', required: true, type: 'string' },
  ]),
  recordPaymentTransactionHandler
);

router.post(
  '/refunds',
  authenticate,
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate([
    { field: 'orderId', required: true, type: 'uuid' },
    { field: 'paymentTxnId', required: true, type: 'uuid' },
    { field: 'amount', required: true, type: 'number', min: 1 },
    { field: 'reason', required: true, type: 'string' },
  ]),
  createRefundHandler
);

export default router;
