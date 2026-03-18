-- ============================================================================
-- Migration 025: HDS Workflow Enhancements
-- ============================================================================
-- Add indexes for efficient checklist-to-category queries used by the
-- HDS Specifications workflow tab.
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_checklist_items_main_category
  ON checklist_items(main_category_id);

CREATE INDEX IF NOT EXISTS idx_checklist_items_sub_category
  ON checklist_items(sub_category_id);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
