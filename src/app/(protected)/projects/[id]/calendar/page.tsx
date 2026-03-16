'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { isValidUUID } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCalendarEvents } from '@/lib/hooks/useCalendarEvents';
import ProjectTabs from '@/components/projects/ProjectTabs';
import CalendarView from '@/components/calendar/CalendarView';
import EventModal from '@/components/calendar/EventModal';
import type { CalendarEvent } from '@/types';

export default function ProjectCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';
  const { userId, tenantId } = useAuth();

  const [projectName, setProjectName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Compute date range for the current month (with padding)
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString();

  const { events, loading, refetch } = useCalendarEvents({
    tenantId,
    projectId,
    startDate,
    endDate,
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [defaultHour, setDefaultHour] = useState<number | undefined>();

  useEffect(() => {
    async function loadProject() {
      const { data: project } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
      if (project) setProjectName(project.name);
    }
    if (isValidUUID(projectId)) loadProject();
  }, [projectId, supabase]);

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

  if (!isValidUUID(projectId)) return <p className="text-muted text-sm">Project not found.</p>;

  return (
    <div>
      <button
        onClick={() => router.push('/projects')}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Projects
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-4">{projectName}</h1>

      <ProjectTabs projectId={projectId} />

      <CalendarView
        events={events}
        loading={loading}
        onCreateEvent={handleCreateEvent}
        onEventClick={handleEventClick}
      />

      {tenantId && userId && (
        <EventModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          event={selectedEvent}
          defaultDate={defaultDate}
          defaultHour={defaultHour}
          projectId={projectId}
          tenantId={tenantId}
          userId={userId}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
