'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitConcern } from '@/app/actions/submitConcern';

export default function SubmitPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 5000;

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);
    setCharCount(val.length);
    if (error) setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await submitConcern(content);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/track/${result.trackingToken}`);
    });
  }

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
            PrajaNeeti · MakeGovAccountable
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
