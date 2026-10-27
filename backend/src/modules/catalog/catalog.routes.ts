// ==============================================================================
// EVEREST PASAL - CATALOG & PRODUCT ROUTES
// ==============================================================================

import { Router } from 'express';
import {
  listProductsHandler,
  searchProductsHandler,
  getProductByIdHandler,
  createProductHandler,
  updateProductHandler,
  setProductStatusHandler,
  deactivateProductHandler,
  listCategoriesHandler,
  listBrandsHandler,
  createCategoryHandler,
  adjustStockHandler,
} from './catalog.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

// Public catalog routes
router.get('/products', listProductsHandler);
router.get('/search/products', searchProductsHandler);
router.get('/products/:id', getProductByIdHandler);
router.get('/categories', listCategoriesHandler);
router.get('/brands', listBrandsHandler);

// Protected catalog mutation routes
router.post(
  '/products',
  authenticate,
  requireRoles('VENDOR', 'VENDOR_SELLER', 'ADMIN', 'SUPER_ADMIN'),
  validate([
    { field: 'name', required: true, type: 'string', min: 2 },
    { field: 'price', required: true, type: 'number', min: 0 },
    { field: 'sku', required: true, type: 'string' },
  ]),
  createProductHandler
);

router.put('/products/:id', authenticate, requireRoles('VENDOR', 'VENDOR_SELLER', 'ADMIN', 'SUPER_ADMIN'), updateProductHandler);
router.patch('/products/:id/status', authenticate, requireRoles('ADMIN', 'SUPER_ADMIN'), setProductStatusHandler);
router.delete('/products/:id', authenticate, requireRoles('ADMIN', 'SUPER_ADMIN'), deactivateProductHandler);

router.post(
  '/categories',
  authenticate,
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate([
    { field: 'name', required: true, type: 'string', min: 2 },
  ]),
  createCategoryHandler
);

router.post('/offers/:offerId/stock-adjust', authenticate, adjustStockHandler);

export default router;
