'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { CalendarEvent } from '@/types';
import EventCard, { EVENT_LABELS, TEAM_MEMBER_COLORS, getTeamMemberColor, formatTime } from './EventCard';

interface CalendarViewProps {
  events: CalendarEvent[];
  loading: boolean;
  onCreateEvent: (date?: Date, hour?: number) => void;
  onEventClick: (event: CalendarEvent) => void;
  showProjectName?: boolean;
}

type ViewMode = 'month' | 'week' | 'list' | 'critical-path';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM - 9 PM

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const dates: Date[] = [];

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    dates.push(new Date(year, month, -i));
  }

  // Current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(new Date(year, month, d));
  }

  // Next month padding to complete grid (always 6 rows)
  while (dates.length < 42) {
    dates.push(new Date(year, month + 1, dates.length - startOffset - daysInMonth + 1));
  }

  return dates;
}

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);

  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    return dt;
  });
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatWeekRange(dates: Date[]): string {
  const start = dates[0];
  const end = dates[6];
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

export default function CalendarView({
  events,
  loading,
  onCreateEvent,
  onEventClick,
  showProjectName,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = useMemo(() => new Date(), []);

  const navigate = (direction: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + direction);
    } else {
      d.setDate(d.getDate() + direction * 7);
    }
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const eventsForDay = (date: Date) =>
    events.filter((e) => isSameDay(new Date(e.startTime), date));

  if (loading) {
    return <div className="text-muted text-sm py-8 text-center">Loading calendar...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-background rounded-md transition-colors text-muted hover:text-foreground"
            aria-label="Previous"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-foreground min-w-[200px] text-center">
            {viewMode === 'week'
              ? formatWeekRange(getWeekDates(currentDate))
              : formatMonthYear(currentDate)}
          </h2>
          <button
            onClick={() => navigate(1)}
            className="p-2 hover:bg-background rounded-md transition-colors text-muted hover:text-foreground"
            aria-label="Next"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-background transition-colors ml-2"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-md overflow-hidden">
            {(['month', 'week', 'list', 'critical-path'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 text-sm transition-colors whitespace-nowrap',
                  viewMode === mode
                    ? 'bg-primary text-white'
                    : 'bg-card-bg text-muted hover:text-foreground'
                )}
              >
                {mode === 'critical-path' ? 'Critical Path' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => onCreateEvent()}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            + New Event
          </button>
        </div>
      </div>

      {/* Team Member Legend */}
      {(() => {
        const memberMap = new Map<string, string>();
        for (const e of events) {
          if (e.teamMemberId && e.teamMemberName) {
            memberMap.set(e.teamMemberId, e.teamMemberName);
          }
        }
        if (memberMap.size === 0) return null;
        return (
          <div className="flex items-center gap-3 flex-wrap mb-4 px-1">
            <span className="text-xs font-medium text-muted">Team:</span>
            {Array.from(memberMap.entries()).map(([id, name]) => {
              const colors = getTeamMemberColor(id);
              return (
                <div key={id} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full ${colors.bg} border-2 ${colors.border}`} />
                  <span className="text-xs text-muted">{name}</span>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Views */}
      {viewMode === 'month' && (
        <MonthView
          currentDate={currentDate}
          today={today}
          eventsForDay={eventsForDay}
          onCreateEvent={onCreateEvent}
          onEventClick={onEventClick}
          showProjectName={showProjectName}
        />
      )}
      {viewMode === 'week' && (
        <WeekView
          currentDate={currentDate}
          today={today}
          eventsForDay={eventsForDay}
          onCreateEvent={onCreateEvent}
          onEventClick={onEventClick}
          showProjectName={showProjectName}
        />
      )}
      {viewMode === 'list' && (
        <ListView
          events={events}
          onEventClick={onEventClick}
          showProjectName={showProjectName}
        />
      )}
      {viewMode === 'critical-path' && (
        <CriticalPathView
          events={events}
          currentDate={currentDate}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}

/* ---- Month View ---- */

function MonthView({
  currentDate,
  today,
  eventsForDay,
  onCreateEvent,
  onEventClick,
  showProjectName,
}: {
  currentDate: Date;
  today: Date;
  eventsForDay: (date: Date) => CalendarEvent[];
  onCreateEvent: (date?: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  showProjectName?: boolean;
}) {
  const grid = getMonthGrid(currentDate.getFullYear(), currentDate.getMonth());

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-background">
        {DAYS.map((day) => (
          <div key={day} className="px-2 py-2 text-xs font-medium text-muted text-center border-b border-border">
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {grid.map((date, i) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(date, today);
          const dayEvents = eventsForDay(date);
          const MAX_VISIBLE = 3;

          return (
            <div
              key={i}
              className={cn(
                'min-h-[100px] border-b border-r border-border p-1 cursor-pointer hover:bg-primary-bg/30 transition-colors',
                !isCurrentMonth && 'bg-background/50'
              )}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                onCreateEvent(date);
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={cn(
                    'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                    isToday && 'bg-primary text-white',
                    !isToday && isCurrentMonth && 'text-foreground',
                    !isToday && !isCurrentMonth && 'text-muted/50'
                  )}
                >
                  {date.getDate()}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, MAX_VISIBLE).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    compact
                    showProjectName={showProjectName}
                  />
                ))}
                {dayEvents.length > MAX_VISIBLE && (
                  <span className="text-xs text-muted px-1">
                    +{dayEvents.length - MAX_VISIBLE} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Week View ---- */

function WeekView({
  currentDate,
  today,
  eventsForDay,
  onCreateEvent,
  onEventClick,
  showProjectName,
}: {
  currentDate: Date;
  today: Date;
  eventsForDay: (date: Date) => CalendarEvent[];
  onCreateEvent: (date?: Date, hour?: number) => void;
  onEventClick: (event: CalendarEvent) => void;
  showProjectName?: boolean;
}) {
  const weekDates = getWeekDates(currentDate);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-background border-b border-border">
        <div className="p-2" />
        {weekDates.map((date, i) => {
          const isToday = isSameDay(date, today);
          return (
            <div key={i} className="p-2 text-center border-l border-border">
              <div className="text-xs text-muted">{DAYS[date.getDay()]}</div>
              <div
                className={cn(
                  'text-sm font-medium mt-0.5 w-7 h-7 flex items-center justify-center rounded-full mx-auto',
                  isToday && 'bg-primary text-white',
                  !isToday && 'text-foreground'
                )}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="max-h-[600px] overflow-y-auto">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
            <div className="p-1 text-xs text-muted text-right pr-2 pt-1">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            {weekDates.map((date, di) => {
              const dayEvents = eventsForDay(date);
              const hourEvents = dayEvents.filter((e) => {
                const h = new Date(e.startTime).getHours();
                return h === hour;
              });

              return (
                <div
                  key={di}
                  className="border-l border-border min-h-[48px] p-0.5 cursor-pointer hover:bg-primary-bg/30 transition-colors relative"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    onCreateEvent(date, hour);
                  }}
                >
                  {hourEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={onEventClick}
                      showProjectName={showProjectName}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- List View ---- */

function ListView({
  events,
  onEventClick,
  showProjectName,
}: {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  showProjectName?: boolean;
}) {
  if (events.length === 0) {
    return (
      <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
        <p className="text-muted text-sm">No events in this period.</p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, CalendarEvent[]> = {};
  for (const event of events) {
    const key = new Date(event.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([dateLabel, dayEvents]) => (
        <div key={dateLabel}>
          <h3 className="text-sm font-semibold text-foreground mb-2">{dateLabel}</h3>
          <div className="bg-card-bg rounded-lg border border-border divide-y divide-border">
            {dayEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className="w-full text-left px-4 py-3 hover:bg-primary-bg/30 transition-colors flex items-center gap-4"
              >
                <div className="text-sm text-muted w-24 flex-shrink-0">
                  {event.eventType === 'due_date'
                    ? 'Due'
                    : `${formatTime(event.startTime)}${event.endTime ? ` – ${formatTime(event.endTime)}` : ''}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                  {event.teamMemberName && (
                    <p className="text-xs text-muted truncate">{event.teamMemberName}</p>
                  )}
                  {showProjectName && event.projectName && (
                    <p className="text-xs text-muted truncate">{event.projectName}</p>
                  )}
                </div>
                <span className="text-xs font-medium text-muted bg-background px-2 py-1 rounded">
                  {EVENT_LABELS[event.eventType]}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- Critical Path View ---- */

const CP_EVENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  due_date: { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700' },
  meeting_zoom: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  meeting_google_meet: { bg: 'bg-sky-100', border: 'border-sky-400', text: 'text-sky-700' },
  meeting_in_person: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
  project_update: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
};

function CriticalPathView({
  events,
  currentDate,
  onEventClick,
}: {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}) {
  const [supabase] = useState(() => createClient());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  const handleBarClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent((prev) => {
      if (prev?.id === event.id) {
        setAttachmentUrl(null);
        return null;
      }
      // Resolve attachment URL if present
      if (event.attachmentPath) {
        const { data } = supabase.storage.from('documents').getPublicUrl(event.attachmentPath);
        setAttachmentUrl(data?.publicUrl || null);
      } else {
        setAttachmentUrl(null);
      }
      return event;
    });
  }, [supabase]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = new Date();
  const todayDay = isSameDay(todayDate, new Date(year, month, todayDate.getDate()))
    ? todayDate.getDate()
    : null;

  // Group events by project
  const projectMap: Record<string, { projectName: string; events: CalendarEvent[] }> = {};
  const noProject: CalendarEvent[] = [];

  for (const event of events) {
    if (event.projectId && event.projectName) {
      if (!projectMap[event.projectId]) {
        projectMap[event.projectId] = { projectName: event.projectName, events: [] };
      }
      projectMap[event.projectId].events.push(event);
    } else if (event.projectId) {
      const key = event.projectId;
      if (!projectMap[key]) {
        projectMap[key] = { projectName: 'Unnamed Project', events: [] };
      }
      projectMap[key].events.push(event);
    } else {
      noProject.push(event);
    }
  }

  // Sort projects by earliest event
  const sortedProjects = Object.entries(projectMap).sort(([, a], [, b]) => {
    const aMin = Math.min(...a.events.map((e) => new Date(e.startTime).getTime()));
    const bMin = Math.min(...b.events.map((e) => new Date(e.startTime).getTime()));
    return aMin - bMin;
  });

  if (noProject.length > 0) {
    sortedProjects.push(['unassigned', { projectName: 'Unassigned', events: noProject }]);
  }

  if (sortedProjects.length === 0) {
    return (
      <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
        <p className="text-muted text-sm">No events to display on the critical path.</p>
      </div>
    );
  }

  // Day column headers
  const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <>
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Legend */}
      <div className="bg-background px-4 py-2 border-b border-border flex items-center gap-4 flex-wrap">
        <span className="text-xs font-medium text-muted">Legend:</span>
        {Object.entries(EVENT_LABELS).map(([type, label]) => {
          const colors = CP_EVENT_COLORS[type] || CP_EVENT_COLORS.due_date;
          return (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${colors.bg} border ${colors.border}`} />
              <span className="text-xs text-muted">{label}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-3 h-3 rounded-sm bg-red-200 border border-red-400" />
          <span className="text-xs text-muted">Today</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${Math.max(daysInMonth * 36 + 200, 900)}px` }}>
          {/* Day header row */}
          <div className="flex border-b border-border bg-background sticky top-0 z-10">
            <div className="w-[200px] min-w-[200px] px-3 py-2 text-xs font-medium text-muted border-r border-border">
              Project
            </div>
            <div className="flex-1 flex">
              {dayHeaders.map((day) => {
                const isToday = todayDay === day;
                const isWeekend = new Date(year, month, day).getDay() % 6 === 0;
                return (
                  <div
                    key={day}
                    className={cn(
                      'flex-1 min-w-[36px] text-center py-2 text-xs border-r border-border last:border-r-0',
                      isToday ? 'bg-red-50 font-bold text-red-600' : isWeekend ? 'bg-background/70 text-muted/50' : 'text-muted'
                    )}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project rows */}
          {sortedProjects.map(([projectId, { projectName, events: projEvents }]) => (
            <div key={projectId} className="flex border-b border-border last:border-b-0 hover:bg-primary-bg/20 transition-colors">
              {/* Project name */}
              <div className="w-[200px] min-w-[200px] px-3 py-3 border-r border-border">
                <p className="text-sm font-medium text-foreground truncate">{projectName}</p>
                <p className="text-xs text-muted">{projEvents.length} event{projEvents.length !== 1 ? 's' : ''}</p>
              </div>

              {/* Timeline cells */}
              <div className="flex-1 relative" style={{ minHeight: '48px' }}>
                {/* Grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {dayHeaders.map((day) => {
                    const isToday = todayDay === day;
                    return (
                      <div
                        key={day}
                        className={cn(
                          'flex-1 min-w-[36px] border-r border-border last:border-r-0',
                          isToday && 'bg-red-50/50'
                        )}
                      />
                    );
                  })}
                </div>

                {/* Event bars */}
                <div className="relative z-[1] py-1 px-0.5 space-y-0.5">
                  {projEvents
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map((event) => {
                      const startDate = new Date(event.startTime);
                      const startDay = startDate.getDate();
                      const endDate = event.endTime ? new Date(event.endTime) : startDate;
                      const endDay = endDate.getMonth() === month ? endDate.getDate() : daysInMonth;
                      const isDueDate = event.eventType === 'due_date';

                      // Calculate position as percentage
                      const leftPct = ((startDay - 1) / daysInMonth) * 100;
                      const widthPct = isDueDate
                        ? Math.max((1 / daysInMonth) * 100, 2.5) // Due dates get a small fixed width
                        : Math.max(((endDay - startDay + 1) / daysInMonth) * 100, 2.5);

                      const colors = CP_EVENT_COLORS[event.eventType] || CP_EVENT_COLORS.due_date;

                      return (
                        <button
                          key={event.id}
                          onClick={() => handleBarClick(event)}
                          className={cn(
                            'absolute h-6 rounded-sm border text-xs font-medium px-1.5 truncate flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity',
                            selectedEvent?.id === event.id && 'ring-2 ring-primary ring-offset-1',
                            colors.bg,
                            colors.border,
                            colors.text
                          )}
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            top: `${4 + projEvents.indexOf(event) * 28}px`,
                          }}
                          title={`${event.title} — ${EVENT_LABELS[event.eventType]} — ${startDate.toLocaleDateString()}`}
                        >
                          {isDueDate && (
                            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                          )}
                          <span className="truncate">{event.title}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

      {/* Selected Event Detail Panel */}
      {selectedEvent && (
        <div className="mt-4 bg-card-bg rounded-lg border border-border border-l-4 border-l-primary p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                  CP_EVENT_COLORS[selectedEvent.eventType]?.bg || 'bg-gray-100'
                } ${CP_EVENT_COLORS[selectedEvent.eventType]?.text || 'text-gray-700'} border ${
                  CP_EVENT_COLORS[selectedEvent.eventType]?.border || 'border-gray-300'
                }`}>
                  {EVENT_LABELS[selectedEvent.eventType]}
                </span>
                {selectedEvent.projectName && (
                  <span className="text-xs text-muted bg-background px-2 py-1 rounded">
                    {selectedEvent.projectName}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{selectedEvent.title}</h3>

              <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <span className="text-muted font-medium">Date: </span>
                  <span className="text-foreground">
                    {new Date(selectedEvent.startTime).toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-muted font-medium">Time: </span>
                  <span className="text-foreground">
                    {selectedEvent.eventType === 'due_date' || selectedEvent.eventType === 'project_update'
                      ? (selectedEvent.eventType === 'due_date' ? 'Due Date' : formatTime(selectedEvent.startTime))
                      : `${formatTime(selectedEvent.startTime)}${selectedEvent.endTime ? ` – ${formatTime(selectedEvent.endTime)}` : ''}`}
                  </span>
                </div>
                {selectedEvent.teamMemberName && (
                  <div>
                    <span className="text-muted font-medium">Team Member: </span>
                    <span className="text-foreground">{selectedEvent.teamMemberName}</span>
                  </div>
                )}
                {selectedEvent.location && (
                  <div>
                    <span className="text-muted font-medium">Location: </span>
                    <span className="text-foreground">{selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.meetingLink && (
                  <div>
                    <span className="text-muted font-medium">Meeting Link: </span>
                    <a href={selectedEvent.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div className="mt-3">
                  <span className="text-muted font-medium text-sm">Description:</span>
                  <p className="text-sm text-foreground mt-1">{selectedEvent.description}</p>
                </div>
              )}

              {/* Attachment / Document / Image */}
              {selectedEvent.attachmentName && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                    <span className="text-sm font-medium text-foreground">Attachment</span>
                    {selectedEvent.attachmentTimestamp && (
                      <span className="text-xs text-muted ml-auto">
                        {new Date(selectedEvent.attachmentTimestamp).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                        {' '}
                        {new Date(selectedEvent.attachmentTimestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric', minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  {attachmentUrl && (() => {
                    const ext = (selectedEvent.attachmentName || '').split('.').pop()?.toLowerCase();
                    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '');
                    const isPdf = ext === 'pdf';

                    return (
                      <div>
                        {isImage && (
                          <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={attachmentUrl}
                              alt={selectedEvent.attachmentName || 'Attachment'}
                              className="max-w-md max-h-64 rounded-lg border border-border object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          </a>
                        )}
                        {isPdf && (
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-md text-sm text-primary hover:bg-primary-bg transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            {selectedEvent.attachmentName}
                          </a>
                        )}
                        {!isImage && !isPdf && (
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-md text-sm text-primary hover:bg-primary-bg transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            {selectedEvent.attachmentName}
                          </a>
                        )}
                      </div>
                    );
                  })()}
                  {!attachmentUrl && (
                    <p className="text-xs text-muted">{selectedEvent.attachmentName}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button
                onClick={() => { onEventClick(selectedEvent); setSelectedEvent(null); }}
                className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 text-muted hover:text-foreground transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
