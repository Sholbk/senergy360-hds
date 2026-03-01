/**
 * Seed script for materials from CSV
 *
 * Run with: npx tsx supabase/seed/seed-materials.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * CSV columns: #, Master Category, Category 2, Category 3, Product/Brand, Primary Use, Key Benefits
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import {
  CSV_TO_CORE_PRINCIPLE,
  extractCsvCategoryNumber,
  extractSubCategoryInfo,
  extractTertiaryCategoryInfo,
} from './category-mapping';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CSV_PATH = path.resolve(
  process.env.HOME || '~',
  'Downloads/HDS Materials Summary Spreadsheet - 260105.csv'
);

interface CsvRow {
  '#': string;
  'Master Category': string;
  'Category 2': string;
  'Category 3': string;
  'Product / Brand': string;
  'Primary Use': string;
  'Key Benefits': string;
}

async function seedMaterials() {
  console.log('Reading CSV...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
  console.log(`Found ${rows.length} rows in CSV.`);

  // Get tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', 'senergy360')
    .single();

  if (!tenant) {
    console.error('SENERGY360 tenant not found. Run seed-categories first.');
    process.exit(1);
  }
  const tenantId = tenant.id;

  // Get main categories (keyed by numeral)
  const { data: mainCats } = await supabase
    .from('main_categories')
    .select('id, numeral')
    .eq('tenant_id', tenantId);

  if (!mainCats || mainCats.length === 0) {
    console.error('No main categories found. Run seed-categories first.');
    process.exit(1);
  }

  const mainCatByNumeral = new Map(mainCats.map((c) => [c.numeral, c.id]));

  // Track subcategories to avoid duplicates
  // Key: "mainCatId:sortOrder:name" for level 2
  // Key: "parentSubCatId:sortOrder:name" for level 3
  const subCatCache = new Map<string, string>(); // key -> id

  let materialCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    const masterCatStr = row['Master Category'];
    const cat2Str = row['Category 2'] || '';
    const cat3Str = row['Category 3'] || '';
    const productName = row['Product / Brand'];
    const primaryUse = row['Primary Use'] || '';
    const keyBenefits = row['Key Benefits'] || '';

    if (!masterCatStr || !productName) {
      skippedCount++;
      continue;
    }

    // 1. Resolve main category
    const csvCatNum = extractCsvCategoryNumber(masterCatStr);
    if (csvCatNum === null) {
      console.warn(`  Skipping row: cannot parse master category "${masterCatStr}"`);
      skippedCount++;
      continue;
    }

    const corePrincipleNum = CSV_TO_CORE_PRINCIPLE[csvCatNum];
    if (corePrincipleNum === undefined) {
      console.warn(`  Skipping row: no core principle mapping for CSV category ${csvCatNum}`);
      skippedCount++;
      continue;
    }

    const mainCatId = mainCatByNumeral.get(corePrincipleNum);
    if (!mainCatId) {
      console.warn(`  Skipping row: main category ${corePrincipleNum} not found in DB`);
      skippedCount++;
      continue;
    }

    // 2. Resolve subcategory (Category 2)
    let subCatId: string | null = null;
    if (cat2Str) {
      const subInfo = extractSubCategoryInfo(cat2Str);
      if (subInfo) {
        const subKey = `${mainCatId}:${subInfo.sortOrder}:${subInfo.name}`;
        if (subCatCache.has(subKey)) {
          subCatId = subCatCache.get(subKey)!;
        } else {
          // Check if exists
          const { data: existing } = await supabase
            .from('sub_categories')
            .select('id')
            .eq('main_category_id', mainCatId)
            .eq('sort_order', subInfo.sortOrder)
            .eq('name', subInfo.name)
            .is('parent_sub_category_id', null)
            .single();

          if (existing) {
            subCatId = existing.id;
          } else {
            const { data: newSub, error } = await supabase
              .from('sub_categories')
              .insert({
                tenant_id: tenantId,
                main_category_id: mainCatId,
                sort_order: subInfo.sortOrder,
                name: subInfo.name,
              })
              .select('id')
              .single();

            if (error) {
              console.error(`  Failed to create subcategory "${subInfo.name}":`, error.message);
              skippedCount++;
              continue;
            }
            subCatId = newSub!.id;
          }
          subCatCache.set(subKey, subCatId);
        }
      }
    }

    // 3. Resolve tertiary category (Category 3)
    let tertiaryCatId: string | null = null;
    if (cat3Str && subCatId) {
      const tertiaryInfo = extractTertiaryCategoryInfo(cat3Str);
      if (tertiaryInfo) {
        const tertiaryKey = `${subCatId}:${tertiaryInfo.sortOrder}:${tertiaryInfo.name}`;
        if (subCatCache.has(tertiaryKey)) {
          tertiaryCatId = subCatCache.get(tertiaryKey)!;
        } else {
          const { data: existing } = await supabase
            .from('sub_categories')
            .select('id')
            .eq('parent_sub_category_id', subCatId)
            .eq('sort_order', tertiaryInfo.sortOrder)
            .eq('name', tertiaryInfo.name)
            .single();

          if (existing) {
            tertiaryCatId = existing.id;
          } else {
            const { data: newTertiary, error } = await supabase
              .from('sub_categories')
              .insert({
                tenant_id: tenantId,
                main_category_id: mainCatId,
                parent_sub_category_id: subCatId,
                sort_order: tertiaryInfo.sortOrder,
                name: tertiaryInfo.name,
              })
              .select('id')
              .single();

            if (error) {
              console.error(`  Failed to create tertiary category "${tertiaryInfo.name}":`, error.message);
            } else {
              tertiaryCatId = newTertiary!.id;
            }
          }
          if (tertiaryCatId) {
            subCatCache.set(tertiaryKey, tertiaryCatId);
          }
        }
      } else {
        // Category 3 exists but doesn't match tertiary pattern — treat as a named subcategory
        const cat3Name = cat3Str.trim();
        if (cat3Name) {
          const fallbackKey = `${subCatId}:fallback:${cat3Name}`;
          if (subCatCache.has(fallbackKey)) {
            tertiaryCatId = subCatCache.get(fallbackKey)!;
          } else {
            // Find max sort_order under this parent to assign next
            const { data: siblings } = await supabase
              .from('sub_categories')
              .select('sort_order')
              .eq('parent_sub_category_id', subCatId)
              .order('sort_order', { ascending: false })
              .limit(1);

            const nextOrder = siblings && siblings.length > 0 ? siblings[0].sort_order + 1 : 1;

            const { data: existing } = await supabase
              .from('sub_categories')
              .select('id')
              .eq('parent_sub_category_id', subCatId)
              .eq('name', cat3Name)
              .single();

            if (existing) {
              tertiaryCatId = existing.id;
            } else {
              const { data: newTertiary, error } = await supabase
                .from('sub_categories')
                .insert({
                  tenant_id: tenantId,
                  main_category_id: mainCatId,
                  parent_sub_category_id: subCatId,
                  sort_order: nextOrder,
                  name: cat3Name,
                })
                .select('id')
                .single();

              if (error) {
                console.error(`  Failed to create fallback tertiary "${cat3Name}":`, error.message);
              } else {
                tertiaryCatId = newTertiary!.id;
              }
            }
            if (tertiaryCatId) {
              subCatCache.set(fallbackKey, tertiaryCatId);
            }
          }
        }
      }
    }

    // 4. Insert material
    const { data: material, error: matError } = await supabase
      .from('materials')
      .insert({
        tenant_id: tenantId,
        name: productName.trim(),
        primary_use: primaryUse.trim() || null,
        key_benefits: keyBenefits.trim() || null,
      })
      .select('id')
      .single();

    if (matError) {
      console.error(`  Failed to insert material "${productName}":`, matError.message);
      skippedCount++;
      continue;
    }

    // 5. Link material to subcategory (prefer most specific: tertiary > secondary)
    const linkSubCatId = tertiaryCatId || subCatId;
    if (linkSubCatId && material) {
      const { error: linkError } = await supabase
        .from('material_sub_categories')
        .insert({
          material_id: material.id,
          sub_category_id: linkSubCatId,
        });

      if (linkError) {
        console.error(`  Failed to link material "${productName}" to subcategory:`, linkError.message);
      }
    }

    materialCount++;
    if (materialCount % 50 === 0) {
      console.log(`  Processed ${materialCount} materials...`);
    }
  }

  console.log(`\nDone! Seeded ${materialCount} materials. Skipped ${skippedCount} rows.`);
  console.log(`Subcategories created/found: ${subCatCache.size}`);
}

seedMaterials().catch(console.error);
