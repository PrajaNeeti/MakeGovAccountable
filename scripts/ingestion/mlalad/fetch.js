const { fetchGujaratMLALAD } = require('./gujarat');
const { fetchMaharashtraMLALAD } = require('./maharashtra');
const { fetchKarnatakaMLALAD } = require('./karnataka');
const { fetchUPMLALAD } = require('./up');

async function fetchAllMLALADData() {
  console.log('[MLALAD-Fetch] Aggregating state MLALAD scheme data across state adapters...');

  const items = [
    ...fetchGujaratMLALAD(),
    ...fetchMaharashtraMLALAD(),
    ...fetchKarnatakaMLALAD(),
    ...fetchUPMLALAD()
  ];

  return {
    fetched_at: new Date().toISOString(),
    items
  };
}

if (require.main === module) {
  fetchAllMLALADData().then(res => console.log(JSON.stringify(res, null, 2)));
}

module.exports = { fetchAllMLALADData };
