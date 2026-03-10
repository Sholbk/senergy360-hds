'use server';

import { createClient } from '@/lib/supabase/server';

export async function createFeedPostAction(
  projectId: string,
  content: string,
  imagePaths: string[],
  documentId?: string,
  visibleTo?: string[]
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated. Please log out and log back in.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'Profile not found. Please contact support.' };
  }

  const { data, error } = await supabase
    .from('feed_posts')
    .insert({
      tenant_id: profile.tenant_id,
      project_id: projectId,
      author_id: user.id,
      content: content.trim(),
      image_paths: imagePaths,
      document_id: documentId || null,
      visible_to: visibleTo || [],
      event_type: 'manual_post',
    })
    .select()
    .single();

  if (error) {
    return { error: 'Failed to create post. Please try again.' };
  }

  return { success: true, post: data };
}

export async function createFeedCommentAction(feedPostId: string, content: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated. Please log out and log back in.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'Profile not found. Please contact support.' };
  }

  const { data, error } = await supabase
    .from('feed_comments')
    .insert({
      feed_post_id: feedPostId,
      author_id: user.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    return { error: 'Failed to add comment. Please try again.' };
  }

  return { success: true, comment: data };
}

export async function deleteFeedPostAction(postId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated. Please log out and log back in.' };
  }

  // Soft delete by setting deleted_at
  const { error } = await supabase
    .from('feed_posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', postId);

  if (error) {
    return { error: 'Failed to delete post. Please try again.' };
  }

  return { success: true };
}

export async function deleteFeedCommentAction(commentId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated. Please log out and log back in.' };
  }

  // Soft delete by setting deleted_at
  const { error } = await supabase
    .from('feed_comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId);

  if (error) {
    return { error: 'Failed to delete comment. Please try again.' };
  }

  return { success: true };
}
