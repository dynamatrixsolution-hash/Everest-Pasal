import { query } from '../db.js';

async function main() {
  const table = process.argv[2] || 'ep_pricing.tb_ep_pricing_price_price_list_master';
  const [schema, tableName] = table.split('.');
  const cols = await query<any>(
    `SELECT column_name, is_nullable, data_type, column_default 
     FROM information_schema.columns 
     WHERE table_schema = $1 AND table_name = $2
     ORDER BY ordinal_position;`,
    [schema, tableName]
  );
  console.log(`=== COLUMNS FOR ${table} ===`);
  console.table(cols);
  process.exit(0);
}

main().catch(console.error);
