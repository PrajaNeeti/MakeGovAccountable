/**
 * Adapter for Uttar Pradesh Vidhayak Nidhi (MLALAD) Scheme
 */
function fetchUPMLALAD() {
  return [
    {
      state: 'Uttar Pradesh',
      district: 'Gorakhpur',
      constituency: 'Gorakhpur Urban',
      mla_name: 'Yogi Adityanath',
      allocated_amount: 50000000,
      total_expenditure: 48200000,
      unspent_amount: 1800000,
      completed_works_count: 92,
      source_url: 'https://up.gov.in/vidhayaknidhi'
    },
    {
      state: 'Uttar Pradesh',
      district: 'Mainpuri',
      constituency: 'Karhal',
      mla_name: 'Akhilesh Yadav',
      allocated_amount: 50000000,
      total_expenditure: 45800000,
      unspent_amount: 4200000,
      completed_works_count: 78,
      source_url: 'https://up.gov.in/vidhayaknidhi'
    }
  ];
}

module.exports = { fetchUPMLALAD };
