-- ============================================================================
-- Migration 030: Allow all authenticated users to insert documents
-- ============================================================================

-- Drop the admin-only insert policy
DROP POLICY IF EXISTS "Admins can insert documents" ON documents;

-- Allow all authenticated tenant members to insert documents
CREATE POLICY "Authenticated users can insert documents" ON documents
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND tenant_id = public.get_user_tenant_id()
  );

NOTIFY pgrst, 'reload schema';
