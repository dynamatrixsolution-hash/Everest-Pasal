// ==============================================================================
// EVEREST PASAL - RETURNS & REVERSE LOGISTICS REPOSITORY (ep_returns)
// ==============================================================================

import { query, execute } from '../db.js';

export class ReturnsRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getReturnReasons(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_returns.tb_ep_returns_reason_return_reason_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY reason_code ASC;`,
      [this.companyCode]
    );
  }

  async createReturnRequest(data: {
    orderId: string;
    customerId: string;
    reasonId: string;
    customerNotes?: string;
    items: {
      orderItemId: string;
      quantity: number;
      reasonId?: string;
    }[];
  }): Promise<any> {
    const returnNumber = `RET_${Date.now().toString().slice(-8)}`;
    const rows = await query(
      `INSERT INTO ep_returns.tb_ep_returns_req_return_request_master (
        id, company_code, return_number, order_id, customer_id, return_reason_id,
        status, customer_notes, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3::uuid, $4::uuid, $5::uuid, 'REQUESTED', $6, true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        returnNumber,
        data.orderId,
        data.customerId,
        data.reasonId,
        data.customerNotes || null,
      ]
    );

    const returnReq = rows[0];

    for (const item of data.items) {
      await execute(
        `INSERT INTO ep_returns.tb_ep_returns_req_return_item_detail (
          id, company_code, return_request_id, order_item_id, return_reason_id,
          requested_quantity, approved_quantity, status, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3::uuid, $4::uuid, $5, 0, 'PENDING', true, false
        );`,
        [this.companyCode, returnReq.id, item.orderItemId, item.reasonId || data.reasonId, item.quantity]
      );
    }

    return returnReq;
  }

  async recordInspection(data: {
    returnItemId: string;
    inspectorId: string;
    conditionGrade: 'GRADE_A_RESTOCK' | 'GRADE_B_DISCOUNT' | 'GRADE_C_REFURBISH' | 'DAMAGED_SCRAP';
    passedInspection: boolean;
    remarks?: string;
  }): Promise<any> {
    const rows = await query(
      `INSERT INTO ep_returns.tb_ep_returns_inspect_return_inspection_txn (
        id, company_code, return_item_id, inspector_user_id, condition_grade,
        passed_inspection, remarks, inspected_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3::uuid, $4, $5, $6, clock_timestamp(), true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        data.returnItemId,
        data.inspectorId,
        data.conditionGrade,
        data.passedInspection,
        data.remarks || null,
      ]
    );

    // Update return item detail status
    await execute(
      `UPDATE ep_returns.tb_ep_returns_req_return_item_detail 
       SET status = $2, approved_quantity = requested_quantity, updated_at = clock_timestamp() 
       WHERE id = $1::uuid;`,
      [data.returnItemId, data.passedInspection ? 'APPROVED' : 'REJECTED']
    );

    return rows[0];
  }

  async getCustomerReturns(customerId: string): Promise<any[]> {
    return await query(
      `SELECT r.*, count(i.id)::int as item_count
       FROM ep_returns.tb_ep_returns_req_return_request_master r
       LEFT JOIN ep_returns.tb_ep_returns_req_return_item_detail i ON i.return_request_id = r.id
       WHERE r.company_code = $1 AND r.customer_id = $2::uuid AND r.active = true
       GROUP BY r.id
       ORDER BY r.created_at DESC;`,
      [this.companyCode, customerId]
    );
  }
}
