-- ============================================================================
-- Migration 021: Fix infinite recursion in RLS policies
-- ============================================================================
-- The "Professionals can view assigned projects" policy on `projects` queries
-- `project_professionals`, whose policy queries back into `projects`, causing
-- infinite recursion. Drop old circular policies and replace with ones that
-- use the new project_participants + organizations tables.
-- ============================================================================

-- ============================================================================
-- 1. DROP old circular policies on PROJECTS
-- ============================================================================
DROP POLICY IF EXISTS "Clients can view own projects" ON projects;
DROP POLICY IF EXISTS "Professionals can view assigned projects" ON projects;

-- Replace with policies using new tables
CREATE POLICY "Property owners can view own projects" ON projects
  FOR SELECT USING (
    public.get_user_role() = 'property_owner' AND
    tenant_id = public.get_user_tenant_id() AND
    id IN (
      SELECT pp.project_id FROM project_participants pp
      JOIN organizations o ON o.id = pp.organization_id
      WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can view assigned projects" ON projects
  FOR SELECT USING (
    public.get_user_role() IN ('architect', 'general_contractor', 'trade') AND
    tenant_id = public.get_user_tenant_id() AND
    id IN (
      SELECT pp.project_id FROM project_participants pp
      JOIN organizations o ON o.id = pp.organization_id
      WHERE o.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. DROP old circular policies on PROJECT_PROFESSIONALS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view project_professionals for accessible projects" ON project_professionals;
DROP POLICY IF EXISTS "Admins can manage project_professionals" ON project_professionals;

-- Replace with simple tenant-scoped admin policy (no circular reference)
CREATE POLICY "Admins can manage project_professionals" ON project_professionals
  FOR ALL USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.tenant_id = public.get_user_tenant_id()
    )
  );

-- ============================================================================
-- 3. DROP old circular policies on PROJECT_PROFESSIONAL_MATERIALS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view project_professional_materials" ON project_professional_materials;
DROP POLICY IF EXISTS "Admins can manage project_professional_materials" ON project_professional_materials;

-- Replace with simple admin policy
CREATE POLICY "Admins can manage project_professional_materials" ON project_professional_materials
  FOR ALL USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM project_professionals pp
      JOIN projects p ON p.id = pp.project_id
      WHERE pp.id = project_professional_id AND p.tenant_id = public.get_user_tenant_id()
    )
  );

-- ============================================================================
-- 4. DROP old circular policies on PROJECT_CLIENT_MATERIALS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view project_client_materials" ON project_client_materials;
DROP POLICY IF EXISTS "Admins can manage project_client_materials" ON project_client_materials;

-- Replace with simple admin policy
CREATE POLICY "Admins can manage project_client_materials" ON project_client_materials
  FOR ALL USING (
    public.get_user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.tenant_id = public.get_user_tenant_id())
  );

-- ============================================================================
-- 5. Fix feed_posts policies that reference old tables
-- ============================================================================
DROP POLICY IF EXISTS "Project participants can view feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Project participants can insert feed posts" ON feed_posts;

CREATE POLICY "Project participants can view feed posts" ON feed_posts
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id() AND deleted_at IS NULL AND (
      visible_to = '{}' OR auth.uid() = ANY(visible_to)
    ) AND (
      EXISTS (
        SELECT 1 FROM project_participants pp
        JOIN organizations o ON o.id = pp.organization_id
        WHERE pp.project_id = feed_posts.project_id AND o.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Project participants can insert feed posts" ON feed_posts
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id() AND
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_id AND (
        (public.get_user_role() = 'admin' AND p.tenant_id = public.get_user_tenant_id()) OR
        EXISTS (
          SELECT 1 FROM project_participants pp
          JOIN organizations o ON o.id = pp.organization_id
          WHERE pp.project_id = p.id AND o.user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- 6. Fix invoices policy that references old clients table
-- ============================================================================
DROP POLICY IF EXISTS "Clients can view own invoices" ON invoices;

CREATE POLICY "Property owners can view own invoices" ON invoices
  FOR SELECT USING (
    public.get_user_role() = 'property_owner' AND
    organization_id IN (
      SELECT o.id FROM organizations o WHERE o.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. Fix checklist policies that reference old tables
-- ============================================================================
DROP POLICY IF EXISTS "Users can view checklists for accessible projects" ON project_checklists;

CREATE POLICY "Users can view checklists for accessible projects" ON project_checklists
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id() AND
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_id AND (
        (public.get_user_role() = 'admin') OR
        EXISTS (
          SELECT 1 FROM project_participants pp
          JOIN organizations o ON o.id = pp.organization_id
          WHERE pp.project_id = p.id AND o.user_id = auth.uid()
        )
      )
    )
  );

-- Fix checklist items policy for professionals -> new roles
DROP POLICY IF EXISTS "Admins and professionals can update checklist items" ON checklist_items;

CREATE POLICY "Admins and participants can update checklist items" ON checklist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM project_checklists pc WHERE pc.id = checklist_id AND pc.tenant_id = public.get_user_tenant_id()
    ) AND (
      public.get_user_role() IN ('admin', 'general_contractor', 'architect', 'trade')
    )
  );

-- ============================================================================
-- 8. Fix documents policies that reference old tables
-- ============================================================================
DROP POLICY IF EXISTS "Clients can view documents shared with them" ON documents;
DROP POLICY IF EXISTS "Professionals can view documents shared with them" ON documents;

CREATE POLICY "Participants can view documents shared with them" ON documents
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id() AND
    public.get_user_role() != 'admin' AND (
      visibility = 'all_participants' OR
      id IN (SELECT document_id FROM document_access WHERE user_id = auth.uid()) OR
      id IN (
        SELECT da.document_id FROM document_access da
        JOIN organizations o ON o.id = da.organization_id
        WHERE o.user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 9. Fix owners manual policy that references old tables
-- ============================================================================
DROP POLICY IF EXISTS "Clients can view manual entries for their projects" ON owners_manual_entries;

CREATE POLICY "Participants can view manual entries for their projects" ON owners_manual_entries
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id() AND
    project_id IN (
      SELECT pp.project_id FROM project_participants pp
      JOIN organizations o ON o.id = pp.organization_id
      WHERE o.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 10. Fix invoice_line_items policy that references old client table
-- ============================================================================
DROP POLICY IF EXISTS "Users can view line items for accessible invoices" ON invoice_line_items;

CREATE POLICY "Users can view line items for accessible invoices" ON invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i WHERE i.id = invoice_id AND (
        (public.get_user_role() = 'admin' AND i.tenant_id = public.get_user_tenant_id()) OR
        (public.get_user_role() = 'property_owner' AND i.organization_id IN (
          SELECT o.id FROM organizations o WHERE o.user_id = auth.uid()
        ))
      )
    )
  );

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
