-- ============================================================================
-- Migration 026: Add project_update event type and team_member tracking
-- ============================================================================
-- Adds 'project_update' as a calendar event type, adds team_member_id to
-- track which team member is associated with an event, and adds file
-- attachment fields for document/image uploads with timestamps.
-- ============================================================================

-- 1. Add team_member_id column (references project_participants)
ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES project_participants(id);

-- 2. Add file attachment fields
ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS attachment_path TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS attachment_timestamp TIMESTAMPTZ;

-- 3. Update event_type CHECK constraint to include project_update
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_event_type_check;
ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_event_type_check
  CHECK (event_type IN ('meeting_zoom', 'meeting_google_meet', 'meeting_in_person', 'due_date', 'project_update'));

-- 4. Update meeting_requires_end_time constraint to allow project_update without end_time
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS meeting_requires_end_time;
ALTER TABLE calendar_events ADD CONSTRAINT meeting_requires_end_time CHECK (
  (event_type IN ('meeting_zoom', 'meeting_google_meet', 'meeting_in_person') AND end_time IS NOT NULL)
  OR (event_type IN ('due_date', 'project_update'))
);

-- 5. Index on team_member_id for color-coded calendar queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_team_member ON calendar_events(team_member_id)
  WHERE deleted_at IS NULL;

-- 6. Update conflict check function to include project_update (no conflict check needed for updates)
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
      AND event_type IN ('meeting_zoom', 'meeting_google_meet', 'meeting_in_person')
      AND id IS DISTINCT FROM p_exclude_id
      AND start_time < p_end
      AND end_time > p_start
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update double-booking trigger
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type IN ('meeting_zoom', 'meeting_google_meet', 'meeting_in_person')
     AND NEW.deleted_at IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM calendar_events
      WHERE tenant_id = NEW.tenant_id
        AND deleted_at IS NULL
        AND event_type IN ('meeting_zoom', 'meeting_google_meet', 'meeting_in_person')
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

NOTIFY pgrst, 'reload schema';
