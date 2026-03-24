'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import ManualEntryForm from '@/components/owners-manual/ManualEntryForm';
import Modal from '@/components/ui/Modal';
import { isValidUUID } from '@/lib/utils';

interface ManualEntry {
  id: string;
  category: string;
  materialName: string | null;
  materialId: string | null;
  organizationName: string | null;
  organizationId: string | null;
  organizationContact: string | null;
  warrantyInfo: string | null;
  warrantyExpiry: string | null;
  contactInfo: string | null;
  notes: string | null;
}

export default function OwnersManualPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [entries, setEntries] = useState<ManualEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEntry, setEditEntry] = useState<ManualEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    // Load project name
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();

    if (project) {
      setProjectName(project.name);
    }

    // Check admin
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

    // Fetch entries with joins
    const { data: entriesData } = await supabase
      .from('owners_manual_entries')
      .select('id, category, material_id, organization_id, warranty_info, warranty_expiry, contact_info, notes, materials(name), organizations(business_name, primary_first_name, primary_last_name, primary_phone, primary_email)')
      .eq('project_id', projectId)
      .order('category', { ascending: true });

    if (entriesData) {
      setEntries(
        entriesData.map((entry) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const material = entry.materials as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const org = entry.organizations as any;
          return {
            id: entry.id,
            category: entry.category,
            materialName: material?.name || null,
            materialId: entry.material_id,
            organizationName: org?.business_name || null,
            organizationId: entry.organization_id,
            organizationContact: org
              ? `${org.primary_first_name || ''} ${org.primary_last_name || ''}`.trim() +
                (org.primary_phone ? ` | ${org.primary_phone}` : '') +
                (org.primary_email ? ` | ${org.primary_email}` : '')
              : null,
            warrantyInfo: entry.warranty_info,
            warrantyExpiry: entry.warranty_expiry,
            contactInfo: entry.contact_info,
            notes: entry.notes,
          };
        })
      );
    }

    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleAddEntry = async (data: {
    category: string;
    materialId: string;
    professionalId: string;
    warrantyInfo: string;
    warrantyExpiry: string;
    contactInfo: string;
    notes: string;
  }) => {
    const { error } = await supabase.from('owners_manual_entries').insert({
      project_id: projectId,
      category: data.category.trim(),
      material_id: data.materialId || null,
      organization_id: data.professionalId || null,
      warranty_info: data.warrantyInfo.trim() || null,
      warranty_expiry: data.warrantyExpiry || null,
      contact_info: data.contactInfo.trim() || null,
      notes: data.notes.trim() || null,
    });

    if (!error) {
      setShowAddModal(false);
      await loadEntries();
    }
  };

  const handleEditEntry = async (data: {
    category: string;
    materialId: string;
    professionalId: string;
    warrantyInfo: string;
    warrantyExpiry: string;
    contactInfo: string;
    notes: string;
  }) => {
    if (!editEntry) return;

    const { error } = await supabase
      .from('owners_manual_entries')
      .update({
        category: data.category.trim(),
        material_id: data.materialId || null,
        organization_id: data.professionalId || null,
        warranty_info: data.warrantyInfo.trim() || null,
        warranty_expiry: data.warrantyExpiry || null,
        contact_info: data.contactInfo.trim() || null,
        notes: data.notes.trim() || null,
      })
      .eq('id', editEntry.id);

    if (!error) {
      setShowEditModal(false);
      setEditEntry(null);
      await loadEntries();
    }
  };

  const handleDeleteEntry = async () => {
    if (!deleteEntryId) return;

    const { error } = await supabase
      .from('owners_manual_entries')
      .delete()
      .eq('id', deleteEntryId);

    if (!error) {
      setShowDeleteConfirm(false);
      setDeleteEntryId(null);
      await loadEntries();
    }
  };

  const openEditModal = (entry: ManualEntry) => {
    setEditEntry(entry);
    setShowEditModal(true);
  };

  const confirmDelete = (entryId: string) => {
    setDeleteEntryId(entryId);
    setShowDeleteConfirm(true);
  };

  // Group entries by category
  const grouped = entries.reduce<Record<string, ManualEntry[]>>((acc, entry) => {
    const cat = entry.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entry);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

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


      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Owner&apos;s Manual</h2>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Add Entry
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted italic">No entries in the owner&apos;s manual yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="bg-card-bg rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
                {category}
              </h3>

              <div className="space-y-4">
                {grouped[category].map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-md border border-border bg-background"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-2">
                        {entry.materialName && (
                          <div>
                            <span className="text-xs font-medium text-muted">Material:</span>
                            <p className="text-sm text-foreground">{entry.materialName}</p>
                          </div>
                        )}
                        {entry.organizationName && (
                          <div>
                            <span className="text-xs font-medium text-muted">Organization:</span>
                            <p className="text-sm text-foreground">{entry.organizationName}</p>
                            {entry.organizationContact && (
                              <p className="text-xs text-muted">{entry.organizationContact}</p>
                            )}
                          </div>
                        )}
                        {entry.contactInfo && (
                          <div>
                            <span className="text-xs font-medium text-muted">Contact Info:</span>
                            <p className="text-sm text-muted whitespace-pre-wrap">{entry.contactInfo}</p>
                          </div>
                        )}
                        {entry.warrantyInfo && (
                          <div>
                            <span className="text-xs font-medium text-muted">Warranty:</span>
                            <p className="text-sm text-muted whitespace-pre-wrap">{entry.warrantyInfo}</p>
                          </div>
                        )}
                        {entry.warrantyExpiry && (
                          <div>
                            <span className="text-xs font-medium text-muted">Warranty Expires:</span>
                            <p className="text-sm text-muted">
                              {new Date(entry.warrantyExpiry).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {entry.notes && (
                          <div>
                            <span className="text-xs font-medium text-muted">Notes:</span>
                            <p className="text-sm text-muted whitespace-pre-wrap">{entry.notes}</p>
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0 ml-4">
                          <button
                            onClick={() => openEditModal(entry)}
                            className="px-2 py-1 text-xs border border-border text-muted rounded-md hover:bg-background transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(entry.id)}
                            className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Entry Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Manual Entry"
        maxWidth="max-w-2xl"
      >
        <ManualEntryForm
          projectId={projectId}
          onSubmit={handleAddEntry}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Entry Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditEntry(null); }}
        title="Edit Manual Entry"
        maxWidth="max-w-2xl"
      >
        {editEntry && (
          <ManualEntryForm
            projectId={projectId}
            initialData={{
              category: editEntry.category,
              materialId: editEntry.materialId || '',
              professionalId: editEntry.organizationId || '',
              warrantyInfo: editEntry.warrantyInfo || '',
              warrantyExpiry: editEntry.warrantyExpiry || '',
              contactInfo: editEntry.contactInfo || '',
              notes: editEntry.notes || '',
            }}
            onSubmit={handleEditEntry}
            onCancel={() => { setShowEditModal(false); setEditEntry(null); }}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Are you sure you want to delete this entry from the owner&apos;s manual?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteEntry}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
