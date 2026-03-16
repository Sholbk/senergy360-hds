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
};

const EVENT_LABELS: Record<string, string> = {
  meeting_zoom: 'Zoom',
  meeting_google_meet: 'Google Meet',
  meeting_in_person: 'In-Person',
  due_date: 'Due Date',
};

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function EventCard({ event, onClick, compact, showProjectName }: EventCardProps) {
  const colors = EVENT_COLORS[event.eventType] || EVENT_COLORS.due_date;

  if (compact) {
    return (
      <button
        onClick={() => onClick(event)}
        className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity`}
        title={event.title}
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
          {event.eventType === 'due_date' ? 'Due' : formatTime(event.startTime)}
          {event.endTime && ` – ${formatTime(event.endTime)}`}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground truncate mt-0.5">{event.title}</p>
      {showProjectName && event.projectName && (
        <p className="text-xs text-muted truncate">{event.projectName}</p>
      )}
    </button>
  );
}

export { EVENT_COLORS, EVENT_LABELS, formatTime };
