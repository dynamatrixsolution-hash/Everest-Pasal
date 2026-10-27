import { Request, Response } from 'express';
import { PricingRepository } from '../../repositories/pricing.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getPriceListsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new PricingRepository(companyCode);
    const data = await repo.getPriceLists();
    sendSuccess(res, data, 'Price lists retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PRICE_LISTS_FAILED', error.message, 500);
  }
}

export async function validateCouponHandler(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.body;
    if (!code) {
      sendError(res, 'INVALID_INPUT', 'Coupon code is required', 400);
      return;
    }
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new PricingRepository(companyCode);
    const coupon = await repo.findValidCoupon(code);

    if (!coupon) {
      sendError(res, 'COUPON_INVALID', 'Coupon code is invalid, expired, or maximum limit reached', 400);
      return;
    }

    sendSuccess(
      res,
      {
        valid: true,
        couponCode: coupon.coupon_code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        minOrderAmount: coupon.min_order_amount,
        maxDiscountAmount: coupon.max_discount_amount,
      },
      'Coupon is valid',
      200
    );
  } catch (error: any) {
    sendError(res, 'VALIDATE_COUPON_FAILED', error.message, 500);
  }
}

export async function getActivePromotionsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new PricingRepository(companyCode);
    const data = await repo.getActivePromotions();
    sendSuccess(res, data, 'Active promotions retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PROMOTIONS_FAILED', error.message, 500);
  }
}

export async function getTaxRulesHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new PricingRepository(companyCode);
    const data = await repo.getTaxRules();
    sendSuccess(res, data, 'Tax rules retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_TAX_RULES_FAILED', error.message, 500);
  }
}
