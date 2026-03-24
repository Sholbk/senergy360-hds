'use client';

import type { CalendarEvent } from '@/types';

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  compact?: boolean;
  showProjectName?: boolean;
}

const EVENT_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  meeting_zoom: { border: 'border-l-primary', bg: 'bg-primary-bg', text: 'text-primary-dark' },
  meeting_google_meet: { border: 'border-l-info', bg: 'bg-blue-50', text: 'text-info' },
  meeting_in_person: { border: 'border-l-success', bg: 'bg-green-50', text: 'text-success' },
  due_date: { border: 'border-l-warning', bg: 'bg-orange-50', text: 'text-warning' },
  project_update: { border: 'border-l-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
};

const EVENT_LABELS: Record<string, string> = {
  meeting_zoom: 'Zoom',
  meeting_google_meet: 'Google Meet',
  meeting_in_person: 'In-Person',
  due_date: 'Due Date',
  project_update: 'Update',
};

// Stable color palette for team member color coding
const TEAM_MEMBER_COLORS = [
  { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  { border: 'border-l-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
  { border: 'border-l-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
  { border: 'border-l-pink-500', bg: 'bg-pink-50', text: 'text-pink-700' },
  { border: 'border-l-teal-500', bg: 'bg-teal-50', text: 'text-teal-700' },
  { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  { border: 'border-l-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  { border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  { border: 'border-l-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-700' },
];

function getTeamMemberColor(memberId: string): { border: string; bg: string; text: string } {
  // Simple hash to get a stable color index from the UUID
  let hash = 0;
  for (let i = 0; i < memberId.length; i++) {
    hash = ((hash << 5) - hash + memberId.charCodeAt(i)) | 0;
  }
  return TEAM_MEMBER_COLORS[Math.abs(hash) % TEAM_MEMBER_COLORS.length];
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function EventCard({ event, onClick, compact, showProjectName }: EventCardProps) {
  // Use team member color if assigned, otherwise fall back to event type color
  const colors = event.teamMemberId
    ? getTeamMemberColor(event.teamMemberId)
    : EVENT_COLORS[event.eventType] || EVENT_COLORS.due_date;

  if (compact) {
    return (
      <button
        onClick={() => onClick(event)}
        className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity`}
        title={`${event.title}${event.teamMemberName ? ` — ${event.teamMemberName}` : ''}`}
      >
        <span className="font-medium">{event.title}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(event)}
      className={`w-full text-left border-l-3 ${colors.border} ${colors.bg} rounded-r-md px-3 py-2 hover:opacity-80 transition-opacity`}
    >
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${colors.text}`}>{EVENT_LABELS[event.eventType]}</span>
        <span className="text-xs text-muted">
          {event.eventType === 'due_date' || event.eventType === 'project_update'
            ? (event.eventType === 'due_date' ? 'Due' : formatTime(event.startTime))
            : formatTime(event.startTime)}
          {event.endTime && ` – ${formatTime(event.endTime)}`}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground truncate mt-0.5">{event.title}</p>
      {event.teamMemberName && (
        <p className={`text-xs truncate ${colors.text}`}>{event.teamMemberName}</p>
      )}
      {showProjectName && event.projectName && (
        <p className="text-xs text-muted truncate">{event.projectName}</p>
      )}
    </button>
  );
}

export { EVENT_COLORS, EVENT_LABELS, TEAM_MEMBER_COLORS, getTeamMemberColor, formatTime };
