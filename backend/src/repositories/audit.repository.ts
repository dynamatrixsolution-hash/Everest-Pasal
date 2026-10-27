// ==============================================================================
// EVEREST PASAL - AUDIT REPOSITORY (ep_audit)
// Immutable Operational, Security & Access Event Logging
// ==============================================================================

import { query, execute } from '../db.js';

export class AuditRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async logActivity(data: {
    userId?: string;
    activityType: string;
    moduleCode: string;
    referenceType?: string;
    referenceId?: string;
    ipAddress?: string;
    metadata?: any;
  }): Promise<void> {
    await execute(
      `INSERT INTO ep_audit.tb_ep_audit_activity_activity_log (
        id, company_code, user_id, activity_type, module_code, reference_type,
        reference_id, ip_address, metadata_json, activity_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3, $4, $5, $6::uuid, $7::inet, $8, clock_timestamp(), true, false
      );`,
      [
        this.companyCode,
        data.userId || null,
        data.activityType,
        data.moduleCode,
        data.referenceType || null,
        data.referenceId || null,
        data.ipAddress || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ]
    );
  }

  async getActivityLogs(params: {
    userId?: string;
    moduleCode?: string;
    activityType?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ data: any[]; total: number }> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClauses = [`a.company_code = $1`];
    let queryParams: any[] = [this.companyCode];
    let idx = 2;

    if (params.userId) {
      whereClauses.push(`a.user_id = $${idx}::uuid`);
      queryParams.push(params.userId);
      idx++;
    }

    if (params.moduleCode) {
      whereClauses.push(`a.module_code = $${idx}`);
      queryParams.push(params.moduleCode);
      idx++;
    }

    if (params.activityType) {
      whereClauses.push(`a.activity_type = $${idx}`);
      queryParams.push(params.activityType);
      idx++;
    }

    const whereSql = whereClauses.join(' AND ');

    const countRows = await query<{ count: number }>(
      `SELECT count(*)::int as count FROM ep_audit.tb_ep_audit_activity_activity_log a WHERE ${whereSql};`,
      queryParams
    );

    const total = countRows[0]?.count || 0;

    const data = await query(
      `SELECT a.*, u.display_name as actor_name, u.email as actor_email
       FROM ep_audit.tb_ep_audit_activity_activity_log a
       LEFT JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = a.user_id
       WHERE ${whereSql}
       ORDER BY a.activity_at DESC
       LIMIT $${idx} OFFSET $${idx + 1};`,
      [...queryParams, pageSize, offset]
    );

    return { data, total };
  }
}
