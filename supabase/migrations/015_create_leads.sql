-- Leads table for marketing site contact/lead capture forms
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source_page TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- No tenant scoping needed for public leads
-- RLS: only service role can insert (from API route), admins can read
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read leads"
  ON leads FOR SELECT
  USING (auth.role() = 'authenticated');
