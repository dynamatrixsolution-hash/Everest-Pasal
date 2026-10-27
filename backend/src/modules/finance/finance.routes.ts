import { Router } from 'express';
import {
  getLedgerAccountsHandler,
  createJournalHandler,
  createSettlementHandler,
  getVendorSettlementsHandler,
  createPayoutHandler,
} from './finance.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/accounts', getLedgerAccountsHandler);

router.post(
  '/journals',
  requireRoles('ADMIN', 'SUPER_ADMIN', 'FINANCE_OPERATOR'),
  validate([
    { field: 'fiscalYearCode', required: true, type: 'string' },
    { field: 'journalType', required: true, type: 'string' },
    { field: 'description', required: true, type: 'string' },
    { field: 'lines', required: true, type: 'array' },
  ]),
  createJournalHandler
);

router.post(
  '/settlements',
  requireRoles('ADMIN', 'SUPER_ADMIN', 'FINANCE_OPERATOR'),
  validate([
    { field: 'vendorId', required: true, type: 'uuid' },
    { field: 'grossSales', required: true, type: 'number' },
    { field: 'netPayout', required: true, type: 'number' },
  ]),
  createSettlementHandler
);

router.get('/settlements/vendor/:vendorId?', requireRoles('VENDOR', 'VENDOR_SELLER', 'ADMIN', 'SUPER_ADMIN'), getVendorSettlementsHandler);

router.post(
  '/payouts',
  requireRoles('ADMIN', 'SUPER_ADMIN', 'FINANCE_OPERATOR'),
  validate([
    { field: 'settlementId', required: true, type: 'uuid' },
    { field: 'vendorId', required: true, type: 'uuid' },
    { field: 'amount', required: true, type: 'number', min: 1 },
    { field: 'payoutMethod', required: true, type: 'string' },
  ]),
  createPayoutHandler
);

export default router;
