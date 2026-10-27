// ==============================================================================
// EVEREST PASAL - CUSTOMER REPOSITORY (ep_customer)
// ==============================================================================

import { query, execute } from '../db.js';

export class CustomerRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getProfileByUserId(userId: string): Promise<any | null> {
    const rows = await query(
      `SELECT c.*, u.email, u.mobile_no, u.display_name
       FROM ep_customer.tb_ep_customer_profile_customer_master c
       JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = c.user_id
       WHERE c.company_code = $1 AND c.user_id = $2::uuid AND c.active = true 
       LIMIT 1;`,
      [this.companyCode, userId]
    );
    return rows[0] || null;
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; gender?: string; dateOfBirth?: Date }): Promise<any> {
    const rows = await query(
      `UPDATE ep_customer.tb_ep_customer_profile_customer_master
       SET first_name = COALESCE($3, first_name),
           last_name = COALESCE($4, last_name),
           gender = COALESCE($5, gender),
           date_of_birth = COALESCE($6, date_of_birth),
           updated_at = clock_timestamp()
       WHERE company_code = $1 AND user_id = $2::uuid AND active = true
       RETURNING *;`,
      [this.companyCode, userId, data.firstName || null, data.lastName || null, data.gender || null, data.dateOfBirth || null]
    );
    return rows[0] || null;
  }

  async getAddresses(customerId: string): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_customer.tb_ep_customer_address_address_detail 
       WHERE company_code = $1 AND customer_id = $2::uuid AND active = true 
       ORDER BY is_default DESC, created_at DESC;`,
      [this.companyCode, customerId]
    );
  }

  async createAddress(customerId: string, address: {
    addressType?: string;
    recipientName: string;
    recipientPhone?: string;
    phoneNo?: string;
    addressLine1: string;
    addressLine2?: string;
    cityCode?: string;
    city?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }): Promise<any> {
    if (address.isDefault) {
      await execute(
        `UPDATE ep_customer.tb_ep_customer_address_address_detail 
         SET is_default = false 
         WHERE company_code = $1 AND customer_id = $2::uuid;`,
        [this.companyCode, customerId]
      );
    }

    const rows = await query(
      `INSERT INTO ep_customer.tb_ep_customer_address_address_detail (
        id, company_code, customer_id, address_type, recipient_name, recipient_phone,
        address_line1, address_line2, city_code, postal_code, latitude, longitude,
        is_default, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        customerId,
        address.addressType || 'SHIPPING',
        address.recipientName,
        address.recipientPhone || address.phoneNo || '9800000000',
        address.addressLine1,
        address.addressLine2 || null,
        address.cityCode || address.city || 'KTM',
        address.postalCode || null,
        address.latitude || null,
        address.longitude || null,
        address.isDefault ?? false,
      ]
    );
    return rows[0];
  }

  async deleteAddress(customerId: string, addressId: string): Promise<void> {
    await execute(
      `UPDATE ep_customer.tb_ep_customer_address_address_detail 
       SET active = false, updated_at = clock_timestamp() 
       WHERE company_code = $1 AND customer_id = $2::uuid AND id = $3::uuid;`,
      [this.companyCode, customerId, addressId]
    );
  }

  async logProductView(customerId: string, productId: string): Promise<void> {
    await execute(
      `INSERT INTO ep_customer.tb_ep_customer_recent_product_view_log (
        id, company_code, customer_id, product_id, viewed_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3::uuid, clock_timestamp(), true, false
      );`,
      [this.companyCode, customerId, productId]
    );
  }

  async getRecentProductViews(customerId: string, limit: number = 10): Promise<any[]> {
    return await query(
      `SELECT v.*, p.product_name, p.product_code 
       FROM ep_customer.tb_ep_customer_recent_product_view_log v
       JOIN ep_catalog.tb_ep_catalog_prd_product_master p ON p.id = v.product_id
       WHERE v.company_code = $1 AND v.customer_id = $2::uuid AND v.active = true
       ORDER BY v.viewed_at DESC 
       LIMIT $3;`,
      [this.companyCode, customerId, limit]
    );
  }
}
