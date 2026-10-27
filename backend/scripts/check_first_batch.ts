import { prisma } from '../src/db.js';

async function main() {
  const tables = [
    'ep_pricing.tb_ep_pricing_coupon_coupon_master',
    'ep_pricing.tb_ep_pricing_price_price_list_master',
    'ep_payment.tb_ep_payment_provider_provider_master',
    'ep_payment.tb_ep_payment_webhook_payment_webhook_event',
    'ep_finance.tb_ep_finance_journal_journal_master',
  ];

  for (const t of tables) {
    const [schema, tbl] = t.split('.');
    const cols: any = await prisma.$queryRawUnsafe(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_schema = '${schema}' AND table_name = '${tbl}'
      ORDER BY ordinal_position;
    `);
    console.log(`\n=== Table: ${t} ===`);
    console.log(cols.map((c: any) => `${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`).join(', '));
  }
}

main().finally(() => prisma.$disconnect());
