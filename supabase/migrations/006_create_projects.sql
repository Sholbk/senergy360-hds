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
