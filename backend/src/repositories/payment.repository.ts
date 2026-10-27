// ==============================================================================
// EVEREST PASAL - PAYMENT REPOSITORY (ep_payment)
// ==============================================================================

import { query, execute } from '../db.js';

export class PaymentRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getProviders(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_payment.tb_ep_payment_provider_provider_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY provider_name ASC;`,
      [this.companyCode]
    );
  }

  async createPaymentIntent(data: {
    orderId: string;
    customerId: string;
    amount: number;
    currency?: string;
    providerId?: string;
    providerCode?: string;
    expiresAt?: Date;
  }): Promise<any> {
    const intentNo = `PI_${Date.now().toString().slice(-8)}`;

    let providerId = data.providerId;
    if (!providerId && data.providerCode) {
      const pRows = await query<{ id: string }>(
        `SELECT id FROM ep_payment.tb_ep_payment_provider_provider_master WHERE company_code = $1 AND UPPER(provider_code) = UPPER($2) LIMIT 1;`,
        [this.companyCode, data.providerCode]
      );
      providerId = pRows[0]?.id;
    }

    if (!providerId) {
      const pRows = await query<{ id: string }>(
        `SELECT id FROM ep_payment.tb_ep_payment_provider_provider_master WHERE company_code = $1 AND active = true LIMIT 1;`,
        [this.companyCode]
      );
      providerId = pRows[0]?.id;
    }

    const rows = await query(
      `INSERT INTO ep_payment.tb_ep_payment_intent_payment_intent_master (
        id, company_code, fiscal_year_code, payment_intent_no, order_id, customer_id, provider_id,
        amount, currency_code, status, expires_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, 'FY8182', $2, $3::uuid, $4::uuid, $5::uuid, $6, $7, 'REQUIRES_PAYMENT_METHOD', $8, true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        intentNo,
        data.orderId,
        data.customerId,
        providerId,
        data.amount,
        data.currency || 'NPR',
        data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
      ]
    );
    return rows[0];
  }

  async recordTransaction(data: {
    intentId: string;
    amount: number;
    currency?: string;
    txnType?: string;
    status?: string;
    providerTxnId?: string;
    providerRawResponse?: any;
  }): Promise<any> {
    const rows = await query(
      `INSERT INTO ep_payment.tb_ep_payment_txn_payment_transaction_txn (
        id, company_code, fiscal_year_code, payment_intent_id, transaction_type,
        status, amount, currency_code, provider_transaction_id, provider_response_json, processed_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, 'FY8182', $2::uuid, $3, $4, $5, $6, $7, $8, clock_timestamp(), true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        data.intentId,
        data.txnType || 'SALE',
        data.status || 'SUCCESS',
        data.amount,
        data.currency || 'NPR',
        data.providerTxnId || `TXN_${Date.now()}`,
        data.providerRawResponse ? JSON.stringify(data.providerRawResponse) : null,
      ]
    );

    if (data.status === 'SUCCESS' || !data.status) {
      await execute(
        `UPDATE ep_payment.tb_ep_payment_intent_payment_intent_master 
         SET status = 'SUCCEEDED', updated_at = clock_timestamp() 
         WHERE id = $1::uuid;`,
        [data.intentId]
      );
    }

    return rows[0];
  }

  async recordWebhookEvent(data: {
    providerCode: string;
    eventType: string;
    externalEventId?: string;
    payload: any;
    signature?: string;
  }): Promise<{ isDuplicate: boolean; event: any }> {
    // 1. Resolve or find provider
    let providerRows = await query<{ id: string }>(
      `SELECT id FROM ep_payment.tb_ep_payment_provider_provider_master 
       WHERE company_code = $1 AND UPPER(provider_code) = UPPER($2) LIMIT 1;`,
      [this.companyCode, data.providerCode]
    );
    let providerId = providerRows[0]?.id;
    if (!providerId) {
      const createdProv = await query<{ id: string }>(
        `INSERT INTO ep_payment.tb_ep_payment_provider_provider_master (
          id, company_code, provider_code, provider_name, provider_type, supports_refund, supports_webhook, active, publish
        ) VALUES (
          gen_random_uuid(), $1, UPPER($2), $2, 'DIGITAL_WALLET', true, true, true, false
        ) RETURNING id;`,
        [this.companyCode, data.providerCode]
      );
      providerId = createdProv[0].id;
    }

    // 2. Check duplicate
    if (data.externalEventId) {
      const existing = await query(
        `SELECT * FROM ep_payment.tb_ep_payment_webhook_payment_webhook_event 
         WHERE company_code = $1 AND provider_id = $2::uuid AND external_event_id = $3 
         LIMIT 1;`,
        [this.companyCode, providerId, data.externalEventId]
      );
      if (existing[0]) {
        return { isDuplicate: true, event: existing[0] };
      }
    }

    const eventId = data.externalEventId || `EVT_${Date.now()}`;
    const rows = await query(
      `INSERT INTO ep_payment.tb_ep_payment_webhook_payment_webhook_event (
        id, company_code, provider_id, external_event_id, event_type, payload_json,
        received_at, processing_status, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3, $4, $5::jsonb, clock_timestamp(), 'RECEIVED', true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        providerId,
        eventId,
        data.eventType,
        JSON.stringify(data.payload),
      ]
    );

    return { isDuplicate: false, event: rows[0] };
  }

  async createRefund(data: {
    orderId: string;
    paymentIntentId: string;
    amount: number;
    reasonCode?: string;
  }): Promise<any> {
    const refundNo = `REF_${Date.now().toString().slice(-8)}`;
    const rows = await query(
      `INSERT INTO ep_payment.tb_ep_payment_refund_refund_master (
        id, company_code, fiscal_year_code, refund_no, order_id, payment_intent_id,
        amount, reason_code, status, requested_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, 'FY8182', $2, $3::uuid, $4::uuid, $5, $6, 'PENDING', clock_timestamp(), true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        refundNo,
        data.orderId,
        data.paymentIntentId,
        data.amount,
        data.reasonCode || 'CUSTOMER_REQUEST',
      ]
    );
    return rows[0];
  }
}
