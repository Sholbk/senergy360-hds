/**
 * Deduplicate materials: merge duplicate material rows into one,
 * preserving all sub_category links via the junction table.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('=== DRY RUN ===\n');

  // Get all materials
  const { data: mats } = await supabase
    .from('materials')
    .select('id, name, primary_use, key_benefits')
    .order('name');

  // Get all links
  const { data: links } = await supabase
    .from('material_sub_categories')
    .select('material_id, sub_category_id');

  // Group materials by name
  const byName = new Map<string, typeof mats>();
  for (const mat of mats!) {
    if (!byName.has(mat.name)) byName.set(mat.name, []);
    byName.get(mat.name)!.push(mat);
  }

  // Group links by material_id
  const linksByMat = new Map<string, string[]>();
  for (const link of links!) {
    if (!linksByMat.has(link.material_id)) linksByMat.set(link.material_id, []);
    linksByMat.get(link.material_id)!.push(link.sub_category_id);
  }

  let mergedCount = 0;
  let deletedCount = 0;
  let linksAdded = 0;

  for (const [name, dupes] of byName) {
    if (dupes.length <= 1) continue;

    // Keep the first one, merge all sub_category links into it
    const keeper = dupes[0];
    const toDelete = dupes.slice(1);

    // Collect all unique sub_category_ids from all duplicates
    const allSubCatIds = new Set<string>();
    for (const mat of dupes) {
      const matLinks = linksByMat.get(mat.id) || [];
      for (const scId of matLinks) {
        allSubCatIds.add(scId);
      }
    }

    // Existing links on the keeper
    const keeperLinks = new Set(linksByMat.get(keeper.id) || []);

    // Links to add to the keeper
    const newLinks = [...allSubCatIds].filter((id) => !keeperLinks.has(id));

    if (newLinks.length > 0 || toDelete.length > 0) {
      console.log(`${name} (${dupes.length}x):`);
      console.log(`  Keep: ${keeper.id.slice(0, 8)} with ${keeperLinks.size} existing links`);
      console.log(`  Add ${newLinks.length} new category links`);
      console.log(`  Delete ${toDelete.length} duplicate rows`);
    }

    if (!dryRun) {
      // Add missing links to keeper
      for (const scId of newLinks) {
        const { error } = await supabase
          .from('material_sub_categories')
          .insert({ material_id: keeper.id, sub_category_id: scId });
        if (error && !error.message.includes('duplicate')) {
          console.error(`  ERROR adding link: ${error.message}`);
        } else {
          linksAdded++;
        }
      }

      // Delete duplicate material rows (cascade will remove their links)
      for (const dup of toDelete) {
        // First remove links
        await supabase
          .from('material_sub_categories')
          .delete()
          .eq('material_id', dup.id);

        // Then remove material
        const { error } = await supabase
          .from('materials')
          .delete()
          .eq('id', dup.id);
        if (error) {
          console.error(`  ERROR deleting ${dup.id}: ${error.message}`);
        } else {
          deletedCount++;
        }
      }
    }

    mergedCount++;
  }

  console.log(`\n=== Summary ===`);
  console.log(`Duplicate groups merged: ${mergedCount}`);
  console.log(`Material rows deleted: ${deletedCount}`);
  console.log(`Category links added: ${linksAdded}`);

  if (!dryRun) {
    const { count: matCount } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true });
    const { count: linkCount } = await supabase
      .from('material_sub_categories')
      .select('*', { count: 'exact', head: true });
    console.log(`\nFinal counts:`);
    console.log(`  Materials: ${matCount}`);
    console.log(`  Category links: ${linkCount}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
