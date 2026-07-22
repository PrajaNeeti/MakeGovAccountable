const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://esakshi.mospi.gov.in/api';
const OUT_DIR = path.join(__dirname, '..', 'data', 'mplads');

// List of official MoSPI / e-SAKSHI public endpoints
const ENDPOINTS = [
  { name: 'summary_overview', url: `${BASE_URL}/mplads/summary/overview` },
  { name: 'summary_states', url: `${BASE_URL}/mplads/summary/states` },
  { name: 'summary_mps', url: `${BASE_URL}/mplads/summary/mps` },
  { name: 'mplads_sectors', url: `${BASE_URL}/mplads/sectors` },
  { name: 'mplads_terms', url: `${BASE_URL}/mplads/terms` },
  { name: 'mplads_trends', url: `${BASE_URL}/mplads/trends` },
  { name: 'works_completed', url: `${BASE_URL}/mplads/works/completed` },
  { name: 'works_categories', url: `${BASE_URL}/mplads/works/categories` },
  { name: 'expenditures_categories', url: `${BASE_URL}/mplads/expenditures/categories` },
  { name: 'analytics_trends', url: `${BASE_URL}/mplads/analytics/trends` },
  { name: 'analytics_top_performers', url: `${BASE_URL}/mplads/analytics/top-performers` },
  { name: 'analytics_performance_distribution', url: `${BASE_URL}/mplads/analytics/performance-distribution` },
];

function ensureDirs() {
  const jsonDir = path.join(OUT_DIR, 'json');
  const csvDir = path.join(OUT_DIR, 'csv');
  const publicMpladsJson = path.join(__dirname, '..', 'frontend', 'public', 'data', 'mplads', 'json');
  const publicMpladsCsv = path.join(__dirname, '..', 'frontend', 'public', 'data', 'mplads', 'csv');

  [OUT_DIR, jsonDir, csvDir, publicMpladsJson, publicMpladsCsv].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => reject(err));
  });
}

function jsonToCsv(items) {
  if (!Array.isArray(items) || items.length === 0) return '';
  
  const headers = Object.keys(items[0]).filter(k => typeof items[0][k] !== 'object');
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const item of items) {
    const values = headers.map(header => {
      let val = item[header] ?? '';
      if (typeof val === 'string') {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

async function run() {
  ensureDirs();
  console.log('Starting MPLADS data fetch from MoSPI / e-SAKSHI Portal...');

  const manifest = {
    fetched_at: new Date().toISOString(),
    endpoints: []
  };

  for (const ep of ENDPOINTS) {
    try {
      console.log(`Fetching [${ep.name}] from ${ep.url}...`);
      const res = await fetchJson(ep.url);

      const jsonPath = path.join(OUT_DIR, 'json', `${ep.name}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(res, null, 2), 'utf8');

      // Copy to public directory for frontend static download
      const publicJsonPath = path.join(__dirname, '..', 'frontend', 'public', 'data', 'mplads', 'json', `${ep.name}.json`);
      fs.writeFileSync(publicJsonPath, JSON.stringify(res, null, 2), 'utf8');

      // Extract array for CSV conversion if applicable
      let arrayData = null;
      if (Array.isArray(res)) arrayData = res;
      else if (res.data && Array.isArray(res.data)) arrayData = res.data;
      else if (res.data?.completedWorks && Array.isArray(res.data.completedWorks)) arrayData = res.data.completedWorks;

      if (arrayData) {
        const csvContent = jsonToCsv(arrayData);
        if (csvContent) {
          const csvPath = path.join(OUT_DIR, 'csv', `${ep.name}.csv`);
          fs.writeFileSync(csvPath, csvContent, 'utf8');

          const publicCsvPath = path.join(__dirname, '..', 'frontend', 'public', 'data', 'mplads', 'csv', `${ep.name}.csv`);
          fs.writeFileSync(publicCsvPath, csvContent, 'utf8');
        }
      }

      manifest.endpoints.push({ name: ep.name, status: 'success', records: arrayData ? arrayData.length : 1 });
      console.log(` Saved [${ep.name}] -> .json & .csv`);
    } catch (err) {
      console.error(`❌ Failed to fetch [${ep.name}]: ${err.message}`);
      manifest.endpoints.push({ name: ep.name, status: 'failed', error: err.message });
    }
  }

  const manifestPath = path.join(OUT_DIR, 'metadata.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\nData fetch completed. Manifest written to data/mplads/metadata.json');
}

run();
