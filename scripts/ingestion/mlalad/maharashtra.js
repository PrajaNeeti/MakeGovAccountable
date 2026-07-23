/**
 * Adapter for Maharashtra Local Development Programme (MLAD)
 */
function fetchMaharashtraMLALAD() {
  return [
    {
      state: 'Maharashtra',
      district: 'Mumbai City',
      constituency: 'Worli',
      mla_name: 'Aaditya Thackeray',
      allocated_amount: 50000000,
      total_expenditure: 46500000,
      unspent_amount: 3500000,
      completed_works_count: 74,
      source_url: 'https://planning.maharashtra.gov.in'
    },
    {
      state: 'Maharashtra',
      district: 'Nagpur',
      constituency: 'Nagpur South West',
      mla_name: 'Devendra Fadnavis',
      allocated_amount: 50000000,
      total_expenditure: 49100000,
      unspent_amount: 900000,
      completed_works_count: 88,
      source_url: 'https://planning.maharashtra.gov.in'
    }
  ];
}

module.exports = { fetchMaharashtraMLALAD };
