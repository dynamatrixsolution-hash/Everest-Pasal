import { Router } from 'express';
import {
  getPriceListsHandler,
  validateCouponHandler,
  getActivePromotionsHandler,
  getTaxRulesHandler,
} from './pricing.controller.js';

const router = Router();

router.get('/price-lists', getPriceListsHandler);
router.post('/coupons/validate', validateCouponHandler);
router.get('/promotions', getActivePromotionsHandler);
router.get('/tax-rules', getTaxRulesHandler);

export default router;
