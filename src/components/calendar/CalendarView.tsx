'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/types';
import EventCard, { EVENT_LABELS, formatTime } from './EventCard';

interface CalendarViewProps {
  events: CalendarEvent[];
  loading: boolean;
  onCreateEvent: (date?: Date, hour?: number) => void;
  onEventClick: (event: CalendarEvent) => void;
  showProjectName?: boolean;
}

type ViewMode = 'month' | 'week' | 'list';

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
            {viewMode === 'month'
              ? formatMonthYear(currentDate)
              : viewMode === 'week'
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
            {(['month', 'week', 'list'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 text-sm capitalize transition-colors',
                  viewMode === mode
                    ? 'bg-primary text-white'
                    : 'bg-card-bg text-muted hover:text-foreground'
                )}
              >
                {mode}
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
