-- ============================================================================
-- Migration 031: Create calendar_event_attachments table for multiple files
-- ============================================================================

CREATE TABLE calendar_event_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_cal_event_attachments_event ON calendar_event_attachments(event_id);

ALTER TABLE calendar_event_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view event attachments" ON calendar_event_attachments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert event attachments" ON calendar_event_attachments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete event attachments" ON calendar_event_attachments
  FOR DELETE USING (auth.role() = 'authenticated');

NOTIFY pgrst, 'reload schema';
