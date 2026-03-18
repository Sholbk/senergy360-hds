/**
 * Migrate category structure to match the HDS document's 12 categories.
 *
 * Strategy:
 * 1. Update existing main_categories (rename, renumber) + add new ones (2, 12)
 * 2. Update existing Cat2 sub_categories (rename, reassign main_category, renumber)
 * 3. Add new Cat2 sub_categories that don't have materials yet
 * 4. Update Cat3 sub_categories' main_category_id to match new parents
 * 5. All material links are preserved (material_sub_categories unchanged)
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

  // Get tenant
  const { data: tenants } = await supabase.from('tenants').select('id');
  const tenantId = tenants![0].id;

  // Get current main categories
  const { data: mainCats } = await supabase
    .from('main_categories')
    .select('id, numeral, name')
    .order('numeral');

  // Get current sub categories
  const { data: allSubs } = await supabase
    .from('sub_categories')
    .select('id, name, sort_order, main_category_id, parent_sub_category_id');

  const mcById = new Map(mainCats!.map((m) => [m.id, m]));
  const mcByNumeral = new Map(mainCats!.map((m) => [m.numeral, m]));

  // ── Define the 12 new main categories ──
  const newMainCats: { numeral: number; name: string }[] = [
    { numeral: 1, name: 'ARCHITECTURAL DESIGN - SITE PREPARATION - FOUNDATIONS' },
    { numeral: 2, name: 'PERFORMANCE BUILDING STRATEGIES' },
    { numeral: 3, name: 'NON-TOXIC BUILDING MATERIALS' },
    { numeral: 4, name: 'CLIMATE CONTROL & VENTILATION' },
    { numeral: 5, name: 'ELECTRICAL SYSTEMS (LOW-EMF DESIGN)' },
    { numeral: 6, name: 'CIRCADIAN LIGHTING SYSTEMS' },
    { numeral: 7, name: 'LOW VOLTAGE & SMART INTEGRATION SYSTEMS' },
    { numeral: 8, name: 'SOLAR & ALTERNATIVE POWER' },
    { numeral: 9, name: 'PLUMBING' },
    { numeral: 10, name: 'WATER QUALITY & ADVANCED FILTRATION' },
    { numeral: 11, name: 'NON-TOXIC CLEANING MATERIALS & MOLD REDUCTION STRATEGIES' },
    { numeral: 12, name: 'HOME FURNISHINGS, APPLIANCES & INTERIOR WELLNESS' },
  ];

  // ── Step 1: Update/create main categories ──
  console.log('Step 1: Updating main categories...');
  const newMcIds: Record<number, string> = {};

  for (const mc of newMainCats) {
    const existing = mcByNumeral.get(mc.numeral);
    if (existing) {
      // Update name
      if (existing.name !== mc.name) {
        console.log(`  Update ${mc.numeral}: "${existing.name}" → "${mc.name}"`);
        if (!dryRun) {
          await supabase
            .from('main_categories')
            .update({ name: mc.name })
            .eq('id', existing.id);
        }
      } else {
        console.log(`  Keep ${mc.numeral}: "${mc.name}"`);
      }
      newMcIds[mc.numeral] = existing.id;
    } else {
      // Create new
      console.log(`  Create ${mc.numeral}: "${mc.name}"`);
      if (!dryRun) {
        const { data } = await supabase
          .from('main_categories')
          .insert({ tenant_id: tenantId, numeral: mc.numeral, name: mc.name })
          .select('id')
          .single();
        newMcIds[mc.numeral] = data!.id;
      } else {
        newMcIds[mc.numeral] = `new-${mc.numeral}`;
      }
    }
  }

  // Old main cat 3 ("PERFORMANCE BUILDING STRATEGIES & BUILDING MATERIALS") needs renumbering
  // It currently holds numeral=3, but in the new scheme numeral=3 is "NON-TOXIC BUILDING MATERIALS"
  // The old cat 3 content mostly maps to new cat 3, except Concrete→1 and Lumber renumber
  // Since we already updated numeral=3's name above, old cat 3's ID is now newMcIds[3]
  const oldCat3Id = mcByNumeral.get(3)?.id; // This is the old "PERFORMANCE BUILDING STRATEGIES & BUILDING MATERIALS"

  // ── Step 2: Define Cat2 mapping (old → new) ──
  // Format: { oldSubName (partial match), newMainCatNumeral, newSortOrder, newName }
  interface Cat2Mapping {
    oldNameContains: string;
    newMainCat: number;
    newSortOrder: number;
    newName: string;
  }

  const cat2Mappings: Cat2Mapping[] = [
    // Category 1 subs
    { oldNameContains: '1.04 Grading', newMainCat: 1, newSortOrder: 4, newName: '1.4 - Grading - Soil Preparation - Vegetation - Pavement' },
    { oldNameContains: '1.05 Pest', newMainCat: 1, newSortOrder: 5, newName: '1.5 Pest and Termite Control' },
    { oldNameContains: '1.06 Waterproofing', newMainCat: 1, newSortOrder: 6, newName: '1.6 Moisture and Vapor Management' },
    // Concrete moves from old cat 3 to new cat 1
    { oldNameContains: '3.02 Concrete', newMainCat: 1, newSortOrder: 8, newName: '1.8 - Concrete' },

    // Category 3 subs (was old cat 3)
    { oldNameContains: '3.01', newMainCat: 3, newSortOrder: 1, newName: '3.1 Adhesives, Sealants & Caulks' },
    { oldNameContains: '3.16 Lumber', newMainCat: 3, newSortOrder: 2, newName: '3.2 - Lumber' },
    { oldNameContains: '3.03 Rough', newMainCat: 3, newSortOrder: 3, newName: '3.3 - Rough Carpentry' },
    { oldNameContains: '3.04 Roofing', newMainCat: 3, newSortOrder: 4, newName: '3.4 - Roofing' },
    { oldNameContains: '3.05 Metal', newMainCat: 3, newSortOrder: 5, newName: '3.5 - Metal cleaning and sealers' },
    { oldNameContains: '3.06 Exterior Wall', newMainCat: 3, newSortOrder: 6, newName: '3.6 - Exterior Wall Bulk Water Management' },
    { oldNameContains: '3.07 Windows', newMainCat: 3, newSortOrder: 7, newName: '3.7 - Windows and Exterior Doors' },
    { oldNameContains: '3.08 Water management', newMainCat: 3, newSortOrder: 8, newName: '3.8 - Water management at Door, Window, Wall Openings and Sill Plates' },
    { oldNameContains: '3.09 Insulation', newMainCat: 3, newSortOrder: 9, newName: '3.9 - Insulation Around Windows, Doors and Any Crevices' },
    { oldNameContains: '3.10 Exterior Finish', newMainCat: 3, newSortOrder: 10, newName: '3.10 - Exterior Finishes' },
    { oldNameContains: '3.11 Thermal', newMainCat: 3, newSortOrder: 11, newName: '3.11 - Thermal Control – Insulation' },
    { oldNameContains: '3.12 Interior Air', newMainCat: 3, newSortOrder: 12, newName: '3.12 - Interior Air Barrier/Smart Vapor Barrier Products' },
    { oldNameContains: '3.13 Finish Carpentry', newMainCat: 3, newSortOrder: 13, newName: '3.13 - Finish Carpentry, Millwork, Cabinetry & Countertops' },
    { oldNameContains: '3.14 Countertop', newMainCat: 3, newSortOrder: 14, newName: '3.14 - Countertops' },
    { oldNameContains: '3.15 Interior Finish', newMainCat: 3, newSortOrder: 15, newName: '3.15 - Interior Finishes' },

    // Category 4 subs
    { oldNameContains: '4.02 Heating', newMainCat: 4, newSortOrder: 2, newName: '4.2 Heating and Cooling Systems' },
    { oldNameContains: '4.04 Ventilation', newMainCat: 4, newSortOrder: 4, newName: '4.4 Ventilation- Passive Air intake | ERV | HRV' },
    { oldNameContains: '4.05 Filtration', newMainCat: 4, newSortOrder: 5, newName: '4.5 – FILTRATION & COIL PROTECTION' },
    { oldNameContains: '4.08 Bathroom', newMainCat: 4, newSortOrder: 8, newName: '4.8 Bathroom Humidity-Motion Sensing Vent Fans' },
    { oldNameContains: '4.09 Kitchen', newMainCat: 4, newSortOrder: 9, newName: '4.9 Kitchen Ventilation' },
    { oldNameContains: '4.10 Exhaust', newMainCat: 4, newSortOrder: 10, newName: '4.10 Exhaust Fan in Garage' },

    // Category 5 subs
    { oldNameContains: '5.05 Meter', newMainCat: 5, newSortOrder: 5, newName: '5.5 Meter Service' },
    { oldNameContains: '5.09 Electrical Disconnect', newMainCat: 5, newSortOrder: 9, newName: '5.9 Electrical Disconnect Panels' },
    { oldNameContains: '5.20 Electrical DE', newMainCat: 5, newSortOrder: 20, newName: '5.20 Electrical DE Filtering' },
    { oldNameContains: '5.24 Options', newMainCat: 5, newSortOrder: 24, newName: '5.24 Options for Remote Demand Switches' },
    { oldNameContains: '5.28 EMF', newMainCat: 5, newSortOrder: 27, newName: '5.27 In-depth Supplemental Electrical' },

    // Category 6 subs
    { oldNameContains: '6.01 Colorbeam', newMainCat: 6, newSortOrder: 6, newName: '6.6 - Best-in-Class Low Voltage Lighting' },
    { oldNameContains: '6.12 LED', newMainCat: 6, newSortOrder: 12, newName: '6.12 LED and Incandescent Bulbs' },
    { oldNameContains: '6.13', newMainCat: 6, newSortOrder: 13, newName: '6.13 - Dimmer Switches' },

    // Category 7 subs
    { oldNameContains: '7.01 Low Voltage', newMainCat: 7, newSortOrder: 2, newName: '7.2 – HARDWIRED DEVICES' },
    { oldNameContains: '7.03', newMainCat: 7, newSortOrder: 3, newName: '7.3 – EMF-MANAGED WIRELESS ZONES' },
    { oldNameContains: '7.04', newMainCat: 7, newSortOrder: 4, newName: '7.4 - EMF-RF Shielding' },
    { oldNameContains: '7.05', newMainCat: 7, newSortOrder: 5, newName: '7.5 – AUTOMATION ECOSYSTEM' },
    { oldNameContains: '7.06', newMainCat: 7, newSortOrder: 6, newName: '7.6 - Integration with IAQ & Sensors' },

    // Category 8 subs
    { oldNameContains: '8.01 SAVANT', newMainCat: 8, newSortOrder: 1, newName: '8.1 Array Orientation & Design' },

    // Category 9 subs
    { oldNameContains: '9.02 Water Supply', newMainCat: 9, newSortOrder: 2, newName: '9.2 Water Supply Pipe' },
    { oldNameContains: '9.03 Pipe Insulation', newMainCat: 9, newSortOrder: 3, newName: '9.3 Pipe Insulation' },
    { oldNameContains: '9.06 Low VOC', newMainCat: 9, newSortOrder: 6, newName: '9.6 Low VOC Pipe Adhesives' },
    { oldNameContains: '9.08', newMainCat: 9, newSortOrder: 8, newName: '9.8 – Interior Water Management' },

    // Category 10 subs
    { oldNameContains: '10.04 Natural', newMainCat: 10, newSortOrder: 4, newName: '10.4 Natural Action MR-24 Water Structuring' },

    // Category 11 subs
    { oldNameContains: '11.01', newMainCat: 11, newSortOrder: 1, newName: '11.1 – DURING CONSTRUCTION' },
    { oldNameContains: '11.02', newMainCat: 11, newSortOrder: 2, newName: '11.2 – TESTING & VERIFICATION' },
  ];

  // ── Step 3: Apply Cat2 mappings ──
  console.log('\nStep 2: Updating existing Cat2 sub_categories...');
  const cat2s = allSubs!.filter((s) => !s.parent_sub_category_id);

  for (const sub of cat2s) {
    const mapping = cat2Mappings.find((m) => sub.name.includes(m.oldNameContains));
    if (!mapping) {
      console.log(`  WARNING: No mapping for "${sub.name}" (id: ${sub.id.slice(0, 8)})`);
      continue;
    }

    const newMcId = newMcIds[mapping.newMainCat];
    const changes: Record<string, unknown> = {};

    if (sub.name !== mapping.newName) changes.name = mapping.newName;
    if (sub.sort_order !== mapping.newSortOrder) changes.sort_order = mapping.newSortOrder;
    if (sub.main_category_id !== newMcId) changes.main_category_id = newMcId;

    if (Object.keys(changes).length > 0) {
      console.log(`  Update "${sub.name}" → "${mapping.newName}" (cat ${mapping.newMainCat}, sort ${mapping.newSortOrder})`);
      if (!dryRun) {
        const { error } = await supabase
          .from('sub_categories')
          .update(changes)
          .eq('id', sub.id);
        if (error) console.error(`    ERROR: ${error.message}`);
      }
    } else {
      console.log(`  Keep "${sub.name}" (no changes)`);
    }
  }

  // ── Step 4: Update Cat3 sub_categories' main_category_id ──
  console.log('\nStep 3: Updating Cat3 main_category_id...');
  const cat3s = allSubs!.filter((s) => s.parent_sub_category_id);

  for (const child of cat3s) {
    const parent = cat2s.find((c2) => c2.id === child.parent_sub_category_id);
    if (!parent) continue;

    const mapping = cat2Mappings.find((m) => parent.name.includes(m.oldNameContains));
    if (!mapping) continue;

    const newMcId = newMcIds[mapping.newMainCat];
    if (child.main_category_id !== newMcId) {
      console.log(`  Update "${child.name}" main_cat → ${mapping.newMainCat}`);
      if (!dryRun) {
        await supabase
          .from('sub_categories')
          .update({ main_category_id: newMcId })
          .eq('id', child.id);
      }
    }
  }

  // ── Step 5: Create new Cat2 sub_categories (no materials yet) ──
  console.log('\nStep 4: Creating new sub_categories (no materials)...');

  interface NewSubCat {
    mainCat: number;
    sortOrder: number;
    name: string;
    children?: string[];
  }

  const newSubCats: NewSubCat[] = [
    // Cat 1 new subs
    { mainCat: 1, sortOrder: 1, name: '1.1 – Collaborative Design & Early Integration' },
    { mainCat: 1, sortOrder: 2, name: '1.2 – Site Orientation, Site Work & Passive Solar' },
    { mainCat: 1, sortOrder: 3, name: '1.3 - Site Work Overview' },
    { mainCat: 1, sortOrder: 7, name: '1.7 Foundations and Basements' },

    // Cat 2 (all new)
    { mainCat: 2, sortOrder: 1, name: '2.1 – Envelope Assembly Selection' },
    { mainCat: 2, sortOrder: 2, name: '2.2 - Mechanical & Electrical Pre-Planning' },
    { mainCat: 2, sortOrder: 3, name: '2.3 - Conditioned Attic & Crawlspaces' },
    { mainCat: 2, sortOrder: 4, name: '2.4 – Exterior Performance & Reduced Thermal Bridging' },
    { mainCat: 2, sortOrder: 5, name: '2.5 - Air Tightness & Verification' },
    { mainCat: 2, sortOrder: 7, name: '2.7 – Water / Air / Vapor / Thermal Control' },
    { mainCat: 2, sortOrder: 8, name: '2.8 – Penetrations, Flashing & Window Buck Systems' },

    // Cat 3 new sub: 3.15.6 Wood Flooring (child of 3.15)
    // Handled separately below

    // Cat 4 new subs
    { mainCat: 4, sortOrder: 1, name: '4.1 – HVAC SYSTEM DESIGN' },
    { mainCat: 4, sortOrder: 3, name: '4.3 Duct System Standards', children: ['Ductwork Installation'] },
    { mainCat: 4, sortOrder: 6, name: '4.6 – SENSORS & CONTROLS' },
    { mainCat: 4, sortOrder: 7, name: '4.7 – AIRFLOW VENTING & BIOFILM PREVENTION' },
    { mainCat: 4, sortOrder: 11, name: '4.11 IAQ During Construction' },
    { mainCat: 4, sortOrder: 12, name: '4.12 HVAC Electro-Magnetic Radiation Considerations' },

    // Cat 5 new subs
    { mainCat: 5, sortOrder: 1, name: '5.1 Utilities' },
    { mainCat: 5, sortOrder: 2, name: '5.2 Wiring' },
    { mainCat: 5, sortOrder: 3, name: '5.3 Electric Fields from Wiring', children: ['AC Magnetic Fields from Wiring'] },
    { mainCat: 5, sortOrder: 6, name: '5.6 Lightning Protection' },
    { mainCat: 5, sortOrder: 7, name: '5.7 Dielectric Unions at Service Entry' },
    { mainCat: 5, sortOrder: 8, name: '5.8 Smart Public Utility Meters' },
    { mainCat: 5, sortOrder: 10, name: '5.10 General Arc Fault Circuit Interrupter (AFCI) breakers' },
    { mainCat: 5, sortOrder: 11, name: '5.11 Encased Grounded Electrode Systems' },
    { mainCat: 5, sortOrder: 12, name: '5.12 Earth grounding for earthing modalities' },
    { mainCat: 5, sortOrder: 13, name: '5.13 Wiring to Eliminate Exposure to Electric Fields' },
    { mainCat: 5, sortOrder: 14, name: '5.14 Wiring to Eliminate Magnetic Fields' },
    { mainCat: 5, sortOrder: 15, name: '5.15 Ganging of neutral wires' },
    { mainCat: 5, sortOrder: 16, name: '5.16 Half-switched outlets' },
    { mainCat: 5, sortOrder: 17, name: '5.17 Wiring from more than one circuit sharing an electrical box' },
    { mainCat: 5, sortOrder: 18, name: '5.18 Three and four-way switches' },
    { mainCat: 5, sortOrder: 19, name: '5.19 Electromagnetic interference (EMI) Filtration' },
    { mainCat: 5, sortOrder: 21, name: '5.21 Remote Cut-Off Switches' },
    { mainCat: 5, sortOrder: 22, name: '5.22 Wiring for Cut-off Switch' },
    { mainCat: 5, sortOrder: 23, name: '5.23 Manual Cut-off Switch option' },
    { mainCat: 5, sortOrder: 25, name: '5.25 Gasket Electrical Boxes for air tightness' },

    // Cat 6 new subs
    { mainCat: 6, sortOrder: 1, name: '6.1 – LIGHTING SYSTEM COORDINATION' },
    { mainCat: 6, sortOrder: 2, name: '6.2 – FLICKER, SPECTRUM & DRIVER PERFORMANCE' },
    { mainCat: 6, sortOrder: 3, name: '6.3 – CIRCADIAN SCHEDULING & CONTROLS' },
    { mainCat: 6, sortOrder: 4, name: '6.4 – LIGHTING LAYERS' },
    { mainCat: 6, sortOrder: 5, name: '6.5 – GLARE & LIGHT POLLUTION CONTROL', children: ['No Standard High-Flicker LED Lamps', 'Bedroom Lighting Restrictions', 'Compatibility with Low-EMF Design'] },
    { mainCat: 6, sortOrder: 10, name: '6.10 - Standard Lighting with Upgraded Wiring' },
    { mainCat: 6, sortOrder: 11, name: '6.11 - Lightbulbs and Fixtures' },

    // Cat 7 new subs
    { mainCat: 7, sortOrder: 7, name: '7.7 - Serviceability' },

    // Cat 8 new subs
    { mainCat: 8, sortOrder: 2, name: '8.2 – POWER QUALITY', children: ['Load Balancing'] },
    { mainCat: 8, sortOrder: 3, name: '8.3 – BACKUP POWER INTEGRATION' },

    // Cat 9 new subs
    { mainCat: 9, sortOrder: 1, name: '9.1 Water Supply and Waste' },
    { mainCat: 9, sortOrder: 4, name: '9.4 Waste Drain System' },
    { mainCat: 9, sortOrder: 5, name: '9.5 Pipe Assembly' },
    { mainCat: 9, sortOrder: 7, name: '9.7 Sealing Plumbing Joints' },
    { mainCat: 9, sortOrder: 9, name: '9.9 Hygiene During Construction' },
    { mainCat: 9, sortOrder: 10, name: '9.10 – LEAK DETECTION & SAFETY', children: ['Whole-Home Leak Detection', 'Zone Shut-Off Valves', 'Fixture-Level Protection', 'Material Durability Checks'] },
    { mainCat: 9, sortOrder: 11, name: '9.11 – VENTING & CLEANOUTS', children: ['Proper Venting Systems', 'Vent Terminations', 'Cleanout Requirements', 'Drainage Optimization'] },

    // Cat 10 new subs
    { mainCat: 10, sortOrder: 1, name: '10.1 – WHOLE-HOME FILTRATION STAGES' },
    { mainCat: 10, sortOrder: 2, name: '10.2 Details on types of filtration' },
    { mainCat: 10, sortOrder: 5, name: '10.5 Pool and Spa Filtration and Purification' },
    { mainCat: 10, sortOrder: 6, name: '10.6 Alternatives to Conventional Chlorination' },
    { mainCat: 10, sortOrder: 7, name: '10.7 Structured Water / Revitalizer Swimming Pool Unit' },
    { mainCat: 10, sortOrder: 8, name: '10.8 Advanced systems to creating Non-toxic swimming pools' },
    { mainCat: 10, sortOrder: 9, name: '10.9 Guide to Non-Toxic Pool Solutions' },

    // Cat 11 new subs
    { mainCat: 11, sortOrder: 3, name: '11.3 – OCCUPANT MAINTENANCE' },
    { mainCat: 11, sortOrder: 4, name: '11.4 – BREATHABLE MATERIAL STRATEGY', children: ['Interior Breathable Finishes'] },
    { mainCat: 11, sortOrder: 5, name: '11.5 No Antimicrobials That Leave Toxic Residues' },
    { mainCat: 11, sortOrder: 6, name: '11.6 Construction Moisture Documentation' },
    { mainCat: 11, sortOrder: 7, name: '11.7 Attic & Crawlspace Inspections' },
  ];

  let created = 0;
  for (const sub of newSubCats) {
    const mcId = newMcIds[sub.mainCat];
    console.log(`  Create ${sub.name} (cat ${sub.mainCat})`);
    if (!dryRun) {
      const { data, error } = await supabase
        .from('sub_categories')
        .insert({
          tenant_id: tenantId,
          main_category_id: mcId,
          sort_order: sub.sortOrder,
          name: sub.name,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`    ERROR: ${error.message}`);
        continue;
      }

      // Create children if any
      if (sub.children && data) {
        for (let i = 0; i < sub.children.length; i++) {
          const { error: childErr } = await supabase
            .from('sub_categories')
            .insert({
              tenant_id: tenantId,
              main_category_id: mcId,
              parent_sub_category_id: data.id,
              sort_order: i + 1,
              name: sub.children[i],
            });
          if (childErr) console.error(`    Child ERROR: ${childErr.message}`);
        }
        created += sub.children.length;
      }
    }
    created++;
  }
  console.log(`  Created ${created} new sub_categories`);

  // ── Step 6: Add 3.15.6 Wood Flooring as child of 3.15 ──
  console.log('\nStep 5: Adding 3.15.6 Wood Flooring...');
  if (!dryRun) {
    // Find the updated 3.15 sub_category
    const { data: sub315 } = await supabase
      .from('sub_categories')
      .select('id')
      .ilike('name', '%3.15%Interior Finish%')
      .single();

    if (sub315) {
      const mcId = newMcIds[3];
      const { error } = await supabase
        .from('sub_categories')
        .insert({
          tenant_id: tenantId,
          main_category_id: mcId,
          parent_sub_category_id: sub315.id,
          sort_order: 6,
          name: '3.15.6 Wood Flooring',
        });
      if (error) console.error(`  ERROR: ${error.message}`);
      else console.log('  Created 3.15.6 Wood Flooring');
    }
  }

  // ── Verification ──
  console.log('\n=== Verification ===');
  if (!dryRun) {
    const { data: finalMcs } = await supabase
      .from('main_categories')
      .select('numeral, name')
      .order('numeral');
    console.log(`Main categories: ${finalMcs?.length}`);
    finalMcs?.forEach((m) => console.log(`  ${m.numeral}. ${m.name}`));

    const { count: subCount } = await supabase
      .from('sub_categories')
      .select('*', { count: 'exact', head: true });
    console.log(`\nSub categories: ${subCount}`);

    const { count: matCount } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true });
    const { count: linkCount } = await supabase
      .from('material_sub_categories')
      .select('*', { count: 'exact', head: true });
    console.log(`Materials: ${matCount}`);
    console.log(`Material links: ${linkCount}`);
  }

  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
