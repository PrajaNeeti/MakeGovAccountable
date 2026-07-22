'use server';

import { createClient } from '@/lib/supabase/server';

export async function getPoliticians() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('politicians').select('*').order('first_name', { ascending: true });
  
  if (error) {
    console.error('Error fetching politicians:', error);
    return [];
  }
  return data;
}

export async function getPoliticianDetails(id: string) {
  const supabase = await createClient();
  const [polRes, rolesRes, statementsRes] = await Promise.all([
    supabase.from('politicians').select('*').eq('id', id).single(),
    supabase.from('roles').select('*, departments(name), courts(name)').eq('politician_id', id),
    supabase.from('statements').select('*').eq('politician_id', id).order('date_made', { ascending: false })
  ]);

  return {
    politician: polRes.data,
    roles: rolesRes.data || [],
    statements: statementsRes.data || []
  };
}
