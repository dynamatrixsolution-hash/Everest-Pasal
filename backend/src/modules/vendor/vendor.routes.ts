// ==============================================================================
// EVEREST PASAL - VENDOR / MERCHANT CONTROLLER & ROUTES
// Strict Multi-Tenant Store Data Isolation
// ==============================================================================

import { Router, Request, Response } from 'express';
import { VendorRepository } from '../../repositories/vendor.repository.js';
import { InventoryRepository } from '../../repositories/inventory.repository.js';
import { FinanceRepository } from '../../repositories/finance.repository.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { sendSuccess, sendError } from '../../types/context.js';

const router = Router();

// Vendor Onboarding (Public or Authenticated User turning into Vendor)
router.post(
  '/onboarding',
  authenticate,
  validate([
    { field: 'merchantName', required: true, type: 'string', min: 2 },
    { field: 'panVatNumber', required: false, type: 'string' },
  ]),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
      const vendorRepo = new VendorRepository(companyCode);

      const created = await vendorRepo.createVendorProfile(user.id, req.body);
      sendSuccess(res, created, 'Vendor onboarding initiated successfully', 201);
    } catch (error: any) {
      sendError(res, 'ONBOARDING_FAILED', error.message, 400);
    }
  }
);

router.use(authenticate);
router.use(requireRoles('VENDOR', 'VENDOR_SELLER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'));

/**
 * GET /api/v1/vendor/me
 * Returns the currently authenticated vendor's merchant store profile
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const vendorRepo = new VendorRepository(companyCode);
    const vendor = await vendorRepo.getVendorByUserId(user.id);
    
    if (!vendor) {
      return sendSuccess(res, { vendor: null }, 'No store mapped to this account', 200);
    }

    sendSuccess(res, { vendor }, 'Vendor profile retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_VENDOR_FAILED', error.message, 500);
  }
});

/**
 * Tenant resolution middleware:
 * Ensures all subsequent routes run strictly within the authenticated vendor's store
 */
const resolveVendorMerchant = async (req: Request, res: Response, next: any) => {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const vendorRepo = new VendorRepository(companyCode);
    const vendor = await vendorRepo.getVendorByUserId(user.id);

    if (!vendor) {
      return sendError(res, 'NO_VENDOR_STORE', 'No active merchant store found for this account. Please complete vendor onboarding.', 404);
    }

    (req as any).vendor = vendor;
    (req as any).merchantId = vendor.id;
    next();
  } catch (error: any) {
    sendError(res, 'VENDOR_RESOLUTION_ERROR', error.message, 500);
  }
};

router.use(resolveVendorMerchant);

/**
 * GET /dashboard & /dashboard/summary
 */
router.get(['/dashboard', '/dashboard/summary'], async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const timeframe = (req.query.timeframe as string) || '7d';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);
    
    const stats = await vendorRepo.getDashboardStats(merchantId, timeframe);
    sendSuccess(res, stats, 'Vendor dashboard metrics', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_DASHBOARD_FAILED', error.message, 500);
  }
});

/**
 * Catalog Products
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);
    
    const result = await vendorRepo.getVendorProducts(merchantId, req.query);
    sendSuccess(res, result, 'Vendor products retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PRODUCTS_FAILED', error.message, 500);
  }
});

router.post('/products', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const created = await vendorRepo.createProductListing(merchantId, req.body);
    sendSuccess(res, created, 'Product listing created successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_PRODUCT_FAILED', error.message, 400);
  }
});

router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    await vendorRepo.deleteProductListing(merchantId, String(req.params.id));
    sendSuccess(res, { success: true }, 'Product listing deleted successfully', 200);
  } catch (error: any) {
    sendError(res, 'DELETE_PRODUCT_FAILED', error.message, 400);
  }
});

/**
 * Orders Management
 */
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);
    
    const orders = await vendorRepo.getVendorOrders(merchantId, req.query);
    sendSuccess(res, orders, 'Vendor orders retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_ORDERS_FAILED', error.message, 500);
  }
});

router.patch('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.updateOrderStatus(merchantId, String(req.params.id), req.body.status, req.body.note);
    sendSuccess(res, result, 'Order status updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_ORDER_STATUS_FAILED', error.message, 400);
  }
});

/**
 * Inventory
 */
router.get('/inventory', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);
    
    const inventory = await vendorRepo.getVendorInventory(merchantId, req.query);
    sendSuccess(res, inventory, 'Vendor inventory retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_INVENTORY_FAILED', error.message, 500);
  }
});

router.post('/inventory/:id/adjust', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.adjustInventoryStock(merchantId, String(req.params.id), req.body);
    sendSuccess(res, result, 'Inventory stock adjusted successfully', 200);
  } catch (error: any) {
    sendError(res, 'ADJUST_INVENTORY_FAILED', error.message, 400);
  }
});

/**
 * Finance, Settlements & Transactions
 */
router.get('/settlements', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);
    
    const settlements = await vendorRepo.getVendorSettlements(merchantId);
    sendSuccess(res, settlements, 'Vendor settlements retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_SETTLEMENTS_FAILED', error.message, 500);
  }
});

router.get('/payouts', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const financeRepo = new FinanceRepository(companyCode);
    
    const settlements = await financeRepo.getVendorSettlements(merchantId);
    sendSuccess(res, settlements, 'Vendor payouts retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PAYOUTS_FAILED', error.message, 500);
  }
});

router.get('/finance/transactions', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorTransactions(merchantId, req.query);
    sendSuccess(res, data, 'Vendor transactions retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_TRANSACTIONS_FAILED', error.message, 500);
  }
});

router.post('/finance/export', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.exportVendorStatement(merchantId, req.body);
    sendSuccess(res, data, 'Statement export scheduled successfully', 200);
  } catch (error: any) {
    sendError(res, 'EXPORT_STATEMENT_FAILED', error.message, 400);
  }
});

/**
 * Promotions & Marketing
 */
router.get('/promotions', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorPromotions(merchantId, req.query);
    sendSuccess(res, data, 'Vendor promotions retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PROMOTIONS_FAILED', error.message, 500);
  }
});

router.post('/promotions', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.createVendorPromotion(merchantId, req.body);
    sendSuccess(res, result, 'Promotion created successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_PROMOTION_FAILED', error.message, 400);
  }
});

router.get('/promotions/coupons', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorCoupons(merchantId, req.query);
    sendSuccess(res, data, 'Vendor coupons retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_COUPONS_FAILED', error.message, 500);
  }
});

router.get('/promotions/campaigns', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorCampaigns(merchantId);
    sendSuccess(res, data, 'Marketplace campaigns retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_CAMPAIGNS_FAILED', error.message, 500);
  }
});

router.get('/promotions/sponsored', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorSponsored(merchantId);
    sendSuccess(res, data, 'Sponsored & featured data retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_SPONSORED_FAILED', error.message, 500);
  }
});

/**
 * Store Profile & Settings
 */
router.get('/store', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorStoreInfo(merchantId);
    sendSuccess(res, data, 'Store information retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_STORE_FAILED', error.message, 500);
  }
});

router.put('/store/profile', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.updateVendorStoreProfile(merchantId, req.body);
    sendSuccess(res, result, 'Store profile updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_PROFILE_FAILED', error.message, 400);
  }
});

router.put('/store/branding', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.updateVendorStoreBranding(merchantId, req.body);
    sendSuccess(res, result, 'Store branding updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_BRANDING_FAILED', error.message, 400);
  }
});

router.put('/store/policies', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.updateVendorStorePolicies(merchantId, req.body);
    sendSuccess(res, result, 'Store policies updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_POLICIES_FAILED', error.message, 400);
  }
});

export default router;
