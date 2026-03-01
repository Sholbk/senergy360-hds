-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_professional_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_client_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_notes ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ADMIN POLICIES: Full CRUD within tenant
-- ============================================================

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles in tenant" ON profiles
  FOR SELECT USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can update profiles in tenant" ON profiles
  FOR UPDATE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

-- Main Categories
CREATE POLICY "Authenticated users can view categories in tenant" ON main_categories
  FOR SELECT USING (tenant_id = auth.tenant_id());

CREATE POLICY "Admins can insert categories" ON main_categories
  FOR INSERT WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can update categories" ON main_categories
  FOR UPDATE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can delete categories" ON main_categories
  FOR DELETE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

-- Sub Categories
CREATE POLICY "Authenticated users can view subcategories in tenant" ON sub_categories
  FOR SELECT USING (tenant_id = auth.tenant_id());

CREATE POLICY "Admins can insert subcategories" ON sub_categories
  FOR INSERT WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can update subcategories" ON sub_categories
  FOR UPDATE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can delete subcategories" ON sub_categories
  FOR DELETE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

-- Materials
CREATE POLICY "Authenticated users can view materials in tenant" ON materials
  FOR SELECT USING (tenant_id = auth.tenant_id());

CREATE POLICY "Admins can insert materials" ON materials
  FOR INSERT WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can update materials" ON materials
  FOR UPDATE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can delete materials" ON materials
  FOR DELETE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

-- Material Sub Categories (junction table)
CREATE POLICY "Authenticated users can view material_sub_categories" ON material_sub_categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM materials m WHERE m.id = material_id AND m.tenant_id = auth.tenant_id())
  );

CREATE POLICY "Admins can manage material_sub_categories" ON material_sub_categories
  FOR ALL USING (
    auth.user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM materials m WHERE m.id = material_id AND m.tenant_id = auth.tenant_id())
  );

-- Clients
CREATE POLICY "Admins can view all clients in tenant" ON clients
  FOR SELECT USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Clients can view own record" ON clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can insert clients" ON clients
  FOR INSERT WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can update clients" ON clients
  FOR UPDATE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can delete clients" ON clients
  FOR DELETE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

-- Professionals
CREATE POLICY "Admins can view all professionals in tenant" ON professionals
  FOR SELECT USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Professionals can view own record" ON professionals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can insert professionals" ON professionals
  FOR INSERT WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can update professionals" ON professionals
  FOR UPDATE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can delete professionals" ON professionals
  FOR DELETE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

-- Projects
CREATE POLICY "Admins can view all projects in tenant" ON projects
  FOR SELECT USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Clients can view own projects" ON projects
  FOR SELECT USING (
    auth.user_role() = 'client' AND
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Professionals can view assigned projects" ON projects
  FOR SELECT USING (
    auth.user_role() = 'professional' AND
    id IN (
      SELECT pp.project_id FROM project_professionals pp
      JOIN professionals p ON p.id = pp.professional_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert projects" ON projects
  FOR INSERT WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can update projects" ON projects
  FOR UPDATE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can delete projects" ON projects
  FOR DELETE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

-- Project Professionals
CREATE POLICY "Users can view project_professionals for accessible projects" ON project_professionals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND (
      (auth.user_role() = 'admin' AND p.tenant_id = auth.tenant_id()) OR
      (auth.user_role() = 'client' AND p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())) OR
      (auth.user_role() = 'professional' AND project_id IN (
        SELECT pp2.project_id FROM project_professionals pp2
        JOIN professionals pr ON pr.id = pp2.professional_id
        WHERE pr.user_id = auth.uid()
      ))
    ))
  );

CREATE POLICY "Admins can manage project_professionals" ON project_professionals
  FOR ALL USING (
    auth.user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.tenant_id = auth.tenant_id())
  );

-- Project Professional Materials
CREATE POLICY "Users can view project_professional_materials" ON project_professional_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_professionals pp
      JOIN projects p ON p.id = pp.project_id
      WHERE pp.id = project_professional_id AND (
        (auth.user_role() = 'admin' AND p.tenant_id = auth.tenant_id()) OR
        (auth.user_role() = 'client' AND p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())) OR
        (auth.user_role() = 'professional' AND pp.professional_id IN (SELECT id FROM professionals WHERE user_id = auth.uid()))
      )
    )
  );

CREATE POLICY "Admins can manage project_professional_materials" ON project_professional_materials
  FOR ALL USING (
    auth.user_role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM project_professionals pp
      JOIN projects p ON p.id = pp.project_id
      WHERE pp.id = project_professional_id AND p.tenant_id = auth.tenant_id()
    )
  );

-- Project Client Materials
CREATE POLICY "Users can view project_client_materials" ON project_client_materials
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND (
      (auth.user_role() = 'admin' AND p.tenant_id = auth.tenant_id()) OR
      (auth.user_role() = 'client' AND p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()))
    ))
  );

CREATE POLICY "Admins can manage project_client_materials" ON project_client_materials
  FOR ALL USING (
    auth.user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.tenant_id = auth.tenant_id())
  );

-- Professional Clients
CREATE POLICY "Admins can manage professional_clients" ON professional_clients
  FOR ALL USING (
    auth.user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM professionals p WHERE p.id = professional_id AND p.tenant_id = auth.tenant_id())
  );

-- Professional Materials
CREATE POLICY "Admins can manage professional_materials" ON professional_materials
  FOR ALL USING (
    auth.user_role() = 'admin' AND
    EXISTS (SELECT 1 FROM professionals p WHERE p.id = professional_id AND p.tenant_id = auth.tenant_id())
  );

-- Private Notes
CREATE POLICY "Admins can view all notes in tenant" ON private_notes
  FOR SELECT USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can insert notes" ON private_notes
  FOR INSERT WITH CHECK (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can update notes" ON private_notes
  FOR UPDATE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

CREATE POLICY "Admins can delete notes" ON private_notes
  FOR DELETE USING (auth.user_role() = 'admin' AND tenant_id = auth.tenant_id());

-- Tenants (admins can view their own tenant)
CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT USING (id = auth.tenant_id());
