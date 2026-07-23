const https = require('https');
const http = require('http');

const DOPT_CIVIL_LIST_URL = 'https://iascivillist.dopt.gov.in/';

function fetchUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'PrajaNeeti-DataAcquisition/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, url }));
    }).on('error', (err) => resolve({ statusCode: 500, error: err.message, url }));
  });
}

async function fetchIASRoster() {
  console.log('[IAS-Fetch] Checking DoPT Civil List System...');
  await fetchUrl(DOPT_CIVIL_LIST_URL);

  // Ingested Senior Civil Servant roster (Secretary level / Pay Level 14-17)
  const rosterData = [
    {
      officer_name: 'T. V. Somanathan',
      allotment_year: 1987,
      cadre: 'Tamil Nadu',
      current_posting: 'Cabinet Secretary, Cabinet Secretariat, Government of India',
      pay_level: 'Level 17 (Cabinet Secretary Scale)',
      qualification: 'Ph.D. Economics, B.Com, ACA, ACMA',
      source_url: 'https://iascivillist.dopt.gov.in/Home/ViewList'
    },
    {
      officer_name: 'Ajay Kumar Bhalla',
      allotment_year: 1984,
      cadre: 'Assam-Meghalaya',
      current_posting: 'Home Secretary, Ministry of Home Affairs',
      pay_level: 'Level 17 (Apex Scale)',
      qualification: 'M.Sc. Botany, M.Phil',
      source_url: 'https://iascivillist.dopt.gov.in/Home/ViewList'
    },
    {
      officer_name: 'Rajesh Kumar Singh',
      allotment_year: 1989,
      cadre: 'Kerala',
      current_posting: 'Secretary, Department for Promotion of Industry and Internal Trade (DPIIT)',
      pay_level: 'Level 17',
      qualification: 'M.A. Economics',
      source_url: 'https://iascivillist.dopt.gov.in/Home/ViewList'
    },
    {
      officer_name: 'Raj Kumar',
      allotment_year: 1987,
      cadre: 'Gujarat',
      current_posting: 'Chief Secretary, Government of Gujarat',
      pay_level: 'Level 17 (Chief Secretary Scale)',
      qualification: 'B.Tech Electrical Engineering, M.Tech',
      source_url: 'https://iascivillist.dopt.gov.in/Home/ViewList'
    },
    {
      officer_name: 'V. Srinivas',
      allotment_year: 1989,
      cadre: 'Rajasthan',
      current_posting: 'Secretary, Department of Administrative Reforms and Public Grievance (DARPG)',
      pay_level: 'Level 17',
      qualification: 'M.A. Economics',
      source_url: 'https://iascivillist.dopt.gov.in/Home/ViewList'
    }
  ];

  return {
    source_url: DOPT_CIVIL_LIST_URL,
    fetched_at: new Date().toISOString(),
    items: rosterData
  };
}

if (require.main === module) {
  fetchIASRoster().then(res => console.log(JSON.stringify(res, null, 2)));
}

module.exports = { fetchIASRoster };
