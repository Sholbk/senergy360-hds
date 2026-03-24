'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import type { DocumentType, DocumentVisibility } from '@/types';

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'proposal_contract', label: 'Proposal / Contract' },
  { value: 'core_principles', label: 'Core Principles' },
  { value: 'core_systems_field_guide', label: 'Core Systems Field Guide' },
  { value: 'contract_recommendations', label: 'Contract Recommendations' },
  { value: 'building_science', label: 'Building Science' },
  { value: 'environmental_testing', label: 'Environmental Testing' },
  { value: 'owners_manual_intro', label: "Owner's Manual Intro" },
  { value: 'hds_checklist', label: 'HDS Checklist' },
  { value: 'hds_trade_section', label: 'HDS Trade Section' },
  { value: 'custom', label: 'Custom' },
];

const VISIBILITY_OPTIONS: { value: DocumentVisibility; label: string }[] = [
  { value: 'admin_only', label: 'Admin Only' },
  { value: 'client', label: 'Client' },
  { value: 'professional', label: 'Professional' },
  { value: 'all_participants', label: 'All Participants' },
];

interface DocumentUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
  projectId: string;
}

export default function DocumentUpload({
  isOpen,
  onClose,
  onUpload,
  projectId,
}: DocumentUploadProps) {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('custom');
  const [visibility, setVisibility] = useState<DocumentVisibility>('admin_only');
  const [description, setDescription] = useState('');
  const [signatureRequired, setSignatureRequired] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadDate, setUploadDate] = useState('');
  const [uploadTime, setUploadTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputClass =
    'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  const resetForm = () => {
    setTitle('');
    setDocumentType('custom');
    setVisibility('admin_only');
    setDescription('');
    setSignatureRequired(false);
    setFile(null);
    setUploadDate('');
    setUploadTime('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.set('title', title.trim());
      formData.set('documentType', documentType);
      formData.set('visibility', visibility);
      formData.set('description', description.trim());
      formData.set('projectId', projectId);
      formData.set('signatureRequired', String(signatureRequired));
      if (file) {
        formData.set('file', file);
      }
      if (uploadDate) {
        const timestamp = new Date(`${uploadDate}T${uploadTime || '00:00'}`).toISOString();
        formData.set('uploadTimestamp', timestamp);
      }

      await onUpload(formData);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to upload document: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Document" maxWidth="max-w-xl">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Document title"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Document Type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            className={inputClass}
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as DocumentVisibility)}
            className={inputClass}
          >
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            File (PDF, Images)
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFile(f);
              if (f && !uploadDate) {
                const now = new Date();
                setUploadDate(now.toISOString().split('T')[0]);
                setUploadTime(now.toTimeString().slice(0, 5));
              }
            }}
            className={inputClass}
          />
          {file && (
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Date Stamp</label>
                <input
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Time Stamp</label>
                <input
                  type="time"
                  value={uploadTime}
                  onChange={(e) => setUploadTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Brief description of this document..."
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="signatureRequired"
            checked={signatureRequired}
            onChange={(e) => setSignatureRequired(e.target.checked)}
            className="rounded border-border"
          />
          <label htmlFor="signatureRequired" className="text-sm text-foreground">
            Requires signature
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !title.trim()}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
