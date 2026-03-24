'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import FeedComposer from '@/components/feed/FeedComposer';
import FeedPost from '@/components/feed/FeedPost';
import { useRealtimeFeed } from '@/lib/hooks/useRealtimeFeed';
import { useAuth } from '@/lib/hooks/useAuth';

interface CommentData {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface PostData {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  imagePaths: string[];
  documentId: string | null;
  documentTitle: string | null;
  eventType: string | null;
  visibleTo: string[];
  visibleToNames: string[];
  comments: CommentData[];
}

export default function ProjectFeedPage() {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';
  const [supabase] = useState(() => createClient());
  const { userId, tenantId, role } = useAuth();

  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  const fetchPosts = useCallback(async () => {
    // Fetch project name
    const { data: projectData } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();

    if (projectData) {
      setProjectName(projectData.name);
    }

    // Fetch feed posts with author profiles
    const { data: postsData } = await supabase
      .from('feed_posts')
      .select(`
        id,
        author_id,
        content,
        created_at,
        image_paths,
        document_id,
        event_type,
        visible_to,
        profiles!feed_posts_author_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (!postsData) {
      setPosts([]);
      setLoading(false);
      return;
    }

    // Fetch all comments for these posts
    const postIds = postsData.map((p) => p.id);
    const { data: commentsData } = postIds.length > 0
      ? await supabase
          .from('feed_comments')
          .select(`
            id,
            feed_post_id,
            author_id,
            content,
            created_at,
            profiles!feed_comments_author_id_fkey (
              first_name,
              last_name
            )
          `)
          .in('feed_post_id', postIds)
          .is('deleted_at', null)
          .order('created_at', { ascending: true })
      : { data: [] };

    // Group comments by post
    const commentsByPost = new Map<string, CommentData[]>();
    for (const c of commentsData || []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profile = c.profiles as any;
      const authorName = profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : 'Unknown';

      const comment: CommentData = {
        id: c.id,
        authorId: c.author_id,
        authorName,
        content: c.content,
        createdAt: c.created_at,
      };

      const existing = commentsByPost.get(c.feed_post_id) || [];
      existing.push(comment);
      commentsByPost.set(c.feed_post_id, existing);
    }

    // Resolve visible_to names
    const allVisibleIds = new Set<string>();
    for (const p of postsData) {
      for (const vid of (p.visible_to || [])) {
        allVisibleIds.add(vid);
      }
    }

    const visibleNamesMap = new Map<string, string>();
    if (allVisibleIds.size > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', Array.from(allVisibleIds));

      for (const p of profilesData || []) {
        visibleNamesMap.set(p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim());
      }
    }

    // Fetch document titles for posts with documents
    const docIds = postsData.filter((p) => p.document_id).map((p) => p.document_id!);
    const docTitlesMap = new Map<string, string>();
    if (docIds.length > 0) {
      const { data: docsData } = await supabase
        .from('documents')
        .select('id, title')
        .in('id', docIds);

      for (const d of docsData || []) {
        docTitlesMap.set(d.id, d.title);
      }
    }

    const mappedPosts: PostData[] = postsData.map((p) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profile = p.profiles as any;
      const authorName = profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : 'Unknown';

      return {
        id: p.id,
        authorId: p.author_id,
        authorName,
        content: p.content,
        createdAt: p.created_at,
        imagePaths: p.image_paths || [],
        documentId: p.document_id,
        documentTitle: p.document_id ? (docTitlesMap.get(p.document_id) || null) : null,
        eventType: p.event_type,
        visibleTo: p.visible_to || [],
        visibleToNames: (p.visible_to || []).map((vid: string) => visibleNamesMap.get(vid) || vid),
        comments: commentsByPost.get(p.id) || [],
      };
    });

    setPosts(mappedPosts);
    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Realtime subscriptions
  const handleNewPost = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (newPostRow: any) => {
      // Fetch the author profile for the new post
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', newPostRow.author_id)
        .single();

      const authorName = profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : 'Unknown';

      const newPost: PostData = {
        id: newPostRow.id,
        authorId: newPostRow.author_id,
        authorName,
        content: newPostRow.content,
        createdAt: newPostRow.created_at,
        imagePaths: newPostRow.image_paths || [],
        documentId: newPostRow.document_id,
        documentTitle: null,
        eventType: newPostRow.event_type,
        visibleTo: newPostRow.visible_to || [],
        visibleToNames: [],
        comments: [],
      };

      setPosts((prev) => {
        // Avoid duplicate if we already have this post
        if (prev.some((p) => p.id === newPost.id)) return prev;
        return [newPost, ...prev];
      });
    },
    [supabase]
  );

  const handleNewComment = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (newCommentRow: any) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', newCommentRow.author_id)
        .single();

      const authorName = profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : 'Unknown';

      const newComment: CommentData = {
        id: newCommentRow.id,
        authorId: newCommentRow.author_id,
        authorName,
        content: newCommentRow.content,
        createdAt: newCommentRow.created_at,
      };

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== newCommentRow.feed_post_id) return post;
          // Avoid duplicate
          if (post.comments.some((c) => c.id === newComment.id)) return post;
          return { ...post, comments: [...post.comments, newComment] };
        })
      );
    },
    [supabase]
  );

  useRealtimeFeed({
    projectId,
    onNewPost: handleNewPost,
    onNewComment: handleNewComment,
  });

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleCommentAdded = (postId: string, comment: CommentData) => {
    // Handle deletion callback from FeedComment
    if (comment.id.startsWith('deleted:')) {
      const deletedId = comment.id.replace('deleted:', '');
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return { ...post, comments: post.comments.filter((c) => c.id !== deletedId) };
        })
      );
      return;
    }

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        // Avoid duplicate
        if (post.comments.some((c) => c.id === comment.id)) return post;
        return { ...post, comments: [...post.comments, comment] };
      })
    );
  };

  return (
    <div>
      <button
        onClick={() => window.history.back()}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Projects
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-4">{projectName || 'Project'} Feed</h1>


      <div className="max-w-2xl">
        <FeedComposer
          projectId={projectId}
          tenantId={tenantId}
          onPostCreated={fetchPosts}
        />

        {loading ? (
          <p className="text-sm text-muted">Loading feed...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted text-sm">No posts yet. Share an update with the project team!</p>
          </div>
        ) : (
          posts.map((post) => (
            <FeedPost
              key={post.id}
              id={post.id}
              authorId={post.authorId}
              authorName={post.authorName}
              content={post.content}
              createdAt={post.createdAt}
              imagePaths={post.imagePaths}
              documentId={post.documentId}
              documentTitle={post.documentTitle}
              eventType={post.eventType as import('@/types').FeedEventType | null}
              visibleTo={post.visibleTo}
              visibleToNames={post.visibleToNames}
              comments={post.comments}
              currentUserId={userId}
              currentUserRole={role}
              onDeleted={handlePostDeleted}
              onCommentAdded={handleCommentAdded}
              supabaseUrl={supabaseUrl}
            />
          ))
        )}
      </div>
    </div>
  );
}
