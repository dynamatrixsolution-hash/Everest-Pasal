import { prisma } from '../src/db.js';
import * as fs from 'fs';

async function main() {
  const schemas: any = await prisma.$queryRawUnsafe(`
    SELECT DISTINCT table_schema FROM information_schema.tables WHERE table_schema LIKE 'ep_%' ORDER BY table_schema;
  `);

  const result: Record<string, Record<string, string[]>> = {};

  for (const s of schemas) {
    const schemaName = s.table_schema;
    result[schemaName] = {};
    const tables: any = await prisma.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name;`,
      schemaName
    );
    for (const t of tables) {
      const cols: any = await prisma.$queryRawUnsafe(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position;`,
        schemaName, t.table_name
      );
      result[schemaName][t.table_name] = cols.map((c: any) => c.column_name);
    }
  }

  fs.writeFileSync('scripts/schema_summary.json', JSON.stringify(result, null, 2));
  console.log('Saved schema_summary.json with', Object.keys(result).length, 'schemas');
}

main().finally(() => prisma.$disconnect());
