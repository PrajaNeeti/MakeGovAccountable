'use server';

import { createClient } from '@/lib/supabase/server';

export type SearchResult = {
  id: string;
  name: string;
  type: 'politician' | 'department' | 'court';
  url: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query) return [];
  
  const supabase = await createClient();
  const searchPattern = `%${query}%`;

  const [
    { data: politicians },
    { data: departments },
    { data: courts }
  ] = await Promise.all([
    supabase
      .from('politicians')
      .select('id, first_name, last_name')
      .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`)
      .eq('public', true)
      .limit(5),
    supabase
      .from('departments')
      .select('id, name')
      .ilike('name', searchPattern)
      .eq('public', true)
      .limit(5),
    supabase
      .from('courts')
      .select('id, name')
      .ilike('name', searchPattern)
      .eq('public', true)
      .limit(5)
  ]);

  const results: SearchResult[] = [];

  if (politicians) {
    results.push(
      ...politicians.map((p: any) => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        type: 'politician' as const,
        url: `/politicians/${p.id}`
      }))
    );
  }

  if (departments) {
    results.push(
      ...departments.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: 'department' as const,
        url: `/departments/${d.id}`
      }))
    );
  }

  if (courts) {
    results.push(
      ...courts.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: 'court' as const,
        url: `/courts/${c.id}`
      }))
    );
  }

  return results;
}
