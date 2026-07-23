const { getSupabaseClient } = require('../supabaseClient');
const { fetchMPData } = require('./fetch');
const { transformMPData } = require('./transform');

async function run() {
  console.log('[MP-Load] Starting MP Affidavits & Legislative Stats loader...');
  const fetched = await fetchMPData();
  const { affidavits, legStats } = transformMPData(fetched);

  try {
    const supabase = getSupabaseClient();
    
    // Load Affidavits
    for (const aff of affidavits) {
      console.log(`[MP-Load] Loading affidavit for candidate: ${aff.candidate_name}`);
      const { error } = await supabase
        .from('politician_affidavits')
        .upsert(aff, { onConflict: 'candidate_name' });

      if (error) {
        console.warn(`[MP-Load] Affidavit upsert notice: ${error.message}. Inserting...`);
        await supabase.from('politician_affidavits').insert(aff);
      }
    }

    // Load Legislative Stats
    for (const stat of legStats) {
      console.log(`[MP-Load] Loading legislative stats for MP: ${stat.mp_name}`);
      const { error } = await supabase
        .from('mp_legislative_stats')
        .upsert(stat, { onConflict: 'mp_name' });

      if (error) {
        console.warn(`[MP-Load] LegStats upsert notice: ${error.message}. Inserting...`);
        await supabase.from('mp_legislative_stats').insert(stat);
      }
    }

    console.log('[MP-Load] Successfully loaded MP affidavits and legislative stats into Supabase!');
  } catch (err) {
    console.error(`[MP-Load] Error connecting to Supabase: ${err.message}`);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
