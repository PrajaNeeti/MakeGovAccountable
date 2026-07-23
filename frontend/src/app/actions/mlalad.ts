'use server';

import { createClient } from '@/lib/supabase/server';

export async function getMLALADSchemes() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('mlalad_schemes').select('*').order('allocated_amount', { ascending: false });

  if (error || !data || data.length === 0) {
    return [
      {
        id: 'm1',
        state: 'Gujarat',
        district: 'Ahmedabad',
        constituency: 'Ghatlodia',
        mla_name: 'Bhupendra Patel',
        allocated_amount: 15000000,
        total_expenditure: 13800000,
        unspent_amount: 1200000,
        completed_works_count: 48,
        source_url: 'https://gujarat.gov.in',
        is_mock: true
      },
      {
        id: 'm2',
        state: 'Gujarat',
        district: 'Rajkot',
        constituency: 'Rajkot West',
        mla_name: 'Darshita Shah',
        allocated_amount: 15000000,
        total_expenditure: 14200000,
        unspent_amount: 800000,
        completed_works_count: 52,
        source_url: 'https://gujarat.gov.in',
        is_mock: true
      },
      {
        id: 'm3',
        state: 'Gujarat',
        district: 'Surat',
        constituency: 'Majura',
        mla_name: 'Harsh Sanghavi',
        allocated_amount: 15000000,
        total_expenditure: 14900000,
        unspent_amount: 100000,
        completed_works_count: 61,
        source_url: 'https://gujarat.gov.in',
        is_mock: true
      }
    ];
  }
  return data.map((item: any) => ({ ...item, is_mock: false }));
}
