'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type SubmitConcernResult =
  | { success: true; trackingToken: string }
  | { success: false; error: string };

/**
 * Server action — inserts an anonymous concern into the `concerns` table.
 *
 * @param content  The raw text of the citizen's concern.
 * @returns        The `tracking_token` UUID so the caller can redirect to /track/[uuid].
 */
export async function submitConcern(
  content: string
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

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('concerns')
    .insert({ content: trimmed })
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
