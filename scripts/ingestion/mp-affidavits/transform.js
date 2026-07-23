/**
 * Transforms raw MP affidavit & PRS legislative stats into database-ready schema.
 */
function transformMPData(fetchedData) {
  const { affidavits, legStats } = fetchedData;

  const transformedAffidavits = affidavits.map(a => ({
    candidate_name: a.candidate_name,
    house: a.house,
    election_year: a.election_year,
    state: a.state,
    constituency: a.constituency,
    party: a.party,
    winner_flag: a.winner_flag,
    criminal_cases_count: a.criminal_cases_count,
    criminal_ipc_sections: a.criminal_ipc_sections,
    education: a.education,
    total_assets: a.total_assets,
    total_liabilities: a.total_liabilities,
    movable_assets: a.movable_assets,
    immovable_assets: a.immovable_assets,
    cash_amount: a.cash_amount,
    jewellery_value: a.jewellery_value,
    source_url: a.source_url
  }));

  const transformedLegStats = legStats.map(s => ({
    mp_name: s.mp_name,
    house: s.house,
    attendance_pct: s.attendance_pct,
    questions_asked: s.questions_asked,
    debates_participated: s.debates_participated,
    private_bills_introduced: s.private_bills_introduced,
    state: s.state,
    constituency: s.constituency,
    source_url: s.source_url
  }));

  return { affidavits: transformedAffidavits, legStats: transformedLegStats };
}

module.exports = { transformMPData };
