/**
 * Adapter for Karnataka MLA Local Area Development Scheme
 *
 * PLACEHOLDER DATA -- see gujarat.js for why real MLA names were removed.
 */
function fetchKarnatakaMLALAD() {
  return [
    {
      state: 'Karnataka',
      district: 'Bengaluru Urban (example)',
      constituency: 'Sample Constituency A',
      mla_name: 'Placeholder MLA A',
      allocated_amount: 20000000,
      total_expenditure: 18400000,
      unspent_amount: 1600000,
      completed_works_count: 39,
      is_placeholder: true,
      verified: false,
      source_url: 'https://finance.karnataka.gov.in'
    },
    {
      state: 'Karnataka',
      district: 'Bengaluru Urban (example)',
      constituency: 'Sample Constituency B',
      mla_name: 'Placeholder MLA B',
      allocated_amount: 20000000,
      total_expenditure: 19100000,
      unspent_amount: 900000,
      completed_works_count: 42,
      is_placeholder: true,
      verified: false,
      source_url: 'https://finance.karnataka.gov.in'
    }
  ];
}

module.exports = { fetchKarnatakaMLALAD };
