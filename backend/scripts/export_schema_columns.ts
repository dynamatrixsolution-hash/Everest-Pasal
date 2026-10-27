import { prisma } from '../src/db.js';
import * as fs from 'fs';

async function main() {
  const columns: any = await prisma.$queryRawUnsafe(`
    SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema LIKE 'ep_%'
    ORDER BY table_schema, table_name, ordinal_position;
  `);

  const schemaMap: Record<string, Record<string, any[]>> = {};
  for (const col of columns) {
    if (!schemaMap[col.table_schema]) schemaMap[col.table_schema] = {};
    if (!schemaMap[col.table_schema][col.table_name]) schemaMap[col.table_schema][col.table_name] = [];
    schemaMap[col.table_schema][col.table_name].push({
      column: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === 'YES',
      default: col.column_default
    });
  }

  fs.writeFileSync('backend/scripts/schema_columns.json', JSON.stringify(schemaMap, null, 2));
  console.log('Exported schema_columns.json successfully!');
}

main().finally(() => prisma.$disconnect());
