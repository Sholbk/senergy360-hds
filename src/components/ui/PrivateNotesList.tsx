'use client';

import { useState } from 'react';
import Modal from './Modal';
import type { PrivateNote } from '@/types';

interface PrivateNotesListProps {
  notes: PrivateNote[];
  onAddNote: (note: string) => Promise<void>;
  title?: string;
}

export default function PrivateNotesList({
  notes,
  onAddNote,
  title = 'Private Notes',
}: PrivateNotesListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      await onAddNote(newNote.trim());
      setNewNote('');
      setIsModalOpen(false);
    } catch {
      // Error handling is done by the parent component
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
        >
          Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-muted italic">No notes yet.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-primary-bg rounded border border-border text-sm"
            >
              <p className="text-foreground whitespace-pre-wrap">{note.note}</p>
              <p className="text-xs text-muted mt-1">
                {new Date(note.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Note">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter your note..."
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!newNote.trim() || saving}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
