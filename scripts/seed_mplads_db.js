const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:t1ovNw0RmeAyou@db.dundcluwxybopaeelemy.supabase.co:5432/postgres';

async function seedMpladsDatabase() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('⚡ Applying MPLADS database migration...');
    const migrationSql = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '20260722200000_add_mplads_tables.sql'),
      'utf8'
    );
    await client.query(migrationSql);
    console.log('✅ Migration applied successfully.');

    // 1. Seed States
    console.log('📊 Seeding State Summaries into Postgres...');
    const statesJsonPath = path.join(__dirname, '..', 'data', 'mplads', 'json', 'summary_states.json');
    if (fs.existsSync(statesJsonPath)) {
      const statesRaw = JSON.parse(fs.readFileSync(statesJsonPath, 'utf8'));
      const statesList = Array.isArray(statesRaw) ? statesRaw : (statesRaw.data || []);

      for (const st of statesList) {
        await client.query(`
          INSERT INTO mplads_states (state, total_allocated, total_expenditure, utilization_percentage, completed_works_count, recommended_works_count)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (state) DO UPDATE SET
            total_allocated = EXCLUDED.total_allocated,
            total_expenditure = EXCLUDED.total_expenditure,
            utilization_percentage = EXCLUDED.utilization_percentage,
            completed_works_count = EXCLUDED.completed_works_count,
            recommended_works_count = EXCLUDED.recommended_works_count;
        `, [
          st.state,
          st.totalAllocated || 0,
          st.totalExpenditure || 0,
          st.utilizationPercentage || 0,
          st.completedWorksCount || st.totalWorksCompleted || 0,
          st.recommendedWorksCount || 0
        ]);
      }
      console.log(`✅ Seeded ${statesList.length} States into Database.`);
    }

    // 2. Seed MPs
    console.log('👤 Seeding MP Directory into Postgres...');
    const mpsJsonPath = path.join(__dirname, '..', 'data', 'mplads', 'json', 'summary_mps.json');
    if (fs.existsSync(mpsJsonPath)) {
      const mpsRaw = JSON.parse(fs.readFileSync(mpsJsonPath, 'utf8'));
      const mpsList = Array.isArray(mpsRaw) ? mpsRaw : (mpsRaw.data || []);

      for (const m of mpsList) {
        await client.query(`
          INSERT INTO mplads_mps (mp_name, house, constituency, state, allocated_amount, total_expenditure, unspent_amount, utilization_percentage, completed_works_count)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          m.mpName || m.name,
          m.house || 'Lok Sabha',
          m.constituency || 'N/A',
          m.state,
          m.allocatedAmount || m.allocated || 0,
          m.totalExpenditure || m.expenditure || 0,
          m.unspentAmount || 0,
          m.utilizationPercentage || 0,
          m.completedWorksCount || m.worksCompleted || 0
        ]);
      }
      console.log(`✅ Seeded ${mpsList.length} Parliamentarians into Database.`);
    }

    // 3. Seed Completed Works
    console.log('🚧 Seeding Ground Public Works into Postgres...');
    const worksJsonPath = path.join(__dirname, '..', 'data', 'mplads', 'json', 'works_completed.json');
    if (fs.existsSync(worksJsonPath)) {
      const worksRaw = JSON.parse(fs.readFileSync(worksJsonPath, 'utf8'));
      const worksList = worksRaw.data?.completedWorks || (Array.isArray(worksRaw) ? worksRaw : []);

      for (const wk of worksList) {
        await client.query(`
          INSERT INTO mplads_completed_works (work_id, work_description, category, cost, location, district, state, mp_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (work_id) DO NOTHING;
        `, [
          wk.work_id,
          wk.work_description,
          wk.category,
          wk.cost || 0,
          wk.location,
          wk.district,
          wk.state,
          wk.mp_details?.name || 'N/A'
        ]);
      }
      console.log(`✅ Seeded ${worksList.length} Ground Public Works into Database.`);
    }

    console.log('🎉 MPLADS Supabase Database seeding complete!');
  } catch (err) {
    console.error('Error seeding DB:', err);
  } finally {
    await client.end();
  }
}

seedMpladsDatabase();
