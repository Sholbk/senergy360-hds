'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCalendarEvents } from '@/lib/hooks/useCalendarEvents';
import CalendarView from '@/components/calendar/CalendarView';
import EventModal from '@/components/calendar/EventModal';
import type { CalendarEvent } from '@/types';

export default function GlobalCalendarPage() {
  const [supabase] = useState(() => createClient());
  const { userId, tenantId } = useAuth();

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [currentDate] = useState(new Date());

  // Date range for current view (with padding)
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString();

  const { events, loading, refetch } = useCalendarEvents({
    tenantId,
    startDate,
    endDate,
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [defaultHour, setDefaultHour] = useState<number | undefined>();

  // Load projects for the dropdown in the create modal
  useEffect(() => {
    async function loadProjects() {
      if (!tenantId) return;
      const { data } = await supabase
        .from('projects')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .order('name');
      if (data) setProjects(data);
    }
    loadProjects();
  }, [supabase, tenantId]);

  const handleCreateEvent = useCallback((date?: Date, hour?: number) => {
    setSelectedEvent(null);
    setDefaultDate(date);
    setDefaultHour(hour);
    setShowModal(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Calendar</h1>

      <CalendarView
        events={events}
        loading={loading}
        onCreateEvent={handleCreateEvent}
        onEventClick={handleEventClick}
        showProjectName
      />

      {tenantId && userId && (
        <EventModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          event={selectedEvent}
          defaultDate={defaultDate}
          defaultHour={defaultHour}
          projects={projects}
          tenantId={tenantId}
          userId={userId}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
