// ==============================================================================
// EVEREST PASAL - ADMIN REPOSITORY
// Global platform metrics, KYC approvals, customer & vendor management
// ==============================================================================

import { query, execute } from '../db.js';

export class AdminRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getPlatformStats(): Promise<any> {
    const custCount = await query<{ count: number }>(
      `SELECT count(*)::int as count FROM ep_customer.tb_ep_customer_profile_customer_master WHERE company_code = $1 AND active = true;`,
      [this.companyCode]
    );

    const vendorCount = await query<{ count: number }>(
      `SELECT count(*)::int as count FROM ep_merchant.tb_ep_merchant_vendor_merchant_master WHERE company_code = $1 AND active = true;`,
      [this.companyCode]
    );

    const prodCount = await query<{ count: number }>(
      `SELECT count(*)::int as count FROM ep_catalog.tb_ep_catalog_prd_product_master WHERE company_code = $1 AND active = true;`,
      [this.companyCode]
    );

    const orderStats = await query<{ count: number; gm_val: number }>(
      `SELECT count(*)::int as count, COALESCE(SUM(grand_total), 0)::numeric as gm_val 
       FROM ep_commerce.tb_ep_commerce_ord_order_master WHERE company_code = $1 AND active = true;`,
      [this.companyCode]
    );

    const pendingKyc = await query<{ count: number }>(
      `SELECT count(*)::int as count FROM ep_kyc.tb_ep_kyc_case_verification_case_master WHERE company_code = $1 AND status IN ('SUBMITTED', 'IN_REVIEW') AND active = true;`,
      [this.companyCode]
    );

    return {
      totalCustomers: custCount[0]?.count || 0,
      totalVendors: vendorCount[0]?.count || 0,
      totalProducts: prodCount[0]?.count || 0,
      totalOrders: orderStats[0]?.count || 0,
      grossMarketplaceVolume: Number(orderStats[0]?.gm_val || 0),
      pendingKycCases: pendingKyc[0]?.count || 0,
    };
  }

  async getAllVendors(): Promise<any[]> {
    return await query<any>(
      `SELECT m.*, u.email as owner_email, u.display_name as owner_name 
       FROM ep_merchant.tb_ep_merchant_vendor_merchant_master m
       LEFT JOIN ep_merchant.tb_ep_merchant_vendor_member_map mem ON mem.merchant_id = m.id AND mem.merchant_role = 'OWNER'
       LEFT JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = mem.user_id
       WHERE m.company_code = $1 AND m.active = true
       ORDER BY m.created_at DESC;`,
      [this.companyCode]
    );
  }

  async approveVendor(merchantId: string, adminUserId: string): Promise<void> {
    await execute(
      `UPDATE ep_merchant.tb_ep_merchant_vendor_merchant_master 
       SET onboarding_status = 'APPROVED', publish = true, updated_at = clock_timestamp()
       WHERE company_code = $1 AND id = $2::uuid;`,
      [this.companyCode, merchantId]
    );

    // Record decision in ep_kyc
    await execute(
      `INSERT INTO ep_kyc.tb_ep_kyc_decision_decision_history (
        id, company_code, case_id, decision, decision_reason_code, decision_note, decided_by, decided_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, (SELECT id FROM ep_kyc.tb_ep_kyc_case_verification_case_master WHERE subject_id = (SELECT id FROM ep_kyc.tb_ep_kyc_subject_subject_master WHERE merchant_id = $2::uuid LIMIT 1) LIMIT 1),
        'APPROVE', 'KYC_VERIFIED', 'Vendor onboarding approved by platform admin', $3::uuid, clock_timestamp(), true, false
      );`,
      [this.companyCode, merchantId, adminUserId]
    );
  }

  async getAllCustomers(): Promise<any[]> {
    return await query<any>(
      `SELECT c.*, u.email, u.mobile_no, u.display_name, u.last_login_at 
       FROM ep_customer.tb_ep_customer_profile_customer_master c
       JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = c.user_id
       WHERE c.company_code = $1 AND c.active = true
       ORDER BY c.created_at DESC;`,
      [this.companyCode]
    );
  }

  async getAuditLogs(limit: number = 50): Promise<any[]> {
    return await query<any>(
      `SELECT a.*, u.display_name as actor_name, u.email as actor_email 
       FROM ep_audit.tb_ep_audit_activity_activity_log a
       LEFT JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = a.user_id
       WHERE a.company_code = $1 AND a.active = true
       ORDER BY a.activity_at DESC
       LIMIT $2;`,
      [this.companyCode, limit]
    );
  }
}
