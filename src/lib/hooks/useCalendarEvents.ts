'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CalendarEvent } from '@/types';

interface UseCalendarEventsOptions {
  tenantId: string | null;
  projectId?: string;
  startDate: string;
  endDate: string;
}

interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  loading: boolean;
  refetch: () => void;
}

export function useCalendarEvents({
  tenantId,
  projectId,
  startDate,
  endDate,
}: UseCalendarEventsOptions): UseCalendarEventsReturn {
  const [supabase] = useState(() => createClient());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);

    let query = supabase
      .from('calendar_events')
      .select('*, projects!inner(name)')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setEvents(
        data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          tenantId: row.tenant_id as string,
          projectId: row.project_id as string,
          title: row.title as string,
          description: (row.description as string) || undefined,
          eventType: row.event_type as CalendarEvent['eventType'],
          startTime: row.start_time as string,
          endTime: (row.end_time as string) || undefined,
          meetingLink: (row.meeting_link as string) || undefined,
          createdBy: (row.created_by as string) || undefined,
          assignedTo: (row.assigned_to as string) || undefined,
          createdAt: row.created_at as string,
          updatedAt: row.updated_at as string,
          deletedAt: (row.deleted_at as string) || undefined,
          projectName: (row.projects as Record<string, unknown>)?.name as string || undefined,
        }))
      );
    }

    setLoading(false);
  }, [supabase, tenantId, projectId, startDate, endDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, refetch: fetchEvents };
}
