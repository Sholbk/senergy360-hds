-- Add soft-delete support to projects and professionals
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add indexes for filtering active records
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_professionals_deleted_at ON professionals(deleted_at) WHERE deleted_at IS NULL;

-- Reload PostgREST schema
NOTIFY pgrst, 'reload schema';
