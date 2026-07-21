'use server';

import { createClient } from '@/lib/supabase/server';
import { Filter } from 'bad-words';

export async function startDiscussion(activityId: string) {
  const supabase = await createClient();

  // Check if discussion exists
  const { data: existing, error: selectError } = await supabase
    .from('discussions')
    .select('id')
    .eq('activity_id', activityId)
    .single();

  if (existing) {
    return { success: true, discussionId: existing.id };
  }

  // Handle PGRST116 (No rows found) which is thrown by single() if not found
  if (selectError && selectError.code !== 'PGRST116') {
    return { success: false, error: 'Failed to fetch discussion.' };
  }

  // Insert new discussion
  const { data: newDiscussion, error: insertError } = await supabase
    .from('discussions')
    .insert({ activity_id: activityId })
    .select('id')
    .single();

  if (insertError || !newDiscussion) {
    return { success: false, error: 'Failed to create discussion.' };
  }

  return { success: true, discussionId: newDiscussion.id };
}

export async function createPost(discussionId: string, content: string) {
  const trimmed = content?.trim();
  if (!trimmed) {
    return { success: false, error: 'Content cannot be empty.' };
  }

  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) {
    return { success: false, error: 'You must be logged in to post.' };
  }

  const filter = new Filter();
  const is_flagged = filter.isProfane(trimmed);

  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      discussion_id: discussionId,
      user_id: userData.user.id,
      content: trimmed,
      is_flagged
    })
    .select('id')
    .single();

  if (error || !data) {
    return { success: false, error: 'Failed to create post.' };
  }

  return { success: true, postId: data.id, isFlagged: is_flagged };
}

export async function reportPost(postId: string, reason: string) {
  const trimmed = reason?.trim();
  if (!trimmed) {
    return { success: false, error: 'Reason cannot be empty.' };
  }

  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) {
    return { success: false, error: 'You must be logged in to report a post.' };
  }

  const { data, error } = await supabase
    .from('moderation_reports')
    .insert({
      post_id: postId,
      reported_by: userData.user.id,
      reason: trimmed,
      status: 'pending'
    })
    .select('id')
    .single();

  if (error || !data) {
    return { success: false, error: 'Failed to submit report.' };
  }

  return { success: true, reportId: data.id };
}
