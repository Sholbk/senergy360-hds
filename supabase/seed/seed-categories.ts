/**
 * Seed script for the 12 Core Principles (Main Categories)
 *
 * Run with: npx tsx supabase/seed/seed-categories.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { CORE_PRINCIPLES } from './category-mapping';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedCategories() {
  console.log('Seeding 12 Core Principles...');

  // Get the SENERGY360 tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', 'senergy360')
    .single();

  if (tenantError || !tenant) {
    console.error('Failed to find SENERGY360 tenant:', tenantError);
    process.exit(1);
  }

  const tenantId = tenant.id;

  for (const principle of CORE_PRINCIPLES) {
    const { error } = await supabase.from('main_categories').upsert(
      {
        tenant_id: tenantId,
        numeral: principle.numeral,
        name: principle.name,
        description: principle.description,
      },
      { onConflict: 'tenant_id,numeral' }
    );

    if (error) {
      console.error(
        `Failed to seed principle ${principle.numeral}: ${principle.name}`,
        error
      );
    } else {
      console.log(`  ✓ ${principle.numeral}. ${principle.name}`);
    }
  }

  console.log('Done seeding Core Principles.');
}

seedCategories().catch(console.error);
