'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveGroup(groupId: string) {
  const supabase = await createClient();

  // Update concern_groups status to 'approved'
  const { error: groupError } = await supabase
    .from('concern_groups')
    .update({ status: 'approved' })
    .eq('id', groupId);

  if (groupError) {
    console.error('Error approving group:', groupError);
    throw new Error('Failed to approve group');
  }

  // Get all concerns linked to this group
  const { data: links, error: linksError } = await supabase
    .from('concern_entity_links')
    .select('concern_id')
    .eq('entity_type', 'concern_group')
    .eq('entity_id', groupId);

  if (linksError) {
    console.error('Error fetching group links:', linksError);
    throw new Error('Failed to fetch linked concerns');
  }

  if (links && links.length > 0) {
    const concernIds = links.map(link => link.concern_id);
    
    // Update status of all linked concerns to 'grouped'
    const { error: concernsError } = await supabase
      .from('concerns')
      .update({ status: 'grouped' })
      .in('id', concernIds);

    if (concernsError) {
      console.error('Error updating concerns:', concernsError);
      throw new Error('Failed to update concerns status');
    }
  }

  revalidatePath('/moderation');
}

export async function rejectGroup(groupId: string) {
  const supabase = await createClient();

  // Update concern_groups status to 'rejected'
  const { error: groupError } = await supabase
    .from('concern_groups')
    .update({ status: 'rejected' })
    .eq('id', groupId);

  if (groupError) {
    console.error('Error rejecting group:', groupError);
    throw new Error('Failed to reject group');
  }

  revalidatePath('/moderation');
}
