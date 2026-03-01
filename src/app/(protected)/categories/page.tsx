'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MainCategory, SubCategory, Material } from '@/types';
import { formatMainCategoryDisplay } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import PrivateNotesList from '@/components/ui/PrivateNotesList';
import Link from 'next/link';

export default function CategoriesPage() {
  const [supabase] = useState(() => createClient());
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [selectedMainCat, setSelectedMainCat] = useState<MainCategory | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSubCat, setSelectedSubCat] = useState<SubCategory | null>(null);
  const [subCatMaterials, setSubCatMaterials] = useState<Material[]>([]);
  const [showDescription, setShowDescription] = useState(false);
  const [editMainCatModal, setEditMainCatModal] = useState(false);
  const [editSubCatModal, setEditSubCatModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [subCatNotes, setSubCatNotes] = useState<{ id: string; tenantId: string; note: string; createdAt: string }[]>([]);

  // Load main categories
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('main_categories')
        .select('*')
        .order('numeral');
      if (data) {
        const mapped = data.map((d) => ({
          id: d.id,
          tenantId: d.tenant_id,
          numeral: d.numeral,
          name: d.name,
          description: d.description,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
        setMainCategories(mapped);
        if (mapped.length > 0 && !selectedMainCat) {
          setSelectedMainCat(mapped[0]);
        }
      }
    }
    load();
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load subcategories when main category changes
  const loadSubCategories = useCallback(async (mainCatId: string) => {
    const { data } = await supabase
      .from('sub_categories')
      .select('*')
      .eq('main_category_id', mainCatId)
      .is('parent_sub_category_id', null)
      .order('sort_order');
    if (data) {
      const mapped = data.map((d) => ({
        id: d.id,
        tenantId: d.tenant_id,
        mainCategoryId: d.main_category_id,
        parentSubCategoryId: d.parent_sub_category_id,
        sortOrder: d.sort_order,
        name: d.name,
        description: d.description,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
      setSubCategories(mapped);
      setSelectedSubCat(null);
      setSubCatMaterials([]);
    }
  }, [supabase]);

  useEffect(() => {
    if (selectedMainCat) {
      loadSubCategories(selectedMainCat.id);
    }
  }, [selectedMainCat, loadSubCategories]);

  // Load materials and notes for selected subcategory
  useEffect(() => {
    async function loadSubCatDetails() {
      if (!selectedSubCat) return;

      // Load private notes for this subcategory
      const { data: notesData } = await supabase
        .from('private_notes')
        .select('*')
        .eq('sub_category_id', selectedSubCat.id)
        .order('created_at', { ascending: false });

      if (notesData) {
        setSubCatNotes(
          notesData.map((n) => ({
            id: n.id,
            note: n.note,
            createdAt: n.created_at,
            tenantId: n.tenant_id,
          }))
        );
      } else {
        setSubCatNotes([]);
      }

      // Load materials via junction table
      const { data: materialLinks } = await supabase
        .from('material_sub_categories')
        .select('material_id, materials(*)')
        .eq('sub_category_id', selectedSubCat.id);

      if (materialLinks) {
        const materials = materialLinks
          .map((link) => {
            const m = link.materials as unknown as Record<string, unknown>;
            if (!m) return null;
            return {
              id: m.id as string,
              tenantId: m.tenant_id as string,
              name: m.name as string,
              manufacturer: m.manufacturer as string | undefined,
              primaryUse: m.primary_use as string | undefined,
              keyBenefits: m.key_benefits as string | undefined,
              url: m.url as string | undefined,
              createdAt: m.created_at as string,
              updatedAt: m.updated_at as string,
            };
          })
          .filter((m): m is NonNullable<typeof m> => m !== null);
        setSubCatMaterials(materials);
      }

      // Also load materials from child subcategories
      const { data: childSubs } = await supabase
        .from('sub_categories')
        .select('id, name, sort_order')
        .eq('parent_sub_category_id', selectedSubCat.id)
        .order('sort_order');

      if (childSubs && childSubs.length > 0) {
        const childIds = childSubs.map((c) => c.id);
        const { data: childMaterialLinks } = await supabase
          .from('material_sub_categories')
          .select('material_id, materials(*)')
          .in('sub_category_id', childIds);

        if (childMaterialLinks) {
          const childMaterials = childMaterialLinks
            .map((link) => {
              const m = link.materials as unknown as Record<string, unknown>;
              if (!m) return null;
              return {
                id: m.id as string,
                tenantId: m.tenant_id as string,
                name: m.name as string,
                manufacturer: m.manufacturer as string | undefined,
                primaryUse: m.primary_use as string | undefined,
                keyBenefits: m.key_benefits as string | undefined,
                url: m.url as string | undefined,
                createdAt: m.created_at as string,
                updatedAt: m.updated_at as string,
              };
            })
            .filter((m): m is NonNullable<typeof m> => m !== null);
          setSubCatMaterials((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newMaterials = childMaterials.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newMaterials];
          });
        }
      }
    }
    loadSubCatDetails();
  }, [selectedSubCat, supabase]);

  // Add note for subcategory
  const handleAddNote = async (note: string) => {
    if (!selectedSubCat) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    const { data: newNote } = await supabase
      .from('private_notes')
      .insert({ tenant_id: profile.tenant_id, note, sub_category_id: selectedSubCat.id })
      .select('*')
      .single();

    if (newNote) {
      setSubCatNotes((prev) => [
        { id: newNote.id, note: newNote.note, createdAt: newNote.created_at, tenantId: newNote.tenant_id },
        ...prev,
      ]);
    }
  };

  // Edit main category
  const openEditMainCat = () => {
    if (!selectedMainCat) return;
    setEditName(selectedMainCat.name);
    setEditDescription(selectedMainCat.description || '');
    setEditMainCatModal(true);
  };

  const saveMainCat = async () => {
    if (!selectedMainCat) return;
    setSaving(true);
    const { error } = await supabase
      .from('main_categories')
      .update({ name: editName, description: editDescription })
      .eq('id', selectedMainCat.id);
    if (!error) {
      setSelectedMainCat({ ...selectedMainCat, name: editName, description: editDescription });
      setMainCategories((prev) =>
        prev.map((c) => (c.id === selectedMainCat.id ? { ...c, name: editName, description: editDescription } : c))
      );
    }
    setSaving(false);
    setEditMainCatModal(false);
  };

  // Edit subcategory
  const openEditSubCat = () => {
    if (!selectedSubCat) return;
    setEditName(selectedSubCat.name);
    setEditDescription(selectedSubCat.description || '');
    setEditSubCatModal(true);
  };

  const saveSubCat = async () => {
    if (!selectedSubCat) return;
    setSaving(true);
    const { error } = await supabase
      .from('sub_categories')
      .update({ name: editName, description: editDescription })
      .eq('id', selectedSubCat.id);
    if (!error) {
      const updated = { ...selectedSubCat, name: editName, description: editDescription };
      setSelectedSubCat(updated);
      setSubCategories((prev) =>
        prev.map((c) => (c.id === selectedSubCat.id ? updated : c))
      );
    }
    setSaving(false);
    setEditSubCatModal(false);
  };


  return (
    <div className="h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold text-foreground mb-4">Categories</h1>

      <div className="flex h-[calc(100%-3rem)] gap-0 border border-border rounded-lg overflow-hidden bg-card-bg">
        {/* Left: Main Categories (20%) */}
        <div className="w-[20%] border-r border-border overflow-y-auto">
          {mainCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedMainCat(cat)}
              className={`w-full text-left px-3 py-3 text-sm border-b border-border transition-colors ${
                selectedMainCat?.id === cat.id
                  ? 'bg-primary text-white font-medium'
                  : 'hover:bg-primary-bg text-foreground'
              }`}
            >
              <span className="break-words">
                {formatMainCategoryDisplay(cat.numeral, cat.name)}
              </span>
            </button>
          ))}
        </div>

        {/* Middle: Main Cat Details + SubCategory List */}
        <div className="w-[30%] border-r border-border flex flex-col overflow-hidden">
          {/* Main Category Details */}
          {selectedMainCat && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-foreground">
                  {formatMainCategoryDisplay(selectedMainCat.numeral, selectedMainCat.name)}
                </h2>
                <button
                  onClick={openEditMainCat}
                  className="text-xs px-2 py-1 border border-border rounded hover:bg-primary-bg transition-colors"
                >
                  Edit
                </button>
              </div>
              {selectedMainCat.description && (
                <div>
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="text-xs text-primary hover:text-primary-dark"
                  >
                    {showDescription ? 'Hide' : 'Show'} Description
                  </button>
                  {showDescription && (
                    <p className="text-xs text-muted mt-2 whitespace-pre-wrap">
                      {selectedMainCat.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SubCategory List */}
          <div className="flex-1 overflow-y-auto">
            {subCategories.length === 0 ? (
              <p className="p-4 text-sm text-muted italic">No subcategories.</p>
            ) : (
              subCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCat(sub)}
                  className={`w-full text-left px-3 py-2.5 text-sm border-b border-border transition-colors ${
                    selectedSubCat?.id === sub.id
                      ? 'bg-primary-light font-medium text-foreground'
                      : 'hover:bg-primary-bg text-foreground'
                  }`}
                >
                  <span className="break-words">
                    {selectedMainCat
                      ? `${selectedMainCat.numeral}.${sub.sortOrder} ${sub.name}`
                      : sub.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: SubCategory Detail */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedSubCat ? (
            <div className="space-y-6">
              {/* SubCategory Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedMainCat
                      ? `${selectedMainCat.numeral}.${selectedSubCat.sortOrder} ${selectedSubCat.name}`
                      : selectedSubCat.name}
                  </h2>
                  <button
                    onClick={openEditSubCat}
                    className="text-xs px-3 py-1 border border-border rounded hover:bg-primary-bg transition-colors"
                  >
                    Edit SubCategory
                  </button>
                </div>
                {selectedSubCat.description && (
                  <p className="text-sm text-muted whitespace-pre-wrap">{selectedSubCat.description}</p>
                )}
              </div>

              {/* Materials Table */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Materials ({subCatMaterials.length})
                </h3>
                {subCatMaterials.length === 0 ? (
                  <p className="text-sm text-muted italic">No materials in this subcategory.</p>
                ) : (
                  <div className="border border-border rounded overflow-hidden">
                    <table className="w-full text-sm table-sticky-header">
                      <thead>
                        <tr className="bg-background border-b border-border">
                          <th className="text-left px-3 py-2 font-medium text-muted">Material Name</th>
                          <th className="text-left px-3 py-2 font-medium text-muted">Manufacturer</th>
                          <th className="text-left px-3 py-2 font-medium text-muted">Primary Use</th>
                          <th className="text-left px-3 py-2 font-medium text-muted">Key Benefits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subCatMaterials.map((mat) => (
                          <tr
                            key={mat.id}
                            className="border-b border-border hover:bg-primary-bg cursor-pointer transition-colors"
                          >
                            <td className="px-3 py-2">
                              <Link
                                href={`/materials?highlight=${mat.id}`}
                                className="text-primary hover:text-primary-dark font-medium"
                              >
                                {mat.name}
                              </Link>
                            </td>
                            <td className="px-3 py-2 text-muted break-words">{mat.manufacturer || '-'}</td>
                            <td className="px-3 py-2 text-muted break-words">{mat.primaryUse || '-'}</td>
                            <td className="px-3 py-2 text-muted break-words">{mat.keyBenefits || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Private Notes */}
              <div>
                <PrivateNotesList
                  notes={subCatNotes.map((n) => ({ id: n.id, tenantId: n.tenantId, note: n.note, createdAt: n.createdAt }))}
                  onAddNote={handleAddNote}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted text-sm">
              Select a subcategory to view details
            </div>
          )}
        </div>
      </div>

      {/* Edit Main Category Modal */}
      <Modal isOpen={editMainCatModal} onClose={() => setEditMainCatModal(false)} title="Edit Main Category">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditMainCatModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveMainCat}
              disabled={saving}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit SubCategory Modal */}
      <Modal isOpen={editSubCatModal} onClose={() => setEditSubCatModal(false)} title="Edit SubCategory">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditSubCatModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveSubCat}
              disabled={saving}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
