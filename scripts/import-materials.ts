import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface RawMaterial {
  main_cat: string;
  cat2: string | null;
  cat3: string | null;
  cat4: string | null;
  product: string;
  primary_use: string | null;
  key_benefits: string | null;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('=== DRY RUN — no changes will be made ===\n');

  // Load spreadsheet data
  const rawData: RawMaterial[] = JSON.parse(
    readFileSync('scripts/materials-data.json', 'utf-8')
  );
  console.log(`Loaded ${rawData.length} materials from spreadsheet\n`);

  // Get tenant
  const { data: tenants } = await supabase.from('tenants').select('id');
  if (!tenants || tenants.length === 0) {
    console.error('No tenant found');
    process.exit(1);
  }
  const tenantId = tenants[0].id;
  console.log(`Tenant: ${tenantId}\n`);

  // ── Step 1: Build category structure from spreadsheet ──
  const mainCatMap = new Map<string, { numeral: number; name: string }>();
  const cat2Map = new Map<string, { name: string; mainCatKey: string; sortOrder: number }>();
  const cat3Map = new Map<string, { name: string; cat2Key: string; mainCatKey: string; sortOrder: number }>();

  for (const row of rawData) {
    if (!row.main_cat) continue;

    // Main category: extract numeral and name
    const mcParts = row.main_cat.match(/^(\d+)\s+(.+)$/);
    if (!mcParts) continue;
    const mcNumeral = parseInt(mcParts[1]);
    const mcName = mcParts[2].trim();
    const mcKey = row.main_cat;

    if (!mainCatMap.has(mcKey)) {
      mainCatMap.set(mcKey, { numeral: mcNumeral, name: mcName });
    }

    // Category 2: extract sort_order from "X.YY Name"
    if (row.cat2) {
      const c2Key = `${mcKey}|${row.cat2}`;
      if (!cat2Map.has(c2Key)) {
        const c2Match = row.cat2.match(/^(\d+)\.(\d+)\s*[-–]?\s*(.+)$/);
        let sortOrder = 0;
        let c2Name = row.cat2;
        if (c2Match) {
          sortOrder = parseInt(c2Match[2]);
          c2Name = row.cat2; // Keep full name like "3.01 - Adhesives, Sealants & Caulks"
        }
        cat2Map.set(c2Key, { name: c2Name, mainCatKey: mcKey, sortOrder });
      }

      // Category 3
      if (row.cat3) {
        const c3Key = `${c2Key}|${row.cat3}`;
        if (!cat3Map.has(c3Key)) {
          // Assign sort order by appearance within cat2
          const existingC3s = [...cat3Map.values()].filter(c => c.cat2Key === c2Key);
          cat3Map.set(c3Key, {
            name: row.cat3.trim(),
            cat2Key: c2Key,
            mainCatKey: mcKey,
            sortOrder: existingC3s.length + 1,
          });
        }
      }
    }
  }

  console.log(`Categories parsed:`);
  console.log(`  Main categories: ${mainCatMap.size}`);
  console.log(`  Category 2 (sub): ${cat2Map.size}`);
  console.log(`  Category 3 (child sub): ${cat3Map.size}\n`);

  if (dryRun) {
    // Print summary and exit
    for (const [key, mc] of mainCatMap) {
      console.log(`  ${mc.numeral}. ${mc.name}`);
      const c2s = [...cat2Map.entries()].filter(([, v]) => v.mainCatKey === key);
      for (const [c2Key, c2] of c2s) {
        const matCount = rawData.filter(r => r.main_cat === key && r.cat2 === c2.name && !r.cat3).length;
        const c3s = [...cat3Map.entries()].filter(([, v]) => v.cat2Key === c2Key);
        console.log(`    ${c2.name} (${c3s.length} cat3s)`);
        for (const [, c3] of c3s) {
          console.log(`      - ${c3.name}`);
        }
      }
    }
    console.log('\n=== DRY RUN complete ===');
    return;
  }

  // ── Step 2: Clear existing data (order matters for FK constraints) ──
  console.log('Clearing existing data...');

  // Clear FK references first
  const { error: ppmErr } = await supabase.from('project_professional_materials').delete().neq('material_id', '00000000-0000-0000-0000-000000000000');
  if (ppmErr) console.log('  project_professional_materials:', ppmErr.message);
  else console.log('  project_professional_materials: cleared');

  const { error: pcmErr } = await supabase.from('project_client_materials').delete().neq('material_id', '00000000-0000-0000-0000-000000000000');
  if (pcmErr) console.log('  project_client_materials:', pcmErr.message);
  else console.log('  project_client_materials: cleared');

  const { error: pnErr } = await supabase.from('private_notes').delete().not('material_id', 'is', null);
  if (pnErr) console.log('  private_notes (material):', pnErr.message);
  else console.log('  private_notes (material): cleared');

  // Clear materials and categories
  const { error: mscErr } = await supabase.from('material_sub_categories').delete().neq('material_id', '00000000-0000-0000-0000-000000000000');
  if (mscErr) console.log('  material_sub_categories:', mscErr.message);
  else console.log('  material_sub_categories: cleared');

  const { error: matErr } = await supabase.from('materials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (matErr) console.log('  materials:', matErr.message);
  else console.log('  materials: cleared');

  // Clear checklist items referencing categories
  const { error: clErr } = await supabase.from('checklist_items').delete().not('main_category_id', 'is', null);
  if (clErr) console.log('  checklist_items:', clErr.message);
  else console.log('  checklist_items: cleared');

  // Sub categories (children first, then parents)
  const { error: scChildErr } = await supabase.from('sub_categories').delete().not('parent_sub_category_id', 'is', null);
  if (scChildErr) console.log('  sub_categories (children):', scChildErr.message);
  else console.log('  sub_categories (children): cleared');

  const { error: scErr } = await supabase.from('sub_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (scErr) console.log('  sub_categories:', scErr.message);
  else console.log('  sub_categories: cleared');

  const { error: mcErr } = await supabase.from('main_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (mcErr) console.log('  main_categories:', mcErr.message);
  else console.log('  main_categories: cleared');

  console.log('');

  // ── Step 3: Insert main categories ──
  console.log('Inserting main categories...');
  const mcIdMap = new Map<string, string>(); // mcKey -> uuid

  for (const [key, mc] of mainCatMap) {
    const { data, error } = await supabase
      .from('main_categories')
      .insert({ tenant_id: tenantId, numeral: mc.numeral, name: mc.name })
      .select('id')
      .single();

    if (error) {
      console.error(`  ERROR inserting main_cat "${mc.name}":`, error.message);
      process.exit(1);
    }
    mcIdMap.set(key, data.id);
    console.log(`  ${mc.numeral}. ${mc.name} -> ${data.id}`);
  }

  // ── Step 4: Insert Category 2 (sub_categories) ──
  console.log('\nInserting Category 2 sub_categories...');
  const c2IdMap = new Map<string, string>(); // c2Key -> uuid

  for (const [key, c2] of cat2Map) {
    const mainCatId = mcIdMap.get(c2.mainCatKey);
    if (!mainCatId) {
      console.error(`  Missing main_cat for "${c2.name}"`);
      continue;
    }

    const { data, error } = await supabase
      .from('sub_categories')
      .insert({
        tenant_id: tenantId,
        main_category_id: mainCatId,
        sort_order: c2.sortOrder,
        name: c2.name,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  ERROR inserting cat2 "${c2.name}":`, error.message);
      continue;
    }
    c2IdMap.set(key, data.id);
  }
  console.log(`  Inserted ${c2IdMap.size} Category 2 entries`);

  // ── Step 5: Insert Category 3 (child sub_categories) ──
  console.log('\nInserting Category 3 child sub_categories...');
  const c3IdMap = new Map<string, string>(); // c3Key -> uuid

  for (const [key, c3] of cat3Map) {
    const parentId = c2IdMap.get(c3.cat2Key);
    const mainCatId = mcIdMap.get(c3.mainCatKey);
    if (!parentId || !mainCatId) {
      console.error(`  Missing parent for cat3 "${c3.name}"`);
      continue;
    }

    const { data, error } = await supabase
      .from('sub_categories')
      .insert({
        tenant_id: tenantId,
        main_category_id: mainCatId,
        parent_sub_category_id: parentId,
        sort_order: c3.sortOrder,
        name: c3.name,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  ERROR inserting cat3 "${c3.name}":`, error.message);
      continue;
    }
    c3IdMap.set(key, data.id);
  }
  console.log(`  Inserted ${c3IdMap.size} Category 3 entries`);

  // ── Step 6: Insert materials in batches ──
  console.log('\nInserting materials...');
  let inserted = 0;
  let skipped = 0;
  let linked = 0;

  // Process in batches of 50
  const batchSize = 50;
  for (let i = 0; i < rawData.length; i += batchSize) {
    const batch = rawData.slice(i, i + batchSize);

    const matInserts = batch.map((row) => ({
      tenant_id: tenantId,
      name: row.product,
      manufacturer: null as string | null, // spreadsheet doesn't have manufacturer column
      primary_use: row.primary_use || null,
      key_benefits: row.key_benefits || null,
      url: null as string | null,
    }));

    const { data: mats, error } = await supabase
      .from('materials')
      .insert(matInserts)
      .select('id, name');

    if (error) {
      console.error(`  ERROR inserting batch at ${i}:`, error.message);
      skipped += batch.length;
      continue;
    }

    inserted += mats.length;

    // Link each material to its deepest category
    const links: { material_id: string; sub_category_id: string }[] = [];

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const mat = mats[j];
      if (!mat) continue;

      // Find the deepest category for this material
      let subCatId: string | undefined;

      if (row.cat3 && row.cat2 && row.main_cat) {
        const c2Key = `${row.main_cat}|${row.cat2}`;
        const c3Key = `${c2Key}|${row.cat3}`;
        subCatId = c3IdMap.get(c3Key);
      }

      if (!subCatId && row.cat2 && row.main_cat) {
        const c2Key = `${row.main_cat}|${row.cat2}`;
        subCatId = c2IdMap.get(c2Key);
      }

      if (subCatId) {
        links.push({ material_id: mat.id, sub_category_id: subCatId });
      }
    }

    if (links.length > 0) {
      const { error: linkErr } = await supabase
        .from('material_sub_categories')
        .insert(links);

      if (linkErr) {
        console.error(`  ERROR linking batch at ${i}:`, linkErr.message);
      } else {
        linked += links.length;
      }
    }

    if ((i + batchSize) % 200 === 0 || i + batchSize >= rawData.length) {
      console.log(`  Progress: ${Math.min(i + batchSize, rawData.length)}/${rawData.length}`);
    }
  }

  console.log(`\n=== Import complete ===`);
  console.log(`  Main categories: ${mcIdMap.size}`);
  console.log(`  Category 2: ${c2IdMap.size}`);
  console.log(`  Category 3: ${c3IdMap.size}`);
  console.log(`  Materials inserted: ${inserted}`);
  console.log(`  Materials skipped: ${skipped}`);
  console.log(`  Category links created: ${linked}`);

  // Verify
  const { count: matCount } = await supabase.from('materials').select('*', { count: 'exact', head: true });
  const { count: linkCount } = await supabase.from('material_sub_categories').select('*', { count: 'exact', head: true });
  const { count: mcCount } = await supabase.from('main_categories').select('*', { count: 'exact', head: true });
  const { count: scCount } = await supabase.from('sub_categories').select('*', { count: 'exact', head: true });
  console.log(`\nVerification (DB counts):`);
  console.log(`  main_categories: ${mcCount}`);
  console.log(`  sub_categories: ${scCount}`);
  console.log(`  materials: ${matCount}`);
  console.log(`  material_sub_categories: ${linkCount}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
