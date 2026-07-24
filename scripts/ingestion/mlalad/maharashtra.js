/**
 * Adapter for Maharashtra Local Development Programme (MLAD)
 *
 * PLACEHOLDER DATA -- see gujarat.js for why real MLA names were removed.
 */
function fetchMaharashtraMLALAD() {
  return [
    {
      state: 'Maharashtra',
      district: 'Mumbai City (example)',
      constituency: 'Sample Constituency A',
      mla_name: 'Placeholder MLA A',
      allocated_amount: 50000000,
      total_expenditure: 46500000,
      unspent_amount: 3500000,
      completed_works_count: 74,
      is_placeholder: true,
      verified: false,
      source_url: 'https://planning.maharashtra.gov.in'
    },
    {
      state: 'Maharashtra',
      district: 'Nagpur (example)',
      constituency: 'Sample Constituency B',
      mla_name: 'Placeholder MLA B',
      allocated_amount: 50000000,
      total_expenditure: 49100000,
      unspent_amount: 900000,
      completed_works_count: 88,
      is_placeholder: true,
      verified: false,
      source_url: 'https://planning.maharashtra.gov.in'
    }
  ];
}

module.exports = { fetchMaharashtraMLALAD };
