import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Everest Pasal 183-Table Database & Mandatory Rules Verification', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should verify all 21 schemas exist in PostgreSQL', async () => {
    const schemas: Array<{ schema_name: string }> = await prisma.$queryRawUnsafe(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'ep_%'
      ORDER BY schema_name;
    `);

    const expectedSchemas = [
      'ep_audit', 'ep_catalog', 'ep_commerce', 'ep_comms', 'ep_content',
      'ep_customer', 'ep_finance', 'ep_fulfillment', 'ep_geo', 'ep_growth',
      'ep_identity', 'ep_integration', 'ep_inventory', 'ep_kyc', 'ep_logistics',
      'ep_merchant', 'ep_payment', 'ep_pricing', 'ep_returns', 'ep_support', 'ep_system'
    ];

    expect(schemas.length).toBe(21);
    const schemaNames = schemas.map((s) => s.schema_name);
    for (const expected of expectedSchemas) {
      expect(schemaNames).toContain(expected);
    }
  });

  it('should verify exactly 183 physical tables across the 21 schemas', async () => {
    const totalResult: Array<{ total: number }> = await prisma.$queryRawUnsafe(`
      SELECT count(*)::int as total 
      FROM information_schema.tables 
      WHERE table_schema LIKE 'ep_%' AND table_type = 'BASE TABLE';
    `);

    expect(totalResult[0].total).toBe(183);
  });

  it('should verify no legacy tables exist in the public schema', async () => {
    const legacyResult: Array<{ total: number }> = await prisma.$queryRawUnsafe(`
      SELECT count(*)::int as total 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name != '_prisma_migrations';
    `);

    expect(legacyResult[0].total).toBe(0);
  });

  it('should verify Rule 1: Physical DELETE is blocked on business records', async () => {
    const testCode = `TD_${Date.now().toString().slice(-8)}`;
    const [company]: any = await prisma.$queryRawUnsafe(`
      INSERT INTO ep_system.tb_ep_system_company_company_master (
        id, company_code, company_name, country_code, currency_code, timezone, active, publish
      ) VALUES (
        gen_random_uuid(), '${testCode}', 'Delete Test Co', 'NPL', 'NPR', 'Asia/Kathmandu', true, true
      ) RETURNING id;
    `);

    let errorThrown = false;
    try {
      await prisma.$executeRawUnsafe(`
        DELETE FROM ep_system.tb_ep_system_company_company_master WHERE id = '${company.id}';
      `);
    } catch (err: any) {
      errorThrown = true;
      expect(err.message).toContain('PHYSICAL DELETE IS PROHIBITED');
    }

    expect(errorThrown).toBe(true);
  });

  it('should verify Rule 2: active=false automatically forces publish=false', async () => {
    const testCode = `TA_${Date.now().toString().slice(-8)}`;
    const [company]: any = await prisma.$queryRawUnsafe(`
      INSERT INTO ep_system.tb_ep_system_company_company_master (
        id, company_code, company_name, country_code, currency_code, timezone, active, publish
      ) VALUES (
        gen_random_uuid(), '${testCode}', 'Active Test Co', 'NPL', 'NPR', 'Asia/Kathmandu', true, true
      ) RETURNING id, active, publish;
    `);

    expect(company.active).toBe(true);
    expect(company.publish).toBe(true);

    const [updated]: any = await prisma.$queryRawUnsafe(`
      UPDATE ep_system.tb_ep_system_company_company_master 
      SET active = false, publish = true
      WHERE id = '${company.id}'
      RETURNING active, publish, deactivated_at;
    `);

    expect(updated.active).toBe(false);
    expect(updated.publish).toBe(false);
    expect(updated.deactivated_at).not.toBeNull();
  });

  it('should verify Rule 8: Unbalanced financial journal cannot be posted', async () => {
    const testCode = `TF_${Date.now().toString().slice(-8)}`;
    const [journal]: any = await prisma.$queryRawUnsafe(`
      INSERT INTO ep_finance.tb_ep_finance_journal_journal_master (
        id, company_code, fiscal_year_code, journal_no, journal_type, journal_date, status
      ) VALUES (
        gen_random_uuid(), '${testCode}', 'FY2026-27', 'JRNL-${Date.now().toString().slice(-6)}', 'GENERAL', CURRENT_DATE, 'DRAFT'
      ) RETURNING id;
    `);

    const [acct1]: any = await prisma.$queryRawUnsafe(`
      INSERT INTO ep_finance.tb_ep_finance_ledger_account_master (
        id, company_code, account_code, account_name, account_type
      ) VALUES (
        gen_random_uuid(), '${testCode}', '1010_CASH_${Date.now().toString().slice(-6)}', 'Cash', 'ASSET'
      ) RETURNING id;
    `);

    const [acct2]: any = await prisma.$queryRawUnsafe(`
      INSERT INTO ep_finance.tb_ep_finance_ledger_account_master (
        id, company_code, account_code, account_name, account_type
      ) VALUES (
        gen_random_uuid(), '${testCode}', '4010_REV_${Date.now().toString().slice(-6)}', 'Revenue', 'REVENUE'
      ) RETURNING id;
    `);

    // Insert unbalanced entries: Debit 5000, Credit 2000
    await prisma.$executeRawUnsafe(`
      INSERT INTO ep_finance.tb_ep_finance_journal_journal_line_detail (
        id, company_code, fiscal_year_code, journal_id, account_id, debit_amount, credit_amount, currency_code
      ) VALUES 
      (gen_random_uuid(), '${testCode}', 'FY2026-27', '${journal.id}', '${acct1.id}', 5000.0000, 0, 'NPR'),
      (gen_random_uuid(), '${testCode}', 'FY2026-27', '${journal.id}', '${acct2.id}', 0, 2000.0000, 'NPR');
    `);

    let errorThrown = false;
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE ep_finance.tb_ep_finance_journal_journal_master 
        SET status = 'POSTED' 
        WHERE id = '${journal.id}';
      `);
    } catch (err: any) {
      errorThrown = true;
      expect(err.message).toContain('UNBALANCED');
    }

    expect(errorThrown).toBe(true);
  });
});
