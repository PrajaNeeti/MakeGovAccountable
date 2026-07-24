/**
 * Adapter for Gujarat MLALAD Portal Data
 *
 * PLACEHOLDER DATA -- the figures below are illustrative only and were NOT
 * verified against gujarat.gov.in or any official MLALAD disbursement
 * record. Earlier versions of this file attributed specific fund-utilization
 * numbers to real sitting MLAs (including the Chief Minister) without a
 * verifiable source, which is unsafe for a public accountability platform.
 * Names have been replaced with non-identifying placeholders until a real
 * scraper against the state portal is implemented.
 */
function fetchGujaratMLALAD() {
  return [
    {
      state: 'Gujarat',
      district: 'Ahmedabad (example)',
      constituency: 'Sample Constituency A',
      mla_name: 'Placeholder MLA A',
      allocated_amount: 15000000,
      total_expenditure: 13800000,
      unspent_amount: 1200000,
      completed_works_count: 48,
      is_placeholder: true,
      verified: false,
      source_url: 'https://gujarat.gov.in/mlalad'
    },
    {
      state: 'Gujarat',
      district: 'Rajkot (example)',
      constituency: 'Sample Constituency B',
      mla_name: 'Placeholder MLA B',
      allocated_amount: 15000000,
      total_expenditure: 14200000,
      unspent_amount: 800000,
      completed_works_count: 52,
      is_placeholder: true,
      verified: false,
      source_url: 'https://gujarat.gov.in/mlalad'
    },
    {
      state: 'Gujarat',
      district: 'Surat (example)',
      constituency: 'Sample Constituency C',
      mla_name: 'Placeholder MLA C',
      allocated_amount: 15000000,
      total_expenditure: 14900000,
      unspent_amount: 100000,
      completed_works_count: 61,
      is_placeholder: true,
      verified: false,
      source_url: 'https://gujarat.gov.in/mlalad'
    }
  ];
}

module.exports = { fetchGujaratMLALAD };
