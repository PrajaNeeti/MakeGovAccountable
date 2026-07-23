/**
 * Transforms raw NJDG pendency records for `public.judicial_aggregates`.
 */
function transformNJDGData(fetchedData) {
  const { source_url, fetched_at, items } = fetchedData;

  return items.map((record) => ({
    state: record.state,
    court_name: record.court_name,
    pending_cases: record.pending_cases,
    disposed_cases: record.disposed_cases,
    civil_pending: record.civil_pending,
    criminal_pending: record.criminal_pending,
    cases_over_10yrs: record.cases_over_10yrs,
    period_year: record.period_year || 2024,
    source_url: record.source_url || source_url
  }));
}

module.exports = { transformNJDGData };
