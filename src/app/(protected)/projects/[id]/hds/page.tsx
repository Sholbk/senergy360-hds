'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import ProjectTabs from '@/components/projects/ProjectTabs';
import HdsWorkflowView from '@/components/hds/HdsWorkflowView';
import { isValidUUID } from '@/lib/utils';
import { postFeedActivity } from '@/lib/feedActivity';

interface Principle {
  id: string;
  numeral: number;
  name: string;
  description: string | null;
}

interface SubCategory {
  id: string;
  name: string;
  main_category_id: string;
}

interface ChecklistItemData {
  id: string;
  label: string;
  isChecked: boolean;
  checkedBy: string | null;
  notes: string | null;
  mainCategoryId: string | null;
  subCategoryId: string | null;
}

interface MaterialData {
  materialName: string;
  manufacturer: string | null;
  primaryUse: string | null;
  assignedTo: string;
  mainCategoryId: string;
}

export default function HdsPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItemData[]>([]);
  const [projectMaterials, setProjectMaterials] = useState<MaterialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [checklistId, setChecklistId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    // Load project name
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();

    if (project) setProjectName(project.name);

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile && (profile.role === 'admin' || profile.role === 'owner')) {
        setIsAdmin(true);
      }
    }

    // Load 12 Core Principles (main_categories)
    const { data: cats } = await supabase
      .from('main_categories')
      .select('id, numeral, name, description')
      .order('numeral', { ascending: true });

    const principleList: Principle[] = (cats || []).map((c) => ({
      id: c.id,
      numeral: c.numeral,
      name: c.name,
      description: c.description,
    }));
    setPrinciples(principleList);

    // Get or create project checklist
    let { data: checklist } = await supabase
      .from('project_checklists')
      .select('id')
      .eq('project_id', projectId)
      .single();

    if (!checklist) {
      const { data: newChecklist } = await supabase
        .from('project_checklists')
        .insert({ project_id: projectId })
        .select('id')
        .single();
      checklist = newChecklist;
    }

    if (!checklist) {
      setLoading(false);
      return;
    }

    setChecklistId(checklist.id);

    // Load checklist items that have a main_category_id (HDS items)
    const { data: itemsData } = await supabase
      .from('checklist_items')
      .select('id, label, notes, is_checked, checked_by, main_category_id, sub_category_id')
      .eq('checklist_id', checklist.id)
      .not('main_category_id', 'is', null)
      .order('sort_order', { ascending: true });

    const mappedItems: ChecklistItemData[] = (itemsData || []).map((item) => ({
      id: item.id,
      label: item.label,
      isChecked: item.is_checked,
      checkedBy: item.checked_by,
      notes: item.notes,
      mainCategoryId: item.main_category_id,
      subCategoryId: item.sub_category_id,
    }));
    setChecklistItems(mappedItems);
    setInitialized(mappedItems.length > 0);

    // Load materials assigned to project participants, joined back to categories
    const principleIds = principleList.map((p) => p.id);
    if (principleIds.length > 0) {
      const { data: ppData } = await supabase
        .from('project_participants')
        .select('id, organizations(business_name, primary_first_name, primary_last_name)')
        .eq('project_id', projectId);

      if (ppData && ppData.length > 0) {
        const ppIds = ppData.map((pp) => pp.id);

        const { data: matData } = await supabase
          .from('project_participant_materials')
          .select(`
            id,
            project_participant_id,
            materials(
              name,
              manufacturer,
              primary_use,
              material_sub_categories(
                sub_categories(
                  main_category_id
                )
              )
            )
          `)
          .in('project_participant_id', ppIds);

        if (matData) {
          const materials: MaterialData[] = [];
          for (const row of matData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mat = row.materials as any;
            if (!mat) continue;

            // Find the participant name
            const pp = ppData.find((p) => p.id === row.project_participant_id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const org = pp?.organizations as any;
            const assignedTo = org?.business_name
              || `${org?.primary_first_name || ''} ${org?.primary_last_name || ''}`.trim()
              || 'Unknown';

            // Get main_category_ids from nested join
            const subCats = mat.material_sub_categories || [];
            const mainCatIds = new Set<string>();
            for (const msc of subCats) {
              const sc = msc.sub_categories;
              if (sc?.main_category_id) {
                mainCatIds.add(sc.main_category_id);
              }
            }

            // Create a material entry per principle it belongs to
            for (const mainCatId of mainCatIds) {
              if (principleIds.includes(mainCatId)) {
                materials.push({
                  materialName: mat.name,
                  manufacturer: mat.manufacturer,
                  primaryUse: mat.primary_use,
                  assignedTo,
                  mainCategoryId: mainCatId,
                });
              }
            }
          }
          setProjectMaterials(materials);
        }
      }
    }

    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInitialize = async () => {
    if (!checklistId) return;
    setInitializing(true);

    // Load all sub_categories (level 2) grouped by main_category
    const { data: subCats } = await supabase
      .from('sub_categories')
      .select('id, name, main_category_id')
      .order('name', { ascending: true });

    if (!subCats || subCats.length === 0) {
      setInitializing(false);
      return;
    }

    // Build checklist items from sub-categories
    const principleMap = new Map(principles.map((p) => [p.id, p.name]));
    const inserts = subCats.map((sc: SubCategory, idx: number) => ({
      checklist_id: checklistId,
      label: sc.name,
      category_name: principleMap.get(sc.main_category_id) || 'Uncategorized',
      main_category_id: sc.main_category_id,
      sub_category_id: sc.id,
      sort_order: idx + 1,
      is_checked: false,
    }));

    const { data: newItems, error } = await supabase
      .from('checklist_items')
      .insert(inserts)
      .select('id, label, notes, is_checked, checked_by, main_category_id, sub_category_id');

    if (!error && newItems) {
      const mapped: ChecklistItemData[] = newItems.map((item) => ({
        id: item.id,
        label: item.label,
        isChecked: item.is_checked,
        checkedBy: item.checked_by,
        notes: item.notes,
        mainCategoryId: item.main_category_id,
        subCategoryId: item.sub_category_id,
      }));
      setChecklistItems(mapped);
      setInitialized(true);

      await postFeedActivity(supabase, {
        projectId,
        content: 'HDS Checklist initialized with 12 Core Principles',
        eventType: 'checklist_item_added',
      });
    }

    setInitializing(false);
  };

  const handleToggleItem = async (itemId: string, checked: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    const userName = user?.email || 'Unknown';

    const updates = checked
      ? { is_checked: true, checked_by: userName, checked_at: new Date().toISOString() }
      : { is_checked: false, checked_by: null, checked_at: null };

    const { error } = await supabase
      .from('checklist_items')
      .update(updates)
      .eq('id', itemId);

    if (!error) {
      const item = checklistItems.find((i) => i.id === itemId);
      setChecklistItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, isChecked: checked, checkedBy: checked ? userName : null }
            : i
        )
      );
      if (checked && item) {
        await postFeedActivity(supabase, {
          projectId,
          content: `HDS item verified: ${item.label}`,
          eventType: 'checklist_item_completed',
        });
      }
    }
  };

  const handleAddItem = async (mainCategoryId: string, label: string) => {
    if (!checklistId) return;

    const principleItems = checklistItems.filter((i) => i.mainCategoryId === mainCategoryId);
    const maxSort = principleItems.length > 0 ? principleItems.length : 0;
    const principleName = principles.find((p) => p.id === mainCategoryId)?.name || 'Uncategorized';

    const { data: newItem, error } = await supabase
      .from('checklist_items')
      .insert({
        checklist_id: checklistId,
        label,
        category_name: principleName,
        main_category_id: mainCategoryId,
        sort_order: maxSort + 1,
        is_checked: false,
      })
      .select('id, label, notes, is_checked, checked_by, main_category_id, sub_category_id')
      .single();

    if (!error && newItem) {
      setChecklistItems((prev) => [
        ...prev,
        {
          id: newItem.id,
          label: newItem.label,
          isChecked: newItem.is_checked,
          checkedBy: newItem.checked_by,
          notes: newItem.notes,
          mainCategoryId: newItem.main_category_id,
          subCategoryId: newItem.sub_category_id,
        },
      ]);
      await postFeedActivity(supabase, {
        projectId,
        content: `HDS checklist item added: ${label} (${principleName})`,
        eventType: 'checklist_item_added',
      });
    }
  };

  if (!isValidUUID(projectId)) return <p className="text-muted text-sm">Project not found.</p>;
  if (loading) return <p className="text-muted text-sm">Loading...</p>;

  return (
    <div>
      <button
        onClick={() => router.push('/projects')}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Projects
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-4">{projectName}</h1>

      <ProjectTabs projectId={projectId} />

      <HdsWorkflowView
        principles={principles}
        checklistItems={checklistItems}
        projectMaterials={projectMaterials}
        isAdmin={isAdmin}
        initialized={initialized}
        onToggleItem={handleToggleItem}
        onAddItem={handleAddItem}
        onInitialize={handleInitialize}
        initializing={initializing}
      />
    </div>
  );
}
