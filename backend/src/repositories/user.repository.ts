// ==============================================================================
// EVEREST PASAL - USER & IDENTITY REPOSITORY
// Direct parameterized data access for ep_identity schema with PostgreSQL 18
// ==============================================================================

import { query, execute } from '../db.js';

export interface UserRow {
  id: string;
  company_code: string;
  user_code: string;
  email: string | null;
  mobile_no: string | null;
  display_name: string;
  user_type: string;
  email_verified: boolean;
  mobile_verified: boolean;
  last_login_at: Date | null;
  active: boolean;
  publish: boolean;
  created_at: Date;
}

export interface UserRoleRow {
  role_code: string;
  role_name: string;
  role_scope: string;
  scope_type: string | null;
  scope_id: string | null;
}

export class UserRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const rows = await query<UserRow>(
      `SELECT * FROM ep_identity.tb_ep_identity_user_user_master 
       WHERE company_code = $1 AND LOWER(email) = LOWER($2) AND active = true 
       LIMIT 1;`,
      [this.companyCode, email]
    );
    return rows[0] || null;
  }

  async findByMobile(mobile: string): Promise<UserRow | null> {
    const rows = await query<UserRow>(
      `SELECT * FROM ep_identity.tb_ep_identity_user_user_master 
       WHERE company_code = $1 AND mobile_no = $2 AND active = true 
       LIMIT 1;`,
      [this.companyCode, mobile]
    );
    return rows[0] || null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const rows = await query<UserRow>(
      `SELECT * FROM ep_identity.tb_ep_identity_user_user_master 
       WHERE company_code = $1 AND id = $2::uuid AND active = true 
       LIMIT 1;`,
      [this.companyCode, id]
    );
    return rows[0] || null;
  }

  async getPasswordCredential(userId: string): Promise<string | null> {
    const rows = await query<{ password_hash: string }>(
      `SELECT password_hash FROM ep_identity.tb_ep_identity_auth_credential_master 
       WHERE company_code = $1 AND user_id = $2::uuid AND credential_type = 'PASSWORD' AND active = true 
       LIMIT 1;`,
      [this.companyCode, userId]
    );
    return rows[0]?.password_hash || null;
  }

  async getUserRoles(userId: string): Promise<UserRoleRow[]> {
    return await query<UserRoleRow>(
      `SELECT r.role_code, r.role_name, r.role_scope, m.scope_type, m.scope_id
       FROM ep_identity.tb_ep_identity_role_user_role_map m
       JOIN ep_identity.tb_ep_identity_role_role_master r ON r.id = m.role_id
       WHERE m.company_code = $1 AND m.user_id = $2::uuid AND m.active = true;`,
      [this.companyCode, userId]
    );
  }

  async createUser(data: {
    email?: string;
    mobile_no?: string;
    display_name: string;
    user_type: string;
    password_hash: string;
    role_code?: string;
  }): Promise<UserRow> {
    const userCode = `USR_${Date.now().toString().slice(-8)}`;
    
    // 1. Insert user master
    const userRows = await query<UserRow>(
      `INSERT INTO ep_identity.tb_ep_identity_user_user_master (
        id, company_code, user_code, email, mobile_no, display_name, user_type, email_verified, mobile_verified, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, false, false, true, false
      ) RETURNING *;`,
      [this.companyCode, userCode, data.email || null, data.mobile_no || null, data.display_name, data.user_type]
    );

    const user = userRows[0];

    // 2. Insert password credential
    await execute(
      `INSERT INTO ep_identity.tb_ep_identity_auth_credential_master (
        id, company_code, user_id, credential_type, password_hash, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, 'PASSWORD', $3, true, false
      );`,
      [this.companyCode, user.id, data.password_hash]
    );

    // 3. Ensure role exists or create it
    const roleCode = data.role_code || (data.user_type === 'VENDOR' ? 'VENDOR_SELLER' : data.user_type === 'ADMIN' ? 'SUPER_ADMIN' : 'CUSTOMER');
    let roleRows = await query<{ id: string }>(
      `SELECT id FROM ep_identity.tb_ep_identity_role_role_master WHERE company_code = $1 AND role_code = $2 LIMIT 1;`,
      [this.companyCode, roleCode]
    );

    let roleId = roleRows[0]?.id;
    if (!roleId) {
      const createdRole = await query<{ id: string }>(
        `INSERT INTO ep_identity.tb_ep_identity_role_role_master (
          id, company_code, role_code, role_name, role_scope, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2, $2, 'GLOBAL', true, false
        ) RETURNING id;`,
        [this.companyCode, roleCode]
      );
      roleId = createdRole[0].id;
    }

    // 4. Assign role
    await execute(
      `INSERT INTO ep_identity.tb_ep_identity_role_user_role_map (
        id, company_code, user_id, role_id, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3::uuid, true, false
      );`,
      [this.companyCode, user.id, roleId]
    );

    // 5. If customer, also create customer profile in ep_customer
    if (data.user_type === 'CUSTOMER') {
      const customerCode = `CUST_${Date.now().toString().slice(-8)}`;
      await execute(
        `INSERT INTO ep_customer.tb_ep_customer_profile_customer_master (
          id, company_code, customer_code, user_id, first_name, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2, $3::uuid, $4, true, false
        );`,
        [this.companyCode, customerCode, user.id, data.display_name]
      );
    }

    return user;
  }

  async createSession(userId: string, tokenHash: string, ipAddress?: string, userAgent?: string, ttlDays: number = 7): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    await execute(
      `INSERT INTO ep_identity.tb_ep_admin_log_session_master (
        id, company_code, user_id, session_token_hash, ip_address, user_agent, expires_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3, $4::inet, $5, $6, true, false
      );`,
      [this.companyCode, userId, tokenHash, ipAddress || null, userAgent || null, expiresAt]
    );
  }

  async revokeSession(tokenHash: string): Promise<void> {
    await execute(
      `UPDATE ep_identity.tb_ep_admin_log_session_master 
       SET revoked_at = clock_timestamp(), active = false 
       WHERE company_code = $1 AND session_token_hash = $2;`,
      [this.companyCode, tokenHash]
    );
  }

  async validateSession(tokenHash: string): Promise<{ user: UserRow; sessionId: string } | null> {
    const rows = await query<{
      session_id: string;
      id: string;
      company_code: string;
      user_code: string;
      email: string | null;
      mobile_no: string | null;
      display_name: string;
      user_type: string;
      email_verified: boolean;
      mobile_verified: boolean;
      last_login_at: Date | null;
      active: boolean;
      publish: boolean;
      created_at: Date;
    }>(
      `SELECT s.id as session_id, u.*
       FROM ep_identity.tb_ep_admin_log_session_master s
       JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = s.user_id
       WHERE s.company_code = $1 
         AND s.session_token_hash = $2 
         AND s.active = true 
         AND s.revoked_at IS NULL 
         AND s.expires_at > clock_timestamp()
         AND u.active = true
       LIMIT 1;`,
      [this.companyCode, tokenHash]
    );
    if (!rows[0]) return null;
    const { session_id, ...user } = rows[0];
    return { user, sessionId: session_id };
  }

  async updateLastLogin(userId: string): Promise<void> {
    await execute(
      `UPDATE ep_identity.tb_ep_identity_user_user_master 
       SET last_login_at = clock_timestamp() 
       WHERE company_code = $1 AND id = $2::uuid;`,
      [this.companyCode, userId]
    );
  }
}
