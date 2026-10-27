// ==============================================================================
// EVEREST PASAL - FINANCE REPOSITORY (ep_finance)
// Implements Double-Entry General Ledger, Balanced Journals & Immutable Postings
// ==============================================================================

import { query, execute } from '../db.js';

export class FinanceRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getLedgerAccounts(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_finance.tb_ep_finance_ledger_account_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY account_code ASC;`,
      [this.companyCode]
    );
  }

  async createBalancedJournal(data: {
    fiscalYearCode: string;
    entryDate?: Date;
    journalType: 'GENERAL' | 'SALES' | 'PURCHASE' | 'PAYMENT' | 'SETTLEMENT' | 'PAYOUT';
    referenceType?: string;
    referenceId?: string;
    description: string;
    createdBy?: string;
    lines: {
      accountId: string;
      entryType: 'DEBIT' | 'CREDIT';
      amount: number;
      currency?: string;
      memo?: string;
      merchantId?: string;
      customerId?: string;
    }[];
  }): Promise<any> {
    const totalDebit = data.lines
      .filter((l) => l.entryType === 'DEBIT')
      .reduce((sum, l) => sum + Number(l.amount), 0);
    const totalCredit = data.lines
      .filter((l) => l.entryType === 'CREDIT')
      .reduce((sum, l) => sum + Number(l.amount), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error(`Unbalanced Journal Entry: Debits (${totalDebit}) do not equal Credits (${totalCredit})`);
    }

    const journalNo = `JRN_${Date.now().toString().slice(-8)}`;

    // 1. Insert journal master
    const journalRows = await query(
      `INSERT INTO ep_finance.tb_ep_finance_journal_journal_master (
        id, company_code, fiscal_year_code, journal_no, journal_type,
        reference_type, reference_id, journal_date, description, status, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6::uuid, $7, $8, 'POSTED', true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        data.fiscalYearCode,
        journalNo,
        data.journalType,
        data.referenceType || null,
        data.referenceId || null,
        data.entryDate || new Date(),
        data.description,
      ]
    );

    const journal = journalRows[0];

    // 2. Insert journal line details
    for (const line of data.lines) {
      await execute(
        `INSERT INTO ep_finance.tb_ep_finance_journal_journal_line_detail (
          id, company_code, fiscal_year_code, journal_id, account_id, merchant_id, customer_id,
          debit_amount, credit_amount, currency_code, memo, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2, $3::uuid, $4::uuid, $5::uuid, $6::uuid,
          $7, $8, $9, $10, true, false
        );`,
        [
          this.companyCode,
          data.fiscalYearCode,
          journal.id,
          line.accountId,
          line.merchantId || null,
          line.customerId || null,
          line.entryType === 'DEBIT' ? line.amount : 0,
          line.entryType === 'CREDIT' ? line.amount : 0,
          line.currency || 'NPR',
          line.memo || data.description,
        ]
      );
    }

    return journal;
  }

  async createMerchantSettlement(data: {
    vendorId: string;
    settlementCycle: string;
    startDate: Date;
    endDate: Date;
    grossSales: number;
    commissionAmount: number;
    shippingFee: number;
    refundDeduction: number;
    netPayout: number;
    currency?: string;
  }): Promise<any> {
    const settlementNumber = `SETTLE_${Date.now().toString().slice(-8)}`;
    const rows = await query(
      `INSERT INTO ep_finance.tb_ep_finance_settlement_merchant_settlement_master (
        id, company_code, settlement_number, vendor_id, settlement_cycle,
        period_start_date, period_end_date, gross_sales_amount, total_commission_amount,
        shipping_fee_amount, refund_deduction_amount, net_payout_amount, currency,
        status, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3::uuid, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING_APPROVAL', true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        settlementNumber,
        data.vendorId,
        data.settlementCycle,
        data.startDate,
        data.endDate,
        data.grossSales,
        data.commissionAmount,
        data.shippingFee,
        data.refundDeduction,
        data.netPayout,
        data.currency || 'NPR',
      ]
    );
    return rows[0];
  }

  async getVendorSettlements(vendorId: string): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_finance.tb_ep_finance_settlement_merchant_settlement_master 
       WHERE company_code = $1 AND vendor_id = $2::uuid AND active = true 
       ORDER BY created_at DESC;`,
      [this.companyCode, vendorId]
    );
  }

  async createMerchantPayout(data: {
    settlementId: string;
    vendorId: string;
    payoutMethod: string;
    bankAccountId?: string;
    amount: number;
    currency?: string;
    initiatedBy: string;
  }): Promise<any> {
    const payoutNumber = `PAY_${Date.now().toString().slice(-8)}`;
    const rows = await query(
      `INSERT INTO ep_finance.tb_ep_finance_payout_merchant_payout_master (
        id, company_code, payout_number, settlement_id, vendor_id, payout_method,
        bank_account_id, amount, currency, status, initiated_by, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3::uuid, $4::uuid, $5, $6::uuid, $7, $8, 'PROCESSING', $9::uuid, true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        payoutNumber,
        data.settlementId,
        data.vendorId,
        data.payoutMethod,
        data.bankAccountId || null,
        data.amount,
        data.currency || 'NPR',
        data.initiatedBy,
      ]
    );
    return rows[0];
  }
}
