-- Owner's manual entries table
CREATE TABLE owners_manual_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  material_id UUID REFERENCES materials(id),
  professional_id UUID REFERENCES professionals(id),
  warranty_info TEXT,
  warranty_expiry DATE,
  contact_info TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_owners_manual_project ON owners_manual_entries(project_id);
CREATE INDEX idx_owners_manual_tenant ON owners_manual_entries(tenant_id);
