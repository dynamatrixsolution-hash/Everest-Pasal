// ==============================================================================
// EVEREST PASAL - PRICING & PROMOTIONS REPOSITORY (ep_pricing)
// ==============================================================================

import { query, execute } from '../db.js';

export class PricingRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getPriceLists(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_pricing.tb_ep_pricing_price_price_list_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY valid_from DESC, price_list_code ASC;`,
      [this.companyCode]
    );
  }

  async getProductPrice(listingVariantId: string, priceListId?: string): Promise<any | null> {
    let sql = `
      SELECT pr.* 
      FROM ep_pricing.tb_ep_pricing_price_product_price_detail pr
      JOIN ep_pricing.tb_ep_pricing_price_price_list_master pl ON pl.id = pr.price_list_id
      WHERE pr.company_code = $1 AND pr.listing_variant_id = $2::uuid AND pr.active = true AND pl.active = true
    `;
    const params: any[] = [this.companyCode, listingVariantId];

    if (priceListId) {
      sql += ` AND pr.price_list_id = $3::uuid`;
      params.push(priceListId);
    }

    sql += ` ORDER BY pl.valid_from DESC LIMIT 1;`;
    const rows = await query(sql, params);
    return rows[0] || null;
  }

  async findValidCoupon(code: string): Promise<any | null> {
    const rows = await query(
      `SELECT c.*, p.promotion_name, p.promotion_code,
              COALESCE(r.reward_type, 'PERCENTAGE') as discount_type,
              COALESCE(r.reward_value, 10) as discount_value
       FROM ep_pricing.tb_ep_pricing_coupon_coupon_master c
       LEFT JOIN ep_pricing.tb_ep_pricing_promo_promotion_master p ON p.id = c.promotion_id
       LEFT JOIN ep_pricing.tb_ep_pricing_promo_promotion_reward_detail r ON r.promotion_id = p.id
       WHERE c.company_code = $1 
         AND UPPER(c.coupon_code) = UPPER($2) 
         AND c.active = true 
         AND c.valid_from <= clock_timestamp() 
         AND (c.valid_to IS NULL OR c.valid_to >= clock_timestamp())
       LIMIT 1;`,
      [this.companyCode, code]
    );
    return rows[0] || null;
  }

  async recordCouponRedemption(couponId: string, orderId: string, customerId: string, discountAmount: number): Promise<void> {
    await execute(
      `INSERT INTO ep_pricing.tb_ep_pricing_coupon_coupon_redemption_txn (
        id, company_code, fiscal_year_code, coupon_id, order_id, customer_id, discount_amount, redeemed_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, 'FY8182', $2::uuid, $3::uuid, $4::uuid, $5, clock_timestamp(), true, false
      );`,
      [this.companyCode, couponId, orderId, customerId, discountAmount]
    );
  }

  async getActivePromotions(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_pricing.tb_ep_pricing_promo_promotion_master 
       WHERE company_code = $1 
         AND active = true 
         AND valid_from <= clock_timestamp() 
         AND (valid_to IS NULL OR valid_to >= clock_timestamp())
       ORDER BY priority DESC, created_at DESC;`,
      [this.companyCode]
    );
  }

  async getTaxRules(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_pricing.tb_ep_pricing_tax_tax_rule_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY tax_rule_code ASC;`,
      [this.companyCode]
    );
  }

  async getShippingRateRules(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_pricing.tb_ep_pricing_shipping_shipping_rate_rule_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY rate_rule_code ASC;`,
      [this.companyCode]
    );
  }
}
