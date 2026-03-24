'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import { isValidUUID } from '@/lib/utils';
import { uploadFile, generateFilePath, STORAGE_BUCKETS } from '@/lib/supabase/storage';

/* ---------- Types ---------- */

interface ReportPhotoRow {
  id: string;
  storage_path: string;
  file_name: string;
  caption: string | null;
  category: string | null;
  sort_order: number;
  created_at: string;
}

interface ReportDoc {
  id: string;
  title: string;
  description: string | null;
  storage_path: string;
  file_name: string;
  file_size_bytes: number | null;
  created_at: string;
}

interface ParticipantEmail {
  id: string;
  name: string;
  email: string;
  role: string;
}

/* ---------- Helpers ---------- */

const PHOTO_CATEGORIES = [
  'Exterior',
  'Interior',
  'HVAC',
  'Plumbing',
  'Electrical',
  'Foundation',
  'Roof',
  'Insulation',
  'Other',
];

function formatFileSize(bytes: number | null): string {
  if (bytes == null || bytes === 0) return '0 KB';
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/* ---------- Component ---------- */

export default function ProjectReportsPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  /* --- core state --- */
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* --- photos --- */
  const [photos, setPhotos] = useState<ReportPhotoRow[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editCategory, setEditCategory] = useState('');

  /* --- reports --- */
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [generating, setGenerating] = useState(false);

  /* --- send modal --- */
  const [participants, setParticipants] = useState<ParticipantEmail[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendDocId, setSendDocId] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  /* --- upload modal --- */
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [uploadCaptions, setUploadCaptions] = useState<string[]>([]);
  const [uploadCategories, setUploadCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ============================== Data Loading ============================== */

  const loadData = useCallback(async () => {
    if (!projectId || !isValidUUID(projectId)) return;

    // Project name
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();

    if (project) setProjectName(project.name);

    // Report photos
    const { data: photosData } = await supabase
      .from('report_photos')
      .select('id, storage_path, file_name, caption, category, sort_order, created_at')
      .eq('project_id', projectId)
      .order('sort_order');

    if (photosData) {
      setPhotos(photosData);
      // Generate signed URLs for each photo
      const urls: Record<string, string> = {};
      for (const photo of photosData) {
        const { data } = await supabase.storage
          .from('documents')
          .createSignedUrl(photo.storage_path, 3600);
        if (data?.signedUrl) urls[photo.id] = data.signedUrl;
      }
      setPhotoUrls(urls);
    }

    // Generated reports
    const { data: reportsData } = await supabase
      .from('documents')
      .select('id, title, description, storage_path, file_name, file_size_bytes, created_at')
      .eq('project_id', projectId)
      .eq('document_type', 'hds_checklist')
      .eq('mime_type', 'application/pdf')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (reportsData) setReports(reportsData);

    // Participants for send modal
    const { data: participantsData } = await supabase
      .from('project_participants')
      .select(
        'id, project_role, organizations(primary_email, business_name, primary_first_name, primary_last_name)'
      )
      .eq('project_id', projectId);

    if (participantsData) {
      const list: ParticipantEmail[] = [];
      for (const pp of participantsData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const org = pp.organizations as any;
        if (org?.primary_email) {
          list.push({
            id: pp.id,
            name:
              org.business_name ||
              `${org.primary_first_name ?? ''} ${org.primary_last_name ?? ''}`.trim(),
            email: org.primary_email,
            role: pp.project_role,
          });
        }
      }
      setParticipants(list);
    }

    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ============================== Photo Upload ============================== */

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadFiles((prev) => [...prev, ...files]);
    setUploadCaptions((prev) => [...prev, ...files.map(() => '')]);
    setUploadCategories((prev) => [...prev, ...files.map(() => '')]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadPreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadCaptions((prev) => prev.filter((_, i) => i !== index));
    setUploadCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single();

      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const path = generateFilePath(profile?.tenant_id || 'default', projectId, file.name);
        const result = await uploadFile(STORAGE_BUCKETS.DOCUMENTS, path, file);

        if (result.error) {
          setError(`Failed to upload ${file.name}: ${result.error}`);
          continue;
        }

        await supabase.from('report_photos').insert({
          tenant_id: profile?.tenant_id,
          project_id: projectId,
          storage_path: result.path,
          file_name: file.name,
          caption: uploadCaptions[i] || null,
          category: uploadCategories[i] || null,
          sort_order: photos.length + i,
          uploaded_by: user?.id,
        });
      }

      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadPreviews([]);
      setUploadCaptions([]);
      setUploadCategories([]);
      await loadData();
    } catch {
      setError('An unexpected error occurred while uploading photos.');
    }

    setUploading(false);
  };

  /* ============================== Photo Edit / Delete ============================== */

  const startEditPhoto = (photo: ReportPhotoRow) => {
    setEditingPhotoId(photo.id);
    setEditCaption(photo.caption || '');
    setEditCategory(photo.category || '');
  };

  const savePhotoEdit = async (photoId: string) => {
    await supabase
      .from('report_photos')
      .update({ caption: editCaption || null, category: editCategory || null })
      .eq('id', photoId);

    setEditingPhotoId(null);
    await loadData();
  };

  const deletePhoto = async (photo: ReportPhotoRow) => {
    if (!confirm(`Delete photo "${photo.file_name}"?`)) return;

    await supabase.storage.from('documents').remove([photo.storage_path]);
    await supabase.from('report_photos').delete().eq('id', photo.id);
    await loadData();
  };

  /* ============================== Generate Report ============================== */

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await fetch(`/api/reports/${projectId}/generate`, { method: 'POST' });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to generate report.');
      } else {
        await loadData();
      }
    } catch {
      setError('An unexpected error occurred while generating the report.');
    }

    setGenerating(false);
  };

  /* ============================== Download Report ============================== */

  const handleDownload = async (storagePath: string) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(storagePath, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  /* ============================== Send Report ============================== */

  const openSendModal = (docId: string) => {
    setSendDocId(docId);
    setSelectedRecipients([]);
    setCustomMessage('');
    setShowSendModal(true);
  };

  const toggleRecipient = (email: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSend = async () => {
    if (selectedRecipients.length === 0) return;
    setSending(true);
    setError('');

    try {
      const response = await fetch(`/api/reports/${projectId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: sendDocId,
          recipients: selectedRecipients,
          customMessage,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to send report.');
      } else {
        setShowSendModal(false);
        setSelectedRecipients([]);
        setCustomMessage('');
      }
    } catch {
      setError('An unexpected error occurred while sending the report.');
    }

    setSending(false);
  };

  /* ============================== Render ============================== */

  if (loading) {
    return <p className="text-muted text-sm">Loading...</p>;
  }

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => router.push('/projects')}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Projects
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-2">{projectName}</h1>


      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {/* ===================== Report Photos Section ===================== */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Report Photos</h2>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Upload Photos
          </button>
        </div>

        {photos.length === 0 ? (
          <p className="text-sm text-muted">No report photos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-card-bg rounded-lg border border-border overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black/5">
                  {photoUrls[photo.id] ? (
                    <img
                      src={photoUrls[photo.id]}
                      alt={photo.caption || photo.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                      Loading...
                    </div>
                  )}
                  {/* Delete button */}
                  <button
                    onClick={() => deletePhoto(photo)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    title="Delete photo"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Caption & Category */}
                <div className="p-3">
                  {editingPhotoId === photo.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        placeholder="Caption"
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">No category</option>
                        {PHOTO_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => savePhotoEdit(photo.id)}
                          className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPhotoId(null)}
                          className="px-3 py-1 text-xs border border-border text-muted rounded hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={() => startEditPhoto(photo)}
                      title="Click to edit"
                    >
                      <p className="text-sm text-foreground truncate">
                        {photo.caption || (
                          <span className="text-muted italic">No caption</span>
                        )}
                      </p>
                      {photo.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                          {photo.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===================== Generated Reports Section ===================== */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Generated Reports</h2>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {reports.length === 0 ? (
          <p className="text-sm text-muted">No reports generated yet.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-card-bg rounded-lg border border-border p-4 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground truncate">{report.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted">{formatDate(report.created_at)}</span>
                    <span className="text-xs text-muted">
                      {formatFileSize(report.file_size_bytes)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => handleDownload(report.storage_path)}
                    className="px-3 py-1.5 text-xs border border-border rounded-md text-muted hover:text-foreground hover:border-primary transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => openSendModal(report.id)}
                    className="px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===================== Upload Photos Modal ===================== */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          if (!uploading) {
            setShowUploadModal(false);
            setUploadFiles([]);
            setUploadPreviews([]);
            setUploadCaptions([]);
            setUploadCategories([]);
          }
        }}
        title="Upload Report Photos"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {/* File picker */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 text-sm border border-border rounded-md text-muted hover:text-foreground hover:border-primary transition-colors disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Select Images
              </span>
            </button>
          </div>

          {/* Preview list with caption / category inputs */}
          {uploadPreviews.length > 0 && (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {uploadPreviews.map((preview, index) => (
                <div
                  key={index}
                  className="flex gap-4 bg-card-bg rounded-lg border border-border p-3"
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 h-24 rounded-md overflow-hidden border border-border shrink-0">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeUploadFile(index)}
                      disabled={uploading}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80"
                    >
                      x
                    </button>
                  </div>

                  {/* Caption & category */}
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-muted truncate">{uploadFiles[index]?.name}</p>
                    <input
                      type="text"
                      value={uploadCaptions[index] || ''}
                      onChange={(e) => {
                        const next = [...uploadCaptions];
                        next[index] = e.target.value;
                        setUploadCaptions(next);
                      }}
                      placeholder="Caption (optional)"
                      disabled={uploading}
                      className="w-full px-2 py-1 text-sm border border-border rounded bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                      value={uploadCategories[index] || ''}
                      onChange={(e) => {
                        const next = [...uploadCategories];
                        next[index] = e.target.value;
                        setUploadCategories(next);
                      }}
                      disabled={uploading}
                      className="w-full px-2 py-1 text-sm border border-border rounded bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">No category</option>
                      {PHOTO_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {uploadFiles.length > 0 && (
            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {uploading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {uploading
                  ? 'Uploading...'
                  : `Upload ${uploadFiles.length} Photo${uploadFiles.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* ===================== Send Report Modal ===================== */}
      <Modal
        isOpen={showSendModal}
        onClose={() => {
          if (!sending) {
            setShowSendModal(false);
            setSelectedRecipients([]);
            setCustomMessage('');
          }
        }}
        title="Send Report"
      >
        <div className="space-y-4">
          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Recipients</label>
            {participants.length === 0 ? (
              <p className="text-sm text-muted">
                No participants with email addresses found for this project.
              </p>
            ) : (
              <div className="space-y-2">
                {participants.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-black/5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(p.email)}
                      onChange={() => toggleRecipient(p.email)}
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{p.name}</p>
                      <p className="text-xs text-muted truncate">{p.email}</p>
                      <span className="text-xs text-muted capitalize">{p.role}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Custom message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Custom Message (optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              placeholder="Add a personal note to the email..."
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              onClick={() => {
                setShowSendModal(false);
                setSelectedRecipients([]);
                setCustomMessage('');
              }}
              disabled={sending}
              className="px-4 py-2 text-sm border border-border rounded-md text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || selectedRecipients.length === 0}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {sending && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
