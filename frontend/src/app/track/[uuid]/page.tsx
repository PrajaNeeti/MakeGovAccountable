import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  pending: 'Under Review',
  grouped: 'Grouped with Similar Concerns',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'oklch(0.556 0 0)',
  grouped: 'oklch(0.439 0.12 260)',
  resolved: 'oklch(0.439 0.18 145)',
  rejected: 'oklch(0.577 0.245 27.325)',
};

const STATUS_BG: Record<string, string> = {
  pending: 'oklch(0.97 0 0)',
  grouped: 'oklch(0.95 0.04 260)',
  resolved: 'oklch(0.95 0.04 145)',
  rejected: 'oklch(0.97 0.06 27.325)',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso));
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default async function TrackConcernPage({ params }: PageProps) {
  const { uuid } = await params;

  // Validate UUID format early to avoid DB round-trip
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: concern, error } = await supabase
    .from('concerns')
    .select('id, tracking_token, content, status, created_at')
    .eq('tracking_token', uuid)
    .single();

  if (error || !concern) {
    notFound();
  }

  const statusLabel = STATUS_LABELS[concern.status] ?? concern.status;
  const statusColor = STATUS_COLORS[concern.status] ?? STATUS_COLORS.pending;
  const statusBg = STATUS_BG[concern.status] ?? STATUS_BG.pending;
  const shortToken = String(concern.tracking_token).split('-')[0].toUpperCase();

  return (
    <main className="min-h-screen bg-[oklch(1_0_0)]">
      {/* Top nav strip */}
      <nav
        className="border-b border-[oklch(0.922_0_0)]"
        style={{ padding: '16px 24px' }}
      >
        <div className="mx-auto max-w-3xl flex items-center gap-4">
          <Link
            href="/"
            className="text-[13px] font-medium text-[oklch(0.556_0_0)] hover:text-[oklch(0.205_0_0)] transition-colors"
          >
            ← Home
          </Link>
          <span className="text-[oklch(0.922_0_0)]">|</span>
          <Link
            href="/concerns"
            className="text-[13px] font-medium text-[oklch(0.556_0_0)] hover:text-[oklch(0.205_0_0)] transition-colors"
          >
            All Concerns
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '64px 24px 0' }}>
        <div className="mx-auto max-w-3xl">
          <p
            className="text-[13px] font-medium tracking-widest uppercase text-[oklch(0.556_0_0)]"
            style={{ marginBottom: '12px' }}
          >
            Concern · {shortToken}
          </p>
          <h1
            className="font-serif font-bold text-[oklch(0.145_0_0)]"
            style={{ fontSize: '36px', lineHeight: '1.2', marginBottom: '24px' }}
          >
            Your Submission
          </h1>

          {/* Status badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full font-medium"
            style={{
              backgroundColor: statusBg,
              color: statusColor,
              padding: '6px 14px',
              fontSize: '13px',
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{
                width: '7px',
                height: '7px',
                backgroundColor: statusColor,
              }}
            />
            {statusLabel}
          </span>
        </div>
      </section>

      {/* Content card */}
      <section style={{ padding: '32px 24px 96px' }}>
        <div className="mx-auto max-w-3xl">
          <article
            className="rounded-xl border border-[oklch(0.922_0_0)] bg-white"
            style={{ padding: '32px' }}
          >
            {/* Concern text */}
            <p
              className="text-[oklch(0.205_0_0)] whitespace-pre-wrap"
              style={{ fontSize: '16px', lineHeight: '1.7' }}
            >
              {concern.content}
            </p>

            {/* Divider */}
            <hr
              className="border-[oklch(0.922_0_0)]"
              style={{ margin: '24px 0' }}
            />

            {/* Meta row */}
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt
                  className="text-[oklch(0.556_0_0)] uppercase tracking-wide"
                  style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}
                >
                  Submitted
                </dt>
                <dd
                  className="text-[oklch(0.205_0_0)]"
                  style={{ fontSize: '14px' }}
                >
                  {formatDate(concern.created_at)}
                </dd>
              </div>
              <div>
                <dt
                  className="text-[oklch(0.556_0_0)] uppercase tracking-wide"
                  style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}
                >
                  Tracking Token
                </dt>
                <dd
                  className="font-mono text-[oklch(0.439_0_0)] break-all"
                  style={{ fontSize: '13px' }}
                >
                  {concern.tracking_token}
                </dd>
              </div>
            </dl>
          </article>

          {/* Share / bookmark nudge */}
          <div
            className="rounded-lg border border-[oklch(0.922_0_0)] bg-[oklch(0.97_0_0)]"
            style={{ padding: '20px 24px', marginTop: '24px' }}
          >
            <p
              className="font-semibold text-[oklch(0.205_0_0)]"
              style={{ fontSize: '14px', marginBottom: '6px' }}
            >
              Bookmark this page
            </p>
            <p
              className="text-[oklch(0.556_0_0)]"
              style={{ fontSize: '13px', lineHeight: '1.5' }}
            >
              This is your anonymous tracking link. Save the URL or your tracking
              token to return later. No account or email needed.
            </p>
          </div>

          {/* CTA to submit another */}
          <div style={{ marginTop: '32px' }}>
            <Link
              href="/submit"
              id="submit-another-link"
              className="inline-flex items-center justify-center rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: 'oklch(0.205 0 0)',
                color: 'oklch(0.985 0 0)',
                padding: '12px 28px',
                fontSize: '15px',
                textDecoration: 'none',
              }}
              onMouseOver={undefined}
            >
              Submit Another Concern
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
