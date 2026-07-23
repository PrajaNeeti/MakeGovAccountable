const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:t1ovNw0RmeAyou@db.dundcluwxybopaeelemy.supabase.co:5432/postgres';

async function applyMigration() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('⚡ Applying Ingestion Logs Migration...');
    const migrationSql = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '20260723120000_ingestion_logs.sql'),
      'utf8'
    );
    await client.query(migrationSql);
    console.log('✅ Ingestion Logs Migration applied successfully.');
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  applyMigration();
}

module.exports = { applyMigration };
