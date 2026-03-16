'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase/client';
import type { CalendarEvent, CalendarEventType } from '@/types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  defaultDate?: Date;
  defaultHour?: number;
  projectId?: string;
  projects?: { id: string; name: string }[];
  tenantId: string;
  userId: string;
  onSaved: () => void;
}

export default function EventModal({
  isOpen,
  onClose,
  event,
  defaultDate,
  defaultHour,
  projectId,
  projects,
  tenantId,
  userId,
  onSaved,
}: EventModalProps) {
  const [supabase] = useState(() => createClient());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEventType>('meeting_zoom');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [meetingLink, setMeetingLink] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const isEditing = !!event;
  const isMeeting = eventType !== 'due_date';

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setShowDeleteConfirm(false);

    if (event) {
      setTitle(event.title);
      setEventType(event.eventType);
      const d = new Date(event.startTime);
      setDate(d.toISOString().split('T')[0]);
      setStartTime(d.toTimeString().slice(0, 5));
      if (event.endTime) {
        const e = new Date(event.endTime);
        setEndTime(e.toTimeString().slice(0, 5));
      }
      setMeetingLink(event.meetingLink || '');
      setDescription(event.description || '');
      setSelectedProjectId(event.projectId);
    } else {
      setTitle('');
      setEventType('meeting_zoom');
      if (defaultDate) {
        setDate(defaultDate.toISOString().split('T')[0]);
      } else {
        setDate(new Date().toISOString().split('T')[0]);
      }
      if (defaultHour !== undefined) {
        setStartTime(`${String(defaultHour).padStart(2, '0')}:00`);
        setEndTime(`${String(Math.min(defaultHour + 1, 23)).padStart(2, '0')}:00`);
      } else {
        setStartTime('09:00');
        setEndTime('10:00');
      }
      setMeetingLink('');
      setDescription('');
      setSelectedProjectId(projectId || '');
    }
  }, [isOpen, event, defaultDate, defaultHour, projectId]);

  const handleSave = async () => {
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const resolvedProjectId = projectId || selectedProjectId;
    if (!resolvedProjectId) {
      setError('Please select a project.');
      return;
    }

    if (isMeeting && meetingLink && !isValidUrl(meetingLink)) {
      setError('Please enter a valid meeting URL.');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`).toISOString();
    let endDateTime: string | null = null;

    if (isMeeting) {
      endDateTime = new Date(`${date}T${endTime}`).toISOString();
      if (endDateTime <= startDateTime) {
        setError('End time must be after start time.');
        return;
      }

      // Check for conflicts
      const { data: hasConflict } = await supabase.rpc('check_calendar_conflict', {
        p_tenant_id: tenantId,
        p_start: startDateTime,
        p_end: endDateTime,
        p_exclude_id: event?.id || null,
      });

      if (hasConflict) {
        setError('This time slot conflicts with an existing meeting. Please choose a different time.');
        return;
      }
    }

    setSaving(true);

    const payload = {
      tenant_id: tenantId,
      project_id: resolvedProjectId,
      title: title.trim(),
      description: description.trim() || null,
      event_type: eventType,
      start_time: startDateTime,
      end_time: endDateTime,
      meeting_link: isMeeting && meetingLink.trim() ? meetingLink.trim() : null,
      updated_at: new Date().toISOString(),
    };

    let saveError;

    if (isEditing) {
      const { error: err } = await supabase
        .from('calendar_events')
        .update(payload)
        .eq('id', event.id);
      saveError = err;
    } else {
      const { error: err } = await supabase
        .from('calendar_events')
        .insert({ ...payload, created_by: userId });
      saveError = err;
    }

    setSaving(false);

    if (saveError) {
      if (saveError.message?.includes('Double booking')) {
        setError('This time slot conflicts with an existing meeting. Please choose a different time.');
      } else {
        setError(saveError.message || 'Failed to save event.');
      }
      return;
    }

    onSaved();
    onClose();
  };

  const handleDelete = async () => {
    if (!event) return;
    setSaving(true);

    const { error: err } = await supabase
      .from('calendar_events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', event.id);

    setSaving(false);

    if (err) {
      setError(err.message || 'Failed to delete event.');
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Event' : 'New Event'}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Type</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as CalendarEventType)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="meeting_zoom">Zoom Meeting</option>
            <option value="meeting_google_meet">Google Meet Meeting</option>
            <option value="due_date">Due Date</option>
          </select>
        </div>

        {!projectId && projects && projects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {isMeeting && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {isMeeting && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Meeting Link</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Optional details..."
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            {isEditing && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Delete
              </button>
            )}
            {showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Delete this event?</span>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-background transition-colors"
                >
                  No
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
