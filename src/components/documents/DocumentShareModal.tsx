'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import type { Document } from '@/types';

interface Participant {
  id: string;
  name: string;
  email: string;
  type: 'client' | 'professional';
}

interface DocumentShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  participants: Participant[];
  onShare: (documentId: string, emails: string[]) => Promise<void>;
}

export default function DocumentShareModal({
  isOpen,
  onClose,
  document,
  participants,
  onShare,
}: DocumentShareModalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputClass =
    'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  const handleClose = () => {
    setEmailInput('');
    setSelectedParticipants(new Set());
    setError('');
    onClose();
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleShare = async () => {
    if (!document) return;

    // Collect emails from both input and selected participants
    const manualEmails = emailInput
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes('@'));

    const participantEmails = participants
      .filter((p) => selectedParticipants.has(p.id))
      .map((p) => p.email);

    const allEmails = [...new Set([...manualEmails, ...participantEmails])];

    if (allEmails.length === 0) {
      setError('Please enter at least one email address or select a participant.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onShare(document.id, allEmails);
      handleClose();
    } catch {
      setError('Failed to share document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!document) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Share Document">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-background rounded-md p-3 border border-border">
          <p className="text-sm font-medium text-foreground">{document.title}</p>
          {document.fileName && (
            <p className="text-xs text-muted mt-0.5">{document.fileName}</p>
          )}
        </div>

        {/* Email input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email Addresses (comma-separated)
          </label>
          <input
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            className={inputClass}
          />
        </div>

        {/* Project participants */}
        {participants.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Project Participants
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {participants.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-background cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedParticipants.has(p.id)}
                    onChange={() => toggleParticipant(p.id)}
                    className="rounded border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{p.name}</p>
                    <p className="text-xs text-muted">{p.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-border text-muted capitalize">
                    {p.type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={saving}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Sharing...' : 'Share & Email'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
