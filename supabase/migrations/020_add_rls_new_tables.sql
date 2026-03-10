-- ============================================================================
-- Migration 020: Add RLS policies for tables created in migration 018 + 019
-- ============================================================================
-- Migration 018 created organizations, project_participants,
-- project_participant_materials, and email_log but did NOT enable RLS.
-- Migration 019 created report_photos without RLS.
-- This migration adds RLS policies for all of them.
-- ============================================================================

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Admins can do everything within their tenant
CREATE POLICY "Admins can view organizations" ON organizations
  FOR SELECT USING (
    public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can insert organizations" ON organizations
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can update organizations" ON organizations
  FOR UPDATE USING (
    public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can delete organizations" ON organizations
  FOR DELETE USING (
    public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id()
  );

-- Non-admin users can view their own organization
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (
    user_id = auth.uid() AND tenant_id = public.get_user_tenant_id()
  );

-- ============================================================================
-- PROJECT PARTICIPANTS
-- ============================================================================
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;

-- Admins can do everything for projects in their tenant
CREATE POLICY "Admins can view project participants" ON project_participants
  FOR SELECT USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "Admins can insert project participants" ON project_participants
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "Admins can update project participants" ON project_participants
  FOR UPDATE USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "Admins can delete project participants" ON project_participants
  FOR DELETE USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.tenant_id = public.get_user_tenant_id()
    )
  );

-- Non-admin users can view participants on projects they belong to
CREATE POLICY "Participants can view fellow participants" ON project_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_participants pp
      JOIN organizations o ON o.id = pp.organization_id
      WHERE pp.project_id = project_participants.project_id
        AND o.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PROJECT PARTICIPANT MATERIALS
-- ============================================================================
ALTER TABLE project_participant_materials ENABLE ROW LEVEL SECURITY;

-- Admins can manage all participant materials in their tenant
CREATE POLICY "Admins can view participant materials" ON project_participant_materials
  FOR SELECT USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM project_participants pp
      JOIN projects p ON p.id = pp.project_id
      WHERE pp.id = project_participant_id AND p.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "Admins can insert participant materials" ON project_participant_materials
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM project_participants pp
      JOIN projects p ON p.id = pp.project_id
      WHERE pp.id = project_participant_id AND p.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "Admins can update participant materials" ON project_participant_materials
  FOR UPDATE USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM project_participants pp
      JOIN projects p ON p.id = pp.project_id
      WHERE pp.id = project_participant_id AND p.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "Admins can delete participant materials" ON project_participant_materials
  FOR DELETE USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM project_participants pp
      JOIN projects p ON p.id = pp.project_id
      WHERE pp.id = project_participant_id AND p.tenant_id = public.get_user_tenant_id()
    )
  );

-- Non-admin users can view materials assigned to them
CREATE POLICY "Participants can view own materials" ON project_participant_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_participants pp
      JOIN organizations o ON o.id = pp.organization_id
      WHERE pp.id = project_participant_id AND o.user_id = auth.uid()
    )
  );

-- ============================================================================
-- EMAIL LOG
-- ============================================================================
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email log" ON email_log
  FOR SELECT USING (
    public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can insert email log" ON email_log
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id()
  );

-- ============================================================================
-- REPORT PHOTOS
-- ============================================================================
ALTER TABLE report_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view report photos" ON report_photos
  FOR SELECT USING (
    public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can insert report photos" ON report_photos
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can update report photos" ON report_photos
  FOR UPDATE USING (
    public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can delete report photos" ON report_photos
  FOR DELETE USING (
    public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id()
  );

-- Non-admin participants can view report photos for their projects
CREATE POLICY "Participants can view report photos" ON report_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_participants pp
      JOIN organizations o ON o.id = pp.organization_id
      WHERE pp.project_id = report_photos.project_id
        AND o.user_id = auth.uid()
    )
  );

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
