'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FeedPostRow {
  id: string;
  tenant_id: string;
  project_id: string;
  author_id: string;
  content: string;
  visible_to: string[];
  document_id: string | null;
  image_paths: string[];
  event_type: string | null;
  event_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface FeedCommentRow {
  id: string;
  feed_post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface UseRealtimeFeedOptions {
  projectId: string;
  onNewPost: (post: FeedPostRow) => void;
  onNewComment: (comment: FeedCommentRow) => void;
}

export function useRealtimeFeed({ projectId, onNewPost, onNewComment }: UseRealtimeFeedOptions) {
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`feed:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feed_posts',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          onNewPost(payload.new as FeedPostRow);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feed_comments',
        },
        (payload) => {
          onNewComment(payload.new as FeedCommentRow);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, onNewPost, onNewComment]);
}
