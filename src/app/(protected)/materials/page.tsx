'use client';

import { Suspense, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import type { MainCategory } from '@/types';
import { formatMainCategoryDisplay } from '@/lib/utils';
import SearchBox from '@/components/ui/SearchBox';
import Modal from '@/components/ui/Modal';
import PrivateNotesList from '@/components/ui/PrivateNotesList';

interface MaterialRow {
  id: string;
  name: string;
  manufacturer: string | null;
  primaryUse: string | null;
  keyBenefits: string | null;
  url: string | null;
  mainCategoryId: string;
  mainCategoryNumeral: number;
  mainCategoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  subCategorySortOrder: number;
  parentSubCategoryName?: string;
  parentSubCategorySortOrder?: number;
}

interface PrivateNoteRow {
  id: string;
  note: string;
  createdAt: string;
  tenantId: string;
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<p className="text-muted text-sm">Loading materials...</p>}>
      <MaterialsPageContent />
    </Suspense>
  );
}

function MaterialsPageContent() {
  const [supabase] = useState(() => createClient());
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const highlightHandled = useRef(false);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: string; name: string; sortOrder: number; mainCategoryId: string }[]>([]);
  const [search, setSearch] = useState('');
  const [filterMainCat, setFilterMainCat] = useState('');
  const [filterSubCat, setFilterSubCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialRow | null>(null);
  const [materialNotes, setMaterialNotes] = useState<PrivateNoteRow[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [affectedProjects, setAffectedProjects] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    primaryUse: '',
    keyBenefits: '',
    url: '',
    mainCategoryId: '',
    subCategoryId: '',
  });
  const [saving, setSaving] = useState(false);

  // Load main categories and subcategories
  useEffect(() => {
    async function loadCategories() {
      const [mainRes, subRes] = await Promise.all([
        supabase.from('main_categories').select('*').order('numeral'),
        supabase.from('sub_categories').select('*').order('sort_order'),
      ]);

      if (mainRes.data) {
        setMainCategories(
          mainRes.data.map((d) => ({
            id: d.id,
            tenantId: d.tenant_id,
            numeral: d.numeral,
            name: d.name,
            description: d.description,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }))
        );
      }

      if (subRes.data) {
        setSubCategories(
          subRes.data.map((d) => ({
            id: d.id,
            name: d.name,
            sortOrder: d.sort_order,
            mainCategoryId: d.main_category_id,
            parentSubCategoryId: d.parent_sub_category_id,
          }))
        );
      }
    }
    loadCategories();
  }, [supabase]);

  // Load materials with category info
  const loadMaterials = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('material_sub_categories')
      .select(`
        material_id,
        materials(id, name, manufacturer, primary_use, key_benefits, url),
        sub_categories(id, name, sort_order, main_category_id, parent_sub_category_id)
      `);

    if (data) {
      const rows: MaterialRow[] = [];
      const seen = new Set<string>();

      for (const row of data) {
        const mat = row.materials as unknown as Record<string, unknown>;
        const sub = row.sub_categories as unknown as Record<string, unknown>;
        if (!mat || !sub) continue;

        const matId = mat.id as string;
        if (seen.has(matId)) continue;
        seen.add(matId);

        const mainCatId = sub.main_category_id as string;
        const mainCat = mainCategories.find((c) => c.id === mainCatId);

        rows.push({
          id: matId,
          name: mat.name as string,
          manufacturer: mat.manufacturer as string | null,
          primaryUse: mat.primary_use as string | null,
          keyBenefits: mat.key_benefits as string | null,
          url: mat.url as string | null,
          mainCategoryId: mainCatId,
          mainCategoryNumeral: mainCat?.numeral || 0,
          mainCategoryName: mainCat?.name || '',
          subCategoryId: sub.id as string,
          subCategoryName: sub.name as string,
          subCategorySortOrder: sub.sort_order as number,
        });
      }

      rows.sort((a, b) => {
        if (a.mainCategoryNumeral !== b.mainCategoryNumeral)
          return a.mainCategoryNumeral - b.mainCategoryNumeral;
        if (a.subCategorySortOrder !== b.subCategorySortOrder)
          return a.subCategorySortOrder - b.subCategorySortOrder;
        return a.name.localeCompare(b.name);
      });

      setMaterials(rows);
    }
    setLoading(false);
  }, [supabase, mainCategories]);

  useEffect(() => {
    if (mainCategories.length > 0) {
      loadMaterials();
    }
  }, [mainCategories, loadMaterials]);

  // Handle ?highlight= query param — auto-open the material
  useEffect(() => {
    if (highlightId && materials.length > 0 && !highlightHandled.current) {
      const mat = materials.find((m) => m.id === highlightId);
      if (mat) {
        highlightHandled.current = true;
        openMaterial(mat);
        // Scroll to the row
        setTimeout(() => {
          const row = document.getElementById(`mat-${highlightId}`);
          if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [highlightId, materials]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered subcategories based on selected main category
  const filteredSubCats = useMemo(() => {
    if (!filterMainCat) return [];
    return subCategories.filter((s) => s.mainCategoryId === filterMainCat);
  }, [filterMainCat, subCategories]);

  // Form subcategories based on selected main category in form
  const formSubCats = useMemo(() => {
    if (!formData.mainCategoryId) return [];
    return subCategories.filter((s) => s.mainCategoryId === formData.mainCategoryId);
  }, [formData.mainCategoryId, subCategories]);

  // Filter and search materials
  const filteredMaterials = useMemo(() => {
    let result = materials;

    if (filterMainCat) {
      result = result.filter((m) => m.mainCategoryId === filterMainCat);
    }
    if (filterSubCat) {
      result = result.filter((m) => m.subCategoryId === filterSubCat);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          (m.manufacturer && m.manufacturer.toLowerCase().includes(term)) ||
          m.mainCategoryName.toLowerCase().includes(term) ||
          m.subCategoryName.toLowerCase().includes(term) ||
          (m.primaryUse && m.primaryUse.toLowerCase().includes(term)) ||
          (m.keyBenefits && m.keyBenefits.toLowerCase().includes(term)) ||
          (m.url && m.url.toLowerCase().includes(term))
      );

      // Rank: name matches first, then manufacturer, then others
      result.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(term) ? 0 : 1;
        const bNameMatch = b.name.toLowerCase().includes(term) ? 0 : 1;
        if (aNameMatch !== bNameMatch) return aNameMatch - bNameMatch;
        const aMfgMatch = a.manufacturer?.toLowerCase().includes(term) ? 0 : 1;
        const bMfgMatch = b.manufacturer?.toLowerCase().includes(term) ? 0 : 1;
        return aMfgMatch - bMfgMatch;
      });
    }

    return result;
  }, [materials, filterMainCat, filterSubCat, search]);

  // Open material detail
  const openMaterial = async (mat: MaterialRow) => {
    setSelectedMaterial(mat);
    setFormData({
      name: mat.name,
      manufacturer: mat.manufacturer || '',
      primaryUse: mat.primaryUse || '',
      keyBenefits: mat.keyBenefits || '',
      url: mat.url || '',
      mainCategoryId: mat.mainCategoryId,
      subCategoryId: mat.subCategoryId,
    });

    // Load private notes
    const { data: notes } = await supabase
      .from('private_notes')
      .select('*')
      .eq('material_id', mat.id)
      .order('created_at', { ascending: false });

    setMaterialNotes(
      (notes || []).map((n) => ({
        id: n.id,
        note: n.note,
        createdAt: n.created_at,
        tenantId: n.tenant_id,
      }))
    );

    setShowEditModal(true);
  };

  // Save material (add or edit)
  const saveMaterial = async (isNew: boolean) => {
    if (!formData.name.trim()) return;
    setSaving(true);

    if (isNew) {
      const { data: mat, error } = await supabase
        .from('materials')
        .insert({
          name: formData.name.trim(),
          manufacturer: formData.manufacturer.trim() || null,
          primary_use: formData.primaryUse.trim() || null,
          key_benefits: formData.keyBenefits.trim() || null,
          url: formData.url.trim() || null,
        })
        .select('id, tenant_id')
        .single();

      if (!error && mat && formData.subCategoryId) {
        await supabase.from('material_sub_categories').insert({
          material_id: mat.id,
          sub_category_id: formData.subCategoryId,
        });
      }
    } else if (selectedMaterial) {
      await supabase
        .from('materials')
        .update({
          name: formData.name.trim(),
          manufacturer: formData.manufacturer.trim() || null,
          primary_use: formData.primaryUse.trim() || null,
          key_benefits: formData.keyBenefits.trim() || null,
          url: formData.url.trim() || null,
        })
        .eq('id', selectedMaterial.id);

      // Update category assignment if changed
      if (formData.subCategoryId && formData.subCategoryId !== selectedMaterial.subCategoryId) {
        await supabase
          .from('material_sub_categories')
          .delete()
          .eq('material_id', selectedMaterial.id);
        await supabase
          .from('material_sub_categories')
          .insert({
            material_id: selectedMaterial.id,
            sub_category_id: formData.subCategoryId,
          });
      }
    }

    setSaving(false);
    setShowAddModal(false);
    setShowEditModal(false);
    loadMaterials();
  };

  // Delete material
  const confirmDelete = async () => {
    if (!selectedMaterial) return;

    // Check affected projects
    const { data: ppmLinks } = await supabase
      .from('project_professional_materials')
      .select('project_professional_id, project_professionals(project_id, projects(id, name))')
      .eq('material_id', selectedMaterial.id);

    const { data: pcmLinks } = await supabase
      .from('project_client_materials')
      .select('project_id, projects(id, name)')
      .eq('material_id', selectedMaterial.id);

    const projects = new Map<string, string>();
    ppmLinks?.forEach((link) => {
      const pp = link.project_professionals as unknown as Record<string, unknown>;
      const proj = pp?.projects as unknown as Record<string, string>;
      if (proj) projects.set(proj.id, proj.name);
    });
    pcmLinks?.forEach((link) => {
      const proj = link.projects as unknown as Record<string, string>;
      if (proj) projects.set(proj.id, proj.name);
    });

    setAffectedProjects(Array.from(projects.entries()).map(([id, name]) => ({ id, name })));
    setShowDeleteConfirm(true);
  };

  const deleteMaterial = async () => {
    if (!selectedMaterial) return;
    setSaving(true);
    await supabase.from('materials').delete().eq('id', selectedMaterial.id);
    setSaving(false);
    setShowDeleteConfirm(false);
    setShowEditModal(false);
    setSelectedMaterial(null);
    loadMaterials();
  };

  // Add note to material
  const handleAddNote = async (note: string) => {
    if (!selectedMaterial) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    const { data: newNote } = await supabase
      .from('private_notes')
      .insert({
        tenant_id: profile.tenant_id,
        note,
        material_id: selectedMaterial.id,
      })
      .select('*')
      .single();

    if (newNote) {
      setMaterialNotes((prev) => [
        { id: newNote.id, note: newNote.note, createdAt: newNote.created_at, tenantId: newNote.tenant_id },
        ...prev,
      ]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      manufacturer: '',
      primaryUse: '',
      keyBenefits: '',
      url: '',
      mainCategoryId: '',
      subCategoryId: '',
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-4">Materials</h1>

      {/* Search + Add */}
      <div className="flex items-center gap-4 mb-4">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search materials..."
          className="flex-1"
        />
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors whitespace-nowrap"
        >
          + Add Material
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex gap-3" style={{ maxWidth: '80%' }}>
          <select
            value={filterMainCat}
            onChange={(e) => {
              setFilterMainCat(e.target.value);
              setFilterSubCat('');
            }}
            className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Main Categories</option>
            {mainCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {formatMainCategoryDisplay(cat.numeral, cat.name)}
              </option>
            ))}
          </select>

          <select
            value={filterSubCat}
            onChange={(e) => setFilterSubCat(e.target.value)}
            disabled={!filterMainCat}
            className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">All Sub Categories</option>
            {filteredSubCats.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setFilterMainCat('');
            setFilterSubCat('');
          }}
          className="px-3 py-2 text-sm border border-border rounded-md hover:bg-primary-bg transition-colors whitespace-nowrap"
        >
          Reset Filters
        </button>
      </div>

      {/* Materials Table */}
      <div className="border border-border rounded-lg overflow-auto max-h-[calc(100vh-18rem)]">
        <table className="w-full text-sm table-sticky-header">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="text-left px-3 py-2.5 font-medium text-muted whitespace-nowrap">Main Category</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted whitespace-nowrap">Sub Category</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted whitespace-nowrap">Material Name</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted">Manufacturer</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted">Primary Use</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted">Key Benefits</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted">
                  Loading materials...
                </td>
              </tr>
            ) : filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted italic">
                  No materials found.
                </td>
              </tr>
            ) : (
              filteredMaterials.map((mat) => (
                <tr
                  key={mat.id}
                  id={`mat-${mat.id}`}
                  onClick={() => openMaterial(mat)}
                  className={`border-b border-border hover:bg-primary-bg cursor-pointer transition-colors ${
                    highlightId === mat.id ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-3 py-2 break-words font-medium">
                    {mat.mainCategoryNumeral} {mat.mainCategoryName.toUpperCase()}
                  </td>
                  <td className="px-3 py-2 break-words">
                    {mat.mainCategoryNumeral}.{mat.subCategorySortOrder} {mat.subCategoryName}
                  </td>
                  <td className="px-3 py-2 break-words text-primary font-medium">{mat.name}</td>
                  <td className="px-3 py-2 break-words text-muted">{mat.manufacturer || '-'}</td>
                  <td className="px-3 py-2 break-words text-muted">{mat.primaryUse || '-'}</td>
                  <td className="px-3 py-2 break-words text-muted">{mat.keyBenefits || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted mt-2">
        Showing {filteredMaterials.length} of {materials.length} materials
      </p>

      {/* Add Material Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Material" maxWidth="max-w-2xl">
        <MaterialForm
          formData={formData}
          setFormData={setFormData}
          mainCategories={mainCategories}
          subCategories={formSubCats}
          onSave={() => saveMaterial(true)}
          onCancel={() => setShowAddModal(false)}
          saving={saving}
        />
      </Modal>

      {/* Edit Material Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Material" maxWidth="max-w-2xl">
        <MaterialForm
          formData={formData}
          setFormData={setFormData}
          mainCategories={mainCategories}
          subCategories={formSubCats}
          onSave={() => saveMaterial(false)}
          onCancel={() => setShowEditModal(false)}
          saving={saving}
        />

        {/* Private Notes Section */}
        <div className="mt-6 pt-4 border-t border-border">
          <PrivateNotesList
            notes={materialNotes.map((n) => ({
              id: n.id,
              tenantId: n.tenantId,
              note: n.note,
              createdAt: n.createdAt,
            }))}
            onAddNote={handleAddNote}
          />
        </div>

        {/* Delete Button */}
        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={confirmDelete}
            className="px-4 py-2 text-sm bg-danger text-white rounded-md hover:opacity-90 transition-colors"
          >
            Delete Material
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete">
        <p className="text-sm text-foreground mb-4">
          Are you sure you want to delete <strong>{selectedMaterial?.name}</strong>?
        </p>
        {affectedProjects.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm font-medium text-red-700 mb-2">
              This material is used in {affectedProjects.length} project(s):
            </p>
            <ul className="text-sm text-red-600 list-disc list-inside">
              {affectedProjects.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={deleteMaterial}
            disabled={saving}
            className="px-4 py-2 text-sm bg-danger text-white rounded-md hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// Material Form Component
function MaterialForm({
  formData,
  setFormData,
  mainCategories,
  subCategories,
  onSave,
  onCancel,
  saving,
}: {
  formData: { name: string; manufacturer: string; primaryUse: string; keyBenefits: string; url: string; mainCategoryId: string; subCategoryId: string };
  setFormData: (data: typeof formData) => void;
  mainCategories: MainCategory[];
  subCategories: { id: string; name: string; sortOrder: number }[];
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Name <span className="text-danger">*</span>
        </label>
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Manufacturer</label>
        <input
          value={formData.manufacturer}
          onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Main Category</label>
          <select
            value={formData.mainCategoryId}
            onChange={(e) => setFormData({ ...formData, mainCategoryId: e.target.value, subCategoryId: '' })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select...</option>
            {mainCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.numeral}. {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Sub Category</label>
          <select
            value={formData.subCategoryId}
            onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
            disabled={!formData.mainCategoryId}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Select...</option>
            {subCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.sortOrder}. {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Primary Use</label>
        <textarea
          value={formData.primaryUse}
          onChange={(e) => setFormData({ ...formData, primaryUse: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Key Benefits</label>
        <textarea
          value={formData.keyBenefits}
          onChange={(e) => setFormData({ ...formData, keyBenefits: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">URL</label>
        <input
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          type="url"
          className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!formData.name.trim() || saving}
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
