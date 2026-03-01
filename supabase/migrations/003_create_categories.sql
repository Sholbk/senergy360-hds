-- Main Categories (12 Core Principles)
CREATE TABLE main_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  numeral INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, numeral)
);

-- Sub Categories (nested under main categories, supports tertiary via parent_sub_category_id)
CREATE TABLE sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  main_category_id UUID NOT NULL REFERENCES main_categories(id) ON DELETE CASCADE,
  parent_sub_category_id UUID REFERENCES sub_categories(id) ON DELETE SET NULL,
  sort_order INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sub_categories_main ON sub_categories(main_category_id);
CREATE INDEX idx_sub_categories_parent ON sub_categories(parent_sub_category_id);
