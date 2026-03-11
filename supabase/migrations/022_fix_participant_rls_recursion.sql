-- ============================================================================
-- Migration 022: Fix infinite recursion between projects ↔ project_participants
-- ============================================================================
-- The projects policies query project_participants, whose policies query
-- projects, causing infinite recursion. Fix: use SECURITY DEFINER helper
-- functions that bypass RLS to check membership without triggering policy
-- evaluation on the other table.
-- ============================================================================

-- ============================================================================
-- 1. Create SECURITY DEFINER helper functions (bypass RLS)
-- ============================================================================

-- Returns project IDs the current user participates in (via organizations)
CREATE OR REPLACE FUNCTION public.get_user_project_ids()
RETURNS SETOF UUID AS $$
  SELECT pp.project_id
  FROM project_participants pp
  JOIN organizations o ON o.id = pp.organization_id
  WHERE o.user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns the tenant_id for a given project (bypass RLS on projects)
CREATE OR REPLACE FUNCTION public.get_project_tenant_id(p_project_id UUID)
RETURNS UUID AS $$
  SELECT tenant_id FROM projects WHERE id = p_project_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- 2. Fix PROJECTS policies — use helper function instead of subquery
-- ============================================================================
DROP POLICY IF EXISTS "Property owners can view own projects" ON projects;
DROP POLICY IF EXISTS "Participants can view assigned projects" ON projects;

CREATE POLICY "Participants can view own projects" ON projects
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id() AND
    id IN (SELECT public.get_user_project_ids())
  );

-- ============================================================================
-- 3. Fix PROJECT_PARTICIPANTS policies — use helper function
-- ============================================================================
DROP POLICY IF EXISTS "Admins can view project participants" ON project_participants;
DROP POLICY IF EXISTS "Admins can insert project participants" ON project_participants;
DROP POLICY IF EXISTS "Admins can update project participants" ON project_participants;
DROP POLICY IF EXISTS "Admins can delete project participants" ON project_participants;
DROP POLICY IF EXISTS "Participants can view fellow participants" ON project_participants;

-- Admin policies use helper function to get tenant_id without querying projects
CREATE POLICY "Admins can view project participants" ON project_participants
  FOR SELECT USING (
    public.get_user_role() = 'admin' AND
    public.get_project_tenant_id(project_id) = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can insert project participants" ON project_participants
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin' AND
    public.get_project_tenant_id(project_id) = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can update project participants" ON project_participants
  FOR UPDATE USING (
    public.get_user_role() = 'admin' AND
    public.get_project_tenant_id(project_id) = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can delete project participants" ON project_participants
  FOR DELETE USING (
    public.get_user_role() = 'admin' AND
    public.get_project_tenant_id(project_id) = public.get_user_tenant_id()
  );

-- Non-admin users can view participants on their own projects
CREATE POLICY "Participants can view fellow participants" ON project_participants
  FOR SELECT USING (
    project_id IN (SELECT public.get_user_project_ids())
  );

-- ============================================================================
-- 4. Fix PROJECT_PARTICIPANT_MATERIALS policies
-- ============================================================================
DROP POLICY IF EXISTS "Admins can view participant materials" ON project_participant_materials;
DROP POLICY IF EXISTS "Admins can insert participant materials" ON project_participant_materials;
DROP POLICY IF EXISTS "Admins can update participant materials" ON project_participant_materials;
DROP POLICY IF EXISTS "Admins can delete participant materials" ON project_participant_materials;
DROP POLICY IF EXISTS "Participants can view own materials" ON project_participant_materials;

CREATE POLICY "Admins can view participant materials" ON project_participant_materials
  FOR SELECT USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM project_participants pp
      WHERE pp.id = project_participant_id
        AND public.get_project_tenant_id(pp.project_id) = public.get_user_tenant_id()
    )
  );

CREATE POLICY "Admins can insert participant materials" ON project_participant_materials
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM project_participants pp
      WHERE pp.id = project_participant_id
        AND public.get_project_tenant_id(pp.project_id) = public.get_user_tenant_id()
    )
  );

CREATE POLICY "Admins can update participant materials" ON project_participant_materials
  FOR UPDATE USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM project_participants pp
      WHERE pp.id = project_participant_id
        AND public.get_project_tenant_id(pp.project_id) = public.get_user_tenant_id()
    )
  );

CREATE POLICY "Admins can delete participant materials" ON project_participant_materials
  FOR DELETE USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM project_participants pp
      WHERE pp.id = project_participant_id
        AND public.get_project_tenant_id(pp.project_id) = public.get_user_tenant_id()
    )
  );

CREATE POLICY "Participants can view own materials" ON project_participant_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_participants pp
      JOIN organizations o ON o.id = pp.organization_id
      WHERE pp.id = project_participant_id AND o.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. Fix REPORT_PHOTOS policy that might chain through projects
-- ============================================================================
DROP POLICY IF EXISTS "Participants can view report photos" ON report_photos;

CREATE POLICY "Participants can view report photos" ON report_photos
  FOR SELECT USING (
    project_id IN (SELECT public.get_user_project_ids())
  );

-- ============================================================================
-- 6. Fix FEED_POSTS policies to use helper function
-- ============================================================================
DROP POLICY IF EXISTS "Project participants can view feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Project participants can insert feed posts" ON feed_posts;

CREATE POLICY "Project participants can view feed posts" ON feed_posts
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id() AND deleted_at IS NULL AND (
      visible_to = '{}' OR auth.uid() = ANY(visible_to)
    ) AND (
      project_id IN (SELECT public.get_user_project_ids())
    )
  );

CREATE POLICY "Project participants can insert feed posts" ON feed_posts
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id() AND
    author_id = auth.uid() AND (
      public.get_user_role() = 'admin' OR
      project_id IN (SELECT public.get_user_project_ids())
    )
  );

-- ============================================================================
-- 7. Fix CHECKLIST policies to use helper function
-- ============================================================================
DROP POLICY IF EXISTS "Users can view checklists for accessible projects" ON project_checklists;

CREATE POLICY "Users can view checklists for accessible projects" ON project_checklists
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id() AND (
      public.get_user_role() = 'admin' OR
      project_id IN (SELECT public.get_user_project_ids())
    )
  );

-- ============================================================================
-- 8. Fix OWNERS_MANUAL policy to use helper function
-- ============================================================================
DROP POLICY IF EXISTS "Participants can view manual entries for their projects" ON owners_manual_entries;

CREATE POLICY "Participants can view manual entries for their projects" ON owners_manual_entries
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id() AND
    project_id IN (SELECT public.get_user_project_ids())
  );

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
