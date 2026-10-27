import { prisma } from '../src/db.js';

async function main() {
  const procs: any = await prisma.$queryRawUnsafe(`
    SELECT n.nspname as schema_name, p.proname as proc_name, 
           CASE WHEN p.prokind = 'p' THEN 'PROCEDURE' 
                WHEN p.prokind = 'f' THEN 'FUNCTION'
                ELSE 'OTHER' END as kind
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname LIKE 'ep_%' OR (n.nspname = 'public' AND (p.proname LIKE 'sp_%' OR p.proname LIKE 'fn_%' OR p.proname LIKE 'trg_%'))
    ORDER BY n.nspname, p.proname;
  `);
  console.log('--- STORED PROCEDURES / FUNCTIONS ---');
  procs.forEach((r: any) => console.log(`- ${r.schema_name}.${r.proc_name} (${r.kind})`));
}

main().finally(() => prisma.$disconnect());
