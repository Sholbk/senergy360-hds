'use client';

import { useState, useRef, useEffect } from 'react';
import { createFeedPostAction } from '@/app/(protected)/projects/[id]/feed/actions';
import { uploadFile, generateFilePath, STORAGE_BUCKETS } from '@/lib/supabase/storage';
import { createClient } from '@/lib/supabase/client';

interface Participant {
  userId: string;
  name: string;
  role: string;
}

interface FeedComposerProps {
  projectId: string;
  tenantId: string | null;
  onPostCreated: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  property_owner: 'Property Owner',
  architect: 'Architect',
  general_contractor: 'General Contractor',
  trade: 'Trade',
};

export default function FeedComposer({ projectId, tenantId, onPostCreated }: FeedComposerProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Visibility
  const [supabase] = useState(() => createClient());
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [visibilityMode, setVisibilityMode] = useState<'all' | 'selected'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);

  useEffect(() => {
    async function loadParticipants() {
      const { data } = await supabase
        .from('project_participants')
        .select('project_role, organizations(user_id, primary_first_name, primary_last_name)')
        .eq('project_id', projectId);

      if (data) {
        const mapped: Participant[] = [];
        for (const p of data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const org = p.organizations as any;
          if (org?.user_id) {
            mapped.push({
              userId: org.user_id,
              name: `${org.primary_first_name || ''} ${org.primary_last_name || ''}`.trim() || 'Unknown',
              role: p.project_role || 'other',
            });
          }
        }
        setParticipants(mapped);
      }
    }
    loadParticipants();
  }, [supabase, projectId]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = 4 - images.length;
    const newFiles = files.slice(0, remaining);

    setImages((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) return;
    setPosting(true);
    setError('');

    try {
      // Upload images first
      const uploadedPaths: string[] = [];
      for (const image of images) {
        const path = generateFilePath(tenantId || 'default', projectId, image.name);
        const result = await uploadFile(STORAGE_BUCKETS.FEED_IMAGES, path, image);
        if (result.error) {
          setError(`Failed to upload image: ${result.error}`);
          setPosting(false);
          return;
        }
        uploadedPaths.push(result.path);
      }

      const visibleTo = visibilityMode === 'selected' ? Array.from(selectedUserIds) : [];

      const result = await createFeedPostAction(projectId, content, uploadedPaths, undefined, visibleTo);
      if (result.error) {
        setError(result.error);
      } else {
        setContent('');
        setImages([]);
        setImagePreviews([]);
        setVisibilityMode('all');
        setSelectedUserIds(new Set());
        setShowVisibilityPicker(false);
        onPostCreated();
      }
    } catch {
      setError('An unexpected error occurred.');
    }

    setPosting(false);
  };

  return (
    <div className="bg-card-bg rounded-lg border border-border p-4 mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share an update with the project team..."
        rows={3}
        maxLength={5000}
        className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />

      {/* Image previews */}
      {imagePreviews.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-border">
              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Visibility picker */}
      {showVisibilityPicker && (
        <div className="mt-3 border border-border rounded-md p-3 bg-background">
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                checked={visibilityMode === 'all'}
                onChange={() => setVisibilityMode('all')}
                className="accent-primary"
              />
              All team members
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                checked={visibilityMode === 'selected'}
                onChange={() => setVisibilityMode('selected')}
                className="accent-primary"
              />
              Selected members only
            </label>
          </div>

          {visibilityMode === 'selected' && participants.length > 0 && (
            <div className="space-y-1 mt-2">
              {participants.map((p) => (
                <label key={p.userId} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.has(p.userId)}
                    onChange={() => toggleUser(p.userId)}
                    className="accent-primary"
                  />
                  <span className="text-foreground">{p.name}</span>
                  <span className="text-xs text-muted">({ROLE_LABELS[p.role] || p.role})</span>
                </label>
              ))}
            </div>
          )}
          {visibilityMode === 'selected' && participants.length === 0 && (
            <p className="text-xs text-muted mt-1">No team members with portal accounts found.</p>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= 4}
            className="px-3 py-1.5 text-xs border border-border rounded-md text-muted hover:text-foreground hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Photo {images.length > 0 ? `(${images.length}/4)` : ''}
            </span>
          </button>
          <button
            onClick={() => setShowVisibilityPicker(!showVisibilityPicker)}
            className={`px-3 py-1.5 text-xs border rounded-md transition-colors ${
              showVisibilityPicker || visibilityMode === 'selected'
                ? 'border-primary text-primary'
                : 'border-border text-muted hover:text-foreground hover:border-primary'
            }`}
          >
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {visibilityMode === 'all'
                ? 'Visible to All'
                : `${selectedUserIds.size} selected`}
            </span>
          </button>
        </div>

        <button
          onClick={handlePost}
          disabled={posting || (!content.trim() && images.length === 0)}
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}
