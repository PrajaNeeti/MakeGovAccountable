'use server';

import { createClient } from '@/lib/supabase/server';

export async function getJudicialAggregates() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('judicial_aggregates').select('*').order('pending_cases', { ascending: false });

  if (error || !data || data.length === 0) {
    return [
      {
        id: 'j1',
        state: 'National Total (High Courts)',
        court_name: 'High Courts of India Aggregate',
        pending_cases: 6184000,
        disposed_cases: 3120000,
        civil_pending: 4450000,
        criminal_pending: 1734000,
        cases_over_10yrs: 1240000,
        period_year: 2024,
        source_url: 'https://njdg.ecourts.gov.in',
        is_mock: true
      },
      {
        id: 'j2',
        state: 'Gujarat',
        court_name: 'Gujarat High Court',
        pending_cases: 164000,
        disposed_cases: 92000,
        civil_pending: 110000,
        criminal_pending: 54000,
        cases_over_10yrs: 31000,
        period_year: 2024,
        source_url: 'https://njdg.ecourts.gov.in',
        is_mock: true
      },
      {
        id: 'j3',
        state: 'Uttar Pradesh',
        court_name: 'Allahabad High Court',
        pending_cases: 1050000,
        disposed_cases: 410000,
        civil_pending: 680000,
        criminal_pending: 370000,
        cases_over_10yrs: 340000,
        period_year: 2024,
        source_url: 'https://njdg.ecourts.gov.in',
        is_mock: true
      },
      {
        id: 'j4',
        state: 'Maharashtra',
        court_name: 'Bombay High Court',
        pending_cases: 715000,
        disposed_cases: 320000,
        civil_pending: 530000,
        criminal_pending: 185000,
        cases_over_10yrs: 142000,
        period_year: 2024,
        source_url: 'https://njdg.ecourts.gov.in',
        is_mock: true
      }
    ];
  }
  return data;
}
