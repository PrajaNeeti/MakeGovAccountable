/**
 * Transforms raw AoB fetched rules into database-ready schema for `public.department_mandates`.
 */
function transformAoBRules(fetchedData) {
  const { source_url, fetched_at, items } = fetchedData;

  return items.map((item) => ({
    department_name: item.department_name,
    mandate_summary: item.mandate_summary,
    subject_rules: Array.isArray(item.subject_rules) ? item.subject_rules.join('\n') : item.subject_rules,
    source_doc: item.source_doc || source_url,
    amendment_date: new Date().toISOString().split('T')[0]
  }));
}

module.exports = { transformAoBRules };
