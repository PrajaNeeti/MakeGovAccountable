import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Search, MapPin, MessageSquare, Filter, ArrowRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

interface Concern {
  id: string;
  tracking_token: string;
  content: string;
  status: string;
  created_at: string;
  state?: string;
  city?: string;
  area?: string;
  signatures_count?: number;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Under Review',
  grouped: 'Grouped',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

function truncate(text: string, maxLen = 220): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '…';
}

function shortId(token: string): string {
  return token.split('-')[0].toUpperCase();
}

// ---------------------------------------------------------------------------
// ConcernCard
// ---------------------------------------------------------------------------

function ConcernCard({ concern }: { concern: Concern }) {
  const status = concern.status ?? 'pending';
  const statusLabel = STATUS_LABELS[status] ?? status;

  return (
    <Link
      href={`/track/${concern.tracking_token}`}
      className="group block border-2 border-primary bg-card p-6 transition-all hover:bg-muted/20 hover:border-primary/90 focus:outline-none"
      aria-label={`View concern ${shortId(concern.tracking_token)}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between border-b border-primary/30 pb-3 mb-4">
        <span className="font-narrow text-xs font-bold uppercase tracking-widest text-primary bg-muted px-2 py-0.5 border border-primary/30">
          #{shortId(concern.tracking_token)}
        </span>
        <span className="inline-flex items-center gap-1.5 font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          {statusLabel}
        </span>
      </div>

      {/* Location */}
      {(concern.city || concern.state) && (
        <div className="flex items-center gap-1 text-xs font-narrow font-bold uppercase tracking-wider text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span>{[concern.area, concern.city, concern.state].filter(Boolean).join(', ')}</span>
        </div>
      )}

      {/* Content */}
      <p className="font-sans text-sm text-foreground leading-relaxed mb-6 group-hover:text-primary transition-colors line-clamp-4">
        {truncate(concern.content)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-primary/20 pt-4 text-xs">
        <span className="font-narrow font-medium text-muted-foreground">
          {formatRelativeDate(concern.created_at)}
        </span>
        <span className="font-narrow font-bold uppercase tracking-wider text-primary border border-primary px-2.5 py-1 bg-background group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          🗣️ {concern.signatures_count || 1} Voice{(concern.signatures_count || 1) !== 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function ConcernsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const state = resolvedParams.state as string | undefined;
  const city = resolvedParams.city as string | undefined;

  let query = supabase
    .from('concerns')
    .select('id, tracking_token, content, status, created_at, state, city, area, signatures_count');
    
  if (state) {
    query = query.ilike('state', `%${state}%`);
  }
  if (city) {
    query = query.ilike('city', `%${city}%`);
  }

  const { data: concerns, error } = await query
    .order('signatures_count', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(100);

  const hasData = !error && concerns && concerns.length > 0;

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Broadsheet Masthead Section */}
      <header className="border-b-2 border-t-2 border-primary py-10 bg-card">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-1 inline-block">
                Pillar 1 • Public Record & Voice Pooling Feed
              </span>
              <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight text-primary uppercase">
                Citizen Concerns
              </h1>
              <p className="text-muted-foreground font-sans text-base max-w-2xl leading-relaxed">
                All submitted concerns are public record by default. Filter by state or city to track real-time government accountability and community voice pooling.
              </p>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <form action="/concerns" method="GET" className="flex flex-wrap sm:flex-nowrap gap-2">
                <input
                  type="text"
                  name="state"
                  placeholder="State (e.g. Karnataka)"
                  defaultValue={state || ''}
                  className="px-3 py-2 border-2 border-primary bg-background text-sm font-sans focus:outline-none w-36 md:w-44"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City (e.g. Bengaluru)"
                  defaultValue={city || ''}
                  className="px-3 py-2 border-2 border-primary bg-background text-sm font-sans focus:outline-none w-36 md:w-44"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-muted px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>
              </form>

              <Link
                href="/submit"
                id="new-concern-cta"
                className="inline-flex items-center justify-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground px-6 py-2.5 hover:bg-transparent hover:text-primary transition-all whitespace-nowrap"
              >
                Submit Concern <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          {hasData && (
            <div className="flex items-center gap-6 border-t border-primary/30 mt-8 pt-4 text-xs font-narrow font-bold uppercase tracking-wider">
              <span className="text-primary text-sm font-serif">{concerns.length} Record{concerns.length !== 1 ? 's' : ''} Published</span>
              <span className="text-muted-foreground">• Sorted by Voice Pool Density</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Feed Section */}
      <section className="container mx-auto px-4 md:px-8 max-w-7xl pt-10">
        {error ? (
          /* Error State */
          <div className="border-2 border-primary bg-card p-12 text-center space-y-3">
            <h2 className="font-serif text-2xl font-bold text-primary uppercase">Failed to load public record</h2>
            <p className="text-muted-foreground text-sm font-sans">
              Could not retrieve concerns feed. Please verify your connection and reload.
            </p>
          </div>
        ) : !hasData ? (
          /* Empty State */
          <div className="border-2 border-dashed border-primary/50 bg-card p-16 text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-12 h-12 border-2 border-primary bg-muted mx-auto flex items-center justify-center text-primary">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-bold uppercase text-primary">No Public Concerns Found</h2>
              <p className="text-muted-foreground text-sm font-sans max-w-md mx-auto">
                No active concerns have been filed matching this filter. Be the first citizen to file an issue for public oversight.
              </p>
            </div>
            <Link
              href="/submit"
              id="empty-state-cta"
              className="inline-flex items-center justify-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground px-6 py-3 hover:bg-transparent hover:text-primary transition-all"
            >
              Submit Concern <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* 3-Column Dossier Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(concerns as Concern[]).map((concern) => (
              <ConcernCard key={concern.id} concern={concern} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

