import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { DiscussionThread } from '@/components/forums/discussion-thread';
import { CreatePostForm } from '@/components/forums/create-post-form';
import Link from 'next/link';

export default async function ForumDiscussionPage(
  props: {
    params: Promise<{ discussionId: string }> | { discussionId: string };
  }
) {
  // Await params to support Next.js 15+ correctly while keeping backwards compat
  const params = await props.params;
  const discussionId = params.discussionId;

  const supabase = await createClient();

  const { data: discussion, error: discussionError } = await supabase
    .from('discussions')
    .select('*')
    .eq('id', discussionId)
    .single();

  if (discussionError || !discussion) {
    notFound();
  }

  const { data: posts } = await supabase
    .from('forum_posts')
    .select(`
      id,
      content,
      created_at,
      users (
        pseudonym
      )
    `)
    .eq('discussion_id', discussionId)
    .order('created_at', { ascending: true });

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-4xl py-12">
      <div className="mb-12 border-b-4 border-primary pb-8">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/forums" className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
            ← Back to Letters & Discourse
          </Link>
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {new Date(discussion.created_at || Date.now()).toLocaleDateString()}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight leading-tight">
          Letters to the Editor: {discussion.title || "Community Discussion"}
        </h1>
      </div>
      
      <div className="mb-16">
        <DiscussionThread posts={(posts as any) || []} />
      </div>

      <div className="mt-16 border-t-2 border-primary pt-12">
        <h3 className="text-2xl font-serif font-black mb-8 uppercase">Submit a Letter</h3>
        <CreatePostForm discussionId={discussionId} />
      </div>
    </div>
  );
}
