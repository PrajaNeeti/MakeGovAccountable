import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { GroupActionButtons } from './GroupActionButtons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default async function ModerationPage() {
  const cookieStore = await cookies();
  const secret = cookieStore.get('MODERATOR_SECRET')?.value;

  if (!secret || secret !== process.env.MODERATOR_SECRET) {
    return (
      <div className="container mx-auto p-8 max-w-4xl text-center pt-24">
        <h1 className="text-4xl font-serif font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-lg">This page is restricted to moderators.</p>
      </div>
    );
  }

  const supabase = await createClient();

  // Fetch pending (suggested) concern groups
  const { data: groups, error: groupsError } = await supabase
    .from('concern_groups')
    .select('*')
    .eq('status', 'suggested')
    .order('created_at', { ascending: false });

  if (groupsError) {
    console.error('Error fetching concern groups:', groupsError);
  }

  // Fetch associated concerns and entities for these groups
  let links: any[] = [];
  if (groups && groups.length > 0) {
    const groupIds = groups.map(g => g.id);
    const { data: linkData, error: linkError } = await supabase
      .from('concern_entity_links')
      .select('concern_id, entity_type, entity_id, concerns(content, tracking_token)')
      .eq('entity_type', 'concern_group')
      .in('entity_id', groupIds);
      
    if (linkError) {
      console.error('Error fetching concern entity links:', linkError);
    } else {
      links = linkData || [];
    }
  }

  return (
    <div className="container mx-auto p-8 lg:p-12 max-w-5xl">
      <header className="mb-12">
        <h1 className="text-5xl font-serif font-bold mb-4">Moderation Dashboard</h1>
        <p className="text-xl text-gray-600">Pending AI-Suggested Groups: {groups?.length || 0}</p>
      </header>

      {(!groups || groups.length === 0) ? (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-lg">
          <h2 className="text-3xl font-serif font-bold mb-4">No Pending Groups</h2>
          <p className="text-gray-500 text-lg">The AI hasn't suggested any concern groupings yet.<br />Check back after more concerns are submitted.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {groups.map(group => {
            const groupLinks = links.filter(l => l.entity_id === group.id);
            // Deduplicate concerns based on concern_id
            const uniqueConcerns = Array.from(new Map(groupLinks.map(l => [l.concern_id, l.concerns])).values());
            
            return (
              <Card key={group.id} className="bg-white border border-gray-200 p-2 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif font-bold">{group.title}</CardTitle>
                  <CardDescription className="text-base text-gray-800">{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-gray-700">Included Concerns ({uniqueConcerns.length})</h3>
                    <ul className="space-y-3">
                      {uniqueConcerns.map((c: any, i) => {
                        const content = c?.content || '';
                        const snippet = content.length > 120 ? content.substring(0, 120) + '...' : content;
                        return (
                          <li key={i} className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                            <span className="font-mono text-xs text-gray-400 block mb-2 uppercase tracking-wide">
                              ID: {c?.tracking_token?.substring(0, 8)}
                            </span>
                            "{snippet}"
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="pt-6 border-t flex justify-end">
                  <GroupActionButtons groupId={group.id} />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
