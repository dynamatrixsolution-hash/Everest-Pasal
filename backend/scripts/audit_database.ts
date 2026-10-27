import { prisma } from '../src/db.js';

async function audit() {
  console.log('=== STARTING EVEREST PASAL BACKEND AUDIT ===');
  
  // 1. Schemas
  const schemas: any = await prisma.$queryRaw`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name LIKE 'ep_%' 
    ORDER BY schema_name;
  `;
  console.log(`Found ${schemas.length} ep_* schemas:`, schemas.map((s: any) => s.schema_name));

  // 2. Tables per schema
  const tablesPerSchema: any = await prisma.$queryRaw`
    SELECT table_schema, count(*)::int as table_count
    FROM information_schema.tables 
    WHERE table_schema LIKE 'ep_%' AND table_type = 'BASE TABLE'
    GROUP BY table_schema
    ORDER BY table_schema;
  `;
  console.log('Tables per schema:', tablesPerSchema);

  const totalTables: any = await prisma.$queryRaw`
    SELECT count(*)::int as total
    FROM information_schema.tables 
    WHERE table_schema LIKE 'ep_%' AND table_type = 'BASE TABLE';
  `;
  console.log(`Total Base Tables across ep_* schemas: ${totalTables[0]?.total}`);

  // 3. Stored Procedures / Functions
  const routines: any = await prisma.$queryRaw`
    SELECT routine_schema, routine_name, routine_type
    FROM information_schema.routines
    WHERE routine_schema LIKE 'ep_%' OR routine_name LIKE 'sp_ep_%' OR routine_name LIKE 'fn_ep_%'
    ORDER BY routine_name;
  `;
  console.log(`Found ${routines.length} Stored Procedures/Functions:`, routines.map((r: any) => `${r.routine_schema}.${r.routine_name} (${r.routine_type})`));

  // 4. Triggers
  const triggers: any = await prisma.$queryRaw`
    SELECT trigger_schema, trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_schema LIKE 'ep_%'
    ORDER BY trigger_schema, trigger_name;
  `;
  console.log(`Found ${triggers.length} Triggers:`, triggers);

  // 5. Check row counts for key tables
  const rowCountSummary = [];
  const allTables: any = await prisma.$queryRaw`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema LIKE 'ep_%' AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name;
  `;

  for (const t of allTables) {
    try {
      const res: any = await prisma.$queryRawUnsafe(`SELECT count(*)::int as count FROM "${t.table_schema}"."${t.table_name}"`);
      rowCountSummary.push({ table: `${t.table_schema}.${t.table_name}`, count: res[0]?.count });
    } catch (e: any) {
      rowCountSummary.push({ table: `${t.table_schema}.${t.table_name}`, error: e.message });
    }
  }

  const populated = rowCountSummary.filter((r) => r.count > 0);
  console.log(`Populated tables (${populated.length}/${allTables.length}):`, populated);

  console.log('=== AUDIT FINISHED SUCCESSFULLY ===');
}

audit()
  .catch((e) => {
    console.error('Audit Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
