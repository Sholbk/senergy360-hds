'use client';

import { useState } from 'react';
import { deleteFeedPostAction, createFeedCommentAction } from '@/app/(protected)/projects/[id]/feed/actions';
import FeedComment from '@/components/feed/FeedComment';
import type { FeedEventType } from '@/types';

interface CommentData {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface FeedPostProps {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  imagePaths: string[];
  documentId: string | null;
  documentTitle: string | null;
  eventType: FeedEventType | null;
  visibleTo: string[];
  visibleToNames: string[];
  comments: CommentData[];
  currentUserId: string | null;
  currentUserRole: string | null;
  onDeleted: (postId: string) => void;
  onCommentAdded: (postId: string, comment: CommentData) => void;
  supabaseUrl: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  document_shared: 'Document Shared',
  hds_sent: 'HDS Report Sent',
  invoice_sent: 'Invoice Sent',
};

export default function FeedPost({
  id,
  authorId,
  authorName,
  content,
  createdAt,
  imagePaths,
  documentId,
  documentTitle,
  eventType,
  visibleTo,
  visibleToNames,
  comments,
  currentUserId,
  currentUserRole,
  onDeleted,
  onCommentAdded,
  supabaseUrl,
}: FeedPostProps) {
  const [deleting, setDeleting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const canDelete = currentUserRole === 'admin' || currentUserId === authorId;
  const isSystemEvent = eventType && eventType !== 'manual_post';

  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteFeedPostAction(id);
    if (result.success) {
      onDeleted(id);
    }
    setDeleting(false);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);

    const result = await createFeedCommentAction(id, commentText);
    if (result.success && result.comment) {
      onCommentAdded(id, {
        id: result.comment.id,
        authorId: result.comment.author_id,
        authorName: 'You',
        content: result.comment.content,
        createdAt: result.comment.created_at,
      });
      setCommentText('');
    }

    setSubmittingComment(false);
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const timeAgo = formatTimeAgo(createdAt);

  const visibilityLabel =
    visibleTo.length === 0
      ? 'All'
      : visibleToNames.length > 0
        ? visibleToNames.join(', ')
        : `${visibleTo.length} people`;

  return (
    <div
      className={`rounded-lg border border-border p-4 mb-4 ${
        isSystemEvent ? 'bg-primary/5 border-primary/20' : 'bg-card-bg'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{authorName}</span>
            {isSystemEvent && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {EVENT_TYPE_LABELS[eventType] || eventType}
              </span>
            )}
            <span className="text-xs text-muted">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <svg className="w-3 h-3 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-[10px] text-muted">Shared with: {visibilityLabel}</span>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-muted hover:text-red-500 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {deleting ? '...' : 'Delete'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-3 ml-12">
        <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>

        {/* Image gallery */}
        {imagePaths.length > 0 && (
          <div className={`mt-3 grid gap-2 ${imagePaths.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {imagePaths.map((path, index) => (
              <div key={index} className="rounded-md overflow-hidden border border-border">
                <img
                  src={`${supabaseUrl}/storage/v1/object/public/feed-images/${path}`}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Document link */}
        {documentId && (
          <div className="mt-3 flex items-center gap-2 p-2 rounded-md border border-border bg-background">
            <svg className="w-4 h-4 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-sm text-primary truncate">{documentTitle || 'Attached document'}</span>
          </div>
        )}

        {/* Comments */}
        {comments.length > 0 && (
          <div className="mt-4 border-t border-border pt-3 space-y-1">
            {comments.map((comment) => (
              <FeedComment
                key={comment.id}
                id={comment.id}
                authorName={comment.authorName}
                authorId={comment.authorId}
                content={comment.content}
                createdAt={comment.createdAt}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onDeleted={(commentId) => {
                  // The parent page handles state updates
                  onCommentAdded(id, { ...comment, id: `deleted:${commentId}` });
                }}
              />
            ))}
          </div>
        )}

        {/* Comment input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleCommentKeyDown}
            placeholder="Write a comment..."
            maxLength={2000}
            className="flex-1 px-3 py-1.5 border border-border rounded-md text-xs bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleAddComment}
            disabled={submittingComment || !commentText.trim()}
            className="px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {submittingComment ? '...' : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
