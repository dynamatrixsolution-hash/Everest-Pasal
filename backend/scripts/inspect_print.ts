import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/schema_columns.json', 'utf8'));
const cols = data['ep_kyc']['tb_ep_kyc_document_document_master'];
console.log('Columns for tb_ep_kyc_document_document_master:');
for (const c of cols) {
  console.log(`  ${c.column} | ${c.type} | nullable: ${c.nullable} | default: ${c.default}`);
}
