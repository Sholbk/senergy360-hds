-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  primary_first_name TEXT NOT NULL,
  primary_last_name TEXT NOT NULL,
  primary_phone TEXT,
  primary_email TEXT,
  secondary_first_name TEXT,
  secondary_last_name TEXT,
  secondary_phone TEXT,
  secondary_email TEXT,
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT DEFAULT 'US',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Professionals
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  business_name TEXT NOT NULL,
  primary_specialty TEXT NOT NULL,
  primary_first_name TEXT NOT NULL,
  primary_last_name TEXT NOT NULL,
  primary_phone TEXT,
  primary_email TEXT,
  secondary_first_name TEXT,
  secondary_last_name TEXT,
  secondary_phone TEXT,
  secondary_email TEXT,
  business_address_line1 TEXT,
  business_address_line2 TEXT,
  business_city TEXT,
  business_state TEXT,
  business_postal_code TEXT,
  business_country TEXT DEFAULT 'US',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Many-to-many: professionals <-> clients
CREATE TABLE professional_clients (
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, client_id)
);

-- Materials that a professional uses/recommends
CREATE TABLE professional_materials (
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, material_id)
);

CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_professionals_tenant ON professionals(tenant_id);
