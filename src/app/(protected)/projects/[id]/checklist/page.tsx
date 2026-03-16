'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import ProjectTabs from '@/components/projects/ProjectTabs';
import ChecklistView from '@/components/checklist/ChecklistView';
import { isValidUUID } from '@/lib/utils';
import { postFeedActivity } from '@/lib/feedActivity';

interface ChecklistItem {
  id: string;
  label: string;
  notes: string | null;
  isChecked: boolean;
  checkedBy: string | null;
  checkedAt: string | null;
  sortOrder: number;
  categoryName: string;
}

export default function ChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projectName, setProjectName] = useState('');

  const loadChecklist = useCallback(async () => {
    // Load project name
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();

    if (project) {
      setProjectName(project.name);
    }

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

    // Fetch or create project checklist
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

    // Fetch checklist items
    const { data: itemsData } = await supabase
      .from('checklist_items')
      .select('id, label, notes, is_checked, checked_by, checked_at, sort_order, category_name')
      .eq('checklist_id', checklist.id)
      .order('sort_order', { ascending: true });

    if (itemsData) {
      setItems(
        itemsData.map((item) => ({
          id: item.id,
          label: item.label,
          notes: item.notes,
          isChecked: item.is_checked,
          checkedBy: item.checked_by,
          checkedAt: item.checked_at,
          sortOrder: item.sort_order,
          categoryName: item.category_name,
        }))
      );
    }

    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

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
      const item = items.find((i) => i.id === itemId);
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                isChecked: checked,
                checkedBy: checked ? userName : null,
                checkedAt: checked ? new Date().toISOString() : null,
              }
            : i
        )
      );
      if (checked && item) {
        await postFeedActivity(supabase, {
          projectId,
          content: `Checklist item completed: ${item.label}`,
          eventType: 'checklist_item_completed',
        });
      }
    }
  };

  const handleAddItem = async (categoryName: string, label: string) => {
    if (!checklistId) return;

    const categoryItems = items.filter((i) => i.categoryName === categoryName);
    const maxSort = categoryItems.length > 0
      ? Math.max(...categoryItems.map((i) => i.sortOrder))
      : 0;

    const { data: newItem, error } = await supabase
      .from('checklist_items')
      .insert({
        checklist_id: checklistId,
        label,
        category_name: categoryName,
        sort_order: maxSort + 1,
        is_checked: false,
      })
      .select('id, label, notes, is_checked, checked_by, checked_at, sort_order, category_name')
      .single();

    if (!error && newItem) {
      setItems((prev) => [
        ...prev,
        {
          id: newItem.id,
          label: newItem.label,
          notes: newItem.notes,
          isChecked: newItem.is_checked,
          checkedBy: newItem.checked_by,
          checkedAt: newItem.checked_at,
          sortOrder: newItem.sort_order,
          categoryName: newItem.category_name,
        },
      ]);
      await postFeedActivity(supabase, {
        projectId,
        content: `Checklist item added: ${label} (${categoryName})`,
        eventType: 'checklist_item_added',
      });
    }
  };

  const handleEditItem = async (itemId: string, label: string, notes: string) => {
    const { error } = await supabase
      .from('checklist_items')
      .update({ label, notes: notes || null })
      .eq('id', itemId);

    if (!error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, label, notes: notes || null } : item
        )
      );
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
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

      <ChecklistView
        items={items}
        isAdmin={isAdmin}
        onToggle={handleToggleItem}
        onAddItem={handleAddItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />
    </div>
  );
}
