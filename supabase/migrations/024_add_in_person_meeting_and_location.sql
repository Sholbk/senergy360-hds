-- ============================================================================
-- Migration 024: Add in-person meeting type and location field
-- ============================================================================

-- Add location column for meeting addresses / online meeting links
ALTER TABLE calendar_events ADD COLUMN location TEXT;

-- Update the event_type CHECK constraint to include meeting_in_person
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_event_type_check;
ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_event_type_check
  CHECK (event_type IN ('meeting_zoom', 'meeting_google_meet', 'meeting_in_person', 'due_date'));

-- Update the meeting_requires_end_time constraint to include in-person
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS meeting_requires_end_time;
ALTER TABLE calendar_events ADD CONSTRAINT meeting_requires_end_time CHECK (
  (event_type IN ('meeting_zoom', 'meeting_google_meet', 'meeting_in_person') AND end_time IS NOT NULL)
  OR (event_type = 'due_date')
);

-- Update the conflict check function to include in-person meetings
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

-- Update the double-booking trigger to include in-person meetings
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

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
