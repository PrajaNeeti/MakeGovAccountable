import Link from 'next/link';
import { getDiscussions } from '../actions/forumActions';
import { MessageSquare, Scale, PlusCircle, ArrowRight, ShieldCheck, Flame, UserCheck, Landmark } from 'lucide-react';
import StartDiscussionButton from '@/components/forums/StartDiscussionButton';

export const dynamic = 'force-dynamic';

export default async function ForumsOverviewPage() {
  const discussions = await getDiscussions();

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl py-12 space-y-12">
      {/* Masthead Header */}
      <header className="border-b-2 border-t-2 border-primary py-10 text-center bg-card">
        <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-1">
          Pillar 2 • Letters to the Editor & Civil Discourse
        </span>
        <h1 className="text-4xl md:text-6xl font-black font-serif uppercase tracking-tight text-primary mt-4">
          Editorial Forum & Public Discourse
        </h1>
        <p className="text-muted-foreground font-sans text-base max-w-3xl mx-auto mt-3 leading-relaxed">
          Quiet, evidence-based commentary on government spending, representative records, executive mandates, and judicial backlogs.
        </p>

        <div className="flex justify-center mt-6">
          <StartDiscussionButton />
        </div>
      </header>

      {/* Discussion Topics Grid */}
      <section className="space-y-6">
        <div className="border-b-2 border-primary pb-3 flex justify-between items-center">
          <h2 className="font-serif text-2xl font-bold uppercase text-primary">Active Civic Discussion Threads</h2>
          <span className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {discussions.length} Open Threads
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {discussions.map((disc: any) => (
            <div key={disc.id} className="border-2 border-primary bg-card p-6 flex flex-col justify-between hover:bg-secondary/20 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                  <span className="font-narrow text-xs font-bold uppercase text-primary border border-primary px-2 py-0.5">
                    {disc.category}
                  </span>
                  <span className="font-narrow text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" /> {disc.post_count} Responses
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold uppercase leading-snug">
                  {disc.title}
                </h3>

                <p className="text-xs text-muted-foreground">
                  Started by community members &bull; Moderated according to PrajaNeeti editorial standards.
                </p>
              </div>

              <Link
                href={`/forums/${disc.id}`}
                className="mt-6 inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-4 py-2 hover:bg-transparent hover:text-primary transition-all w-fit"
              >
                Read Thread & Submit Letter <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
