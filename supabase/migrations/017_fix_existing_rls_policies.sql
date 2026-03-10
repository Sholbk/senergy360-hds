-- Fix existing RLS policies from migration 008
-- Replace auth.tenant_id() -> public.get_user_tenant_id()
-- Replace auth.user_role() -> public.get_user_role()
-- The auth schema functions could not be created via SQL Editor (permission denied)
-- The public schema equivalents were created in migration 016

-- Drop the auth schema functions if they somehow exist (they don't, but safe cleanup)
DROP FUNCTION IF EXISTS auth.tenant_id();
DROP FUNCTION IF EXISTS auth.user_role();

-- ============================================================
-- Drop ALL existing policies from migration 008 and recreate
-- ============================================================

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in tenant" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles in tenant" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles in tenant" ON profiles
  FOR SELECT USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update profiles in tenant" ON profiles
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- MAIN CATEGORIES
DROP POLICY IF EXISTS "Authenticated users can view categories in tenant" ON main_categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON main_categories;
DROP POLICY IF EXISTS "Admins can update categories" ON main_categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON main_categories;

CREATE POLICY "Authenticated users can view categories in tenant" ON main_categories
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can insert categories" ON main_categories
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update categories" ON main_categories
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can delete categories" ON main_categories
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- SUB CATEGORIES
DROP POLICY IF EXISTS "Authenticated users can view subcategories in tenant" ON sub_categories;
DROP POLICY IF EXISTS "Admins can insert subcategories" ON sub_categories;
DROP POLICY IF EXISTS "Admins can update subcategories" ON sub_categories;
DROP POLICY IF EXISTS "Admins can delete subcategories" ON sub_categories;

CREATE POLICY "Authenticated users can view subcategories in tenant" ON sub_categories
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can insert subcategories" ON sub_categories
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update subcategories" ON sub_categories
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can delete subcategories" ON sub_categories
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- MATERIALS
DROP POLICY IF EXISTS "Authenticated users can view materials in tenant" ON materials;
DROP POLICY IF EXISTS "Admins can insert materials" ON materials;
DROP POLICY IF EXISTS "Admins can update materials" ON materials;
DROP POLICY IF EXISTS "Admins can delete materials" ON materials;

CREATE POLICY "Authenticated users can view materials in tenant" ON materials
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can insert materials" ON materials
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update materials" ON materials
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can delete materials" ON materials
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- MATERIAL SUB CATEGORIES
DROP POLICY IF EXISTS "Authenticated users can view material_sub_categories" ON material_sub_categories;
DROP POLICY IF EXISTS "Admins can manage material_sub_categories" ON material_sub_categories;

CREATE POLICY "Authenticated users can view material_sub_categories" ON material_sub_categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM materials m WHERE m.id = material_id AND m.tenant_id = public.get_user_tenant_id())
  );

CREATE POLICY "Admins can manage material_sub_categories" ON material_sub_categories
  FOR ALL USING (
    public.get_user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM materials m WHERE m.id = material_id AND m.tenant_id = public.get_user_tenant_id())
  );

-- CLIENTS
DROP POLICY IF EXISTS "Admins can view all clients in tenant" ON clients;
DROP POLICY IF EXISTS "Clients can view own record" ON clients;
DROP POLICY IF EXISTS "Admins can insert clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;

CREATE POLICY "Admins can view all clients in tenant" ON clients
  FOR SELECT USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Clients can view own record" ON clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can insert clients" ON clients
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update clients" ON clients
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can delete clients" ON clients
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- PROFESSIONALS
DROP POLICY IF EXISTS "Admins can view all professionals in tenant" ON professionals;
DROP POLICY IF EXISTS "Professionals can view own record" ON professionals;
DROP POLICY IF EXISTS "Admins can insert professionals" ON professionals;
DROP POLICY IF EXISTS "Admins can update professionals" ON professionals;
DROP POLICY IF EXISTS "Admins can delete professionals" ON professionals;

CREATE POLICY "Admins can view all professionals in tenant" ON professionals
  FOR SELECT USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Professionals can view own record" ON professionals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can insert professionals" ON professionals
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update professionals" ON professionals
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can delete professionals" ON professionals
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- PROJECTS
DROP POLICY IF EXISTS "Admins can view all projects in tenant" ON projects;
DROP POLICY IF EXISTS "Clients can view own projects" ON projects;
DROP POLICY IF EXISTS "Professionals can view assigned projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

CREATE POLICY "Admins can view all projects in tenant" ON projects
  FOR SELECT USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Clients can view own projects" ON projects
  FOR SELECT USING (
    public.get_user_role() = 'client' AND
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Professionals can view assigned projects" ON projects
  FOR SELECT USING (
    public.get_user_role() = 'professional' AND
    id IN (
      SELECT pp.project_id FROM project_professionals pp
      JOIN professionals p ON p.id = pp.professional_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert projects" ON projects
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update projects" ON projects
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can delete projects" ON projects
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- PROJECT PROFESSIONALS
DROP POLICY IF EXISTS "Users can view project_professionals for accessible projects" ON project_professionals;
DROP POLICY IF EXISTS "Admins can manage project_professionals" ON project_professionals;

CREATE POLICY "Users can view project_professionals for accessible projects" ON project_professionals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND (
      (public.get_user_role() = 'admin' AND p.tenant_id = public.get_user_tenant_id()) OR
      (public.get_user_role() = 'client' AND p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())) OR
      (public.get_user_role() = 'professional' AND project_id IN (
        SELECT pp2.project_id FROM project_professionals pp2
        JOIN professionals pr ON pr.id = pp2.professional_id
        WHERE pr.user_id = auth.uid()
      ))
    ))
  );

CREATE POLICY "Admins can manage project_professionals" ON project_professionals
  FOR ALL USING (
    public.get_user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.tenant_id = public.get_user_tenant_id())
  );

-- PROJECT PROFESSIONAL MATERIALS
DROP POLICY IF EXISTS "Users can view project_professional_materials" ON project_professional_materials;
DROP POLICY IF EXISTS "Admins can manage project_professional_materials" ON project_professional_materials;

CREATE POLICY "Users can view project_professional_materials" ON project_professional_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_professionals pp
      JOIN projects p ON p.id = pp.project_id
      WHERE pp.id = project_professional_id AND (
        (public.get_user_role() = 'admin' AND p.tenant_id = public.get_user_tenant_id()) OR
        (public.get_user_role() = 'client' AND p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())) OR
        (public.get_user_role() = 'professional' AND pp.professional_id IN (SELECT id FROM professionals WHERE user_id = auth.uid()))
      )
    )
  );

CREATE POLICY "Admins can manage project_professional_materials" ON project_professional_materials
  FOR ALL USING (
    public.get_user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM project_professionals pp
      JOIN projects p ON p.id = pp.project_id
      WHERE pp.id = project_professional_id AND p.tenant_id = public.get_user_tenant_id()
    )
  );

-- PROJECT CLIENT MATERIALS
DROP POLICY IF EXISTS "Users can view project_client_materials" ON project_client_materials;
DROP POLICY IF EXISTS "Admins can manage project_client_materials" ON project_client_materials;

CREATE POLICY "Users can view project_client_materials" ON project_client_materials
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND (
      (public.get_user_role() = 'admin' AND p.tenant_id = public.get_user_tenant_id()) OR
      (public.get_user_role() = 'client' AND p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()))
    ))
  );

CREATE POLICY "Admins can manage project_client_materials" ON project_client_materials
  FOR ALL USING (
    public.get_user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.tenant_id = public.get_user_tenant_id())
  );

-- PROFESSIONAL CLIENTS
DROP POLICY IF EXISTS "Admins can manage professional_clients" ON professional_clients;

CREATE POLICY "Admins can manage professional_clients" ON professional_clients
  FOR ALL USING (
    public.get_user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM professionals p WHERE p.id = professional_id AND p.tenant_id = public.get_user_tenant_id())
  );

-- PROFESSIONAL MATERIALS
DROP POLICY IF EXISTS "Admins can manage professional_materials" ON professional_materials;

CREATE POLICY "Admins can manage professional_materials" ON professional_materials
  FOR ALL USING (
    public.get_user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM professionals p WHERE p.id = professional_id AND p.tenant_id = public.get_user_tenant_id())
  );

-- PRIVATE NOTES
DROP POLICY IF EXISTS "Admins can view all notes in tenant" ON private_notes;
DROP POLICY IF EXISTS "Admins can insert notes" ON private_notes;
DROP POLICY IF EXISTS "Admins can update notes" ON private_notes;
DROP POLICY IF EXISTS "Admins can delete notes" ON private_notes;

CREATE POLICY "Admins can view all notes in tenant" ON private_notes
  FOR SELECT USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can insert notes" ON private_notes
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can update notes" ON private_notes
  FOR UPDATE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can delete notes" ON private_notes
  FOR DELETE USING (public.get_user_role() = 'admin' AND tenant_id = public.get_user_tenant_id());

-- TENANTS
DROP POLICY IF EXISTS "Users can view own tenant" ON tenants;

CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT USING (id = public.get_user_tenant_id());
