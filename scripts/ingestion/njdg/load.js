const { getSupabaseClient } = require('../supabaseClient');
const { fetchNJDGData } = require('./fetch');
const { transformNJDGData } = require('./transform');

async function run() {
  console.log('[NJDG-Load] Starting NJDG Court Pendency loader...');
  const fetched = await fetchNJDGData();
  const transformed = transformNJDGData(fetched);

  console.log(`[NJDG-Load] Prepared ${transformed.length} court records for loading.`);

  try {
    const supabase = getSupabaseClient();
    for (const court of transformed) {
      console.log(`[NJDG-Load] Loading court pendency record for: ${court.court_name}`);
      const { error } = await supabase
        .from('judicial_aggregates')
        .upsert(court, { onConflict: 'court_name' });

      if (error) {
        console.warn(`[NJDG-Load] Upsert notice: ${error.message}. Inserting...`);
        await supabase.from('judicial_aggregates').insert(court);
      }
    }
    console.log('[NJDG-Load] Successfully loaded Judicial NJDG aggregates into Supabase!');
  } catch (err) {
    console.error(`[NJDG-Load] Error connecting to Supabase: ${err.message}`);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
