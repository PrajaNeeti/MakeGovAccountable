const { Client } = require('pg');

const connectionString = 'postgresql://postgres:t1ovNw0RmeAyou@db.dundcluwxybopaeelemy.supabase.co:5432/postgres';

async function deduplicatePoliticians() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('🧹 Deduplicating politicians in Supabase...');

    // Find distinct names and keep the newest ID
    const res = await client.query(`
      SELECT LOWER(TRIM(first_name)) as fname, LOWER(TRIM(last_name)) as lname, ARRAY_AGG(id ORDER BY created_at DESC) as ids
      FROM politicians
      GROUP BY LOWER(TRIM(first_name)), LOWER(TRIM(last_name))
      HAVING COUNT(*) > 1;
    `);

    for (const row of res.rows) {
      const keepId = row.ids[0];
      const deleteIds = row.ids.slice(1);

      console.log(`Re-linking and deleting duplicates for ${row.fname} ${row.lname}: keeping ${keepId}, removing [${deleteIds.join(', ')}]`);

      // Re-link affidavits and stats to keepId
      await client.query(`UPDATE politician_affidavits SET politician_id = $1::uuid WHERE politician_id = ANY($2::uuid[]);`, [keepId, deleteIds]);
      await client.query(`UPDATE mp_legislative_stats SET politician_id = $1::uuid WHERE politician_id = ANY($2::uuid[]);`, [keepId, deleteIds]);

      // Delete duplicate politicians
      await client.query(`DELETE FROM politicians WHERE id = ANY($1::uuid[]);`, [deleteIds]);
    }

    const countRes = await client.query('SELECT count(*) FROM politicians;');
    console.log(`✅ Deduplication complete! Clean politician count: ${countRes.rows[0].count}`);
  } catch (err) {
    console.error('Error deduplicating:', err);
  } finally {
    await client.end();
  }
}

deduplicatePoliticians();
