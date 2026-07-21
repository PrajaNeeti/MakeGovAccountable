'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitConcern, getSemanticMatches, SemanticMatch } from '@/app/actions/submitConcern';
import { signConcern } from '@/app/actions/signConcern';
import { createClient } from '@/lib/supabase/client';
import { State, City } from 'country-state-city';

// ── Similarity badge colour ────────────────────────────────────────────────

function SimilarityBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  // colour ranges: green ≥70, amber 55–69
  const colour =
    pct >= 70
      ? { bg: 'oklch(0.95 0.06 145)', text: 'oklch(0.3 0.1 145)' }
      : { bg: 'oklch(0.96 0.08 60)', text: 'oklch(0.45 0.14 60)' };

  return (
    <span
      style={{
        backgroundColor: colour.bg,
        color: colour.text,
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '100px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {pct}% match
    </span>
  );
}

// ── Entity type label ──────────────────────────────────────────────────────

const ENTITY_LABELS: Record<string, string> = {
  concern: 'Similar Concern',
  politician: 'Politician',
  department: 'Department',
  court: 'Court',
  activity: 'Gov. Activity',
};

// ── Semantic Match Panel ──────────────────────────────────────────────────

interface MatchPanelProps {
  matches: SemanticMatch[];
  isLoading: boolean;
  onSign: (id: string) => void;
}

function MatchPanel({ matches, isLoading, onSign }: MatchPanelProps) {
  if (isLoading) {
    return (
      <div
        aria-live="polite"
        aria-label="Finding similar concerns…"
        style={{
          marginTop: '24px',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid oklch(0.922 0 0)',
          backgroundColor: 'oklch(0.985 0 0)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span
          className="inline-block rounded-full border-2 animate-spin"
          style={{
            width: '14px',
            height: '14px',
            borderColor: 'oklch(0.7 0 0)',
            borderTopColor: 'oklch(0.3 0 0)',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <span style={{ fontSize: '13px', color: 'oklch(0.556 0 0)' }}>
          Scanning for similar concerns…
        </span>
      </div>
    );
  }

  if (matches.length === 0) return null;

  const concerns = matches.filter((m) => m.result_type === 'concern');
  const entities = matches.filter((m) => m.result_type !== 'concern');

  return (
    <div
      role="region"
      aria-label="Similar concerns found"
      style={{ marginTop: '24px' }}
    >
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'oklch(0.5 0.18 145)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'oklch(0.439 0 0)',
          }}
        >
          Similar concerns already on record
        </span>
      </div>

      {/* Concern cards */}
      {concerns.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: entities.length > 0 ? '16px' : 0 }}>
          {concerns.map((m) => (
            <div
              key={m.id}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid oklch(0.922 0 0)',
                backgroundColor: 'oklch(0.99 0 0)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'oklch(0.7 0 0)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'oklch(0.922 0 0)';
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'oklch(0.205 0 0)',
                    lineHeight: '1.5',
                    margin: 0,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {m.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <p
                    style={{
                      fontSize: '11px',
                      color: 'oklch(0.6 0 0)',
                      margin: 0,
                    }}
                  >
                    {ENTITY_LABELS[m.result_type] ?? m.result_type}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSign(m.id)}
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'oklch(0.985 0 0)',
                      backgroundColor: 'oklch(0.205 0 0)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    Add My Voice
                  </button>
                </div>
              </div>
              <SimilarityBadge score={m.similarity} />
            </div>
          ))}
        </div>
      )}

      {/* Entity cards (government context) */}
      {entities.length > 0 && (
        <>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'oklch(0.439 0 0)',
              marginBottom: '8px',
            }}
          >
            Related government context
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {entities.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid oklch(0.922 0 0)',
                  backgroundColor: 'oklch(0.975 0 0)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'oklch(0.556 0 0)',
                    whiteSpace: 'nowrap',
                    backgroundColor: 'oklch(0.93 0 0)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                >
                  {ENTITY_LABELS[m.result_type] ?? m.result_type}
                </span>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'oklch(0.3 0 0)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {m.content}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Non-blocking note */}
      <p
        style={{
          fontSize: '12px',
          color: 'oklch(0.65 0 0)',
          marginTop: '10px',
          lineHeight: '1.5',
        }}
      >
        These are existing concerns and government actions that may overlap with
        yours. You can still submit — your concern will be published regardless.
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function SubmitPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [location, setLocation] = useState({ state: '', city: '', area: '' });
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const indianStates = State.getStatesOfCountry('IN');
  const citiesInState = stateCode ? City.getCitiesOfState('IN', stateCode) : [];

  // Semantic match state
  const [matches, setMatches] = useState<SemanticMatch[]>([]);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_CHARS = 5000;

  // ── Debounced semantic search ────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Only search when there's enough text
    if (content.trim().length < 20) {
      setMatches([]);
      setIsMatchLoading(false);
      return;
    }

    setIsMatchLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await getSemanticMatches(content);
        setMatches(result.matches);
      } catch {
        setMatches([]);
      } finally {
        setIsMatchLoading(false);
      }
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);
    setCharCount(val.length);
    if (error) setError(null);
  }

  function handleLocationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setLocation(prev => ({ ...prev, [name]: value }));
  }

  function handleStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value;
    setStateCode(code);
    const stateObj = indianStates.find(s => s.isoCode === code);
    setLocation(prev => ({ ...prev, state: stateObj ? stateObj.name : '', city: '' }));
  }

  function handleCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const city = e.target.value;
    setLocation(prev => ({ ...prev, city }));
  }

  async function handleSign(concernId: string) {
    // 1. Try to sign
    const res = await signConcern(concernId);
    if (res.success) {
      router.push(`/track/${concernId}`);
    } else if (res.requiresAuth) {
      // 2. Redirect to Google login if required
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/track/${concernId}`,
        },
      });
    } else {
      setError(res.error);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      // Here we would normally grab the reCAPTCHA token, e.g. from a ref
      const captchaToken = 'mock-token'; // Mocked for now

      const result = await submitConcern(content, location, captchaToken);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/track/${result.trackingToken}`);
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[oklch(1_0_0)]">
      {/* Hero section */}
      <section
        className="border-b border-[oklch(0.922_0_0)]"
        style={{ padding: '64px 0 48px' }}
      >
        <div className="mx-auto max-w-3xl px-6">
          <p
            className="text-[14px] font-medium tracking-widest uppercase text-[oklch(0.556_0_0)]"
            style={{ marginBottom: '16px' }}
          >
            PRAJA NEETI
          </p>
          <h1
            className="font-serif font-bold leading-tight text-[oklch(0.145_0_0)]"
            style={{ fontSize: '48px', lineHeight: '1.1', marginBottom: '16px' }}
          >
            Submit a Concern
          </h1>
          <p
            className="text-[oklch(0.556_0_0)]"
            style={{ fontSize: '16px', lineHeight: '1.6', maxWidth: '580px' }}
          >
            Your concern will be published publicly and matched to government
            actions and policies. No account required — you will receive a
            private tracking link after submission.
          </p>
        </div>
      </section>

      {/* Form */}
      <section style={{ padding: '48px 0 96px' }}>
        <div className="mx-auto max-w-3xl px-6">
          <form onSubmit={handleSubmit} noValidate>
            {/* Instructions card */}
            <div
              className="rounded-lg border border-[oklch(0.922_0_0)] bg-[oklch(0.97_0_0)]"
              style={{ padding: '16px 20px', marginBottom: '32px' }}
            >
              <p className="text-[14px] text-[oklch(0.439_0_0)] leading-relaxed">
                <strong className="text-[oklch(0.205_0_0)]">Guidelines:</strong>{' '}
                Be specific and factual. Avoid personal attacks. Concerns must be
                civic in nature — relate to government actions, policies,
                spending, or inaction.
              </p>
            </div>

            {/* Location Fields */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label className="block font-semibold text-[oklch(0.205_0_0)]" style={{ fontSize: '13px', marginBottom: '6px' }}>State</label>
                <select
                  name="stateCode"
                  value={stateCode}
                  onChange={handleStateChange}
                  className="w-full rounded-lg border border-[oklch(0.922_0_0)] bg-white px-3 py-2 text-[14px]"
                  style={{ outline: 'none' }}
                >
                  <option value="">Select State</option>
                  {indianStates.map(s => (
                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="block font-semibold text-[oklch(0.205_0_0)]" style={{ fontSize: '13px', marginBottom: '6px' }}>City</label>
                <select
                  name="city"
                  value={location.city}
                  onChange={handleCityChange}
                  disabled={!stateCode}
                  className="w-full rounded-lg border border-[oklch(0.922_0_0)] bg-white px-3 py-2 text-[14px] disabled:opacity-50"
                  style={{ outline: 'none' }}
                >
                  <option value="">Select City</option>
                  {citiesInState.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="block font-semibold text-[oklch(0.205_0_0)]" style={{ fontSize: '13px', marginBottom: '6px' }}>Area (Optional)</label>
                <input
                  type="text"
                  name="area"
                  value={location.area}
                  onChange={handleLocationChange}
                  placeholder="e.g. Bandra"
                  className="w-full rounded-lg border border-[oklch(0.922_0_0)] bg-white px-3 py-2 text-[14px]"
                  style={{ outline: 'none' }}
                />
              </div>
            </div>

            {/* Label */}
            <label
              htmlFor="concern-content"
              className="block font-semibold text-[oklch(0.205_0_0)]"
              style={{ fontSize: '14px', marginBottom: '8px' }}
            >
              Your Concern
            </label>

            {/* Textarea */}
            <textarea
              id="concern-content"
              name="content"
              value={content}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={MAX_CHARS}
              disabled={isPending}
              placeholder="Describe the government action, policy, or inaction you are concerned about…"
              className="w-full rounded-lg border text-[oklch(0.145_0_0)] placeholder:text-[oklch(0.708_0_0)] bg-white resize-y focus:outline-none transition-colors"
              style={{
                borderColor: error ? 'oklch(0.577 0.245 27.325)' : 'oklch(0.922 0 0)',
                padding: '16px',
                fontSize: '16px',
                lineHeight: '1.6',
                minHeight: '200px',
                boxShadow: error
                  ? '0 0 0 2px oklch(0.577 0.245 27.325 / 0.15)'
                  : 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'oklch(0.439 0 0)';
                e.currentTarget.style.boxShadow =
                  '0 0 0 3px oklch(0.205 0 0 / 0.08)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = error
                  ? 'oklch(0.577 0.245 27.325)'
                  : 'oklch(0.922 0 0)';
                e.currentTarget.style.boxShadow = error
                  ? '0 0 0 2px oklch(0.577 0.245 27.325 / 0.15)'
                  : 'none';
              }}
            />

            {/* Char counter + error row */}
            <div
              className="flex items-start justify-between"
              style={{ marginTop: '8px' }}
            >
              {error ? (
                <p
                  role="alert"
                  className="text-[oklch(0.577_0.245_27.325)] font-medium"
                  style={{ fontSize: '14px' }}
                >
                  {error}
                </p>
              ) : (
                <span />
              )}
              <span
                className="text-[oklch(0.556_0_0)] tabular-nums ml-auto"
                style={{ fontSize: '13px' }}
              >
                {charCount} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>

            {/* ── Semantic match panel (non-blocking) ──────────────── */}
            <MatchPanel matches={matches} isLoading={isMatchLoading} onSign={handleSign} />

            {/* Submit button */}
            <div style={{ marginTop: '32px' }}>
              <button
                id="submit-concern-btn"
                type="submit"
                disabled={isPending || content.trim().length < 10}
                className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: isPending
                    ? 'oklch(0.439 0 0)'
                    : 'oklch(0.205 0 0)',
                  color: 'oklch(0.985 0 0)',
                  padding: '14px 32px',
                  fontSize: '16px',
                  cursor:
                    isPending || content.trim().length < 10
                      ? 'not-allowed'
                      : 'pointer',
                  opacity: content.trim().length < 10 ? 0.5 : 1,
                  transition: 'background-color 0.15s, opacity 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isPending && content.trim().length >= 10) {
                    e.currentTarget.style.backgroundColor = 'oklch(0.269 0 0)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isPending
                    ? 'oklch(0.439 0 0)'
                    : 'oklch(0.205 0 0)';
                }}
              >
                {isPending ? (
                  <>
                    <span
                      className="inline-block rounded-full border-2 border-white/30 border-t-white animate-spin"
                      style={{ width: '16px', height: '16px' }}
                      aria-hidden="true"
                    />
                    Publishing…
                  </>
                ) : (
                  'Submit Concern'
                )}
              </button>

              <p
                className="text-[oklch(0.556_0_0)]"
                style={{ fontSize: '13px', marginTop: '12px' }}
              >
                By submitting, you agree that your concern will be visible
                publicly. No personal data is collected.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
