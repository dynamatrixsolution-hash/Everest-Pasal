import { prisma } from '../src/db.js';

async function main() {
  const tables = [
    'ep_pricing.tb_ep_pricing_coupon_coupon_master',
    'ep_pricing.tb_ep_pricing_price_price_list_master',
    'ep_payment.tb_ep_payment_provider_provider_master',
    'ep_payment.tb_ep_payment_webhook_payment_webhook_event',
    'ep_finance.tb_ep_finance_journal_journal_master',
    'ep_finance.tb_ep_finance_journal_journal_line_detail',
    'ep_logistics.tb_ep_logistics_rider_rider_master',
    'ep_growth.tb_ep_growth_referral_referral_code_master',
    'ep_content.tb_ep_content_menu_menu_master',
    'ep_content.tb_ep_content_menu_menu_item_detail',
    'ep_comms.tb_ep_comms_notify_notification_master',
    'ep_comms.tb_ep_comms_notify_notification_recipient_detail',
    'ep_support.tb_ep_support_ticket_ticket_master',
    'ep_support.tb_ep_support_ticket_ticket_message_detail',
    'ep_integration.tb_ep_integration_outbox_outbox_event_queue',
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
