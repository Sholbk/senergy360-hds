import type { SupabaseClient } from '@supabase/supabase-js';
import type { FeedEventType } from '@/types';

/**
 * Posts an automatic activity entry to the project feed.
 * Call this after any project action (calendar, documents, checklist, team, etc.)
 */
export async function postFeedActivity(
  supabase: SupabaseClient,
  opts: {
    projectId: string;
    content: string;
    eventType: FeedEventType;
    eventMetadata?: Record<string, unknown>;
    documentId?: string;
  }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile) return;

  await supabase.from('feed_posts').insert({
    tenant_id: profile.tenant_id,
    project_id: opts.projectId,
    author_id: user.id,
    content: opts.content,
    event_type: opts.eventType,
    event_metadata: opts.eventMetadata || null,
    document_id: opts.documentId || null,
    visible_to: [],
    image_paths: [],
  });
}
