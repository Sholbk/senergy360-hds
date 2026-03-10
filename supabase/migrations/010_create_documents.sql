-- Document type enum
CREATE TYPE document_type AS ENUM (
  'proposal_contract',
  'core_principles',
  'core_systems_field_guide',
  'contract_recommendations',
  'building_science',
  'environmental_testing',
  'owners_manual_intro',
  'hds_checklist',
  'hds_trade_section',
  'custom'
);

-- Document visibility enum
CREATE TYPE document_visibility AS ENUM (
  'admin_only',
  'client',
  'professional',
  'all_participants'
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  document_type document_type NOT NULL DEFAULT 'custom',
  title TEXT NOT NULL,
  description TEXT,
  -- File-based documents (PDFs uploaded to Supabase Storage)
  storage_path TEXT,
  file_name TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  -- Structured in-app documents
  content_json JSONB,
  -- Visibility control
  visibility document_visibility NOT NULL DEFAULT 'admin_only',
  -- Sharing log
  shared_at TIMESTAMPTZ,
  shared_by UUID REFERENCES auth.users(id),
  shared_to_emails TEXT[],
  -- Digital signature fields
  signature_required BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  signed_by_name TEXT,
  signature_data TEXT,
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_tenant ON documents(tenant_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_deleted_at ON documents(deleted_at);

-- Document access junction table
CREATE TABLE document_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  professional_id UUID REFERENCES professionals(id),
  client_id UUID REFERENCES clients(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_document_access_document ON document_access(document_id);
CREATE INDEX idx_document_access_user ON document_access(user_id);
