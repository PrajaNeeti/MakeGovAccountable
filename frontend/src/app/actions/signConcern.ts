'use server';

import { createClient } from '@/lib/supabase/server';

export type SignConcernResult =
  | { success: true }
  | { success: false; error: string; requiresAuth?: boolean };

export async function signConcern(concernId: string): Promise<SignConcernResult> {
  const supabase = await createClient();

  // 1. Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: 'You must be signed in to add your voice.',
      requiresAuth: true,
    };
  }

  // 2. Insert signature
  const { error: insertError } = await supabase
    .from('signatures')
    .insert({
      concern_id: concernId,
      user_id: user.id,
    });

  if (insertError) {
    console.error('[signConcern] Supabase insert error:', insertError);
    // Code 23505 is PostgreSQL's unique_violation
    if (insertError.code === '23505') {
      return {
        success: false,
        error: 'You have already added your voice to this concern.',
      };
    }
    return {
      success: false,
      error: 'Failed to record your signature. Please try again.',
    };
  }

  return { success: true };
}
