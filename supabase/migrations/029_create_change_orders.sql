-- ============================================================================
-- Migration 029: Create change_orders table
-- ============================================================================

BEGIN;

CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  change_order_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  cost_impact_cents BIGINT NOT NULL DEFAULT 0,
  requested_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_change_orders_tenant ON change_orders(tenant_id);
CREATE INDEX idx_change_orders_project ON change_orders(project_id);
CREATE INDEX idx_change_orders_status ON change_orders(status);

-- RLS
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view change orders" ON change_orders
  FOR SELECT USING (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can insert change orders" ON change_orders
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can update change orders" ON change_orders
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "Admins can delete change orders" ON change_orders
  FOR DELETE USING (
    public.get_user_role() = 'admin'
    AND tenant_id = public.get_user_tenant_id()
  );

COMMIT;
NOTIFY pgrst, 'reload schema';
