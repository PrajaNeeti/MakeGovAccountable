const { getSupabaseClient } = require('../supabaseClient');
const { fetchAllMLALADData } = require('./fetch');
const { transformMLALADData } = require('./transform');

async function run() {
  console.log('[MLALAD-Load] Starting State MLALAD loader...');
  const fetched = await fetchAllMLALADData();
  const transformed = transformMLALADData(fetched);

  console.log(`[MLALAD-Load] Prepared ${transformed.length} state MLALAD records for loading.`);

  try {
    const supabase = getSupabaseClient();
    for (const scheme of transformed) {
      console.log(`[MLALAD-Load] Loading scheme for MLA ${scheme.mla_name} (${scheme.state} - ${scheme.constituency})`);
      const { error } = await supabase
        .from('mlalad_schemes')
        .upsert(scheme, { onConflict: 'mla_name' });

      if (error) {
        console.warn(`[MLALAD-Load] Upsert notice: ${error.message}. Inserting...`);
        await supabase.from('mlalad_schemes').insert(scheme);
      }
    }
    console.log('[MLALAD-Load] Successfully loaded State MLALAD schemes into Supabase!');
  } catch (err) {
    console.error(`[MLALAD-Load] Error connecting to Supabase: ${err.message}`);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
