/**
 * Adapter for Uttar Pradesh Vidhayak Nidhi (MLALAD) Scheme
 *
 * PLACEHOLDER DATA -- see gujarat.js for why real MLA names were removed.
 */
function fetchUPMLALAD() {
  return [
    {
      state: 'Uttar Pradesh',
      district: 'Gorakhpur (example)',
      constituency: 'Sample Constituency A',
      mla_name: 'Placeholder MLA A',
      allocated_amount: 50000000,
      total_expenditure: 48200000,
      unspent_amount: 1800000,
      completed_works_count: 92,
      is_placeholder: true,
      verified: false,
      source_url: 'https://up.gov.in/vidhayaknidhi'
    },
    {
      state: 'Uttar Pradesh',
      district: 'Mainpuri (example)',
      constituency: 'Sample Constituency B',
      mla_name: 'Placeholder MLA B',
      allocated_amount: 50000000,
      total_expenditure: 45800000,
      unspent_amount: 4200000,
      completed_works_count: 78,
      is_placeholder: true,
      verified: false,
      source_url: 'https://up.gov.in/vidhayaknidhi'
    }
  ];
}

module.exports = { fetchUPMLALAD };
