/**
 * Normalizes state MLALAD datasets to `public.mlalad_schemes` table schema.
 */
function transformMLALADData(fetchedData) {
  const { items } = fetchedData;

  return items.map(scheme => ({
    state: scheme.state,
    district: scheme.district,
    constituency: scheme.constituency,
    mla_name: scheme.mla_name,
    allocated_amount: scheme.allocated_amount,
    total_expenditure: scheme.total_expenditure,
    unspent_amount: scheme.unspent_amount,
    completed_works_count: scheme.completed_works_count,
    source_url: scheme.source_url
  }));
}

module.exports = { transformMLALADData };
