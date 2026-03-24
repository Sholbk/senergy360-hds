-- ============================================================================
-- Migration 028: Create estimates and estimate_line_items tables
-- ============================================================================

BEGIN;

CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  lead_id UUID REFERENCES leads(id),
  estimate_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'approved', 'declined', 'expired')),
  subtotal_cents BIGINT NOT NULL DEFAULT 0,
  tax_cents BIGINT NOT NULL DEFAULT 0,
  total_cents BIGINT NOT NULL DEFAULT 0,
  valid_until DATE,
  approved_at TIMESTAMPTZ,
  converted_invoice_id UUID REFERENCES invoices(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE estimate_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents BIGINT NOT NULL,
  total_cents BIGINT NOT NULL,
  line_type TEXT NOT NULL DEFAULT 'custom'
    CHECK (line_type IN ('hds', 'inspection', 'hourly', 'custom')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_estimates_tenant ON estimates(tenant_id);
CREATE INDEX idx_estimates_organization ON estimates(organization_id);
CREATE INDEX idx_estimates_project ON estimates(project_id);
CREATE INDEX idx_estimates_lead ON estimates(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_estimates_status ON estimates(status);

-- RLS
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view estimates" ON estimates
  FOR SELECT USING (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can insert estimates" ON estimates
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can update estimates" ON estimates
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can delete estimates" ON estimates
  FOR DELETE USING (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

-- Line items inherit access through estimate
CREATE POLICY "Users can view estimate line items" ON estimate_line_items
  FOR SELECT USING (
    estimate_id IN (SELECT id FROM estimates WHERE tenant_id = public.get_user_tenant_id())
  );

CREATE POLICY "Users can insert estimate line items" ON estimate_line_items
  FOR INSERT WITH CHECK (
    estimate_id IN (SELECT id FROM estimates WHERE tenant_id = public.get_user_tenant_id())
  );

CREATE POLICY "Users can update estimate line items" ON estimate_line_items
  FOR UPDATE USING (
    estimate_id IN (SELECT id FROM estimates WHERE tenant_id = public.get_user_tenant_id())
  );

CREATE POLICY "Users can delete estimate line items" ON estimate_line_items
  FOR DELETE USING (
    estimate_id IN (SELECT id FROM estimates WHERE tenant_id = public.get_user_tenant_id())
  );

COMMIT;
NOTIFY pgrst, 'reload schema';
