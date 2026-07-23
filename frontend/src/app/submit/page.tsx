'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitConcern, getSemanticMatches, SemanticMatch } from '@/app/actions/submitConcern';
import { signConcern } from '@/app/actions/signConcern';
import { createClient } from '@/lib/supabase/client';
import { Shield, Sparkles, Send, MapPin, User, EyeOff, Info, ArrowRight } from 'lucide-react';

// ── Similarity badge colour ────────────────────────────────────────────────

function SimilarityBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  return (
    <span className="font-narrow text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-primary bg-muted text-primary flex-shrink-0">
      {pct}% Match
    </span>
  );
}

// ── Entity type label ──────────────────────────────────────────────────────

const ENTITY_LABELS: Record<string, string> = {
  concern: 'Similar Public Concern',
  politician: 'Parliamentarian Record',
  department: 'Department Oversight',
  court: 'Legal/Judicial Precedent',
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
        className="mt-6 p-4 border-2 border-primary bg-muted/20 flex items-center gap-3 text-xs font-narrow font-bold uppercase tracking-wider text-muted-foreground"
      >
        <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <span>Scanning public archives for similar citizen concerns…</span>
      </div>
    );
  }

  if (matches.length === 0) return null;

  const concerns = matches.filter((m) => m.result_type === 'concern');
  const entities = matches.filter((m) => m.result_type !== 'concern');

  return (
    <div role="region" aria-label="Similar concerns found" className="mt-8 space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 border-b border-primary/30 pb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="font-narrow text-xs font-bold uppercase tracking-widest text-primary">
          AI Voice Pooling • Overlapping Concerns Found ({matches.length})
        </span>
      </div>

      {/* Concern cards */}
      {concerns.length > 0 && (
        <div className="space-y-3">
          {concerns.map((m) => (
            <div
              key={m.id}
              className="p-4 border-2 border-primary bg-card flex items-start gap-4 justify-between transition-all hover:bg-muted/10"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <p className="font-sans text-sm text-foreground line-clamp-2 leading-relaxed">
                  {m.content}
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-narrow text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {ENTITY_LABELS[m.result_type] ?? m.result_type}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSign(m.id)}
                    className="font-narrow text-xs font-bold uppercase tracking-wider border border-primary bg-primary text-primary-foreground px-3 py-1 hover:bg-transparent hover:text-primary transition-all"
                  >
                    Add My Voice 🗣️
                  </button>
                </div>
              </div>
              <SimilarityBadge score={m.similarity} />
            </div>
          ))}
        </div>
      )}

      {/* Entity cards */}
      {entities.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground block">
            Related Government Records
          </span>
          <div className="space-y-2">
            {entities.map((m) => (
              <div
                key={m.id}
                className="p-3 border border-primary/50 bg-muted/20 flex items-center gap-3 text-xs"
              >
                <span className="font-narrow text-[10px] font-bold uppercase tracking-wider border border-primary bg-background px-2 py-0.5 text-primary flex-shrink-0">
                  {ENTITY_LABELS[m.result_type] ?? m.result_type}
                </span>
                <p className="font-sans text-muted-foreground truncate flex-1">
                  {m.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="font-sans text-xs text-muted-foreground leading-relaxed pt-1">
        Found overlapping records? You can add your voice to existing concerns or proceed to file a new public record below.
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function SubmitPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState({ state: '', city: '', area: '' });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  // Semantic match state
  const [matches, setMatches] = useState<SemanticMatch[]>([]);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_CHARS = 5000;

  // ── Debounced semantic search ────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

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

  async function handleSign(concernId: string) {
    const res = await signConcern(concernId);
    if (res.success) {
      router.push(`/track/${concernId}`);
    } else if (res.requiresAuth) {
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
      const captchaToken = 'mock-token';
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
    <main className="min-h-screen bg-background pb-16">
      {/* Broadsheet Masthead Section */}
      <header className="border-b-2 border-t-2 border-primary py-10 bg-card">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-3">
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-1 inline-block">
            Pillar 1 • Citizen Oversight & Public Filing
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight text-primary uppercase">
            Submit a Concern
          </h1>
          <p className="text-muted-foreground font-sans text-base max-w-2xl leading-relaxed">
            Your concern will be published as a public record and automatically aggregated into regional voice pools. No password required — a secure tracking token will be issued.
          </p>
        </div>
      </header>

      {/* Form Section */}
      <section className="container mx-auto px-4 md:px-8 max-w-4xl pt-10">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* AI Notice & Guidelines Callout */}
          <div className="border-2 border-primary bg-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span className="font-narrow text-xs font-bold uppercase tracking-widest">
                Filing Guidelines & Public Oversight Notice
              </span>
            </div>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              <strong className="text-primary font-semibold">Civic Scope Only:</strong> Submissions must relate to public infrastructure, government spending, policy implementation, or official inaction. Factual descriptions enable precise automated matching against parliamentary records and MP expenditure.
            </p>
          </div>

          {/* Jurisdiction & Location Section */}
          <div className="space-y-4 border-2 border-primary bg-card p-6">
            <div className="flex items-center gap-2 border-b border-primary/30 pb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="font-narrow text-xs font-bold uppercase tracking-widest text-primary">
                1. Jurisdiction & Location Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block font-narrow text-xs font-bold uppercase tracking-wider text-primary mb-2">
                  State / Territory *
                </label>
                <input
                  type="text"
                  name="state"
                  value={location.state}
                  onChange={handleLocationChange}
                  placeholder="e.g. Maharashtra"
                  className="w-full border-b-2 border-primary bg-transparent py-2 text-sm font-sans focus:outline-none focus:border-b-4 placeholder:text-muted-foreground/60"
                />
              </div>
              <div>
                <label className="block font-narrow text-xs font-bold uppercase tracking-wider text-primary mb-2">
                  City / District *
                </label>
                <input
                  type="text"
                  name="city"
                  value={location.city}
                  onChange={handleLocationChange}
                  placeholder="e.g. Mumbai"
                  className="w-full border-b-2 border-primary bg-transparent py-2 text-sm font-sans focus:outline-none focus:border-b-4 placeholder:text-muted-foreground/60"
                />
              </div>
              <div>
                <label className="block font-narrow text-xs font-bold uppercase tracking-wider text-primary mb-2">
                  Ward / Area (Optional)
                </label>
                <input
                  type="text"
                  name="area"
                  value={location.area}
                  onChange={handleLocationChange}
                  placeholder="e.g. Bandra West"
                  className="w-full border-b-2 border-primary bg-transparent py-2 text-sm font-sans focus:outline-none focus:border-b-4 placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
          </div>

          {/* Concern Content Section */}
          <div className="space-y-4 border-2 border-primary bg-card p-6">
            <div className="flex items-center justify-between border-b border-primary/30 pb-3">
              <label
                htmlFor="concern-content"
                className="font-narrow text-xs font-bold uppercase tracking-widest text-primary block"
              >
                2. Statement of Concern *
              </label>
              <span className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {charCount} / {MAX_CHARS.toLocaleString()} Chars
              </span>
            </div>

            <textarea
              id="concern-content"
              name="content"
              value={content}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={MAX_CHARS}
              disabled={isPending}
              placeholder="Provide specific details regarding the civic issue, department involved, or unfulfilled promise..."
              className="w-full border-2 border-primary bg-background p-4 text-base font-sans leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-h-[220px] resize-y"
            />

            {error && (
              <p role="alert" className="font-narrow text-xs font-bold uppercase tracking-wider text-destructive border-l-2 border-destructive pl-2">
                ⚠️ {error}
              </p>
            )}

            {/* Semantic Match Panel */}
            <MatchPanel matches={matches} isLoading={isMatchLoading} onSign={handleSign} />
          </div>

          {/* Privacy & Filing Mode Section */}
          <div className="space-y-4 border-2 border-primary bg-card p-6">
            <div className="flex items-center gap-2 border-b border-primary/30 pb-3">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="font-narrow text-xs font-bold uppercase tracking-widest text-primary">
                3. Privacy & Voice Identity Mode
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`p-4 border-2 text-left transition-all flex items-start gap-3 ${
                  !isAnonymous
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-primary/40 bg-background text-primary hover:border-primary'
                }`}
              >
                <User className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-narrow text-xs font-bold uppercase tracking-wider block">Verified Voice</span>
                  <span className="text-xs opacity-80 font-sans block mt-0.5">Sign with Google authentication for verified citizen badge.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`p-4 border-2 text-left transition-all flex items-start gap-3 ${
                  isAnonymous
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-primary/40 bg-background text-primary hover:border-primary'
                }`}
              >
                <EyeOff className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-narrow text-xs font-bold uppercase tracking-wider block">Anonymous Citizen</span>
                  <span className="text-xs opacity-80 font-sans block mt-0.5">File anonymously without personal identity attached.</span>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="pt-4 space-y-3">
            <button
              id="submit-concern-btn"
              type="submit"
              disabled={isPending || content.trim().length < 10}
              className="w-full inline-flex items-center justify-center gap-2 font-narrow text-sm font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground px-8 py-4 hover:bg-transparent hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Publishing to Public Record…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> File Public Concern
                </>
              )}
            </button>
            <p className="font-sans text-xs text-center text-muted-foreground">
              By submitting, your concern becomes an immutable public record for community voice pooling.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}

