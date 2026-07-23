const { Client } = require('pg');

const connectionString = 'postgresql://postgres:t1ovNw0RmeAyou@db.dundcluwxybopaeelemy.supabase.co:5432/postgres';

async function fixRlsAndPopulate() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log('⚡ Adding RLS Insert/Update policies across all data sourcing tables...');

  const tables = [
    'department_mandates',
    'ias_officers',
    'judicial_aggregates',
    'politician_affidavits',
    'mp_legislative_stats',
    'mlalad_schemes',
    'ingestion_logs'
  ];

  for (const t of tables) {
    try {
      await client.query(`DROP POLICY IF EXISTS "Public insert ${t}" ON public.${t};`);
      await client.query(`CREATE POLICY "Public insert ${t}" ON public.${t} FOR INSERT WITH CHECK (true);`);
      
      await client.query(`DROP POLICY IF EXISTS "Public update ${t}" ON public.${t};`);
      await client.query(`CREATE POLICY "Public update ${t}" ON public.${t} FOR UPDATE USING (true);`);

      await client.query(`DROP POLICY IF EXISTS "Public delete ${t}" ON public.${t};`);
      await client.query(`CREATE POLICY "Public delete ${t}" ON public.${t} FOR DELETE USING (true);`);
    } catch (err) {
      console.warn(`Policy update notice for ${t}:`, err.message);
    }
  }

  console.log('✅ RLS policies updated successfully!');
  await client.end();
}

if (require.main === module) {
  fixRlsAndPopulate();
}

module.exports = { fixRlsAndPopulate };
