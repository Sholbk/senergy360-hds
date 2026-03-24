-- ============================================================================
-- SEED: Critical Path Calendar Data
-- Adds a full month of construction milestones for the Smith Residence
-- and Johnson Renovation projects. Run in Supabase SQL Editor.
-- ============================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_proj_smith UUID;
  v_proj_johnson UUID;
  v_proj_chen UUID;
  v_part_smith UUID;
  v_part_johnson UUID;
  v_part_chen UUID;
  v_month_start DATE;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;

  -- Look up existing projects
  SELECT id INTO v_proj_smith FROM projects WHERE name LIKE 'Smith Residence%' LIMIT 1;
  SELECT id INTO v_proj_johnson FROM projects WHERE name LIKE 'Johnson Kitchen%' LIMIT 1;
  SELECT id INTO v_proj_chen FROM projects WHERE name LIKE 'Chen Commercial%' LIMIT 1;

  IF v_proj_smith IS NULL THEN RAISE EXCEPTION 'Smith project not found. Run seed-dummy-data.sql first.'; END IF;
  IF v_proj_johnson IS NULL THEN RAISE EXCEPTION 'Johnson project not found.'; END IF;
  IF v_proj_chen IS NULL THEN RAISE EXCEPTION 'Chen project not found.'; END IF;

  -- Look up participant IDs (property owners)
  SELECT id INTO v_part_smith FROM project_participants WHERE project_id = v_proj_smith AND project_role = 'property_owner' LIMIT 1;
  SELECT id INTO v_part_johnson FROM project_participants WHERE project_id = v_proj_johnson AND project_role = 'property_owner' LIMIT 1;
  SELECT id INTO v_part_chen FROM project_participants WHERE project_id = v_proj_chen AND project_role = 'property_owner' LIMIT 1;

  -- Use the 1st of the current month as baseline
  v_month_start := date_trunc('month', now())::date;

  -- Delete old seed calendar events for these projects to avoid double-booking conflicts
  DELETE FROM calendar_events WHERE project_id IN (v_proj_smith, v_proj_johnson, v_proj_chen) AND deleted_at IS NULL;

  -- ============================================================================
  -- SMITH RESIDENCE — Full Construction Timeline (current month)
  -- ============================================================================

  -- Week 1: Foundation & Site Work
  INSERT INTO calendar_events (tenant_id, project_id, title, event_type, start_time, end_time, description, team_member_id) VALUES
    (v_tenant_id, v_proj_smith, 'Foundation Pour', 'project_update',
     (v_month_start + 1) + interval '7 hours', NULL,
     'Concrete foundation pour completed. Cure time 7 days before framing.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Foundation Inspection', 'meeting_in_person',
     (v_month_start + 2) + interval '9 hours', (v_month_start + 2) + interval '10 hours 30 minutes',
     'City inspector to verify foundation per plans. Must pass before framing.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Site Grading & Drainage Review', 'meeting_in_person',
     (v_month_start + 3) + interval '8 hours', (v_month_start + 3) + interval '9 hours 30 minutes',
     'Review site drainage plan to prevent moisture intrusion.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Vapor Barrier Installation Deadline', 'due_date',
     (v_month_start + 4) + interval '17 hours', NULL,
     'Sub-slab vapor barrier must be installed before backfill.', v_part_smith),

  -- Week 2: Framing
    (v_tenant_id, v_proj_smith, 'Framing Begins', 'project_update',
     (v_month_start + 7) + interval '7 hours', NULL,
     'Structural framing starts. Estimated 10 days for completion.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Framing Progress Check', 'meeting_in_person',
     (v_month_start + 9) + interval '9 hours', (v_month_start + 9) + interval '10 hours',
     'Mid-framing walkthrough. Verify window/door rough openings and wall layout.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Architect Review — Framing', 'meeting_zoom',
     (v_month_start + 10) + interval '14 hours', (v_month_start + 10) + interval '15 hours',
     'Ironwood Design reviews framing against architectural plans.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Structural Material Specs Due', 'due_date',
     (v_month_start + 11) + interval '17 hours', NULL,
     'Final HDS material specifications for sheathing, adhesives, and sealants.', v_part_smith),

  -- Week 3: Rough-Ins (HVAC, Plumbing, Electrical)
    (v_tenant_id, v_proj_smith, 'HVAC Rough-In Starts', 'project_update',
     (v_month_start + 14) + interval '7 hours', NULL,
     'GreenLine HVAC begins ductwork and ERV installation.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Plumbing Rough-In', 'project_update',
     (v_month_start + 14) + interval '8 hours', NULL,
     'ProCraft Plumbing begins water lines, drains, and filtration system rough-in.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'HVAC Design Review — ERV System', 'meeting_zoom',
     (v_month_start + 15) + interval '10 hours', (v_month_start + 15) + interval '11 hours',
     'Review ERV placement, duct sizing, and fresh air intake locations with GreenLine.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Water Filtration System Review', 'meeting_in_person',
     (v_month_start + 16) + interval '9 hours', (v_month_start + 16) + interval '10 hours',
     'On-site review of whole-house water filtration rough-in with ProCraft.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Electrical Rough-In Inspection', 'meeting_in_person',
     (v_month_start + 17) + interval '14 hours', (v_month_start + 17) + interval '15 hours',
     'City electrical inspection for rough-in compliance.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Rough-In HDS Inspection', 'meeting_in_person',
     (v_month_start + 18) + interval '9 hours', (v_month_start + 18) + interval '12 hours',
     'Full HDS inspection of all rough-ins: HVAC, plumbing, electrical. Verify air sealing and material compliance.', v_part_smith),

  -- Week 4: Insulation, Drywall Prep, Close-In
    (v_tenant_id, v_proj_smith, 'Insulation Installation', 'project_update',
     (v_month_start + 21) + interval '7 hours', NULL,
     'Closed-cell spray foam insulation in exterior walls. Open-cell in interior partitions.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Pre-Drywall HDS Walkthrough', 'meeting_in_person',
     (v_month_start + 22) + interval '9 hours', (v_month_start + 22) + interval '11 hours 30 minutes',
     'Critical pre-drywall inspection. Last chance to verify air sealing, insulation, vapor barriers, and material specs before close-in.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Owner Walkthrough — Pre-Drywall', 'meeting_in_person',
     (v_month_start + 23) + interval '10 hours', (v_month_start + 23) + interval '11 hours 30 minutes',
     'David Smith walkthrough before drywall. Review layout, outlet locations, and any final changes.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'IAQ Baseline Testing — Pre-Close', 'project_update',
     (v_month_start + 24) + interval '8 hours', NULL,
     'Indoor air quality baseline measurement before drywall close-in. CO2, VOC, and particulate testing.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Low-VOC Material Selections Due', 'due_date',
     (v_month_start + 25) + interval '17 hours', NULL,
     'All paint, primer, adhesive, and sealant selections must be finalized. Must meet HDS VOC limits.', v_part_smith),

    (v_tenant_id, v_proj_smith, 'Drywall Begins', 'project_update',
     (v_month_start + 28) + interval '7 hours', NULL,
     'Drywall hang and finishing begins. Using low-VOC joint compound per HDS specs.', v_part_smith);

  -- ============================================================================
  -- JOHNSON RENOVATION — Key Milestones (current month)
  -- ============================================================================
  INSERT INTO calendar_events (tenant_id, project_id, title, event_type, start_time, end_time, description, team_member_id) VALUES
    (v_tenant_id, v_proj_johnson, 'Kitchen Demo Complete', 'project_update',
     (v_month_start + 1) + interval '16 hours', NULL,
     'Kitchen demolition finished. Ready for rough-in work.', v_part_johnson),

    (v_tenant_id, v_proj_johnson, 'Mold Assessment — Kitchen Walls', 'meeting_in_person',
     (v_month_start + 3) + interval '11 hours', (v_month_start + 3) + interval '12 hours 30 minutes',
     'Check exposed wall cavities for mold/moisture after demo.', v_part_johnson),

    (v_tenant_id, v_proj_johnson, 'Plumbing Rough-In — Kitchen & Bath', 'project_update',
     (v_month_start + 7) + interval '7 hours', NULL,
     'ProCraft Plumbing rough-in for kitchen sink, dishwasher, and master bath.', v_part_johnson),

    (v_tenant_id, v_proj_johnson, 'Ventilation Design Review', 'meeting_zoom',
     (v_month_start + 9) + interval '15 hours', (v_month_start + 9) + interval '16 hours',
     'Review bathroom exhaust fan sizing and kitchen range hood venting per HDS specs.', v_part_johnson),

    (v_tenant_id, v_proj_johnson, 'Material Selections Deadline — Cabinets', 'due_date',
     (v_month_start + 12) + interval '17 hours', NULL,
     'Cabinet selection must be finalized. Verify formaldehyde-free/low-emission options.', v_part_johnson),

    (v_tenant_id, v_proj_johnson, 'Tile & Countertop HDS Review', 'meeting_in_person',
     (v_month_start + 14) + interval '13 hours', (v_month_start + 14) + interval '14 hours',
     'Review tile adhesive, grout, and countertop material selections for VOC compliance.', v_part_johnson),

    (v_tenant_id, v_proj_johnson, 'Cabinet Installation Begins', 'project_update',
     (v_month_start + 18) + interval '8 hours', NULL,
     'Kitchen cabinet install. Using formaldehyde-free plywood boxes.', v_part_johnson),

    (v_tenant_id, v_proj_johnson, 'Paint Selection — Low-VOC Verification', 'due_date',
     (v_month_start + 20) + interval '17 hours', NULL,
     'Final paint colors selected. All paints must be zero-VOC or low-VOC certified.', v_part_johnson),

    (v_tenant_id, v_proj_johnson, 'Final Walk-Through with Homeowner', 'meeting_in_person',
     (v_month_start + 27) + interval '13 hours', (v_month_start + 27) + interval '15 hours',
     'Pre-completion walkthrough with Sarah Johnson. Punch list review.', v_part_johnson);

  -- ============================================================================
  -- CHEN COMMERCIAL — Key Milestones (current month)
  -- ============================================================================
  INSERT INTO calendar_events (tenant_id, project_id, title, event_type, start_time, end_time, description, team_member_id) VALUES
    (v_tenant_id, v_proj_chen, 'WELL Pre-Certification Review', 'meeting_zoom',
     (v_month_start + 2) + interval '15 hours', (v_month_start + 2) + interval '16 hours 30 minutes',
     'Review WELL Building Standard compliance checklist with design team.', v_part_chen),

    (v_tenant_id, v_proj_chen, 'Office Partition Framing', 'project_update',
     (v_month_start + 5) + interval '7 hours', NULL,
     'Interior partition framing for offices and conference rooms.', v_part_chen),

    (v_tenant_id, v_proj_chen, 'HVAC Design — Air Quality Zones', 'meeting_in_person',
     (v_month_start + 8) + interval '13 hours', (v_month_start + 8) + interval '14 hours 30 minutes',
     'Design air quality zones for conference rooms, open office, and break room.', v_part_chen),

    (v_tenant_id, v_proj_chen, 'Acoustic Panel Material Review', 'due_date',
     (v_month_start + 11) + interval '17 hours', NULL,
     'Select acoustic panels — must meet WELL v2 Sound requirements and be low-emission.', v_part_chen),

    (v_tenant_id, v_proj_chen, 'MEP Coordination Meeting', 'meeting_google_meet',
     (v_month_start + 15) + interval '16 hours', (v_month_start + 15) + interval '17 hours',
     'Coordinate mechanical, electrical, and plumbing systems with all trades.', v_part_chen),

    (v_tenant_id, v_proj_chen, 'Lighting Design — Circadian Review', 'meeting_zoom',
     (v_month_start + 19) + interval '16 hours', (v_month_start + 19) + interval '17 hours',
     'Review lighting design for WELL Light concept compliance — tunable white LED, daylight harvesting.', v_part_chen),

    (v_tenant_id, v_proj_chen, 'Air Quality Monitor Installation', 'project_update',
     (v_month_start + 22) + interval '9 hours', NULL,
     'Install Awair air quality monitors in all conference rooms and common areas.', v_part_chen),

    (v_tenant_id, v_proj_chen, 'Flooring Material Specs Due', 'due_date',
     (v_month_start + 25) + interval '17 hours', NULL,
     'Commercial flooring selection — must meet FloorScore and WELL v2 Materials requirements.', v_part_chen);

  RAISE NOTICE 'Critical path data inserted!';
  RAISE NOTICE 'Smith Residence: 20 events (foundation through drywall)';
  RAISE NOTICE 'Johnson Renovation: 9 events (demo through walkthrough)';
  RAISE NOTICE 'Chen Commercial: 8 events (WELL review through flooring)';
  RAISE NOTICE 'Total: 37 new calendar events across 3 projects';
END $$;
