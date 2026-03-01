-- ============================================
-- SENERGY360 HDS - Full Database Migration
-- Run this in the Supabase SQL Editor
-- ============================================

-- === 001_create_tenants.sql ===
-- Tenants table for multi-tenancy support
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#C5A55A',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the initial SENERGY360 tenant
INSERT INTO tenants (name, slug, primary_color)
VALUES ('SENERGY360', 'senergy360', '#C5A55A');


-- === 002_create_profiles.sql ===
-- User profiles extending Supabase auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'client', 'professional')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger to auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, tenant_id, role, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data ->> 'tenant_id')::UUID,
      (SELECT id FROM tenants WHERE slug = 'senergy360' LIMIT 1)
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'admin'),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- === 003_create_categories.sql ===
-- Main Categories (12 Core Principles)
CREATE TABLE main_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  numeral INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, numeral)
);

-- Sub Categories (nested under main categories, supports tertiary via parent_sub_category_id)
CREATE TABLE sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  main_category_id UUID NOT NULL REFERENCES main_categories(id) ON DELETE CASCADE,
  parent_sub_category_id UUID REFERENCES sub_categories(id) ON DELETE SET NULL,
  sort_order INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sub_categories_main ON sub_categories(main_category_id);
CREATE INDEX idx_sub_categories_parent ON sub_categories(parent_sub_category_id);


-- === 004_create_materials.sql ===
-- Materials
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  manufacturer TEXT,
  primary_use TEXT,
  key_benefits TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Many-to-many: materials <-> subcategories
CREATE TABLE material_sub_categories (
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  sub_category_id UUID NOT NULL REFERENCES sub_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (material_id, sub_category_id)
);

CREATE INDEX idx_materials_tenant ON materials(tenant_id);
CREATE INDEX idx_material_sub_categories_sub ON material_sub_categories(sub_category_id);


-- === 005_create_clients_professionals.sql ===
-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  primary_first_name TEXT NOT NULL,
  primary_last_name TEXT NOT NULL,
  primary_phone TEXT,
  primary_email TEXT,
  secondary_first_name TEXT,
  secondary_last_name TEXT,
  secondary_phone TEXT,
  secondary_email TEXT,
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT DEFAULT 'US',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Professionals
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  business_name TEXT NOT NULL,
  primary_specialty TEXT NOT NULL,
  primary_first_name TEXT NOT NULL,
  primary_last_name TEXT NOT NULL,
  primary_phone TEXT,
  primary_email TEXT,
  secondary_first_name TEXT,
  secondary_last_name TEXT,
  secondary_phone TEXT,
  secondary_email TEXT,
  business_address_line1 TEXT,
  business_address_line2 TEXT,
  business_city TEXT,
  business_state TEXT,
  business_postal_code TEXT,
  business_country TEXT DEFAULT 'US',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Many-to-many: professionals <-> clients
CREATE TABLE professional_clients (
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, client_id)
);

-- Materials that a professional uses/recommends
CREATE TABLE professional_materials (
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, material_id)
);

CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_professionals_tenant ON professionals(tenant_id);


-- === 006_create_projects.sql ===
-- Project status and type enums
CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'completed');
CREATE TYPE project_type AS ENUM (
  'new_construction', 'renovation', 'addition', 'remodel',
  'commercial', 'residential', 'multi_family', 'custom_home', 'other'
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'draft',
  project_type project_type NOT NULL DEFAULT 'new_construction',
  project_type_other_description TEXT,
  client_id UUID NOT NULL REFERENCES clients(id),
  description TEXT,
  building_plan_summary TEXT,
  site_address_line1 TEXT NOT NULL,
  site_address_line2 TEXT,
  site_city TEXT NOT NULL,
  site_state TEXT NOT NULL,
  site_postal_code TEXT NOT NULL,
  site_country TEXT DEFAULT 'US',
  created_on TIMESTAMPTZ DEFAULT now(),
  started_on TIMESTAMPTZ,
  completed_on TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Professionals assigned to a project
CREATE TABLE project_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  UNIQUE(project_id, professional_id)
);

-- Materials assigned to a professional within a project
CREATE TABLE project_professional_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_professional_id UUID NOT NULL REFERENCES project_professionals(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  notes TEXT,
  UNIQUE(project_professional_id, material_id)
);

-- Client-directed materials (not tied to a professional)
CREATE TABLE project_client_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  notes TEXT,
  UNIQUE(project_id, material_id)
);

CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_professionals_project ON project_professionals(project_id);


-- === 007_create_private_notes.sql ===
-- Polymorphic private notes table
CREATE TABLE private_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id)
);

-- Ensure at least one foreign key is set
ALTER TABLE private_notes ADD CONSTRAINT chk_note_owner CHECK (
  (material_id IS NOT NULL)::int +
  (professional_id IS NOT NULL)::int +
  (client_id IS NOT NULL)::int +
  (project_id IS NOT NULL)::int = 1
);

CREATE INDEX idx_private_notes_material ON private_notes(material_id) WHERE material_id IS NOT NULL;
CREATE INDEX idx_private_notes_professional ON private_notes(professional_id) WHERE professional_id IS NOT NULL;
CREATE INDEX idx_private_notes_client ON private_notes(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_private_notes_project ON private_notes(project_id) WHERE project_id IS NOT NULL;


-- === 008_create_rls_policies.sql ===
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


