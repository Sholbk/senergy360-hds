'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import PrivateNotesList from '@/components/ui/PrivateNotesList';
import Modal from '@/components/ui/Modal';

const PROJECT_TYPES = [
  { value: 'new_construction', label: 'New Construction' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'addition', label: 'Addition' },
  { value: 'remodel', label: 'Remodel' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'residential', label: 'Residential' },
  { value: 'multi_family', label: 'Multi-Family' },
  { value: 'custom_home', label: 'Custom Home' },
  { value: 'other', label: 'Other' },
];

interface ProjectDetail {
  id: string;
  name: string;
  status: string;
  projectType: string;
  projectTypeOtherDescription: string | null;
  description: string | null;
  buildingPlanSummary: string | null;
  siteAddressLine1: string;
  siteAddressLine2: string | null;
  siteCity: string;
  siteState: string;
  sitePostalCode: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  clientId: string;
}

interface ProfessionalWithMaterials {
  projectProfessionalId: string;
  professionalId: string;
  businessName: string;
  primarySpecialty: string;
  contactName: string;
  materials: { id: string; name: string; primaryUse: string | null; notes: string | null }[];
}

interface ClientMaterial {
  id: string;
  materialId: string;
  name: string;
  primaryUse: string | null;
  notes: string | null;
}

interface NoteRow {
  id: string;
  note: string;
  createdAt: string;
  tenantId: string;
}

interface ProfessionalOption {
  id: string;
  businessName: string;
  primarySpecialty: string;
  contactName: string;
}

interface MaterialOption {
  id: string;
  name: string;
  primaryUse: string | null;
}

interface ClientOption {
  id: string;
  firstName: string;
  lastName: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalWithMaterials[]>([]);
  const [clientMaterials, setClientMaterials] = useState<ClientMaterial[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Edit Project modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    buildingPlanSummary: '',
    siteAddressLine1: '',
    siteAddressLine2: '',
    siteCity: '',
    siteState: '',
    sitePostalCode: '',
    clientId: '',
    projectType: '',
    projectTypeOtherDescription: '',
  });
  const [allClients, setAllClients] = useState<ClientOption[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  // Assign Professional modal state
  const [showAssignProModal, setShowAssignProModal] = useState(false);
  const [allProfessionals, setAllProfessionals] = useState<ProfessionalOption[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('');
  const [assignProSaving, setAssignProSaving] = useState(false);

  // Assign Material to Professional modal state
  const [showProMaterialModal, setShowProMaterialModal] = useState(false);
  const [proMaterialTarget, setProMaterialTarget] = useState<{ projectProfessionalId: string; businessName: string } | null>(null);
  const [allMaterials, setAllMaterials] = useState<MaterialOption[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [materialNotes, setMaterialNotes] = useState('');
  const [proMaterialSaving, setProMaterialSaving] = useState(false);

  // Client Material modal state
  const [showClientMaterialModal, setShowClientMaterialModal] = useState(false);
  const [clientMaterialId, setClientMaterialId] = useState('');
  const [clientMaterialNotes, setClientMaterialNotes] = useState('');
  const [clientMaterialSaving, setClientMaterialSaving] = useState(false);

  const loadProject = useCallback(async () => {
    // Load project with client info
    const { data } = await supabase
      .from('projects')
      .select('*, clients(primary_first_name, primary_last_name, primary_email, primary_phone)')
      .eq('id', projectId)
      .single();

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = data.clients as any;
      setProject({
        id: data.id,
        name: data.name,
        status: data.status,
        projectType: data.project_type,
        projectTypeOtherDescription: data.project_type_other_description,
        description: data.description,
        buildingPlanSummary: data.building_plan_summary,
        siteAddressLine1: data.site_address_line1,
        siteAddressLine2: data.site_address_line2,
        siteCity: data.site_city,
        siteState: data.site_state,
        sitePostalCode: data.site_postal_code,
        clientFirstName: client?.primary_first_name || '',
        clientLastName: client?.primary_last_name || '',
        clientEmail: client?.primary_email || null,
        clientPhone: client?.primary_phone || null,
        clientId: data.client_id,
      });
    }

    // Load professionals with their materials
    const { data: ppData } = await supabase
      .from('project_professionals')
      .select('id, professional_id, professionals(business_name, primary_specialty, primary_first_name, primary_last_name)')
      .eq('project_id', projectId);

    if (ppData && ppData.length > 0) {
      const ppIds = ppData.map((pp) => pp.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: allMatData } = await supabase
        .from('project_professional_materials')
        .select('id, material_id, notes, project_professional_id, materials(name, primary_use)')
        .in('project_professional_id', ppIds);

      const matsByPpId = new Map<string, typeof allMatData>();
      for (const m of allMatData || []) {
        const existing = matsByPpId.get(m.project_professional_id) || [];
        existing.push(m);
        matsByPpId.set(m.project_professional_id, existing);
      }

      const prosWithMats: ProfessionalWithMaterials[] = ppData.map((pp) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prof = pp.professionals as any;
        const matData = matsByPpId.get(pp.id) || [];
        return {
          projectProfessionalId: pp.id,
          professionalId: pp.professional_id,
          businessName: prof?.business_name || '',
          primarySpecialty: prof?.primary_specialty || '',
          contactName: `${prof?.primary_first_name || ''} ${prof?.primary_last_name || ''}`.trim(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          materials: matData.map((m: any) => ({
            id: m.id,
            name: m.materials?.name || '',
            primaryUse: m.materials?.primary_use || null,
            notes: m.notes,
          })),
        };
      });
      setProfessionals(prosWithMats);
    } else {
      setProfessionals([]);
    }

    // Load client-directed materials
    const { data: clientMatData } = await supabase
      .from('project_client_materials')
      .select('id, material_id, notes, materials(name, primary_use)')
      .eq('project_id', projectId);

    if (clientMatData) {
      setClientMaterials(
        clientMatData.map((m) => ({
          id: m.id,
          materialId: m.material_id,
          name: ((m.materials as any)?.name) || '',
          primaryUse: ((m.materials as any)?.primary_use) || null,
          notes: m.notes,
        }))
      );
    }

    // Load notes
    const { data: notesData } = await supabase
      .from('private_notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (notesData) {
      setNotes(
        notesData.map((n) => ({
          id: n.id,
          note: n.note,
          createdAt: n.created_at,
          tenantId: n.tenant_id,
        }))
      );
    }

    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleAddNote = async (note: string) => {
    const { data: profile } = await supabase.from('profiles').select('tenant_id').limit(1).single();
    if (!profile) return;

    const { data: newNote } = await supabase
      .from('private_notes')
      .insert({ tenant_id: profile.tenant_id, note, project_id: projectId })
      .select('*')
      .single();

    if (newNote) {
      setNotes((prev) => [
        { id: newNote.id, note: newNote.note, createdAt: newNote.created_at, tenantId: newNote.tenant_id },
        ...prev,
      ]);
    }
  };

  const updateStatus = async () => {
    if (!newStatus || !project) return;
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'in_progress') updates.started_on = new Date().toISOString();
    if (newStatus === 'completed') updates.completed_on = new Date().toISOString();

    const { error } = await supabase.from('projects').update(updates).eq('id', project.id);
    if (!error) {
      setProject({ ...project, status: newStatus });
      setShowStatusModal(false);
    }
  };

  // --- Edit Project ---
  const openEditModal = async () => {
    if (!project) return;
    setEditForm({
      name: project.name,
      description: project.description || '',
      buildingPlanSummary: project.buildingPlanSummary || '',
      siteAddressLine1: project.siteAddressLine1,
      siteAddressLine2: project.siteAddressLine2 || '',
      siteCity: project.siteCity,
      siteState: project.siteState,
      sitePostalCode: project.sitePostalCode,
      clientId: project.clientId,
      projectType: project.projectType,
      projectTypeOtherDescription: project.projectTypeOtherDescription || '',
    });

    const { data: clients } = await supabase
      .from('clients')
      .select('id, primary_first_name, primary_last_name')
      .order('primary_last_name');
    if (clients) {
      setAllClients(clients.map((c) => ({ id: c.id, firstName: c.primary_first_name, lastName: c.primary_last_name })));
    }

    setShowEditModal(true);
  };

  const saveEditProject = async () => {
    if (!project) return;
    setEditSaving(true);
    const { error } = await supabase
      .from('projects')
      .update({
        name: editForm.name,
        description: editForm.description || null,
        building_plan_summary: editForm.buildingPlanSummary || null,
        site_address_line1: editForm.siteAddressLine1,
        site_address_line2: editForm.siteAddressLine2 || null,
        site_city: editForm.siteCity,
        site_state: editForm.siteState,
        site_postal_code: editForm.sitePostalCode,
        client_id: editForm.clientId,
        project_type: editForm.projectType,
        project_type_other_description: editForm.projectType === 'other' ? editForm.projectTypeOtherDescription || null : null,
      })
      .eq('id', project.id);

    if (!error) {
      setShowEditModal(false);
      await loadProject();
    }
    setEditSaving(false);
  };

  // --- Assign Professional ---
  const openAssignProModal = async () => {
    const { data } = await supabase
      .from('professionals')
      .select('id, business_name, primary_specialty, primary_first_name, primary_last_name')
      .order('business_name');
    if (data) {
      const assignedIds = new Set(professionals.map((p) => p.professionalId));
      setAllProfessionals(
        data
          .filter((p) => !assignedIds.has(p.id))
          .map((p) => ({
            id: p.id,
            businessName: p.business_name,
            primarySpecialty: p.primary_specialty,
            contactName: `${p.primary_first_name || ''} ${p.primary_last_name || ''}`.trim(),
          }))
      );
    }
    setSelectedProfessionalId('');
    setShowAssignProModal(true);
  };

  const assignProfessional = async () => {
    if (!selectedProfessionalId) return;
    setAssignProSaving(true);
    const { error } = await supabase
      .from('project_professionals')
      .insert({ project_id: projectId, professional_id: selectedProfessionalId });
    if (!error) {
      setShowAssignProModal(false);
      await loadProject();
    }
    setAssignProSaving(false);
  };

  // --- Remove Professional ---
  const removeProfessional = async (projectProfessionalId: string) => {
    if (!confirm('Remove this professional and all their assigned materials from the project?')) return;
    const { error } = await supabase.from('project_professionals').delete().eq('id', projectProfessionalId);
    if (!error) {
      await loadProject();
    }
  };

  // --- Add Material to Professional ---
  const openProMaterialModal = async (projectProfessionalId: string, businessName: string) => {
    setProMaterialTarget({ projectProfessionalId, businessName });
    const { data } = await supabase.from('materials').select('id, name, primary_use').order('name');
    if (data) {
      setAllMaterials(data.map((m) => ({ id: m.id, name: m.name, primaryUse: m.primary_use })));
    }
    setSelectedMaterialId('');
    setMaterialNotes('');
    setShowProMaterialModal(true);
  };

  const addProMaterial = async () => {
    if (!selectedMaterialId || !proMaterialTarget) return;
    setProMaterialSaving(true);
    const { error } = await supabase.from('project_professional_materials').insert({
      project_professional_id: proMaterialTarget.projectProfessionalId,
      material_id: selectedMaterialId,
      notes: materialNotes || null,
    });
    if (!error) {
      setShowProMaterialModal(false);
      await loadProject();
    }
    setProMaterialSaving(false);
  };

  // --- Remove Material from Professional ---
  const removeProMaterial = async (materialRowId: string) => {
    if (!confirm('Remove this material?')) return;
    const { error } = await supabase.from('project_professional_materials').delete().eq('id', materialRowId);
    if (!error) {
      await loadProject();
    }
  };

  // --- Add Client-Directed Material ---
  const openClientMaterialModal = async () => {
    const { data } = await supabase.from('materials').select('id, name, primary_use').order('name');
    if (data) {
      setAllMaterials(data.map((m) => ({ id: m.id, name: m.name, primaryUse: m.primary_use })));
    }
    setClientMaterialId('');
    setClientMaterialNotes('');
    setShowClientMaterialModal(true);
  };

  const addClientMaterial = async () => {
    if (!clientMaterialId) return;
    setClientMaterialSaving(true);
    const { error } = await supabase.from('project_client_materials').insert({
      project_id: projectId,
      material_id: clientMaterialId,
      notes: clientMaterialNotes || null,
    });
    if (!error) {
      setShowClientMaterialModal(false);
      await loadProject();
    }
    setClientMaterialSaving(false);
  };

  // --- Remove Client-Directed Material ---
  const removeClientMaterial = async (materialRowId: string) => {
    if (!confirm('Remove this material?')) return;
    const { error } = await supabase.from('project_client_materials').delete().eq('id', materialRowId);
    if (!error) {
      await loadProject();
    }
  };

  if (loading) return <p className="text-muted text-sm">Loading...</p>;
  if (!project) return <p className="text-muted text-sm">Project not found.</p>;

  const statusStyles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  const inputClass = 'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <button
        onClick={() => router.push('/projects')}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Projects
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
        <button
          onClick={() => {
            setNewStatus(project.status);
            setShowStatusModal(true);
          }}
          className={`text-xs px-3 py-1 rounded-full font-medium cursor-pointer ${statusStyles[project.status]}`}
        >
          {statusLabels[project.status]}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left 1/3: Project Info Card */}
        <div className="w-1/3 space-y-6">
          <div className="bg-card-bg rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Client</h2>
              <button
                onClick={openEditModal}
                className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Edit Project
              </button>
            </div>
            <p className="text-sm font-medium">{project.clientFirstName} {project.clientLastName}</p>
            {project.clientEmail && <p className="text-xs text-muted">{project.clientEmail}</p>}
            {project.clientPhone && <p className="text-xs text-muted">{project.clientPhone}</p>}

            <h2 className="text-sm font-semibold text-foreground mt-4 mb-2">Site Address</h2>
            <p className="text-xs text-muted">{project.siteAddressLine1}</p>
            {project.siteAddressLine2 && <p className="text-xs text-muted">{project.siteAddressLine2}</p>}
            <p className="text-xs text-muted">
              {project.siteCity}, {project.siteState} {project.sitePostalCode}
            </p>

            {project.description && (
              <>
                <h2 className="text-sm font-semibold text-foreground mt-4 mb-2">Description</h2>
                <p className="text-xs text-muted whitespace-pre-wrap">{project.description}</p>
              </>
            )}

            {project.buildingPlanSummary && (
              <>
                <h2 className="text-sm font-semibold text-foreground mt-4 mb-2">Building Plan Summary</h2>
                <p className="text-xs text-muted whitespace-pre-wrap">{project.buildingPlanSummary}</p>
              </>
            )}
          </div>

          <div className="bg-card-bg rounded-lg border border-border p-5">
            <PrivateNotesList
              notes={notes.map((n) => ({ id: n.id, tenantId: n.tenantId, note: n.note, createdAt: n.createdAt }))}
              onAddNote={handleAddNote}
            />
          </div>
        </div>

        {/* Right 2/3: Professionals & Materials */}
        <div className="w-2/3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Assigned Materials</h2>
            <button
              onClick={openAssignProModal}
              className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Assign Professional
            </button>
          </div>

          {professionals.length === 0 && clientMaterials.length === 0 ? (
            <p className="text-sm text-muted italic">No professionals or materials assigned yet.</p>
          ) : (
            <>
              {professionals.map((pro) => (
                <div key={pro.projectProfessionalId} className="bg-card-bg rounded-lg border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{pro.businessName}</h3>
                      <p className="text-xs text-muted">
                        {pro.primarySpecialty} &middot; {pro.contactName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openProMaterialModal(pro.projectProfessionalId, pro.businessName)}
                        className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                      >
                        Add Material
                      </button>
                      <button
                        onClick={() => removeProfessional(pro.projectProfessionalId)}
                        className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {pro.materials.length === 0 ? (
                    <p className="text-sm text-muted italic">No materials assigned.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 font-medium text-muted">Material</th>
                          <th className="text-left py-2 font-medium text-muted">Primary Use</th>
                          <th className="text-left py-2 font-medium text-muted">Notes</th>
                          <th className="text-right py-2 font-medium text-muted w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {pro.materials.map((mat) => (
                          <tr key={mat.id} className="border-b border-border">
                            <td className="py-2 text-foreground">{mat.name}</td>
                            <td className="py-2 text-muted">{mat.primaryUse || '-'}</td>
                            <td className="py-2 text-muted">{mat.notes || '-'}</td>
                            <td className="py-2 text-right">
                              <button
                                onClick={() => removeProMaterial(mat.id)}
                                className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}

              {clientMaterials.length > 0 && (
                <div className="bg-card-bg rounded-lg border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">Client-Directed Materials</h3>
                    <button
                      onClick={openClientMaterialModal}
                      className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Add Material
                    </button>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium text-muted">Material</th>
                        <th className="text-left py-2 font-medium text-muted">Primary Use</th>
                        <th className="text-left py-2 font-medium text-muted">Notes</th>
                        <th className="text-right py-2 font-medium text-muted w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientMaterials.map((mat) => (
                        <tr key={mat.id} className="border-b border-border">
                          <td className="py-2 text-foreground">{mat.name}</td>
                          <td className="py-2 text-muted">{mat.primaryUse || '-'}</td>
                          <td className="py-2 text-muted">{mat.notes || '-'}</td>
                          <td className="py-2 text-right">
                            <button
                              onClick={() => removeClientMaterial(mat.id)}
                              className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Show Add Client Material button when no client materials yet but professionals exist */}
          {clientMaterials.length === 0 && (
            <div className="bg-card-bg rounded-lg border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">Client-Directed Materials</h3>
                <button
                  onClick={openClientMaterialModal}
                  className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Add Material
                </button>
              </div>
              <p className="text-sm text-muted italic">No client-directed materials yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Project Status">
        <div className="space-y-4">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowStatusModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={updateStatus}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project" maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Project Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Project Type</label>
            <select
              value={editForm.projectType}
              onChange={(e) => setEditForm({ ...editForm, projectType: e.target.value })}
              className={inputClass}
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {editForm.projectType === 'other' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Other Description</label>
              <input
                type="text"
                value={editForm.projectTypeOtherDescription}
                onChange={(e) => setEditForm({ ...editForm, projectTypeOtherDescription: e.target.value })}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Client</label>
            <select
              value={editForm.clientId}
              onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })}
              className={inputClass}
            >
              <option value="">Select a client</option>
              {allClients.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Building Plan Summary</label>
            <textarea
              value={editForm.buildingPlanSummary}
              onChange={(e) => setEditForm({ ...editForm, buildingPlanSummary: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Address Line 1</label>
            <input
              type="text"
              value={editForm.siteAddressLine1}
              onChange={(e) => setEditForm({ ...editForm, siteAddressLine1: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Address Line 2</label>
            <input
              type="text"
              value={editForm.siteAddressLine2}
              onChange={(e) => setEditForm({ ...editForm, siteAddressLine2: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">City</label>
              <input
                type="text"
                value={editForm.siteCity}
                onChange={(e) => setEditForm({ ...editForm, siteCity: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">State</label>
              <input
                type="text"
                value={editForm.siteState}
                onChange={(e) => setEditForm({ ...editForm, siteState: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Zip</label>
              <input
                type="text"
                value={editForm.sitePostalCode}
                onChange={(e) => setEditForm({ ...editForm, sitePostalCode: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEditProject}
              disabled={editSaving || !editForm.name || !editForm.clientId}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Professional Modal */}
      <Modal isOpen={showAssignProModal} onClose={() => setShowAssignProModal(false)} title="Assign Professional">
        <div className="space-y-4">
          {allProfessionals.length === 0 ? (
            <p className="text-sm text-muted italic">No unassigned professionals available.</p>
          ) : (
            <select
              value={selectedProfessionalId}
              onChange={(e) => setSelectedProfessionalId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a professional</option>
              {allProfessionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.businessName} - {p.primarySpecialty} ({p.contactName})
                </option>
              ))}
            </select>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAssignProModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={assignProfessional}
              disabled={assignProSaving || !selectedProfessionalId}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {assignProSaving ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Material to Professional Modal */}
      <Modal
        isOpen={showProMaterialModal}
        onClose={() => setShowProMaterialModal(false)}
        title={`Add Material - ${proMaterialTarget?.businessName || ''}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Material</label>
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a material</option>
              {allMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}{m.primaryUse ? ` (${m.primaryUse})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
            <input
              type="text"
              value={materialNotes}
              onChange={(e) => setMaterialNotes(e.target.value)}
              placeholder="Optional notes..."
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowProMaterialModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addProMaterial}
              disabled={proMaterialSaving || !selectedMaterialId}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {proMaterialSaving ? 'Adding...' : 'Add Material'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Client-Directed Material Modal */}
      <Modal
        isOpen={showClientMaterialModal}
        onClose={() => setShowClientMaterialModal(false)}
        title="Add Client-Directed Material"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Material</label>
            <select
              value={clientMaterialId}
              onChange={(e) => setClientMaterialId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a material</option>
              {allMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}{m.primaryUse ? ` (${m.primaryUse})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
            <input
              type="text"
              value={clientMaterialNotes}
              onChange={(e) => setClientMaterialNotes(e.target.value)}
              placeholder="Optional notes..."
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowClientMaterialModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addClientMaterial}
              disabled={clientMaterialSaving || !clientMaterialId}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {clientMaterialSaving ? 'Adding...' : 'Add Material'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
