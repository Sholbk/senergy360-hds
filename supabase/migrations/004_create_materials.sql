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
