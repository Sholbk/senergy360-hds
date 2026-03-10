-- ============================================================================
-- Migration 018: Project-Centric Redesign
-- ============================================================================
-- Redesigns the system from client/professional-centric to project-centric.
--
-- Summary of changes:
--   1. Create `organizations` table (replaces `clients` + `professionals`)
--   2. Create `project_participants` table (replaces `project_professionals` + client_id FK)
--   3. Create `project_participant_materials` (replaces `project_professional_materials` + `project_client_materials`)
--   4. Create `email_log` table
--   5. Migrate existing data using temporary mapping tables
--   6. Update `profiles` role constraint
--   7. Add `organization_id` columns to related tables and backfill
--   8. Make `client_id` on projects nullable
--   9. Add indexes
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CREATE NEW TABLES
-- ============================================================================

-- 1a. organizations (unified replacement for clients + professionals)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  org_type TEXT NOT NULL CHECK (org_type IN ('property_owner', 'architect', 'general_contractor', 'trade', 'other')),
  business_name TEXT,
  specialty TEXT,
  primary_first_name TEXT NOT NULL,
  primary_last_name TEXT NOT NULL,
  primary_phone TEXT,
  primary_email TEXT,
  secondary_first_name TEXT,
  secondary_last_name TEXT,
  secondary_phone TEXT,
  secondary_email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 1b. project_participants (unified replacement for project_professionals + client_id on projects)
CREATE TABLE IF NOT EXISTS project_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_role TEXT NOT NULL CHECK (project_role IN ('property_owner', 'architect', 'general_contractor', 'trade')),
  parent_participant_id UUID REFERENCES project_participants(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, organization_id)
);

-- 1c. project_participant_materials (unified replacement for project_professional_materials + project_client_materials)
CREATE TABLE IF NOT EXISTS project_participant_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_participant_id UUID NOT NULL REFERENCES project_participants(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  notes TEXT,
  is_owner_directed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_participant_id, material_id)
);

-- 1d. email_log
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id),
  organization_id UUID REFERENCES organizations(id),
  sent_by UUID REFERENCES auth.users(id),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  resend_message_id TEXT,
  email_type TEXT CHECK (email_type IN ('invitation', 'material_instructions', 'document_share', 'custom'))
);


-- ============================================================================
-- 2. DATA MIGRATION — Temporary mapping tables
-- ============================================================================
-- We use temp tables to track old client/professional IDs -> new organization IDs
-- so we can remap all foreign keys.

-- Map: old client_id -> new organization_id
CREATE TEMP TABLE _map_client_to_org (
  old_client_id UUID PRIMARY KEY,
  new_org_id UUID NOT NULL
);

-- Map: old professional_id -> new organization_id
CREATE TEMP TABLE _map_professional_to_org (
  old_professional_id UUID PRIMARY KEY,
  new_org_id UUID NOT NULL
);

-- Map: old project_professionals.id -> new project_participants.id
CREATE TEMP TABLE _map_pp_to_participant (
  old_project_professional_id UUID PRIMARY KEY,
  new_participant_id UUID NOT NULL
);


-- ============================================================================
-- 2a. Migrate clients -> organizations (org_type = 'property_owner')
-- ============================================================================

INSERT INTO organizations (
  id, tenant_id, org_type,
  business_name, specialty,
  primary_first_name, primary_last_name,
  primary_phone, primary_email,
  secondary_first_name, secondary_last_name,
  secondary_phone, secondary_email,
  address_line1, address_line2,
  city, state, postal_code, country,
  user_id, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  c.tenant_id,
  'property_owner',
  NULL,               -- clients don't have business_name
  NULL,               -- clients don't have specialty
  c.primary_first_name,
  c.primary_last_name,
  c.primary_phone,
  c.primary_email,
  c.secondary_first_name,
  c.secondary_last_name,
  c.secondary_phone,
  c.secondary_email,
  c.billing_address_line1,
  c.billing_address_line2,
  c.billing_city,
  c.billing_state,
  c.billing_postal_code,
  c.billing_country,
  c.user_id,
  c.created_at,
  c.updated_at
FROM clients c;

-- Populate the client mapping table by matching on unique fields
-- (tenant_id + primary names + email should be unique enough after insert)
INSERT INTO _map_client_to_org (old_client_id, new_org_id)
SELECT c.id, o.id
FROM clients c
JOIN organizations o ON
  o.tenant_id = c.tenant_id
  AND o.org_type = 'property_owner'
  AND o.primary_first_name = c.primary_first_name
  AND o.primary_last_name = c.primary_last_name
  AND o.created_at = c.created_at;


-- ============================================================================
-- 2b. Migrate professionals -> organizations (org_type derived from specialty)
-- ============================================================================

INSERT INTO organizations (
  id, tenant_id, org_type,
  business_name, specialty,
  primary_first_name, primary_last_name,
  primary_phone, primary_email,
  secondary_first_name, secondary_last_name,
  secondary_phone, secondary_email,
  address_line1, address_line2,
  city, state, postal_code, country,
  user_id, created_at, updated_at, deleted_at
)
SELECT
  gen_random_uuid(),
  p.tenant_id,
  CASE
    WHEN lower(p.primary_specialty) LIKE '%architect%' THEN 'architect'
    WHEN lower(p.primary_specialty) LIKE '%general contractor%'
      OR lower(p.primary_specialty) LIKE '%gc%' THEN 'general_contractor'
    ELSE 'trade'
  END,
  p.business_name,
  p.primary_specialty,
  p.primary_first_name,
  p.primary_last_name,
  p.primary_phone,
  p.primary_email,
  p.secondary_first_name,
  p.secondary_last_name,
  p.secondary_phone,
  p.secondary_email,
  p.business_address_line1,
  p.business_address_line2,
  p.business_city,
  p.business_state,
  p.business_postal_code,
  p.business_country,
  p.user_id,
  p.created_at,
  p.updated_at,
  p.deleted_at
FROM professionals p;

-- Populate the professional mapping table
INSERT INTO _map_professional_to_org (old_professional_id, new_org_id)
SELECT p.id, o.id
FROM professionals p
JOIN organizations o ON
  o.tenant_id = p.tenant_id
  AND o.org_type != 'property_owner'
  AND o.business_name = p.business_name
  AND o.primary_first_name = p.primary_first_name
  AND o.primary_last_name = p.primary_last_name
  AND o.created_at = p.created_at;


-- ============================================================================
-- 2c. Migrate project clients -> project_participants (property_owner role)
-- ============================================================================

INSERT INTO project_participants (
  id, project_id, organization_id, project_role, created_at
)
SELECT
  gen_random_uuid(),
  proj.id,
  m.new_org_id,
  'property_owner',
  proj.created_on
FROM projects proj
JOIN _map_client_to_org m ON m.old_client_id = proj.client_id
WHERE proj.client_id IS NOT NULL;


-- ============================================================================
-- 2d. Migrate project_professionals -> project_participants
-- ============================================================================

INSERT INTO project_participants (
  id, project_id, organization_id, project_role, created_at
)
SELECT
  gen_random_uuid(),
  pp.project_id,
  m.new_org_id,
  -- Derive role from the organization's org_type
  CASE
    WHEN o.org_type = 'architect' THEN 'architect'
    WHEN o.org_type = 'general_contractor' THEN 'general_contractor'
    ELSE 'trade'
  END,
  now()
FROM project_professionals pp
JOIN _map_professional_to_org m ON m.old_professional_id = pp.professional_id
JOIN organizations o ON o.id = m.new_org_id
-- Avoid duplicates if a professional was also the client on the same project
ON CONFLICT (project_id, organization_id) DO NOTHING;

-- Build the project_professionals -> project_participants mapping
INSERT INTO _map_pp_to_participant (old_project_professional_id, new_participant_id)
SELECT pp.id, part.id
FROM project_professionals pp
JOIN _map_professional_to_org m ON m.old_professional_id = pp.professional_id
JOIN project_participants part ON
  part.project_id = pp.project_id
  AND part.organization_id = m.new_org_id;


-- ============================================================================
-- 2e. Migrate project_professional_materials -> project_participant_materials
-- ============================================================================

INSERT INTO project_participant_materials (
  project_participant_id, material_id, notes, is_owner_directed, created_at
)
SELECT
  mp.new_participant_id,
  ppm.material_id,
  ppm.notes,
  false,
  now()
FROM project_professional_materials ppm
JOIN _map_pp_to_participant mp ON mp.old_project_professional_id = ppm.project_professional_id;


-- ============================================================================
-- 2f. Migrate project_client_materials -> project_participant_materials
--     (is_owner_directed = true, linked to the property_owner participant)
-- ============================================================================

INSERT INTO project_participant_materials (
  project_participant_id, material_id, notes, is_owner_directed, created_at
)
SELECT
  part.id,
  pcm.material_id,
  pcm.notes,
  true,
  now()
FROM project_client_materials pcm
JOIN projects proj ON proj.id = pcm.project_id
JOIN _map_client_to_org mc ON mc.old_client_id = proj.client_id
JOIN project_participants part ON
  part.project_id = pcm.project_id
  AND part.organization_id = mc.new_org_id
ON CONFLICT (project_participant_id, material_id) DO NOTHING;


-- ============================================================================
-- 3. UPDATE PROFILES — role constraint
-- ============================================================================

-- First, remap existing role values
UPDATE profiles SET role = 'property_owner' WHERE role = 'client';
UPDATE profiles SET role = 'general_contractor' WHERE role = 'professional';

-- Drop old check constraint and add new one
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'property_owner', 'architect', 'general_contractor', 'trade'));


-- ============================================================================
-- 4. MAKE client_id NULLABLE ON projects (keep column for safety)
-- ============================================================================

ALTER TABLE projects ALTER COLUMN client_id DROP NOT NULL;


-- ============================================================================
-- 5. ADD organization_id COLUMNS TO RELATED TABLES AND BACKFILL
-- ============================================================================

-- 5a. documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

UPDATE documents d
SET organization_id = m.new_org_id
FROM _map_client_to_org m
WHERE d.client_id = m.old_client_id
  AND d.organization_id IS NULL;

-- 5b. invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

UPDATE invoices i
SET organization_id = m.new_org_id
FROM _map_client_to_org m
WHERE i.client_id = m.old_client_id
  AND i.organization_id IS NULL;

-- 5c. owners_manual_entries
ALTER TABLE owners_manual_entries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

UPDATE owners_manual_entries ome
SET organization_id = m.new_org_id
FROM _map_professional_to_org m
WHERE ome.professional_id = m.old_professional_id
  AND ome.organization_id IS NULL;

-- 5d. private_notes — add organization_id column
ALTER TABLE private_notes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Backfill from professional_id
UPDATE private_notes pn
SET organization_id = m.new_org_id
FROM _map_professional_to_org m
WHERE pn.professional_id = m.old_professional_id
  AND pn.organization_id IS NULL;

-- Backfill from client_id
UPDATE private_notes pn
SET organization_id = m.new_org_id
FROM _map_client_to_org m
WHERE pn.client_id = m.old_client_id
  AND pn.organization_id IS NULL;

-- Update the private_notes check constraint to include organization_id
ALTER TABLE private_notes DROP CONSTRAINT IF EXISTS chk_note_owner;
ALTER TABLE private_notes ADD CONSTRAINT chk_note_owner CHECK (
  (material_id IS NOT NULL)::int +
  (professional_id IS NOT NULL)::int +
  (client_id IS NOT NULL)::int +
  (organization_id IS NOT NULL)::int +
  (project_id IS NOT NULL)::int >= 1
);

-- 5e. document_access
ALTER TABLE document_access ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Backfill from professional_id
UPDATE document_access da
SET organization_id = m.new_org_id
FROM _map_professional_to_org m
WHERE da.professional_id = m.old_professional_id
  AND da.organization_id IS NULL;

-- Backfill from client_id
UPDATE document_access da
SET organization_id = m.new_org_id
FROM _map_client_to_org m
WHERE da.client_id = m.old_client_id
  AND da.organization_id IS NULL;


-- ============================================================================
-- 6. INDEXES ON NEW TABLES
-- ============================================================================

-- organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_tenant ON organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizations_org_type ON organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_user ON organizations(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_deleted_at ON organizations(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_tenant_type ON organizations(tenant_id, org_type);

-- project_participants indexes
CREATE INDEX IF NOT EXISTS idx_project_participants_project ON project_participants(project_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_organization ON project_participants(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_role ON project_participants(project_role);
CREATE INDEX IF NOT EXISTS idx_project_participants_parent ON project_participants(parent_participant_id)
  WHERE parent_participant_id IS NOT NULL;

-- project_participant_materials indexes
CREATE INDEX IF NOT EXISTS idx_ppm_participant ON project_participant_materials(project_participant_id);
CREATE INDEX IF NOT EXISTS idx_ppm_material ON project_participant_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_ppm_owner_directed ON project_participant_materials(is_owner_directed)
  WHERE is_owner_directed = true;

-- email_log indexes
CREATE INDEX IF NOT EXISTS idx_email_log_tenant ON email_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_log_project ON email_log(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_log_organization ON email_log(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_log_sent_at ON email_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON email_log(email_type);

-- organization_id on existing tables
CREATE INDEX IF NOT EXISTS idx_documents_organization ON documents(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_organization ON invoices(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_owners_manual_organization ON owners_manual_entries(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_private_notes_organization ON private_notes(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_document_access_organization ON document_access(organization_id) WHERE organization_id IS NOT NULL;


-- ============================================================================
-- 7. CLEANUP — drop temp tables (auto-dropped at end of session, but explicit is better)
-- ============================================================================

DROP TABLE IF EXISTS _map_pp_to_participant;
DROP TABLE IF EXISTS _map_professional_to_org;
DROP TABLE IF EXISTS _map_client_to_org;


-- ============================================================================
-- 8. RELOAD PostgREST schema cache
-- ============================================================================

NOTIFY pgrst, 'reload schema';

COMMIT;
