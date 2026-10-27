// ==============================================================================
// EVEREST PASAL - GROWTH & ATTRIBUTION REPOSITORY (ep_growth)
// ==============================================================================

import { query, execute } from '../db.js';

export class GrowthRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getReferralCode(code: string): Promise<any | null> {
    const rows = await query(
      `SELECT * FROM ep_growth.tb_ep_growth_referral_referral_code_master 
       WHERE company_code = $1 
         AND UPPER(referral_code) = UPPER($2) 
         AND active = true 
         AND valid_from <= clock_timestamp() 
         AND (valid_to IS NULL OR valid_to >= clock_timestamp())
       LIMIT 1;`,
      [this.companyCode, code]
    );
    return rows[0] || null;
  }

  async createReferralCode(ownerId: string, code: string, discountPercent: number = 5, commissionPercent: number = 5): Promise<any> {
    const rows = await query(
      `INSERT INTO ep_growth.tb_ep_growth_referral_referral_code_master (
        id, company_code, referral_code, owner_type, owner_id, valid_from, valid_to, active, publish
      ) VALUES (
        gen_random_uuid(), $1, UPPER($2), 'USER', $3::uuid, clock_timestamp(), clock_timestamp() + interval '1 year', true, true
      ) RETURNING *;`,
      [this.companyCode, code, ownerId]
    );
    return rows[0];
  }

  async recordAttribution(data: {
    orderId: string;
    referralCodeId?: string;
    campaignId?: string;
    influencerId?: string;
    commissionBasisAmount: number;
    commissionAmount: number;
  }): Promise<any> {
    const rows = await query(
      `INSERT INTO ep_growth.tb_ep_growth_attr_attribution_txn (
        id, company_code, order_id, referral_code_id, campaign_id,
        influencer_id, commission_basis_amount, commission_amount,
        attribution_status, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6, $7, 'ATTRIBUTED', true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        data.orderId,
        data.referralCodeId || null,
        data.campaignId || null,
        data.influencerId || null,
        data.commissionBasisAmount,
        data.commissionAmount,
      ]
    );
    return rows[0];
  }

  async getCampaigns(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_growth.tb_ep_growth_campaign_campaign_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY start_date DESC;`,
      [this.companyCode]
    );
  }
}
