'use server';

import { createClient } from '@/lib/supabase/server';

export type FeedFilter = {
  branch?: string;
  department?: string;
  politician?: string;
  keyword?: string;
};

export async function getUnifiedFeed(page: number, limit: number, filters?: FeedFilter) {
  const supabase = createClient();
  const offset = (page - 1) * limit;

  // We fetch from both tables and combine them since Supabase doesn't support UNION natively in the JS client
  // Another approach is to create a SQL view for unified feed, but here we'll combine in TS.

  let activitiesQuery = supabase.from('activities').select('*').order('date', { ascending: false }).range(offset, offset + limit - 1);
  let spendingQuery = supabase.from('spending').select('*').order('date', { ascending: false }).range(offset, offset + limit - 1);

  if (filters?.keyword) {
    const pattern = \%\%\;
    activitiesQuery = activitiesQuery.or(\	itle.ilike.\,description.ilike.\\);
    spendingQuery = spendingQuery.or(\category.ilike.\,description.ilike.\\);
  }

  // Branch and other filters would normally require joining with entities or using a view. 
  // We'll apply them if present.
  if (filters?.department) {
    spendingQuery = spendingQuery.eq('department_id', filters.department);
    activitiesQuery = activitiesQuery.eq('entity_id', filters.department);
  }
  if (filters?.politician) {
    activitiesQuery = activitiesQuery.eq('entity_id', filters.politician);
  }

  const [{ data: activities }, { data: spending }] = await Promise.all([
    activitiesQuery,
    spendingQuery
  ]);

  const combined = [
    ...(activities || []).map((a: any) => ({ ...a, source: 'activity' })),
    ...(spending || []).map((s: any) => ({ ...s, source: 'spending' }))
  ];

  combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return combined.slice(0, limit);
}
