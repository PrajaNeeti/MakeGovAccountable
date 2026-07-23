const { getSupabaseClient } = require('../supabaseClient');
const { fetchAoBRules } = require('./fetch');
const { transformAoBRules } = require('./transform');

async function run() {
  console.log('[AoB-Load] Starting Allocation of Business Rules loader...');
  const fetched = await fetchAoBRules();
  const transformed = transformAoBRules(fetched);

  console.log(`[AoB-Load] Prepared ${transformed.length} records for loading.`);

  try {
    const supabase = getSupabaseClient();
    for (const record of transformed) {
      console.log(`[AoB-Load] Loading mandate for: ${record.department_name}`);
      const { error } = await supabase
        .from('department_mandates')
        .upsert(record, { onConflict: 'department_name' });

      if (error) {
        console.warn(`[AoB-Load] Upsert notice: ${error.message}. Performing insert...`);
        await supabase.from('department_mandates').insert(record);
      }
    }
    console.log('[AoB-Load] Successfully loaded Allocation of Business rules into Supabase!');
  } catch (err) {
    console.error(`[AoB-Load] Error connecting to Supabase: ${err.message}`);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
