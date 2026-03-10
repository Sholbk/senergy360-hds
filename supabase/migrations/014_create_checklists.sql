-- Project checklists table
CREATE TABLE project_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'SENERGY360 Core Systems Checklist',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_project_checklists_project ON project_checklists(project_id);

-- Checklist items table
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES project_checklists(id) ON DELETE CASCADE,
  main_category_id UUID REFERENCES main_categories(id),
  sub_category_id UUID REFERENCES sub_categories(id),
  label TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  checked_by UUID REFERENCES auth.users(id),
  checked_at TIMESTAMPTZ,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_checklist_items_checklist ON checklist_items(checklist_id);
