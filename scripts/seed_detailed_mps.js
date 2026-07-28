const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from frontend/.env.local if present
const envPath = path.join(__dirname, '..', 'frontend', '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDetailedMps() {
  console.log('--- Starting Seeding of Detailed MP Records ---');
  
  const pilotJsonPath = path.join(__dirname, '..', 'data', 'mock_db', 'pilot_mps_detailed.json');
  if (!fs.existsSync(pilotJsonPath)) {
    console.error('File not found:', pilotJsonPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(pilotJsonPath, 'utf8');
  const pilotData = JSON.parse(rawData);
  const politicians = pilotData.politicians || [];

  console.log(`Found ${politicians.length} detailed MP profile entries to process.`);

  // 1. Fetch existing politicians from DB to match UUIDs
  const { data: dbPoliticians, error: polErr } = await supabase.from('politicians').select('id, first_name, last_name');
  if (polErr) {
    console.warn('Could not fetch existing politicians from Supabase DB:', polErr.message);
  }

  for (const pol of politicians) {
    const fullName = pol.name.toLowerCase();
    const mpNameKey = pol.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Find matching DB politician ID if available
    let politicianId = null;
    if (dbPoliticians && dbPoliticians.length > 0) {
      const match = dbPoliticians.find(p => `${p.first_name} ${p.last_name}`.toLowerCase() === fullName);
      if (match) politicianId = match.id;
    }

    console.log(`Processing: ${pol.name} (Matched DB UUID: ${politicianId || 'None'})`);

    // A. Seed Career Timeline
    if (pol.career_timeline && pol.career_timeline.length > 0) {
      const timelineRows = pol.career_timeline.map(item => ({
        politician_id: politicianId,
        mp_name_key: mpNameKey,
        period: item.period,
        position: item.position,
        source_name: item.source_name || null,
        source_url: item.source_url || null
      }));

      const { error: tErr } = await supabase.from('politician_career_timeline').insert(timelineRows);
      if (tErr) {
        console.error(`  Error inserting career timeline for ${pol.name}:`, tErr.message);
      } else {
        console.log(`  ✓ Inserted ${timelineRows.length} career timeline entries.`);
      }
    }

    // B. Seed Case Allegations
    if (pol.case_allegations && pol.case_allegations.length > 0) {
      const caseRows = pol.case_allegations.map(item => ({
        politician_id: politicianId,
        mp_name_key: mpNameKey,
        type: item.type,
        description: item.description,
        case_summary: item.case_summary || null,
        status: item.status,
        source_name: item.source_name || null,
        source_url: item.source_url || null,
        event_date: item.date || null
      }));

      const { error: cErr } = await supabase.from('politician_case_allegations').insert(caseRows);
      if (cErr) {
        console.error(`  Error inserting case allegations for ${pol.name}:`, cErr.message);
      } else {
        console.log(`  ✓ Inserted ${caseRows.length} case allegation entries.`);
      }
    }

    // C. Seed Public Promises
    if (pol.promises && pol.promises.length > 0) {
      const promiseRows = pol.promises.map(item => ({
        politician_id: politicianId,
        mp_name_key: mpNameKey,
        promise_text: item.promise_text,
        context: item.context || null,
        public_belief_vs_fact: item.public_belief_vs_fact || null,
        source_name: item.source_name || null,
        source_url: item.source_url || null,
        pledge_date: item.date || null
      }));

      const { error: pErr } = await supabase.from('politician_public_promises').insert(promiseRows);
      if (pErr) {
        console.error(`  Error inserting public promises for ${pol.name}:`, pErr.message);
      } else {
        console.log(`  ✓ Inserted ${promiseRows.length} public promise entries.`);
      }
    }
  }

  console.log('--- Seeding Completed ---');
}

seedDetailedMps().catch(err => {
  console.error('Unhandled seed error:', err);
  process.exit(1);
});
