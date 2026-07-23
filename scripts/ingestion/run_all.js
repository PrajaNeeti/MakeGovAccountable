const { getSupabaseClient } = require('./supabaseClient');
const aob = require('./aob-rules/load');
const ias = require('./ias-roster/load');
const njdg = require('./njdg/load');
const mp = require('./mp-affidavits/load');
const mlalad = require('./mlalad/load');

async function logTelemetry(supabase, domain, status, recordsProcessed, errorMessage, durationMs) {
  try {
    await supabase.from('ingestion_logs').insert({
      domain,
      status,
      records_processed: recordsProcessed,
      error_message: errorMessage || null,
      execution_time_ms: durationMs
    });
  } catch (err) {
    console.error(`[Orchestrator] Telemetry logging failed for ${domain}:`, err.message);
  }
}

async function runDomain(supabase, domainName, loaderFunc) {
  console.log(`\n========================================`);
  console.log(`[Orchestrator] Starting domain: ${domainName}`);
  console.log(`========================================`);
  const startTime = Date.now();

  try {
    await loaderFunc();
    const duration = Date.now() - startTime;
    console.log(`[Orchestrator] Domain ${domainName} completed in ${duration}ms.`);
    await logTelemetry(supabase, domainName, 'success', 0, null, duration);
    return { domain: domainName, status: 'success', durationMs: duration };
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[Orchestrator] Error in domain ${domainName}:`, err.message);
    await logTelemetry(supabase, domainName, 'failed', 0, err.message, duration);
    return { domain: domainName, status: 'failed', error: err.message, durationMs: duration };
  }
}

async function runAllIngestion(targetDomain = 'all') {
  console.log(`[Orchestrator] Starting live data ingestion run (Target: ${targetDomain})...`);
  const supabase = getSupabaseClient();

  const domainMap = {
    'aob-rules': aob.run,
    'ias-roster': ias.run,
    'njdg': njdg.run,
    'mp-affidavits': mp.run,
    'mlalad': mlalad.run
  };

  const results = [];

  if (targetDomain !== 'all' && domainMap[targetDomain]) {
    const result = await runDomain(supabase, targetDomain, domainMap[targetDomain]);
    results.push(result);
  } else {
    for (const [name, fn] of Object.entries(domainMap)) {
      const result = await runDomain(supabase, name, fn);
      results.push(result);
    }
  }

  console.log('\n========================================');
  console.log('[Orchestrator] Live Data Sync Completed!');
  console.log('========================================');
  console.table(results);

  return results;
}

if (require.main === module) {
  const target = process.argv[2] || 'all';
  runAllIngestion(target);
}

module.exports = { runAllIngestion };
