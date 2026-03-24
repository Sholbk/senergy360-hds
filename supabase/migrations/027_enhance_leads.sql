-- ============================================================================
-- Migration 027: Enhance leads table for full CRM / Lead Management
-- ============================================================================
-- Adds stage tracking, tenant scoping, address fields, project type,
-- manager assignment, tags, and conversion linkage to organizations/projects.
-- ============================================================================

BEGIN;

-- 1. Add new columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'new'
  CHECK (stage IN ('new', 'followed_up', 'connected', 'meeting_scheduled', 'estimate_sent', 'won', 'snoozed', 'archived'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_postal_code TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_type TEXT
  CHECK (project_type IS NULL OR project_type IN ('new_construction', 'renovation', 'addition', 'remodel', 'commercial', 'residential', 'multi_family', 'custom_home', 'other'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Backfill existing leads
UPDATE leads SET lead_source = 'website' WHERE lead_source IS NULL;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_organization ON leads(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_project ON leads(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_not_deleted ON leads(id) WHERE deleted_at IS NULL;

-- 4. Update RLS policies
DROP POLICY IF EXISTS "Service role can insert leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can read leads" ON leads;

-- Public insert (for contact form / API route)
CREATE POLICY "Service role can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Admin read: tenant-scoped leads + unclaimed public leads
CREATE POLICY "Admins can view leads" ON leads
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      tenant_id IS NULL
      OR tenant_id = public.get_user_tenant_id()
    )
  );

-- Admin update within tenant (or unclaimed leads)
CREATE POLICY "Admins can update leads" ON leads
  FOR UPDATE USING (
    public.get_user_role() = 'admin' AND (
      tenant_id IS NULL OR tenant_id = public.get_user_tenant_id()
    )
  );

-- Admin delete within tenant
CREATE POLICY "Admins can delete leads" ON leads
  FOR DELETE USING (
    public.get_user_role() = 'admin' AND (
      tenant_id IS NULL OR tenant_id = public.get_user_tenant_id()
    )
  );

COMMIT;

NOTIFY pgrst, 'reload schema';
