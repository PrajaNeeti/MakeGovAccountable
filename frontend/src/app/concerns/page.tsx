import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

interface Concern {
  id: string;
  tracking_token: string;
  content: string;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Under Review',
  grouped: 'Grouped',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const STATUS_DOT: Record<string, string> = {
  pending: 'oklch(0.708 0 0)',
  grouped: 'oklch(0.439 0.12 260)',
  resolved: 'oklch(0.439 0.18 145)',
  rejected: 'oklch(0.577 0.245 27.325)',
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
  const dotColor = STATUS_DOT[status] ?? STATUS_DOT.pending;
  const statusLabel = STATUS_LABELS[status] ?? status;

  return (
    <Link
      href={`/track/${concern.tracking_token}`}
      className="group block rounded-xl border border-[oklch(0.922_0_0)] bg-white hover:border-[oklch(0.708_0_0)] hover:shadow-sm transition-all duration-200"
      style={{ padding: '24px', textDecoration: 'none' }}
      aria-label={`View concern ${shortId(concern.tracking_token)}`}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '12px' }}
      >
        <span
          className="font-mono font-medium text-[oklch(0.556_0_0)]"
          style={{ fontSize: '11px', letterSpacing: '0.08em' }}
        >
          #{shortId(concern.tracking_token)}
        </span>
        <span
          className="inline-flex items-center gap-1 text-[oklch(0.556_0_0)]"
          style={{ fontSize: '12px' }}
        >
          <span
            className="inline-block rounded-full"
            style={{ width: '6px', height: '6px', backgroundColor: dotColor }}
          />
          {statusLabel}
        </span>
      </div>

      {/* Content */}
      <p
        className="text-[oklch(0.205_0_0)] group-hover:text-[oklch(0.145_0_0)] transition-colors"
        style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '16px' }}
      >
        {truncate(concern.content)}
      </p>

      {/* Footer */}
      <p
        className="text-[oklch(0.708_0_0)]"
        style={{ fontSize: '12px' }}
      >
        {formatRelativeDate(concern.created_at)}
      </p>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function ConcernsPage() {
  const supabase = await createClient();

  const { data: concerns, error } = await supabase
    .from('concerns')
    .select('id, tracking_token, content, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const hasData = !error && concerns && concerns.length > 0;

  return (
    <main className="min-h-screen bg-[oklch(1_0_0)]">
      {/* Page header */}
      <section
        className="border-b border-[oklch(0.922_0_0)]"
        style={{ padding: '64px 24px 48px' }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-[13px] font-medium tracking-widest uppercase text-[oklch(0.556_0_0)]"
                style={{ marginBottom: '12px' }}
              >
                PrajaNeeti · Public Feed
              </p>
              <h1
                className="font-serif font-bold text-[oklch(0.145_0_0)]"
                style={{ fontSize: '48px', lineHeight: '1.1' }}
              >
                Citizen Concerns
              </h1>
              <p
                className="text-[oklch(0.556_0_0)]"
                style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginTop: '16px',
                  maxWidth: '560px',
                }}
              >
                All concerns submitted by citizens are public by default. Browse,
                share, and track government accountability in real time.
              </p>
            </div>

            {/* CTA */}
            <Link
              href="/submit"
              id="new-concern-cta"
              className="inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-all"
              style={{
                backgroundColor: 'oklch(0.205 0 0)',
                color: 'oklch(0.985 0 0)',
                padding: '13px 28px',
                fontSize: '15px',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              Submit Concern
            </Link>
          </div>

          {/* Stats bar */}
          {hasData && (
            <div
              className="flex items-center gap-6 border-t border-[oklch(0.922_0_0)]"
              style={{ marginTop: '32px', paddingTop: '24px' }}
            >
              <div>
                <span
                  className="font-bold text-[oklch(0.205_0_0)]"
                  style={{ fontSize: '24px' }}
                >
                  {concerns.length}
                </span>
                <span
                  className="text-[oklch(0.556_0_0)]"
                  style={{ fontSize: '13px', marginLeft: '6px' }}
                >
                  concern{concerns.length !== 1 ? 's' : ''} published
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feed */}
      <section style={{ padding: '48px 24px 96px' }}>
        <div className="mx-auto max-w-6xl">
          {error ? (
            /* Error state */
            <div
              className="rounded-xl border border-[oklch(0.922_0_0)] bg-[oklch(0.97_0_0)] text-center"
              style={{ padding: '64px 24px' }}
            >
              <p
                className="font-semibold text-[oklch(0.439_0_0)]"
                style={{ fontSize: '18px', marginBottom: '8px' }}
              >
                Failed to load concerns
              </p>
              <p className="text-[oklch(0.556_0_0)]" style={{ fontSize: '14px' }}>
                Failed to publish. Please check your connection and try again.
              </p>
            </div>
          ) : !hasData ? (
            /* Empty state */
            <div
              className="rounded-xl border border-[oklch(0.922_0_0)] bg-[oklch(0.97_0_0)] text-center"
              style={{ padding: '96px 24px' }}
            >
              <div
                className="mx-auto rounded-full bg-[oklch(0.922_0_0)] flex items-center justify-center"
                style={{ width: '64px', height: '64px', marginBottom: '24px' }}
              >
                {/* Megaphone icon (inline SVG) */}
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="oklch(0.556 0 0)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 11l19-9-9 19-2-8-8-2z" />
                </svg>
              </div>
              <h2
                className="font-serif font-bold text-[oklch(0.205_0_0)]"
                style={{ fontSize: '24px', marginBottom: '12px' }}
              >
                No Concerns Published Yet
              </h2>
              <p
                className="text-[oklch(0.556_0_0)]"
                style={{ fontSize: '16px', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}
              >
                Be the first to raise an issue and start tracking government
                action.
              </p>
              <Link
                href="/submit"
                id="empty-state-cta"
                className="inline-flex items-center justify-center rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: 'oklch(0.205 0 0)',
                  color: 'oklch(0.985 0 0)',
                  padding: '13px 28px',
                  fontSize: '15px',
                  textDecoration: 'none',
                }}
              >
                Submit Concern
              </Link>
            </div>
          ) : (
            /* Magazine multi-column grid */
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              }}
            >
              {(concerns as Concern[]).map((concern) => (
                <ConcernCard key={concern.id} concern={concern} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
