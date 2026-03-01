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
