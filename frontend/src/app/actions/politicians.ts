'use server';

import { createClient } from '@/lib/supabase/server';

export async function getPoliticians() {
  const supabase = await createClient();
  const { data: pols, error } = await supabase.from('politicians').select('*').order('first_name', { ascending: true });
  
  const { data: affidavits } = await supabase.from('politician_affidavits').select('*');
  const { data: stats } = await supabase.from('mp_legislative_stats').select('*');

  const affidavitMap = new Map((affidavits || []).map(a => [a.politician_id, a]));
  const statsMap = new Map((stats || []).map(s => [s.politician_id, s]));

  if (error || !pols || pols.length === 0) {
    try {
      const fs = require('fs');
      const path = require('path');
      const pilotJsonPath = path.join(/*turbopackIgnore: true*/ process.cwd(), '..', 'data', 'mock_db', 'pilot_mps_detailed.json');
      const jsonPath = path.join(/*turbopackIgnore: true*/ process.cwd(), '..', 'data', 'mock_db', 'mp_affidavits_and_stats.json');

      let pilotPols: any[] = [];
      if (fs.existsSync(pilotJsonPath)) {
        const pilotData = JSON.parse(fs.readFileSync(pilotJsonPath, 'utf-8'));
        pilotPols = pilotData.politicians || [];
      }

      if (fs.existsSync(jsonPath)) {
        const fileData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const affidavits = fileData.affidavits || [];
        const legStats = fileData.legStats || [];

        return affidavits.map((aff: any, index: number) => {
          const names = aff.candidate_name.split(' ');
          const st = legStats.find((s: any) => s.mp_name === aff.candidate_name) || {};
          const pilotDetail = pilotPols.find((p: any) => p.name.toLowerCase() === aff.candidate_name.toLowerCase());

          return {
            id: `pol-${index + 1}`,
            first_name: names[0],
            last_name: names.slice(1).join(' '),
            bio: `${aff.candidate_name} - ${aff.party} MP from ${aff.constituency}, ${aff.state}.`,
            house: aff.house,
            state: aff.state,
            constituency: aff.constituency,
            party: aff.party,
            total_assets: aff.total_assets,
            criminal_cases_count: aff.criminal_cases_count,
            attendance_pct: st.attendance_pct ?? null,
            questions_asked: st.questions_asked ?? null,
            verified: aff.verified,
            data_quality: aff.data_quality,
            has_detailed_pilot: !!pilotDetail,
            is_mock: false
          };
        });
      }
    } catch (e) {
      console.error('Failed reading mock JSON:', e);
    }

    // Fallback sample data with rich affidavit and legislative stats
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
        is_mock: true
      },
      {
        id: 'pol-2',
        first_name: 'Rahul',
        last_name: 'Gandhi',
        bio: 'Leader of Opposition in Lok Sabha & MP from Wayanad / Rae Bareli.',
        house: 'Lok Sabha',
        state: 'Kerala',
        constituency: 'Wayanad',
        party: 'INC',
        total_assets: 200000000,
        criminal_cases_count: 18,
        attendance_pct: 68,
        questions_asked: 110,
        is_mock: true
      },
      {
        id: 'pol-3',
        first_name: 'Shashi',
        last_name: 'Tharoor',
        bio: 'MP from Thiruvananthapuram, Kerala (Lok Sabha) & former UN Under-Secretary-General.',
        house: 'Lok Sabha',
        state: 'Kerala',
        constituency: 'Thiruvananthapuram',
        party: 'INC',
        total_assets: 350000000,
        criminal_cases_count: 2,
        attendance_pct: 92,
        questions_asked: 340,
        is_mock: true
      }
    ];
  }

  return pols.map((pol: any) => {
    const aff = affidavitMap.get(pol.id);
    const st = statsMap.get(pol.id);
    return {
      ...pol,
      house: aff?.house || st?.house || 'Lok Sabha',
      state: aff?.state || st?.state || 'India',
      constituency: aff?.constituency || st?.constituency || 'Constituency',
      party: aff?.party || 'Independent',
      total_assets: aff?.total_assets ?? 0,
      criminal_cases_count: aff?.criminal_cases_count ?? 0,
      attendance_pct: st?.attendance_pct ?? 0,
      questions_asked: st?.questions_asked ?? 0,
      is_mock: false
    };
  });
}

export async function getPoliticianDetails(id: string) {
  const supabase = await createClient();
  const timeout = new Promise<{ data: null }>((resolve) =>
    setTimeout(() => resolve({ data: null }), 1500)
  );

  const [polRes, rolesRes, statementsRes, affidavitRes, legStatsRes, timelineRes, casesRes, promisesRes] = await Promise.all([
    Promise.race([supabase.from('politicians').select('*').eq('id', id).single(), timeout]),
    Promise.race([supabase.from('roles').select('*, departments(name), courts(name)').eq('politician_id', id), timeout]),
    Promise.race([supabase.from('statements').select('*').eq('politician_id', id).order('date_made', { ascending: false }), timeout]),
    Promise.race([supabase.from('politician_affidavits').select('*').eq('politician_id', id).maybeSingle(), timeout]),
    Promise.race([supabase.from('mp_legislative_stats').select('*').eq('politician_id', id).maybeSingle(), timeout]),
    Promise.race([supabase.from('politician_career_timeline').select('*').eq('politician_id', id), timeout]),
    Promise.race([supabase.from('politician_case_allegations').select('*').eq('politician_id', id), timeout]),
    Promise.race([supabase.from('politician_public_promises').select('*').eq('politician_id', id), timeout])
  ]);

  let politician = polRes?.data;
  let affidavit = affidavitRes?.data;
  let legislativeStats = legStatsRes?.data;
  let careerTimeline: any[] = timelineRes?.data || [];
  let caseAllegations: any[] = casesRes?.data || [];
  let promises: any[] = promisesRes?.data || [];

  // If detailed data wasn't found by UUID in database, fallback to reading mock JSON or querying by key
  const fs = require('fs');
  const path = require('path');
  const pilotJsonPath = path.join(/*turbopackIgnore: true*/ process.cwd(), '..', 'data', 'mock_db', 'pilot_mps_detailed.json');
  const jsonPath = path.join(/*turbopackIgnore: true*/ process.cwd(), '..', 'data', 'mock_db', 'mp_affidavits_and_stats.json');

  if (careerTimeline.length === 0 || caseAllegations.length === 0 || promises.length === 0) {
    let pilotData: any = null;
    if (fs.existsSync(pilotJsonPath)) {
      try {
        pilotData = JSON.parse(fs.readFileSync(pilotJsonPath, 'utf-8'));
      } catch (e) {
        console.error('Failed reading pilot JSON:', e);
      }
    }

    const fullName = politician ? `${politician.first_name} ${politician.last_name}`.toLowerCase() : id.toLowerCase();
    if (pilotData && pilotData.politicians) {
      const matchedPilot = pilotData.politicians.find((p: any) => {
        const pName = p.name.toLowerCase();
        return fullName.includes(pName) || pName.includes(fullName) ||
               (id === 'pol-1' && pName.includes('modi')) ||
               (id === 'pol-2' && pName.includes('rahul')) ||
               (id === 'pol-3' && pName.includes('shah')) ||
               (id === 'pol-4' && pName.includes('gadkari')) ||
               (id === 'pol-5' && pName.includes('sitharaman'));
      });

      if (matchedPilot) {
        if (careerTimeline.length === 0) careerTimeline = matchedPilot.career_timeline || [];
        if (caseAllegations.length === 0) caseAllegations = matchedPilot.case_allegations || [];
        if (promises.length === 0) promises = matchedPilot.promises || [];

        if (!politician) {
          const names = matchedPilot.name.split(' ');
          politician = {
            id,
            first_name: names[0],
            last_name: names.slice(1).join(' '),
            bio: `${matchedPilot.name} - ${matchedPilot.party} representative (${matchedPilot.house}, ${matchedPilot.constituency || matchedPilot.state}).`,
            is_mock: false
          };
        }
      }
    }
  }

  if (!politician) {
    if (id === 'pol-1' || id.includes('modi')) {
      politician = { id: 'pol-1', first_name: 'Narendra', last_name: 'Modi', bio: 'Prime Minister of India & MP from Varanasi constituency, Uttar Pradesh (Lok Sabha).', is_mock: true };
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
    } else if (id === 'pol-2' || id.includes('gandhi')) {
      politician = { id: 'pol-2', first_name: 'Rahul', last_name: 'Gandhi', bio: 'Leader of Opposition in Lok Sabha & MP from Wayanad / Rae Bareli.', is_mock: true };
      affidavit = {
        candidate_name: 'Rahul Gandhi',
        house: 'Lok Sabha',
        election_year: 2024,
        state: 'Kerala',
        constituency: 'Wayanad',
        party: 'INC',
        winner_flag: true,
        criminal_cases_count: 18,
        criminal_ipc_sections: 'IPC 499/500 (Defamation), IPC 153A (Promoting enmity), Unlawful Assembly',
        education: 'M.Phil (Development Studies, Trinity College Cambridge)',
        total_assets: 200000000,
        total_liabilities: 4900000,
        cash_amount: 55000,
        source_url: 'https://myneta.info/LokSabha2024',
        is_mock: true
      };
      legislativeStats = {
        mp_name: 'Rahul Gandhi',
        house: 'Lok Sabha',
        attendance_pct: 68,
        questions_asked: 110,
        debates_participated: 18,
        private_bills_introduced: 1,
        state: 'Kerala',
        constituency: 'Wayanad',
        is_mock: true
      };
    } else {
      politician = { id: id, first_name: 'Shashi', last_name: 'Tharoor', bio: 'MP from Thiruvananthapuram, Kerala (Lok Sabha) & former UN Under-Secretary-General.', is_mock: true };
      affidavit = {
        candidate_name: 'Shashi Tharoor',
        house: 'Lok Sabha',
        election_year: 2024,
        state: 'Kerala',
        constituency: 'Thiruvananthapuram',
        party: 'INC',
        winner_flag: true,
        criminal_cases_count: 2,
        education: 'Ph.D. (Fletcher School of Law and Diplomacy, Tufts University)',
        total_assets: 350000000,
        total_liabilities: 12000000,
        source_url: 'https://myneta.info/LokSabha2024',
        is_mock: true
      };
      legislativeStats = {
        mp_name: 'Shashi Tharoor',
        house: 'Lok Sabha',
        attendance_pct: 92,
        questions_asked: 340,
        debates_participated: 84,
        private_bills_introduced: 8,
        state: 'Kerala',
        constituency: 'Thiruvananthapuram',
        is_mock: true
      };
    }
  }

  return {
    politician,
    roles: rolesRes.data || [
      { id: 'r1', title: 'Member of Parliament', valid_from: '2024-06-04', departments: { name: 'Lok Sabha' } }
    ],
    statements: statementsRes.data || [],
    affidavit,
    legislativeStats,
    careerTimeline,
    caseAllegations,
    promises
  };
}

