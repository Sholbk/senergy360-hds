-- ============================================================================
-- SEED DUMMY DATA for SENERGY360 / CORE Framework
-- Run this in the Supabase SQL Editor after all migrations are applied.
-- ============================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  -- Organization IDs
  v_org_smith UUID;
  v_org_johnson UUID;
  v_org_garcia UUID;
  v_org_williams UUID;
  v_org_chen UUID;
  v_org_apex UUID;
  v_org_summit UUID;
  v_org_greenline UUID;
  v_org_procraft UUID;
  v_org_ironwood UUID;
  -- Project IDs
  v_proj_smith UUID;
  v_proj_johnson UUID;
  v_proj_garcia UUID;
  v_proj_williams UUID;
  v_proj_chen UUID;
  -- Invoice IDs
  v_inv1 UUID;
  v_inv2 UUID;
  v_inv3 UUID;
  v_inv4 UUID;
  v_inv5 UUID;
  v_inv6 UUID;
  -- Estimate IDs
  v_est1 UUID;
  v_est2 UUID;
  v_est3 UUID;
  -- Client IDs (legacy table for invoice FK)
  v_client_smith UUID;
  v_client_johnson UUID;
  v_client_williams UUID;
  v_client_chen UUID;
  -- Participant IDs
  v_part_smith UUID;
  v_part_johnson UUID;
  v_part_garcia UUID;
  v_part_williams UUID;
  v_part_chen UUID;
BEGIN
  -- Get tenant
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant found. Please create a tenant first.';
  END IF;

  -- ============================================================================
  -- 1. ORGANIZATIONS (Property Owners)
  -- ============================================================================
  INSERT INTO organizations (id, tenant_id, org_type, primary_first_name, primary_last_name, primary_email, primary_phone, address_line1, city, state, postal_code)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'property_owner', 'David', 'Smith', 'david.smith@email.com', '520-555-0101', '4521 E Sunrise Dr', 'Tucson', 'AZ', '85718')
  RETURNING id INTO v_org_smith;

  INSERT INTO organizations (id, tenant_id, org_type, primary_first_name, primary_last_name, primary_email, primary_phone, address_line1, city, state, postal_code)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'property_owner', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '520-555-0102', '8901 N Oracle Rd', 'Oro Valley', 'AZ', '85737')
  RETURNING id INTO v_org_johnson;

  INSERT INTO organizations (id, tenant_id, org_type, primary_first_name, primary_last_name, primary_email, primary_phone, address_line1, city, state, postal_code)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'property_owner', 'Miguel', 'Garcia', 'miguel.garcia@email.com', '520-555-0103', '2200 W Ina Rd', 'Tucson', 'AZ', '85741')
  RETURNING id INTO v_org_garcia;

  INSERT INTO organizations (id, tenant_id, org_type, primary_first_name, primary_last_name, primary_email, primary_phone, address_line1, city, state, postal_code)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'property_owner', 'Jennifer', 'Williams', 'jennifer.williams@email.com', '480-555-0104', '15600 N Scottsdale Rd', 'Scottsdale', 'AZ', '85254')
  RETURNING id INTO v_org_williams;

  INSERT INTO organizations (id, tenant_id, org_type, primary_first_name, primary_last_name, primary_email, primary_phone, address_line1, city, state, postal_code)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'property_owner', 'Robert', 'Chen', 'robert.chen@email.com', '602-555-0105', '3400 E Camelback Rd', 'Phoenix', 'AZ', '85018')
  RETURNING id INTO v_org_chen;

  -- Organizations (GCs / Trades)
  INSERT INTO organizations (id, tenant_id, org_type, business_name, specialty, primary_first_name, primary_last_name, primary_email, primary_phone, city, state)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'general_contractor', 'Apex Custom Homes', 'Custom home building', 'Mark', 'Peterson', 'mark@apexcustomhomes.com', '520-555-0201', 'Tucson', 'AZ')
  RETURNING id INTO v_org_apex;

  INSERT INTO organizations (id, tenant_id, org_type, business_name, specialty, primary_first_name, primary_last_name, primary_email, primary_phone, city, state)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'general_contractor', 'Summit Construction', 'Residential renovation', 'Lisa', 'Torres', 'lisa@summitconstruction.com', '520-555-0202', 'Tucson', 'AZ')
  RETURNING id INTO v_org_summit;

  INSERT INTO organizations (id, tenant_id, org_type, business_name, specialty, primary_first_name, primary_last_name, primary_email, primary_phone, city, state)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'trade', 'GreenLine HVAC', 'HVAC systems & indoor air quality', 'Tom', 'Rivera', 'tom@greenlinehvac.com', '520-555-0301', 'Tucson', 'AZ')
  RETURNING id INTO v_org_greenline;

  INSERT INTO organizations (id, tenant_id, org_type, business_name, specialty, primary_first_name, primary_last_name, primary_email, primary_phone, city, state)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'trade', 'ProCraft Plumbing', 'Water filtration & plumbing', 'Jake', 'Adams', 'jake@procraftplumbing.com', '520-555-0302', 'Tucson', 'AZ')
  RETURNING id INTO v_org_procraft;

  INSERT INTO organizations (id, tenant_id, org_type, business_name, specialty, primary_first_name, primary_last_name, primary_email, primary_phone, city, state)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'architect', 'Ironwood Design Studio', 'Sustainable architecture', 'Amanda', 'Nguyen', 'amanda@ironwooddesign.com', '520-555-0303', 'Tucson', 'AZ')
  RETURNING id INTO v_org_ironwood;

  -- ============================================================================
  -- 2. PROJECTS
  -- ============================================================================
  INSERT INTO projects (id, tenant_id, name, status, project_type, description, site_address_line1, site_city, site_state, site_postal_code, site_country, created_on)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'Smith Residence — New Build', 'in_progress', 'custom_home',
     'Custom 3,200 sq ft home with healthy design specifications. Focus on indoor air quality, water filtration, and non-toxic materials.',
     '4521 E Sunrise Dr', 'Tucson', 'AZ', '85718', 'US', now() - interval '45 days')
  RETURNING id INTO v_proj_smith;

  INSERT INTO projects (id, tenant_id, name, status, project_type, description, site_address_line1, site_city, site_state, site_postal_code, site_country, created_on)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'Johnson Kitchen & Bath Renovation', 'in_progress', 'renovation',
     'Full kitchen and master bath renovation with low-VOC materials and improved ventilation.',
     '8901 N Oracle Rd', 'Oro Valley', 'AZ', '85737', 'US', now() - interval '30 days')
  RETURNING id INTO v_proj_johnson;

  INSERT INTO projects (id, tenant_id, name, status, project_type, description, site_address_line1, site_city, site_state, site_postal_code, site_country, created_on)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'Garcia Home Addition', 'draft', 'addition',
     '800 sq ft addition including new bedroom, bathroom, and sunroom. HDS assessment for existing structure.',
     '2200 W Ina Rd', 'Tucson', 'AZ', '85741', 'US', now() - interval '10 days')
  RETURNING id INTO v_proj_garcia;

  INSERT INTO projects (id, tenant_id, name, status, project_type, description, site_address_line1, site_city, site_state, site_postal_code, site_country, created_on)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'Williams Scottsdale Remodel', 'completed', 'remodel',
     'Whole-house remodel with focus on healthy indoor environment. Completed HDS inspection and remediation.',
     '15600 N Scottsdale Rd', 'Scottsdale', 'AZ', '85254', 'US', now() - interval '120 days')
  RETURNING id INTO v_proj_williams;

  INSERT INTO projects (id, tenant_id, name, status, project_type, description, site_address_line1, site_city, site_state, site_postal_code, site_country, created_on)
  VALUES
    (gen_random_uuid(), v_tenant_id, 'Chen Commercial Office Build-Out', 'in_progress', 'commercial',
     'Commercial office space build-out with WELL Building Standard considerations and healthy design specs.',
     '3400 E Camelback Rd', 'Phoenix', 'AZ', '85018', 'US', now() - interval '60 days')
  RETURNING id INTO v_proj_chen;

  -- ============================================================================
  -- 3. PROJECT PARTICIPANTS
  -- ============================================================================
  INSERT INTO project_participants (id, project_id, organization_id, project_role) VALUES
    (gen_random_uuid(), v_proj_smith, v_org_smith, 'property_owner') RETURNING id INTO v_part_smith;
  INSERT INTO project_participants (project_id, organization_id, project_role) VALUES
    (v_proj_smith, v_org_apex, 'general_contractor'),
    (v_proj_smith, v_org_greenline, 'trade'),
    (v_proj_smith, v_org_procraft, 'trade'),
    (v_proj_smith, v_org_ironwood, 'architect');

  INSERT INTO project_participants (id, project_id, organization_id, project_role) VALUES
    (gen_random_uuid(), v_proj_johnson, v_org_johnson, 'property_owner') RETURNING id INTO v_part_johnson;
  INSERT INTO project_participants (project_id, organization_id, project_role) VALUES
    (v_proj_johnson, v_org_summit, 'general_contractor'),
    (v_proj_johnson, v_org_procraft, 'trade');

  INSERT INTO project_participants (id, project_id, organization_id, project_role) VALUES
    (gen_random_uuid(), v_proj_garcia, v_org_garcia, 'property_owner') RETURNING id INTO v_part_garcia;
  INSERT INTO project_participants (project_id, organization_id, project_role) VALUES
    (v_proj_garcia, v_org_apex, 'general_contractor');

  INSERT INTO project_participants (id, project_id, organization_id, project_role) VALUES
    (gen_random_uuid(), v_proj_williams, v_org_williams, 'property_owner') RETURNING id INTO v_part_williams;
  INSERT INTO project_participants (project_id, organization_id, project_role) VALUES
    (v_proj_williams, v_org_summit, 'general_contractor'),
    (v_proj_williams, v_org_greenline, 'trade');

  INSERT INTO project_participants (id, project_id, organization_id, project_role) VALUES
    (gen_random_uuid(), v_proj_chen, v_org_chen, 'property_owner') RETURNING id INTO v_part_chen;
  INSERT INTO project_participants (project_id, organization_id, project_role) VALUES
    (v_proj_chen, v_org_apex, 'general_contractor'),
    (v_proj_chen, v_org_ironwood, 'architect');

  -- ============================================================================
  -- 4. LEADS
  -- ============================================================================
  INSERT INTO leads (tenant_id, name, email, phone, message, source_page, lead_source, stage, project_type, address_city, address_state, address_postal_code, created_at) VALUES
    (v_tenant_id, 'Angela Martinez', 'angela.martinez@email.com', '520-555-0401', 'Interested in a healthy home inspection for our new build. We have a 2-month-old and want to ensure the home is safe.', 'contact', 'website', 'new', 'new_construction', 'Tucson', 'AZ', '85704', now() - interval '2 days'),
    (v_tenant_id, 'Brian Foster', 'brian.foster@email.com', '480-555-0402', 'Looking for HDS assessment on our 1980s ranch home before renovation.', 'home', 'website', 'new', 'renovation', 'Mesa', 'AZ', '85201', now() - interval '1 day'),
    (v_tenant_id, 'Carol White', 'carol.white@email.com', '520-555-0403', 'Referred by Sarah Johnson. Want to discuss healthy design for our custom home project.', 'contact', 'referral', 'followed_up', 'custom_home', 'Tucson', 'AZ', '85750', now() - interval '7 days'),
    (v_tenant_id, 'Dennis Park', 'dennis.park@email.com', '602-555-0404', 'Commercial office renovation — need indoor air quality assessment and remediation plan.', 'contact', 'website', 'connected', 'commercial', 'Phoenix', 'AZ', '85004', now() - interval '14 days'),
    (v_tenant_id, 'Emily Rogers', 'emily.rogers@email.com', '520-555-0405', NULL, 'home', 'social_media', 'meeting_scheduled', 'remodel', 'Tucson', 'AZ', '85719', now() - interval '10 days'),
    (v_tenant_id, 'Frank Thompson', 'frank.thompson@email.com', '480-555-0406', 'Need full HDS inspection and report for insurance purposes.', 'contact', 'referral', 'estimate_sent', 'residential', 'Scottsdale', 'AZ', '85260', now() - interval '21 days'),
    (v_tenant_id, 'Grace Kim', 'grace.kim@email.com', '520-555-0407', 'Ready to move forward with healthy design consultation for our addition project.', 'contact', 'referral', 'won', 'addition', 'Tucson', 'AZ', '85748', now() - interval '30 days'),
    (v_tenant_id, 'Henry Davis', 'henry.davis@email.com', '602-555-0408', 'Multi-family project — need HDS specs for 12-unit development.', 'contact', 'website', 'meeting_scheduled', 'multi_family', 'Phoenix', 'AZ', '85016', now() - interval '5 days'),
    (v_tenant_id, 'Isabel Cruz', 'isabel.cruz@email.com', '520-555-0409', 'Not ready yet, will reach out in the spring.', 'home', 'website', 'snoozed', 'renovation', 'Tucson', 'AZ', '85745', now() - interval '45 days'),
    (v_tenant_id, 'James Miller', 'james.miller@email.com', '480-555-0410', 'Was looking for something different. Going with another provider.', 'contact', 'website', 'archived', 'new_construction', 'Tempe', 'AZ', '85281', now() - interval '60 days'),
    (v_tenant_id, 'Karen Lee', 'karen.lee@email.com', '520-555-0411', 'New home build starting in May. Want HDS consultation from the start.', 'contact', 'referral', 'new', 'custom_home', 'Marana', 'AZ', '85653', now() - interval '3 days'),
    (v_tenant_id, 'Larry Brown', 'larry.brown@email.com', '602-555-0412', 'Mold issues in current home. Need assessment and remediation guidance.', 'home', 'website', 'followed_up', 'residential', 'Chandler', 'AZ', '85225', now() - interval '8 days');

  -- ============================================================================
  -- 4b. CLIENTS (legacy table — invoices FK requires clients, not organizations)
  -- ============================================================================
  INSERT INTO clients (tenant_id, primary_first_name, primary_last_name, primary_email, primary_phone, billing_address_line1, billing_city, billing_state, billing_postal_code)
  VALUES (v_tenant_id, 'David', 'Smith', 'david.smith@email.com', '520-555-0101', '4521 E Sunrise Dr', 'Tucson', 'AZ', '85718')
  RETURNING id INTO v_client_smith;

  INSERT INTO clients (tenant_id, primary_first_name, primary_last_name, primary_email, primary_phone, billing_address_line1, billing_city, billing_state, billing_postal_code)
  VALUES (v_tenant_id, 'Sarah', 'Johnson', 'sarah.johnson@email.com', '520-555-0102', '8901 N Oracle Rd', 'Oro Valley', 'AZ', '85737')
  RETURNING id INTO v_client_johnson;

  INSERT INTO clients (tenant_id, primary_first_name, primary_last_name, primary_email, primary_phone, billing_address_line1, billing_city, billing_state, billing_postal_code)
  VALUES (v_tenant_id, 'Jennifer', 'Williams', 'jennifer.williams@email.com', '480-555-0104', '15600 N Scottsdale Rd', 'Scottsdale', 'AZ', '85254')
  RETURNING id INTO v_client_williams;

  INSERT INTO clients (tenant_id, primary_first_name, primary_last_name, primary_email, primary_phone, billing_address_line1, billing_city, billing_state, billing_postal_code)
  VALUES (v_tenant_id, 'Robert', 'Chen', 'robert.chen@email.com', '602-555-0105', '3400 E Camelback Rd', 'Phoenix', 'AZ', '85018')
  RETURNING id INTO v_client_chen;

  -- ============================================================================
  -- 5. INVOICES (client_id references clients table, not organizations)
  -- ============================================================================
  -- Smith: 2 invoices (1 paid, 1 sent)
  INSERT INTO invoices (id, tenant_id, client_id, project_id, invoice_number, status, subtotal_cents, tax_cents, total_cents, due_date, paid_at, created_at)
  VALUES (gen_random_uuid(), v_tenant_id, v_client_smith, v_proj_smith, 'INV-1001', 'paid', 450000, 0, 450000, (now() - interval '20 days')::date, now() - interval '18 days', now() - interval '35 days')
  RETURNING id INTO v_inv1;

  INSERT INTO invoices (id, tenant_id, client_id, project_id, invoice_number, status, subtotal_cents, tax_cents, total_cents, due_date, created_at)
  VALUES (gen_random_uuid(), v_tenant_id, v_client_smith, v_proj_smith, 'INV-1002', 'sent', 875000, 0, 875000, (now() + interval '15 days')::date, now() - interval '5 days')
  RETURNING id INTO v_inv2;

  -- Johnson: 1 invoice (overdue)
  INSERT INTO invoices (id, tenant_id, client_id, project_id, invoice_number, status, subtotal_cents, tax_cents, total_cents, due_date, created_at)
  VALUES (gen_random_uuid(), v_tenant_id, v_client_johnson, v_proj_johnson, 'INV-1003', 'overdue', 325000, 0, 325000, (now() - interval '10 days')::date, now() - interval '25 days')
  RETURNING id INTO v_inv3;

  -- Williams: 2 invoices (both paid — completed project)
  INSERT INTO invoices (id, tenant_id, client_id, project_id, invoice_number, status, subtotal_cents, tax_cents, total_cents, due_date, paid_at, created_at)
  VALUES (gen_random_uuid(), v_tenant_id, v_client_williams, v_proj_williams, 'INV-1004', 'paid', 650000, 0, 650000, (now() - interval '90 days')::date, now() - interval '85 days', now() - interval '100 days')
  RETURNING id INTO v_inv4;

  INSERT INTO invoices (id, tenant_id, client_id, project_id, invoice_number, status, subtotal_cents, tax_cents, total_cents, due_date, paid_at, created_at)
  VALUES (gen_random_uuid(), v_tenant_id, v_client_williams, v_proj_williams, 'INV-1005', 'paid', 420000, 0, 420000, (now() - interval '60 days')::date, now() - interval '55 days', now() - interval '70 days')
  RETURNING id INTO v_inv5;

  -- Chen: 1 invoice (draft)
  INSERT INTO invoices (id, tenant_id, client_id, project_id, invoice_number, status, subtotal_cents, tax_cents, total_cents, due_date, created_at)
  VALUES (gen_random_uuid(), v_tenant_id, v_client_chen, v_proj_chen, 'INV-1006', 'draft', 1250000, 0, 1250000, (now() + interval '30 days')::date, now() - interval '2 days')
  RETURNING id INTO v_inv6;

  -- Invoice Line Items
  INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price_cents, total_cents, line_type, sort_order) VALUES
    (v_inv1, 'HDS Initial Consultation & Assessment', 1, 150000, 150000, 'hds', 0),
    (v_inv1, 'Indoor Air Quality Testing', 1, 200000, 200000, 'inspection', 1),
    (v_inv1, 'Material Specifications Report', 1, 100000, 100000, 'hds', 2),
    (v_inv2, 'Framing Phase HDS Inspection', 1, 175000, 175000, 'inspection', 0),
    (v_inv2, 'HVAC System Design Review', 1, 250000, 250000, 'hds', 1),
    (v_inv2, 'Water Filtration System Specification', 1, 125000, 125000, 'hds', 2),
    (v_inv2, 'On-site Consultation (8 hours)', 8, 40625, 325000, 'hourly', 3),
    (v_inv3, 'Kitchen Renovation HDS Assessment', 1, 125000, 125000, 'hds', 0),
    (v_inv3, 'Bathroom Ventilation Design', 1, 100000, 100000, 'hds', 1),
    (v_inv3, 'Low-VOC Material Selection Guide', 1, 100000, 100000, 'custom', 2),
    (v_inv4, 'Whole-House HDS Inspection', 1, 350000, 350000, 'inspection', 0),
    (v_inv4, 'Remediation Plan Development', 1, 300000, 300000, 'hds', 1),
    (v_inv5, 'Post-Remediation Verification Testing', 1, 220000, 220000, 'inspection', 0),
    (v_inv5, 'Final HDS Certification Report', 1, 200000, 200000, 'hds', 1),
    (v_inv6, 'Commercial HDS Full Assessment', 1, 500000, 500000, 'hds', 0),
    (v_inv6, 'WELL Standard Compliance Review', 1, 350000, 350000, 'inspection', 1),
    (v_inv6, 'On-site Consultation (25 hours)', 25, 16000, 400000, 'hourly', 2);

  -- ============================================================================
  -- 6. ESTIMATES
  -- ============================================================================
  INSERT INTO estimates (id, tenant_id, organization_id, project_id, estimate_number, status, subtotal_cents, total_cents, valid_until, notes, created_at)
  VALUES (gen_random_uuid(), v_tenant_id, v_org_garcia, v_proj_garcia, 'EST-1001', 'sent', 580000, 580000, (now() + interval '30 days')::date, 'Home addition HDS assessment and specification package.', now() - interval '8 days')
  RETURNING id INTO v_est1;

  INSERT INTO estimates (id, tenant_id, organization_id, project_id, estimate_number, status, subtotal_cents, total_cents, valid_until, notes, created_at)
  VALUES (gen_random_uuid(), v_tenant_id, v_org_chen, v_proj_chen, 'EST-1002', 'approved', 1250000, 1250000, (now() + interval '15 days')::date, 'Commercial office build-out — full HDS package.', now() - interval '20 days')
  RETURNING id INTO v_est2;

  INSERT INTO estimates (id, tenant_id, organization_id, project_id, estimate_number, status, subtotal_cents, total_cents, valid_until, created_at)
  VALUES (gen_random_uuid(), v_tenant_id, v_org_johnson, v_proj_johnson, 'EST-1003', 'draft', 275000, 275000, (now() + interval '45 days')::date, now() - interval '3 days')
  RETURNING id INTO v_est3;

  -- Estimate Line Items
  INSERT INTO estimate_line_items (estimate_id, description, quantity, unit_price_cents, total_cents, line_type, sort_order) VALUES
    (v_est1, 'Pre-Construction HDS Assessment', 1, 180000, 180000, 'hds', 0),
    (v_est1, 'Addition Specification Package', 1, 200000, 200000, 'hds', 1),
    (v_est1, 'On-site Consultation (5 hours)', 5, 40000, 200000, 'hourly', 2),
    (v_est2, 'Commercial HDS Full Assessment', 1, 500000, 500000, 'hds', 0),
    (v_est2, 'WELL Standard Compliance Review', 1, 350000, 350000, 'inspection', 1),
    (v_est2, 'On-site Consultation (25 hours)', 25, 16000, 400000, 'hourly', 2),
    (v_est3, 'Phase 2 Kitchen HDS Follow-Up', 1, 125000, 125000, 'hds', 0),
    (v_est3, 'Updated Material Specifications', 1, 150000, 150000, 'custom', 1);

  -- Link approved estimate to its invoice
  UPDATE estimates SET converted_invoice_id = v_inv6, approved_at = now() - interval '15 days' WHERE id = v_est2;

  -- ============================================================================
  -- 7. CHANGE ORDERS
  -- ============================================================================
  INSERT INTO change_orders (tenant_id, project_id, change_order_number, title, description, status, cost_impact_cents, requested_by, notes, created_at) VALUES
    (v_tenant_id, v_proj_smith, 'CO-1001', 'Upgrade to ERV System', 'Client requests upgrade from standard HRV to Energy Recovery Ventilator for better humidity control.', 'approved', 350000, 'David Smith', 'Approved — improves indoor air quality significantly.', now() - interval '20 days'),
    (v_tenant_id, v_proj_smith, 'CO-1002', 'Add Whole-House Water Filtration', 'Add Aquasana Rhino whole-house water filtration system to specifications.', 'pending_approval', 180000, 'Mark Peterson (Apex)', NULL, now() - interval '3 days'),
    (v_tenant_id, v_proj_johnson, 'CO-1003', 'Replace Countertop Material', 'Switch from engineered quartz to natural stone to avoid resin off-gassing concerns.', 'approved', 275000, 'Lisa Torres (Summit)', 'Price difference absorbed by trade credit.', now() - interval '15 days'),
    (v_tenant_id, v_proj_chen, 'CO-1004', 'Add Air Quality Monitoring System', 'Install Awair air quality monitors in all conference rooms and common areas.', 'draft', 125000, 'Robert Chen', NULL, now() - interval '1 day'),
    (v_tenant_id, v_proj_williams, 'CO-1005', 'Expand Mold Remediation Scope', 'Additional mold found behind master bathroom wall. Expand remediation to include full wall cavity.', 'approved', 450000, 'Lisa Torres (Summit)', 'Critical health issue — prioritized.', now() - interval '80 days');

  -- ============================================================================
  -- 8. CALENDAR EVENTS
  -- ============================================================================
  INSERT INTO calendar_events (tenant_id, project_id, title, event_type, start_time, end_time, description, team_member_id, created_at) VALUES
    (v_tenant_id, v_proj_smith, 'Smith Residence — Framing Inspection', 'meeting_in_person', now() + interval '2 days' + interval '9 hours', now() + interval '2 days' + interval '11 hours', 'HDS framing phase inspection. Check vapor barrier installation and HVAC rough-in.', v_part_smith, now()),
    (v_tenant_id, v_proj_smith, 'HVAC Design Review with GreenLine', 'meeting_zoom', now() + interval '4 days' + interval '14 hours', now() + interval '4 days' + interval '15 hours', 'Review ERV system design and ductwork layout.', v_part_smith, now()),
    (v_tenant_id, v_proj_johnson, 'Johnson Renovation Progress Meeting', 'meeting_google_meet', now() + interval '1 day' + interval '10 hours', now() + interval '1 day' + interval '11 hours', 'Weekly progress check on kitchen demolition and bath rough-in.', v_part_johnson, now()),
    (v_tenant_id, v_proj_johnson, 'Material Selection Deadline', 'due_date', now() + interval '7 days' + interval '17 hours', NULL, 'Final selection for low-VOC paint, adhesives, and sealants.', v_part_johnson, now()),
    (v_tenant_id, v_proj_garcia, 'Garcia Addition — Initial Site Visit', 'meeting_in_person', now() + interval '5 days' + interval '8 hours', now() + interval '5 days' + interval '10 hours', 'Walk the site, assess existing structure for HDS baseline.', v_part_garcia, now()),
    (v_tenant_id, v_proj_chen, 'Chen Office — WELL Compliance Review', 'meeting_zoom', now() + interval '3 days' + interval '13 hours', now() + interval '3 days' + interval '14 hours 30 minutes', 'Review WELL Building Standard requirements with design team.', v_part_chen, now()),
    (v_tenant_id, v_proj_chen, 'Air Quality Baseline Testing', 'project_update', now() - interval '1 day' + interval '9 hours', NULL, 'Completed baseline IAQ testing. CO2, VOCs, and particulate levels documented.', v_part_chen, now()),
    (v_tenant_id, v_proj_smith, 'Plumbing Rough-In Inspection', 'meeting_in_person', now() + interval '8 days' + interval '9 hours', now() + interval '8 days' + interval '10 hours 30 minutes', 'Inspect water filtration system rough-in with ProCraft Plumbing.', v_part_smith, now()),
    (v_tenant_id, v_proj_williams, 'Post-Remediation Final Walkthrough', 'meeting_in_person', now() - interval '50 days' + interval '10 hours', now() - interval '50 days' + interval '12 hours', 'Final HDS walkthrough and certification.', v_part_williams, now());

  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Organizations: 10 (5 property owners, 2 GCs, 2 trades, 1 architect)';
  RAISE NOTICE 'Projects: 5 (1 draft, 3 in_progress, 1 completed)';
  RAISE NOTICE 'Leads: 12 (across all stages)';
  RAISE NOTICE 'Invoices: 6 (3 paid, 1 sent, 1 overdue, 1 draft)';
  RAISE NOTICE 'Estimates: 3 (1 draft, 1 sent, 1 approved/converted)';
  RAISE NOTICE 'Change Orders: 5 (1 draft, 1 pending, 3 approved)';
  RAISE NOTICE 'Calendar Events: 9';
END $$;
