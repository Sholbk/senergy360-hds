-- Report photos for inspection documentation
-- Photos can come from both the activity feed and dedicated uploads here
CREATE TABLE report_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  caption TEXT,
  category TEXT,
  sort_order INT DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_report_photos_project ON report_photos(project_id);
CREATE INDEX idx_report_photos_tenant ON report_photos(tenant_id);
