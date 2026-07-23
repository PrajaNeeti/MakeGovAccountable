/**
 * Transforms raw IAS roster data into database-ready schema for `public.ias_officers`.
 */
function transformIASRoster(fetchedData) {
  const { source_url, fetched_at, items } = fetchedData;

  return items.map((officer) => ({
    officer_name: officer.officer_name,
    allotment_year: officer.allotment_year,
    cadre: officer.cadre,
    current_posting: officer.current_posting,
    pay_level: officer.pay_level,
    qualification: officer.qualification,
    source_url: officer.source_url || source_url
  }));
}

module.exports = { transformIASRoster };
