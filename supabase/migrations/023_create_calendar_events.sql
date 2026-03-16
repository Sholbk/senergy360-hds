-- ============================================================================
-- Migration 023: Create calendar_events table
-- ============================================================================
-- Adds a calendar system for scheduling meetings (Zoom/Google Meet) and
-- tracking project due dates. Includes double-booking prevention at both
-- the application level (RPC function) and database level (trigger).
-- ============================================================================

-- ============================================================================
-- 1. Create calendar_events table
-- ============================================================================

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('meeting_zoom', 'meeting_google_meet', 'due_date')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  meeting_link TEXT,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,

  -- Ensure end_time > start_time when both are present
  CONSTRAINT valid_time_range CHECK (end_time IS NULL OR end_time > start_time),

  -- Meetings must have end_time; due_dates must not
  CONSTRAINT meeting_requires_end_time CHECK (
    (event_type IN ('meeting_zoom', 'meeting_google_meet') AND end_time IS NOT NULL)
    OR (event_type = 'due_date')
  )
);

-- ============================================================================
-- 2. Indexes
-- ============================================================================

CREATE INDEX idx_calendar_events_project ON calendar_events(project_id);
CREATE INDEX idx_calendar_events_tenant ON calendar_events(tenant_id);
CREATE INDEX idx_calendar_events_start ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_tenant_time ON calendar_events(tenant_id, start_time, end_time)
  WHERE deleted_at IS NULL AND event_type IN ('meeting_zoom', 'meeting_google_meet');

-- ============================================================================
-- 3. Double-booking prevention: RPC function (application-level check)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_calendar_conflict(
  p_tenant_id UUID,
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM calendar_events
    WHERE tenant_id = p_tenant_id
      AND deleted_at IS NULL
      AND event_type IN ('meeting_zoom', 'meeting_google_meet')
      AND id IS DISTINCT FROM p_exclude_id
      AND start_time < p_end
      AND end_time > p_start
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. Double-booking prevention: Trigger (database-level safety net)
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type IN ('meeting_zoom', 'meeting_google_meet')
     AND NEW.deleted_at IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM calendar_events
      WHERE tenant_id = NEW.tenant_id
        AND deleted_at IS NULL
        AND event_type IN ('meeting_zoom', 'meeting_google_meet')
        AND id != NEW.id
        AND start_time < NEW.end_time
        AND end_time > NEW.start_time
    ) THEN
      RAISE EXCEPTION 'Double booking detected: time slot conflicts with an existing meeting';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_double_booking
  BEFORE INSERT OR UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION prevent_double_booking();

-- ============================================================================
-- 5. Row Level Security
-- ============================================================================

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Admins: full CRUD within tenant
CREATE POLICY "Admins can view calendar events" ON calendar_events
  FOR SELECT USING (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can insert calendar events" ON calendar_events
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can update calendar events" ON calendar_events
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can delete calendar events" ON calendar_events
  FOR DELETE USING (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

-- Non-admin participants: view, create, update, delete on their projects
CREATE POLICY "Participants can view calendar events" ON calendar_events
  FOR SELECT USING (
    deleted_at IS NULL
    AND project_id IN (SELECT public.get_user_project_ids())
  );

CREATE POLICY "Participants can insert calendar events" ON calendar_events
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND project_id IN (SELECT public.get_user_project_ids())
  );

CREATE POLICY "Participants can update calendar events" ON calendar_events
  FOR UPDATE USING (
    created_by = auth.uid()
    AND project_id IN (SELECT public.get_user_project_ids())
  );

CREATE POLICY "Participants can delete calendar events" ON calendar_events
  FOR DELETE USING (
    created_by = auth.uid()
    AND project_id IN (SELECT public.get_user_project_ids())
  );

-- ============================================================================
-- 6. Reload PostgREST schema cache
-- ============================================================================

NOTIFY pgrst, 'reload schema';
