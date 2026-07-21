'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function checkModerator() {
  const cookieStore = await cookies();
  const secret = cookieStore.get('MODERATOR_SECRET')?.value;
  if (!secret || secret !== process.env.MODERATOR_SECRET) {
    throw new Error('Access Denied: You must be a moderator to perform this action.');
  }
}

export async function resolveReport(reportId: string, action: 'dismiss' | 'delete') {
  await checkModerator();
  const supabase = await createClient();

  // 1. Get the report to find the post_id
  const { data: report, error: reportError } = await supabase
    .from('moderation_reports')
    .select('post_id')
    .eq('id', reportId)
    .single();

  if (reportError || !report) {
    throw new Error('Failed to find report.');
  }

  // 2. Update report status to resolved
  const { error: updateError } = await supabase
    .from('moderation_reports')
    .update({ status: 'resolved' })
    .eq('id', reportId);

  if (updateError) {
    throw new Error('Failed to update report status.');
  }

  // 3. If action is delete, delete the post
  if (action === 'delete') {
    const { error: deleteError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', report.post_id);

    if (deleteError) {
      throw new Error('Failed to delete post.');
    }
  }

  revalidatePath('/moderation');
  return { success: true };
}

export async function dismissFlag(postId: string) {
  await checkModerator();
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from('forum_posts')
    .update({ is_flagged: false })
    .eq('id', postId);

  if (updateError) {
    throw new Error('Failed to dismiss flag.');
  }

  revalidatePath('/moderation');
  return { success: true };
}

export async function deletePost(postId: string) {
  await checkModerator();
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId);

  if (deleteError) {
    throw new Error('Failed to delete post.');
  }

  revalidatePath('/moderation');
  return { success: true };
}
