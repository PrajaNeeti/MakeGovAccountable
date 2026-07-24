const https = require('https');
const http = require('http');

const AOB_INDEX_URL = 'https://cabsec.gov.in/businessrules/allocationofbusinessrules/';
const AOB_SCHEDULE_URL = 'https://cabsec.gov.in/aob_first.php?page=1';

/**
 * Fetches raw HTML content from Cabinet Secretariat site.
 * Falls back gracefully if site is unreachable or returns non-200.
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'PrajaNeeti-DataAcquisition/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, url }));
    }).on('error', (err) => resolve({ statusCode: 500, error: err.message, url }));
  });
}

async function fetchAoBRules() {
  console.log('[AoB-Fetch] Requesting Cabinet Secretariat AoB Rules index...');
  const indexRes = await fetchUrl(AOB_INDEX_URL);
  
  // PLACEHOLDER DATA -- general-knowledge ministry mandate summaries, NOT
  // parsed from the fetched Cabinet Secretariat pages. Broadly accurate at a
  // high level but unverified against the current official AoB Rules text.
  const rawData = [
    {
      department_name: 'Ministry of Home Affairs',
      mandate_summary: 'Internal Security, Police, Border Management, Center-State Relations, Union Territories, Disaster Management & Official Languages.',
      subject_rules: [
        '1. Maintenance of public order and internal security.',
        '2. Union territory administration and Delhi Police oversight.',
        '3. National Disaster Management Authority (NDMA) & National Disaster Response Force (NDRF).',
        '4. Border management, coastal security, and census operations.',
        '5. Department of Official Language and Inter-State Council Secretariat.'
      ],
      source_doc: 'https://cabsec.gov.in/businessrules/allocationofbusinessrules/',
      is_placeholder: true,
      verified: false
    },
    {
      department_name: 'Ministry of Finance - Department of Economic Affairs',
      mandate_summary: 'Macroeconomic Policy, Federal Capital Budgeting, External Assistance, Infrastructure Financing & Capital Markets.',
      subject_rules: [
        '1. Preparation and presentation of Union Budget to Parliament.',
        '2. Management of public debt, currency, coinage, and foreign exchange reserves.',
        '3. Regulation of capital markets (SEBI), stock exchanges, and financial institutions.',
        '4. Bilateral and multilateral economic relations (World Bank, IMF, ADB).',
        '5. National Investment and Infrastructure Fund (NIIF) administration.'
      ],
      source_doc: 'https://cabsec.gov.in/businessrules/allocationofbusinessrules/',
      is_placeholder: true,
      verified: false
    },
    {
      department_name: 'Ministry of Cooperation',
      mandate_summary: 'General Policy on Cooperatives, Incorporation, Regulation, and Winding up of Multi-State Cooperative Societies.',
      subject_rules: [
        '1. Strengthening of cooperative movement and creation of national cooperative database.',
        '2. Implementation of "Sahakar se Samriddhi" vision and ease of doing business for cooperatives.',
        '3. Multi-State Cooperative Societies Act, 2002 administration.',
        '4. Computerisation of Primary Agricultural Credit Societies (PACS).'
      ],
      source_doc: 'https://cabsec.gov.in/businessrules/allocationofbusinessrules/',
      is_placeholder: true,
      verified: false
    },
    {
      department_name: 'Ministry of Road Transport and Highways',
      mandate_summary: 'Development, Maintenance, and Management of National Highways, Road Transport Legislation, and Vehicle Safety Rules.',
      subject_rules: [
        '1. Planning, development, and maintenance of National Highways network.',
        '2. Motor Vehicles Act, 1988 and Central Motor Vehicles Rules enforcement.',
        '3. National Highways Authority of India (NHAI) governance.',
        '4. Road safety initiatives, FASTag electronic toll collection, and green expressways.'
      ],
      source_doc: 'https://cabsec.gov.in/businessrules/allocationofbusinessrules/',
      is_placeholder: true,
      verified: false
    },
    {
      department_name: 'Ministry of Environment, Forest and Climate Change',
      mandate_summary: 'Conservation of Forests, Wildlife & Biodiversity, Climate Change Mitigation, Pollution Control, and EIA Regulation.',
      subject_rules: [
        '1. Forest Conservation Act, 1980 and Wildlife Protection Act, 1972 administration.',
        '2. Central Pollution Control Board (CPCB) and Air/Water Quality standards.',
        '3. Environmental Impact Assessment (EIA) clearances for major infrastructure.',
        '4. International climate change negotiations under UNFCCC and COP commitments.'
      ],
      source_doc: 'https://cabsec.gov.in/businessrules/allocationofbusinessrules/',
      is_placeholder: true,
      verified: false
    }
  ];

  return {
    source_url: AOB_INDEX_URL,
    fetched_at: new Date().toISOString(),
    items: rawData
  };
}

if (require.main === module) {
  fetchAoBRules().then(res => console.log(JSON.stringify(res, null, 2)));
}

module.exports = { fetchAoBRules };
