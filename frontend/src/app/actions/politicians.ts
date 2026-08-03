'use server';

import { createClient } from '@/lib/supabase/server';

export async function getPoliticians() {
  const supabase = await createClient();
  const { data: pols, error } = await supabase
    .from('politicians')
    .select('*')
    .order('first_name', { ascending: true });

  const { data: affidavits } = await supabase.from('politician_affidavits').select('*');
  const { data: stats } = await supabase.from('mp_legislative_stats').select('*');

  const affidavitMap = new Map((affidavits || []).map(a => [a.politician_id, a]));
  const statsMap = new Map((stats || []).map(s => [s.politician_id, s]));

  if (error || !pols || pols.length === 0) {
    // Fallback sample data if DB is empty
    return [
      {
        id: 'pol-1',
        first_name: 'Narendra',
        last_name: 'Modi',
        bio: 'Prime Minister of India & MP from Varanasi constituency, Uttar Pradesh (Lok Sabha).',
        house: 'Lok Sabha',
        state: 'Uttar Pradesh',
        constituency: 'Varanasi',
        party: 'BJP',
        total_assets: 30200000,
        criminal_cases_count: 0,
        attendance_pct: 88,
        questions_asked: 0,
        career_timeline: [],
        case_allegations: [],
        promises: [],
        is_mock: true
      },
      {
        id: 'pol-2',
        first_name: 'Rahul',
        last_name: 'Gandhi',
        bio: 'Leader of Opposition in Lok Sabha & MP from Rae Bareli, Uttar Pradesh.',
        house: 'Lok Sabha',
        state: 'Uttar Pradesh',
        constituency: 'Rae Bareli',
        party: 'INC',
        total_assets: 200000000,
        criminal_cases_count: 18,
        attendance_pct: 68,
        questions_asked: 110,
        career_timeline: [],
        case_allegations: [],
        promises: [],
        is_mock: true
      }
    ];
  }

  return pols.map((pol: any) => {
    const aff = affidavitMap.get(pol.id);
    const st = statsMap.get(pol.id);
    
    // Parse JSON fields safely if stringified
    const career_timeline = typeof pol.career_timeline === 'string' ? JSON.parse(pol.career_timeline) : (pol.career_timeline || []);
    const case_allegations = typeof pol.case_allegations === 'string' ? JSON.parse(pol.case_allegations) : (pol.case_allegations || []);
    const promises = typeof pol.promises === 'string' ? JSON.parse(pol.promises) : (pol.promises || []);

    const declaredCases = case_allegations.filter((c: any) => c.type === 'declared_affidavit' && c.status !== 'no_cases_declared').length;

    return {
      ...pol,
      house: pol.house || aff?.house || st?.house || 'Lok Sabha',
      state: pol.state || aff?.state || st?.state || 'India',
      constituency: pol.constituency || aff?.constituency || st?.constituency || 'Constituency',
      party: pol.party || aff?.party || 'Independent',
      prs_source_url: pol.prs_source_url || aff?.source_url || st?.source_url,
      total_assets: aff?.total_assets ?? 0,
      criminal_cases_count: declaredCases || aff?.criminal_cases_count || 0,
      attendance_pct: st?.attendance_pct ?? 0,
      questions_asked: st?.questions_asked ?? 0,
      career_timeline,
      case_allegations,
      promises,
      is_mock: false
    };
  });
}

export async function getPoliticianDetails(id: string) {
  const supabase = await createClient();
  const [polRes, rolesRes, statementsRes, affidavitRes, legStatsRes] = await Promise.all([
    supabase.from('politicians').select('*').eq('id', id).single(),
    supabase.from('roles').select('*, departments(name), courts(name)').eq('politician_id', id),
    supabase.from('statements').select('*').eq('politician_id', id).order('date_made', { ascending: false }),
    supabase.from('politician_affidavits').select('*').eq('politician_id', id).maybeSingle(),
    supabase.from('mp_legislative_stats').select('*').eq('politician_id', id).maybeSingle()
  ]);

  let politician = polRes.data;
  let affidavit = affidavitRes.data;
  let legislativeStats = legStatsRes.data;

  if (politician) {
    // Parse JSON fields cleanly
    politician.career_timeline = typeof politician.career_timeline === 'string' ? JSON.parse(politician.career_timeline) : (politician.career_timeline || []);
    politician.case_allegations = typeof politician.case_allegations === 'string' ? JSON.parse(politician.case_allegations) : (politician.case_allegations || []);
    politician.promises = typeof politician.promises === 'string' ? JSON.parse(politician.promises) : (politician.promises || []);
  }

  // Rich fallback matching if record is not in Supabase yet (clearly marked as mock)
  if (!politician) {
    if (id === 'pol-1' || id.includes('modi')) {
      politician = {
        id: 'pol-1',
        first_name: 'Narendra',
        last_name: 'Modi',
        bio: 'Prime Minister of India & MP from Varanasi constituency, Uttar Pradesh (Lok Sabha).',
        house: 'Lok Sabha',
        state: 'Uttar Pradesh',
        constituency: 'Varanasi',
        party: 'BJP',
        career_timeline: [],
        case_allegations: [],
        promises: [],
        is_mock: true
      };
      affidavit = {
        candidate_name: 'Narendra Modi',
        house: 'Lok Sabha',
        election_year: 2024,
        state: 'Uttar Pradesh',
        constituency: 'Varanasi',
        party: 'BJP',
        winner_flag: true,
        criminal_cases_count: 0,
        education: 'Post Graduate (M.A. Political Science)',
        total_assets: 30200000,
        total_liabilities: 0,
        cash_amount: 52920,
        source_url: 'https://myneta.info/LokSabha2024',
        is_mock: true
      };
      legislativeStats = {
        mp_name: 'Narendra Modi',
        house: 'Lok Sabha',
        attendance_pct: 88,
        questions_asked: 0,
        debates_participated: 45,
        private_bills_introduced: 0,
        state: 'Uttar Pradesh',
        constituency: 'Varanasi',
        is_mock: true
      };
    } else {
      politician = {
        id: id,
        first_name: 'Representative',
        last_name: 'MP',
        bio: 'Member of Parliament in the Parliament of India.',
        house: 'Lok Sabha',
        state: 'India',
        constituency: 'Constituency',
        party: 'Independent',
        career_timeline: [],
        case_allegations: [],
        promises: [],
        is_mock: true
      };
    }
  }

  return {
    politician,
    roles: rolesRes.data || [
      { id: 'r1', title: 'Member of Parliament', valid_from: '2024-06-04', departments: { name: politician?.house || 'Lok Sabha' } }
    ],
    statements: statementsRes.data || [],
    affidavit,
    legislativeStats
  };
}
