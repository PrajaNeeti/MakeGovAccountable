const { getSupabaseClient } = require('../supabaseClient');
const { fetchIASRoster } = require('./fetch');
const { transformIASRoster } = require('./transform');

async function run() {
  console.log('[IAS-Load] Starting IAS Roster loader...');
  const fetched = await fetchIASRoster();
  const transformed = transformIASRoster(fetched);

  console.log(`[IAS-Load] Prepared ${transformed.length} officer records for loading.`);

  try {
    const supabase = getSupabaseClient();
    for (const officer of transformed) {
      console.log(`[IAS-Load] Loading officer: ${officer.officer_name} (${officer.cadre})`);
      const { error } = await supabase
        .from('ias_officers')
        .upsert(officer, { onConflict: 'officer_name' });

      if (error) {
        console.warn(`[IAS-Load] Upsert notice: ${error.message}. Inserting...`);
        await supabase.from('ias_officers').insert(officer);
      }
    }
    console.log('[IAS-Load] Successfully loaded IAS officers into Supabase!');
  } catch (err) {
    console.error(`[IAS-Load] Error connecting to Supabase: ${err.message}`);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
