-- Tenants table for multi-tenancy support
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#C5A55A',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the initial SENERGY360 tenant
INSERT INTO tenants (name, slug, primary_color)
VALUES ('SENERGY360', 'senergy360', '#C5A55A');
