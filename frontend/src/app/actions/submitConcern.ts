'use server';

import { createClient } from '@/lib/supabase/server';

// ── Types ──────────────────────────────────────────────────────────────────

export type SubmitConcernResult =
  | { success: true; trackingToken: string }
  | { success: false; error: string };

export interface SemanticMatch {
  id: string;
  content: string;
  similarity: number;
  result_type: 'concern' | 'politician' | 'department' | 'court' | 'activity';
}

export interface SemanticMatchResult {
  matches: SemanticMatch[];
  error?: string;
}

// ── OpenAI Embedding via native fetch ─────────────────────────────────────

/**
 * Calls the OpenAI Embeddings API using native `fetch`.
 * Model: text-embedding-3-small (1536 dimensions, lower cost than ada-002).
 *
 * @param text  The text to embed.
 * @returns     A flat array of 1536 floats, or null on failure.
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[generateEmbedding] OPENAI_API_KEY not set — skipping embedding.');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000), // model max context safeguard
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[generateEmbedding] OpenAI API error:', response.status, err);
      return null;
    }

    const json = (await response.json()) as {
      data: Array<{ embedding: number[] }>;
    };
    return json.data[0]?.embedding ?? null;
  } catch (err) {
    console.error('[generateEmbedding] fetch error:', err);
    return null;
  }
}

// ── Server Actions ─────────────────────────────────────────────────────────

/**
 * Server action — generates an embedding for `content` and calls the
 * `match_concerns` Supabase RPC to surface semantically similar concerns
 * and related government entities in real time during user submission.
 *
 * Non-blocking: if the OpenAI API is unavailable the action returns an
 * empty match list rather than an error.
 *
 * @param content  The draft concern text typed by the user.
 * @returns        Up to 8 semantic matches with similarity scores.
 */
export async function getSemanticMatches(
  content: string
): Promise<SemanticMatchResult> {
  const trimmed = content?.trim();
  if (!trimmed || trimmed.length < 10) {
    return { matches: [] };
  }

  // 1. Generate embedding
  const embedding = await generateEmbedding(trimmed);
  if (!embedding) {
    // Graceful degradation — no matches without an embedding
    return { matches: [], error: 'Embedding unavailable; showing no suggestions.' };
  }

  // 2. Call the match_concerns RPC
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('match_concerns', {
    query_embedding: embedding,
    match_threshold: 0.55,
    match_count: 6,
  });

  if (error) {
    console.error('[getSemanticMatches] RPC error:', error);
    return { matches: [], error: 'Could not retrieve matches.' };
  }

  return { matches: (data as SemanticMatch[]) ?? [] };
}

/**
 * Server action — validates, optionally embeds, then inserts an anonymous
 * concern into the `concerns` table and returns the tracking_token UUID.
 *
 * @param content  The raw text of the citizen's concern.
 * @returns        The `tracking_token` UUID so the caller can redirect to /track/[uuid].
 */
export async function submitConcern(
  content: string,
  location?: { state?: string; city?: string; area?: string },
  captchaToken?: string
): Promise<SubmitConcernResult> {
  // Basic validation
  const trimmed = content?.trim();
  if (!trimmed || trimmed.length < 10) {
    return {
      success: false,
      error: 'Concern must be at least 10 characters long.',
    };
  }

  if (trimmed.length > 5000) {
    return {
      success: false,
      error: 'Concern must not exceed 5,000 characters.',
    };
  }

  // Basic CAPTCHA verification (mocked if no secret is provided)
  const captchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (captchaSecret && captchaToken) {
    try {
      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${captchaSecret}&response=${captchaToken}`,
      });
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success) {
        return { success: false, error: 'CAPTCHA verification failed. Please try again.' };
      }
    } catch (e) {
      console.error('[submitConcern] CAPTCHA verification error:', e);
      return { success: false, error: 'Failed to verify CAPTCHA. Please try again.' };
    }
  } else if (captchaSecret && !captchaToken) {
    return { success: false, error: 'CAPTCHA token is required.' };
  }

  // Generate embedding for the concern (best-effort — non-blocking)
  const embedding = await generateEmbedding(trimmed);

  const supabase = await createClient();

  const insertPayload: Record<string, unknown> = { 
    content: trimmed,
    state: location?.state || null,
    city: location?.city || null,
    area: location?.area || null,
  };
  if (embedding) {
    // Insert as a JSON-serialised array; Supabase casts to vector(1536)
    insertPayload.embedding = JSON.stringify(embedding);
  }

  const { data, error } = await supabase
    .from('concerns')
    .insert(insertPayload)
    .select('tracking_token')
    .single();

  if (error || !data?.tracking_token) {
    console.error('[submitConcern] Supabase insert error:', error);
    return {
      success: false,
      error: 'Failed to publish. Please check your connection and try again.',
    };
  }

  return { success: true, trackingToken: data.tracking_token as string };
}
