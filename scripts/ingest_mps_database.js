const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:t1ovNw0RmeAyou@db.dundcluwxybopaeelemy.supabase.co:5432/postgres';

async function runIngestion() {
  console.log('🚀 Starting MPS Database Ingestion Process...');
  const client = new Client({ connectionString });
  await client.connect();

  try {
    // 1. Apply Migration
    console.log('📦 Applying Schema Migration (20260804000000_mps_dossier_enhancement.sql)...');
    const migrationSql = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '20260804000000_mps_dossier_enhancement.sql'),
      'utf8'
    );
    await client.query(migrationSql);
    console.log('✅ Migration applied successfully.');

    // 2. Read JSON
    const jsonPath = path.join(__dirname, '..', 'mps-database.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`File not found: ${jsonPath}`);
    }

    console.log('📄 Reading mps-database.json...');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const dbData = JSON.parse(rawData);
    const politicians = dbData.politicians || [];

    console.log(`Found ${politicians.length} parliamentarians in dataset.`);

    let insertedCount = 0;
    let updatedCount = 0;
    let totalTimeline = 0;
    let totalAllegations = 0;
    let totalPromises = 0;

    for (let i = 0; i < politicians.length; i++) {
      const p = politicians[i];
      const fullName = (p.name || '').trim();
      const parts = fullName.split(' ');
      const firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0];
      const lastName = parts.length > 1 ? parts[parts.length - 1] : '';

      const bio = `${fullName} is a Member of Parliament representing ${p.constituency || p.state}, ${p.state} in ${p.house} (${p.party}).`;
      const careerTimeline = JSON.stringify(p.career_timeline || []);
      const caseAllegations = JSON.stringify(p.case_allegations || []);
      const promises = JSON.stringify(p.promises || []);

      totalTimeline += (p.career_timeline || []).length;
      totalAllegations += (p.case_allegations || []).length;
      totalPromises += (p.promises || []).length;

      // Upsert into politicians table
      const res = await client.query(`
        INSERT INTO public.politicians (first_name, last_name, bio, house, constituency, state, party, prs_source_url, career_timeline, case_allegations, promises, public)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
        ON CONFLICT DO NOTHING
        RETURNING id;
      `, [firstName, lastName, bio, p.house, p.constituency, p.state, p.party, p.prs_source_url, careerTimeline, caseAllegations, promises]);

      let politicianId;
      if (res.rows.length > 0) {
        politicianId = res.rows[0].id;
        insertedCount++;
      } else {
        // Update existing record
        const updateRes = await client.query(`
          UPDATE public.politicians
          SET bio = $1, house = $2, constituency = $3, state = $4, party = $5, prs_source_url = $6, career_timeline = $7, case_allegations = $8, promises = $9, updated_at = NOW()
          WHERE (first_name = $10 AND last_name = $11) OR (first_name || ' ' || last_name) = $12
          RETURNING id;
        `, [bio, p.house, p.constituency, p.state, p.party, p.prs_source_url, careerTimeline, caseAllegations, promises, firstName, lastName, fullName]);
        
        if (updateRes.rows.length > 0) {
          politicianId = updateRes.rows[0].id;
          updatedCount++;
        }
      }

      if (politicianId) {
        // Count declared affidavit cases
        const declaredCases = (p.case_allegations || []).filter(c => c.type === 'declared_affidavit' && c.status !== 'no_cases_declared').length;

        // Baseline Affidavit record
        await client.query(`
          INSERT INTO public.politician_affidavits 
            (politician_id, election_year, house, state, constituency, party, candidate_name, criminal_cases_count, source_url)
          VALUES ($1, 2024, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING;
        `, [politicianId, p.house || 'Lok Sabha', p.state || 'India', p.constituency || 'Constituency', p.party || 'Independent', fullName, declaredCases, p.prs_source_url]);

        // Baseline Legislative Stats record
        await client.query(`
          INSERT INTO public.mp_legislative_stats
            (politician_id, mp_name, house, state, constituency, source_url)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING;
        `, [politicianId, fullName, p.house || 'Lok Sabha', p.state || 'India', p.constituency || 'Constituency', p.prs_source_url]);
      }

      if ((i + 1) % 100 === 0 || i === politicians.length - 1) {
        console.log(`Processed ${i + 1}/${politicians.length} parliamentarians...`);
      }
    }

    console.log('\n🎉 Ingestion Complete Summary:');
    console.log(`- Total MPs Processed: ${politicians.length}`);
    console.log(`- New Inserted MPs: ${insertedCount}`);
    console.log(`- Updated Existing MPs: ${updatedCount}`);
    console.log(`- Total Career Milestones Ingested: ${totalTimeline}`);
    console.log(`- Total Case Allegations & Disclosures Ingested: ${totalAllegations}`);
    console.log(`- Total Tracked Campaign Promises Ingested: ${totalPromises}`);

  } catch (err) {
    console.error('❌ Error during ingestion:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runIngestion();
