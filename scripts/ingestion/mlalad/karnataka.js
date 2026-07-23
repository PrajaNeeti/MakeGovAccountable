/**
 * Adapter for Karnataka MLA Local Area Development Scheme
 */
function fetchKarnatakaMLALAD() {
  return [
    {
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      constituency: 'Varuna / Malleshwaram',
      mla_name: 'C. N. Ashwath Narayan',
      allocated_amount: 20000000,
      total_expenditure: 18400000,
      unspent_amount: 1600000,
      completed_works_count: 39,
      source_url: 'https://finance.karnataka.gov.in'
    },
    {
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      constituency: 'Shivajinagar',
      mla_name: 'Rizwan Arshad',
      allocated_amount: 20000000,
      total_expenditure: 19100000,
      unspent_amount: 900000,
      completed_works_count: 42,
      source_url: 'https://finance.karnataka.gov.in'
    }
  ];
}

module.exports = { fetchKarnatakaMLALAD };
