'use client';

import { useState } from 'react';
import { deleteFeedCommentAction } from '@/app/(protected)/projects/[id]/feed/actions';

interface FeedCommentProps {
  id: string;
  authorName: string;
  authorId: string;
  content: string;
  createdAt: string;
  currentUserId: string | null;
  currentUserRole: string | null;
  onDeleted: (commentId: string) => void;
}

export default function FeedComment({
  id,
  authorName,
  authorId,
  content,
  createdAt,
  currentUserId,
  currentUserRole,
  onDeleted,
}: FeedCommentProps) {
  const [deleting, setDeleting] = useState(false);

  const canDelete = currentUserRole === 'admin' || currentUserId === authorId;

  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteFeedCommentAction(id);
    if (result.success) {
      onDeleted(id);
    }
    setDeleting(false);
  };

  const timeAgo = formatTimeAgo(createdAt);

  return (
    <div className="flex gap-2 py-2">
      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{authorName}</span>
          <span className="text-[10px] text-muted">{timeAgo}</span>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[10px] text-muted hover:text-red-500 transition-colors ml-auto disabled:opacity-50"
            >
              {deleting ? '...' : 'Delete'}
            </button>
          )}
        </div>
        <p className="text-xs text-foreground mt-0.5">{content}</p>
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
