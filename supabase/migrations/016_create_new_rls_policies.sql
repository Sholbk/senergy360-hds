-- RLS policies for new tables
-- Using public schema helper functions (auth schema not writable via SQL Editor)

-- ============================================================
-- HELPER FUNCTIONS (public schema)
-- These are used by RLS policies to get the current user's tenant and role
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- DOCUMENTS
-- ============================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all documents in tenant" ON documents
  FOR SELECT USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Clients can view documents shared with them" ON documents
  FOR SELECT USING (
    public.get_user_role() = 'client' AND tenant_id = public.get_user_tenant_id() AND (
      visibility IN ('client', 'all_participants') OR
      id IN (SELECT document_id FROM document_access WHERE user_id = auth.uid()) OR
      id IN (
        SELECT da.document_id FROM document_access da
        JOIN clients c ON c.id = da.client_id
        WHERE c.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Professionals can view documents shared with them" ON documents
  FOR SELECT USING (
    public.get_user_role() = 'professional' AND tenant_id = public.get_user_tenant_id() AND (
      visibility IN ('professional', 'all_participants') OR
      id IN (SELECT document_id FROM document_access WHERE user_id = auth.uid()) OR
      id IN (
        SELECT da.document_id FROM document_access da
        JOIN professionals p ON p.id = da.professional_id
        WHERE p.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can insert documents" ON documents
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update documents" ON documents
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can sign documents shared with them" ON documents
  FOR UPDATE USING (
    tenant_id = public.get_user_tenant_id() AND
    signature_required = true AND
    signed_at IS NULL AND
    id IN (SELECT document_id FROM document_access WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete documents" ON documents
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- ============================================================
-- DOCUMENT ACCESS
-- ============================================================
ALTER TABLE document_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage document_access" ON document_access
  FOR ALL USING (
    public.get_user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND d.tenant_id = public.get_user_tenant_id())
  );

CREATE POLICY "Users can view their own document_access" ON document_access
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- FEED POSTS
-- ============================================================
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all feed posts in tenant" ON feed_posts
  FOR SELECT USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Project participants can view feed posts" ON feed_posts
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id() AND deleted_at IS NULL AND (
      visible_to = '{}' OR auth.uid() = ANY(visible_to)
    ) AND (
      EXISTS (
        SELECT 1 FROM projects p WHERE p.id = project_id AND (
          p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()) OR
          p.id IN (
            SELECT pp.project_id FROM project_professionals pp
            JOIN professionals pr ON pr.id = pp.professional_id
            WHERE pr.user_id = auth.uid()
          )
        )
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
        p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()) OR
        p.id IN (
          SELECT pp.project_id FROM project_professionals pp
          JOIN professionals pr ON pr.id = pp.professional_id
          WHERE pr.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Admins can update feed posts" ON feed_posts
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Authors can update own feed posts" ON feed_posts
  FOR UPDATE USING (author_id = auth.uid() AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can delete feed posts" ON feed_posts
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- ============================================================
-- FEED COMMENTS
-- ============================================================
ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on accessible posts" ON feed_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM feed_posts fp WHERE fp.id = feed_post_id AND (
        (public.get_user_role() = 'admin' AND fp.tenant_id = public.get_user_tenant_id()) OR
        (fp.visible_to = '{}' OR auth.uid() = ANY(fp.visible_to))
      )
    )
  );

CREATE POLICY "Project participants can insert comments" ON feed_comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM feed_posts fp WHERE fp.id = feed_post_id AND fp.tenant_id = public.get_user_tenant_id())
  );

CREATE POLICY "Authors can update own comments" ON feed_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Admins can delete comments" ON feed_comments
  FOR DELETE USING (
    public.get_user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM feed_posts fp WHERE fp.id = feed_post_id AND fp.tenant_id = public.get_user_tenant_id())
  );

-- ============================================================
-- INVOICES
-- ============================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all invoices in tenant" ON invoices
  FOR SELECT USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Clients can view own invoices" ON invoices
  FOR SELECT USING (
    public.get_user_role() = 'client' AND
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can insert invoices" ON invoices
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update invoices" ON invoices
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can delete invoices" ON invoices
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- Invoice line items
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view line items for accessible invoices" ON invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i WHERE i.id = invoice_id AND (
        (public.get_user_role() = 'admin' AND i.tenant_id = public.get_user_tenant_id()) OR
        (public.get_user_role() = 'client' AND i.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()))
      )
    )
  );

CREATE POLICY "Admins can manage invoice line items" ON invoice_line_items
  FOR ALL USING (
    public.get_user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM invoices i WHERE i.id = invoice_id AND i.tenant_id = public.get_user_tenant_id())
  );

-- ============================================================
-- OWNER'S MANUAL ENTRIES
-- ============================================================
ALTER TABLE owners_manual_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all manual entries in tenant" ON owners_manual_entries
  FOR SELECT USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Clients can view manual entries for their projects" ON owners_manual_entries
  FOR SELECT USING (
    public.get_user_role() = 'client' AND
    project_id IN (
      SELECT p.id FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert manual entries" ON owners_manual_entries
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update manual entries" ON owners_manual_entries
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can delete manual entries" ON owners_manual_entries
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- ============================================================
-- PROJECT CHECKLISTS
-- ============================================================
ALTER TABLE project_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklists for accessible projects" ON project_checklists
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id() AND
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_id AND (
        (public.get_user_role() = 'admin') OR
        (public.get_user_role() = 'client' AND p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())) OR
        (public.get_user_role() = 'professional' AND p.id IN (
          SELECT pp.project_id FROM project_professionals pp
          JOIN professionals pr ON pr.id = pp.professional_id
          WHERE pr.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Admins can insert checklists" ON project_checklists
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update checklists" ON project_checklists
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can delete checklists" ON project_checklists
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- CHECKLIST ITEMS
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklist items" ON checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_checklists pc WHERE pc.id = checklist_id AND pc.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "Admins can insert checklist items" ON checklist_items
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM project_checklists pc WHERE pc.id = checklist_id AND pc.tenant_id = public.get_user_tenant_id())
  );

CREATE POLICY "Admins and professionals can update checklist items" ON checklist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM project_checklists pc WHERE pc.id = checklist_id AND pc.tenant_id = public.get_user_tenant_id()
    ) AND (
      public.get_user_role() = 'admin' OR public.get_user_role() = 'professional'
    )
  );

CREATE POLICY "Admins can delete checklist items" ON checklist_items
  FOR DELETE USING (
    public.get_user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM project_checklists pc WHERE pc.id = checklist_id AND pc.tenant_id = public.get_user_tenant_id())
  );
