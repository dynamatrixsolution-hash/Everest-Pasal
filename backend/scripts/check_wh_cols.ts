import { prisma } from '../src/db.js';

async function main() {
  const cols: any = await prisma.$queryRawUnsafe(`
    SELECT column_name, is_nullable, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'ep_inventory' AND table_name = 'tb_ep_inventory_wh_warehouse_master'
    ORDER BY ordinal_position;
  `);
  console.log('Warehouse cols:', cols);
}

main().finally(() => prisma.$disconnect());
