// ==============================================================================
// EVEREST PASAL - SUPPORT REPOSITORY (ep_support)
// ==============================================================================

import { query, execute } from '../db.js';

export class SupportRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async createTicket(data: {
    userId: string;
    ticketType?: string;
    subject: string;
    priority?: string;
    orderId?: string;
    initialMessage: string;
    requesterType?: string;
  }): Promise<any> {
    const ticketNo = `TCK_${Date.now().toString().slice(-8)}`;
    const rows = await query(
      `INSERT INTO ep_support.tb_ep_support_ticket_ticket_master (
        id, company_code, ticket_no, requester_user_id, requester_type, subject,
        priority, status, reference_type, reference_id, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3::uuid, $4, $5, $6, 'OPEN', $7, $8::uuid, true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        ticketNo,
        data.userId,
        data.requesterType || 'CUSTOMER',
        data.subject,
        data.priority || 'MEDIUM',
        data.orderId ? 'ORDER' : null,
        data.orderId || null,
      ]
    );

    const ticket = rows[0];

    // Add initial message
    await execute(
      `INSERT INTO ep_support.tb_ep_support_ticket_ticket_message_detail (
        id, company_code, ticket_id, sender_user_id, message_text, visibility, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3::uuid, $4, 'PUBLIC', true, false
      );`,
      [this.companyCode, ticket.id, data.userId, data.initialMessage]
    );

    return ticket;
  }

  async addMessage(ticketId: string, senderUserId: string, messageText: string, isInternal: boolean = false): Promise<any> {
    const rows = await query(
      `INSERT INTO ep_support.tb_ep_support_ticket_ticket_message_detail (
        id, company_code, ticket_id, sender_user_id, message_text, visibility, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3::uuid, $4, $5, true, false
      ) RETURNING *;`,
      [this.companyCode, ticketId, senderUserId, messageText, isInternal ? 'INTERNAL' : 'PUBLIC']
    );

    await execute(
      `UPDATE ep_support.tb_ep_support_ticket_ticket_master 
       SET updated_at = clock_timestamp() 
       WHERE id = $1::uuid;`,
      [ticketId]
    );

    return rows[0];
  }

  async getTickets(params: { userId?: string; status?: string; page?: number; pageSize?: number } = {}): Promise<{ data: any[]; total: number }> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClauses = [`t.company_code = $1`, `t.active = true`];
    let queryParams: any[] = [this.companyCode];
    let idx = 2;

    if (params.userId) {
      whereClauses.push(`t.requester_user_id = $${idx}::uuid`);
      queryParams.push(params.userId);
      idx++;
    }

    if (params.status) {
      whereClauses.push(`t.status = $${idx}`);
      queryParams.push(params.status);
      idx++;
    }

    const whereSql = whereClauses.join(' AND ');

    const countRows = await query<{ count: number }>(
      `SELECT count(*)::int as count FROM ep_support.tb_ep_support_ticket_ticket_master t WHERE ${whereSql};`,
      queryParams
    );

    const total = countRows[0]?.count || 0;

    const data = await query(
      `SELECT t.*, u.display_name as user_name, u.email as user_email
       FROM ep_support.tb_ep_support_ticket_ticket_master t
       JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = t.requester_user_id
       WHERE ${whereSql}
       ORDER BY t.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1};`,
      [...queryParams, pageSize, offset]
    );

    return { data, total };
  }

  async getTicketDetails(ticketId: string): Promise<any | null> {
    const rows = await query(
      `SELECT t.*, u.display_name, u.email 
       FROM ep_support.tb_ep_support_ticket_ticket_master t
       JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = t.requester_user_id
       WHERE t.company_code = $1 AND t.id = $2::uuid AND t.active = true 
       LIMIT 1;`,
      [this.companyCode, ticketId]
    );

    if (!rows[0]) return null;

    const messages = await query(
      `SELECT m.*, u.display_name as sender_name, u.user_type as sender_type
       FROM ep_support.tb_ep_support_ticket_ticket_message_detail m
       JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = m.sender_user_id
       WHERE m.company_code = $1 AND m.ticket_id = $2::uuid AND m.active = true 
       ORDER BY m.created_at ASC;`,
      [this.companyCode, ticketId]
    );

    return {
      ...rows[0],
      messages,
    };
  }

  async updateTicketStatus(ticketId: string, status: string, changedByUserId: string, reason?: string): Promise<void> {
    await execute(
      `UPDATE ep_support.tb_ep_support_ticket_ticket_master 
       SET status = $2, updated_at = clock_timestamp() 
       WHERE id = $1::uuid;`,
      [ticketId, status]
    );

    await execute(
      `INSERT INTO ep_support.tb_ep_support_ticket_ticket_status_history (
        id, company_code, ticket_id, new_status, changed_by_user_id, change_reason, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3, $4::uuid, $5, true, false
      );`,
      [this.companyCode, ticketId, status, changedByUserId, reason || null]
    );
  }
}
