'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase/client';
import { postFeedActivity } from '@/lib/feedActivity';
import type { CalendarEvent, CalendarEventType } from '@/types';

interface TeamMember {
  participantId: string;
  name: string;
}

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

const TYPE_LABELS: Record<string, string> = {
  meeting_zoom: 'Zoom Meeting',
  meeting_google_meet: 'Google Meet Meeting',
  meeting_in_person: 'In-Person Meeting',
  due_date: 'Due Date',
  project_update: 'Project Update',
};

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
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [teamMemberId, setTeamMemberId] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentDate, setAttachmentDate] = useState('');
  const [attachmentTime, setAttachmentTime] = useState('');

  const isEditing = !!event;
  const isMeeting = eventType === 'meeting_zoom' || eventType === 'meeting_google_meet' || eventType === 'meeting_in_person';
  const isOnline = eventType === 'meeting_zoom' || eventType === 'meeting_google_meet';
  const isInPerson = eventType === 'meeting_in_person';
  const isProjectUpdate = eventType === 'project_update';

  // Load team members when project changes
  const resolvedProjId = projectId || selectedProjectId;
  useEffect(() => {
    async function loadTeamMembers() {
      if (!resolvedProjId) {
        setTeamMembers([]);
        return;
      }
      const { data } = await supabase
        .from('project_participants')
        .select('id, organizations(business_name, primary_first_name, primary_last_name)')
        .eq('project_id', resolvedProjId);

      if (data) {
        setTeamMembers(
          data.map((p: Record<string, unknown>) => {
            const org = p.organizations as Record<string, unknown> | null;
            const name = org
              ? (org.business_name as string) || `${org.primary_first_name || ''} ${org.primary_last_name || ''}`.trim()
              : 'Unknown';
            return { participantId: p.id as string, name };
          })
        );
      }
    }
    if (isOpen) loadTeamMembers();
  }, [isOpen, resolvedProjId, supabase]);

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
      setLocation(event.location || '');
      setDescription(event.description || '');
      setSelectedProjectId(event.projectId);
      setTeamMemberId(event.teamMemberId || '');
      setAttachmentFile(null);
      if (event.attachmentTimestamp) {
        const at = new Date(event.attachmentTimestamp);
        setAttachmentDate(at.toISOString().split('T')[0]);
        setAttachmentTime(at.toTimeString().slice(0, 5));
      } else {
        setAttachmentDate('');
        setAttachmentTime('');
      }
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
      setLocation('');
      setDescription('');
      setSelectedProjectId(projectId || '');
      setTeamMemberId('');
      setAttachmentFile(null);
      setAttachmentDate('');
      setAttachmentTime('');
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

    if (isOnline && meetingLink && !isValidUrl(meetingLink)) {
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

    // Handle file attachment upload
    let attachmentPath: string | null = null;
    let attachmentName: string | null = null;
    if (attachmentFile) {
      const ext = attachmentFile.name.split('.').pop();
      const storagePath = `calendar-attachments/${resolvedProjectId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(storagePath, attachmentFile);
      if (uploadErr) {
        setError('Failed to upload attachment: ' + uploadErr.message);
        setSaving(false);
        return;
      }
      attachmentPath = storagePath;
      attachmentName = attachmentFile.name;
    }

    const attachmentTimestamp = attachmentDate
      ? new Date(`${attachmentDate}T${attachmentTime || '00:00'}`).toISOString()
      : null;

    const payload: Record<string, unknown> = {
      tenant_id: tenantId,
      project_id: resolvedProjectId,
      title: title.trim(),
      description: description.trim() || null,
      event_type: eventType,
      start_time: startDateTime,
      end_time: endDateTime,
      meeting_link: isOnline && meetingLink.trim() ? meetingLink.trim() : null,
      location: (isInPerson || isOnline) && location.trim() ? location.trim() : null,
      team_member_id: teamMemberId || null,
      updated_at: new Date().toISOString(),
    };

    if (attachmentPath) {
      payload.attachment_path = attachmentPath;
      payload.attachment_name = attachmentName;
    }
    if (attachmentTimestamp) {
      payload.attachment_timestamp = attachmentTimestamp;
    }

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

    // Post to feed
    const resolvedPid = projectId || selectedProjectId;
    const typeLabel = TYPE_LABELS[eventType] || eventType;
    const dateLabel = new Date(startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeLabel = isMeeting
      ? `${new Date(startDateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${new Date(endDateTime!).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      : '';
    const locationLabel = isInPerson && location.trim() ? ` at ${location.trim()}` : '';

    if (isEditing) {
      await postFeedActivity(supabase, {
        projectId: resolvedPid,
        content: `${typeLabel} updated: ${title.trim()} — ${dateLabel}${timeLabel ? ' ' + timeLabel : ''}${locationLabel}`,
        eventType: 'event_updated',
      });
    } else {
      await postFeedActivity(supabase, {
        projectId: resolvedPid,
        content: `${typeLabel} scheduled: ${title.trim()} — ${dateLabel}${timeLabel ? ' ' + timeLabel : ''}${locationLabel}`,
        eventType: 'event_scheduled',
      });
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

    const typeLabel = TYPE_LABELS[event.eventType] || event.eventType;
    await postFeedActivity(supabase, {
      projectId: event.projectId,
      content: `${typeLabel} cancelled: ${event.title}`,
      eventType: 'event_deleted',
    });

    onSaved();
    onClose();
  };

  const inputClass = 'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

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
            className={inputClass}
            placeholder="Event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Type</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as CalendarEventType)}
            className={inputClass}
          >
            <option value="meeting_zoom">Zoom Meeting</option>
            <option value="meeting_google_meet">Google Meet Meeting</option>
            <option value="meeting_in_person">In-Person Meeting</option>
            <option value="due_date">Due Date</option>
            <option value="project_update">Project Update</option>
          </select>
        </div>

        {/* Team Member */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Team Member</label>
          <select
            value={teamMemberId}
            onChange={(e) => setTeamMemberId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select team member...</option>
            {teamMembers.map((m) => (
              <option key={m.participantId} value={m.participantId}>{m.name}</option>
            ))}
          </select>
        </div>

        {!projectId && projects && projects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={inputClass}
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
            className={inputClass}
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
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {isInPerson && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
              placeholder="123 Main St, City, State 12345"
            />
          </div>
        )}

        {isOnline && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Meeting Link</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className={inputClass}
              placeholder={eventType === 'meeting_zoom' ? 'https://zoom.us/j/...' : 'https://meet.google.com/...'}
            />
          </div>
        )}

        {/* File/Image Attachment */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Attachment (Document or Image)
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setAttachmentFile(f);
              if (f && !attachmentDate) {
                const now = new Date();
                setAttachmentDate(now.toISOString().split('T')[0]);
                setAttachmentTime(now.toTimeString().slice(0, 5));
              }
            }}
            className={inputClass}
          />
          {(attachmentFile || event?.attachmentName) && (
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Attachment Date</label>
                <input
                  type="date"
                  value={attachmentDate}
                  onChange={(e) => setAttachmentDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Attachment Time</label>
                <input
                  type="time"
                  value={attachmentTime}
                  onChange={(e) => setAttachmentTime(e.target.value)}
                  className={inputClass}
                />
              </div>
              {event?.attachmentName && !attachmentFile && (
                <p className="col-span-2 text-xs text-muted">
                  Current: {event.attachmentName}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
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
