import { prisma } from '../src/db.js';

async function main() {
  const schemas: any = await prisma.$queryRaw`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name LIKE 'ep_%' 
    ORDER BY schema_name;
  `;
  console.log('--- 21 SCHEMAS ---');
  schemas.forEach((s: any, idx: number) => console.log(`${idx + 1}. ${s.schema_name}`));

  console.log('\n--- STORED PROCEDURES / FUNCTIONS (pg_proc) ---');
  const procs: any = await prisma.$queryRawUnsafe(`
    SELECT n.nspname as schema_name, p.proname as proc_name, 
           CASE WHEN p.prokind = 'p' THEN 'PROCEDURE' 
                WHEN p.prokind = 'f' THEN 'FUNCTION'
                ELSE 'OTHER' END as kind
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname LIKE 'ep_%' OR n.nspname = 'public'
    ORDER BY n.nspname, p.proname;
  `);
  procs.forEach((r: any) => console.log(`- ${r.schema_name}.${r.proc_name} (${r.kind})`));

  console.log('\n--- ALL 183 TABLES BY SCHEMA ---');
  const tables: any = await prisma.$queryRaw`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema LIKE 'ep_%' AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name;
  `;
  let currentSchema = '';
  tables.forEach((t: any) => {
    if (t.table_schema !== currentSchema) {
      currentSchema = t.table_schema;
      console.log(`\n[Schema: ${currentSchema}]`);
    }
    console.log(`  - ${t.table_name}`);
  });
}

main().finally(() => prisma.$disconnect());
