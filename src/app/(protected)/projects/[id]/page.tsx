'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PrivateNotesList from '@/components/ui/PrivateNotesList';
import Modal from '@/components/ui/Modal';
import ProjectTabs from '@/components/projects/ProjectTabs';
import { isValidUUID, VALID_STATUSES, PROJECT_TYPES, STATUS_LABELS, STATUS_STYLES } from '@/lib/utils';

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
}

interface OwnerInfo {
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface TeamSummary {
  totalParticipants: number;
  roles: { role: string; count: number }[];
}

interface NoteRow {
  id: string;
  note: string;
  createdAt: string;
  tenantId: string;
}

const ROLE_LABELS: Record<string, string> = {
  property_owner: 'Property Owner',
  architect: 'Architect',
  general_contractor: 'General Contractor',
  trades: 'Trades',
  engineer: 'Engineer',
  designer: 'Designer',
  consultant: 'Consultant',
  inspector: 'Inspector',
  other: 'Other',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const [teamSummary, setTeamSummary] = useState<TeamSummary>({ totalParticipants: 0, roles: [] });
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
    projectType: '',
    projectTypeOtherDescription: '',
  });
  const [editSaving, setEditSaving] = useState(false);

  const loadProject = useCallback(async () => {
    // Load project
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (data) {
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
      });
    }

    // Load property owner from project_participants
    const { data: ownerParticipant } = await supabase
      .from('project_participants')
      .select('organization_id, organizations(business_name, primary_first_name, primary_last_name, primary_email, primary_phone)')
      .eq('project_id', projectId)
      .eq('project_role', 'property_owner')
      .single();

    if (ownerParticipant) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const org = ownerParticipant.organizations as any;
      const name = org?.business_name
        || `${org?.primary_first_name || ''} ${org?.primary_last_name || ''}`.trim()
        || 'Unknown';
      setOwner({
        organizationId: ownerParticipant.organization_id,
        name,
        email: org?.primary_email || null,
        phone: org?.primary_phone || null,
      });
    } else {
      setOwner(null);
    }

    // Load team summary
    const { data: participants } = await supabase
      .from('project_participants')
      .select('project_role')
      .eq('project_id', projectId);

    if (participants && participants.length > 0) {
      const roleCounts = new Map<string, number>();
      for (const p of participants) {
        const role = p.project_role || 'other';
        roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
      }
      const roles = Array.from(roleCounts.entries()).map(([role, count]) => ({ role, count }));
      setTeamSummary({ totalParticipants: participants.length, roles });
    } else {
      setTeamSummary({ totalParticipants: 0, roles: [] });
    }

    // Load notes
    const { data: notesData } = await supabase
      .from('private_notes')
      .select('id, note, created_at, tenant_id')
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    const { data: newNote } = await supabase
      .from('private_notes')
      .insert({ tenant_id: profile.tenant_id, note, project_id: projectId })
      .select('id, note, created_at, tenant_id')
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
    if (!VALID_STATUSES.includes(newStatus as typeof VALID_STATUSES[number])) return;
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
  const openEditModal = () => {
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
      projectType: project.projectType,
      projectTypeOtherDescription: project.projectTypeOtherDescription || '',
    });
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

  const projectTypeLabel = PROJECT_TYPES.find((t) => t.value === project?.projectType)?.label
    || project?.projectTypeOtherDescription
    || project?.projectType
    || '-';

  if (!isValidUUID(projectId)) return <p className="text-muted text-sm">Project not found.</p>;
  if (loading) return <p className="text-muted text-sm">Loading...</p>;
  if (!project) return <p className="text-muted text-sm">Project not found.</p>;

  const inputClass = 'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <button
        onClick={() => router.push('/projects')}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Projects
      </button>

      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
        <button
          onClick={() => {
            setNewStatus(project.status);
            setShowStatusModal(true);
          }}
          className={`text-xs px-3 py-1 rounded-full font-medium cursor-pointer ${STATUS_STYLES[project.status]}`}
        >
          {STATUS_LABELS[project.status]}
        </button>
      </div>

      <ProjectTabs projectId={projectId} />

      <div className="flex gap-6">
        {/* Left 1/3: Property Owner, Address, Description, Notes */}
        <div className="w-1/3 space-y-6">
          {/* Property Owner */}
          <div className="bg-card-bg rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Property Owner</h2>
              <button
                onClick={openEditModal}
                className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Edit Project
              </button>
            </div>
            {owner ? (
              <>
                <p className="text-sm font-medium">{owner.name}</p>
                {owner.email && <p className="text-xs text-muted">{owner.email}</p>}
                {owner.phone && <p className="text-xs text-muted">{owner.phone}</p>}
              </>
            ) : (
              <p className="text-sm text-muted italic">No property owner assigned.</p>
            )}
          </div>

          {/* Site Address */}
          <div className="bg-card-bg rounded-lg border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-2">Site Address</h2>
            <p className="text-xs text-muted">{project.siteAddressLine1}</p>
            {project.siteAddressLine2 && <p className="text-xs text-muted">{project.siteAddressLine2}</p>}
            <p className="text-xs text-muted">
              {project.siteCity}, {project.siteState} {project.sitePostalCode}
            </p>
          </div>

          {/* Description */}
          {project.description && (
            <div className="bg-card-bg rounded-lg border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground mb-2">Description</h2>
              <p className="text-xs text-muted whitespace-pre-wrap">{project.description}</p>
            </div>
          )}

          {/* Building Plan Summary */}
          {project.buildingPlanSummary && (
            <div className="bg-card-bg rounded-lg border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground mb-2">Building Plan Summary</h2>
              <p className="text-xs text-muted whitespace-pre-wrap">{project.buildingPlanSummary}</p>
            </div>
          )}

          {/* Private Notes */}
          <div className="bg-card-bg rounded-lg border border-border p-5">
            <PrivateNotesList
              notes={notes.map((n) => ({ id: n.id, tenantId: n.tenantId, note: n.note, createdAt: n.createdAt }))}
              onAddNote={handleAddNote}
            />
          </div>
        </div>

        {/* Right 2/3: Project Summary */}
        <div className="w-2/3 space-y-6">
          <div className="bg-card-bg rounded-lg border border-border p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Project Summary</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Type</span>
                <span className="text-sm font-medium text-foreground">{projectTypeLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Status</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[project.status]}`}>
                  {STATUS_LABELS[project.status]}
                </span>
              </div>

              <hr className="border-border my-3" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Team</span>
                  <span className="text-sm font-medium text-foreground">
                    {teamSummary.totalParticipants} participant{teamSummary.totalParticipants !== 1 ? 's' : ''}
                  </span>
                </div>

                {teamSummary.roles.length > 0 ? (
                  <ul className="space-y-1 ml-2">
                    {teamSummary.roles.map(({ role, count }) => (
                      <li key={role} className="text-xs text-muted flex items-center gap-2">
                        <span className="w-1 h-1 bg-muted rounded-full flex-shrink-0" />
                        {count} {ROLE_LABELS[role] || role}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted italic ml-2">No team members assigned yet.</p>
                )}
              </div>

              <div className="pt-3">
                <Link
                  href={`/projects/${projectId}/team`}
                  className="text-sm text-primary hover:text-primary-dark font-medium inline-flex items-center gap-1"
                >
                  View Team &rarr;
                </Link>
              </div>
            </div>
          </div>
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
              maxLength={200}
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
                maxLength={200}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              maxLength={5000}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Building Plan Summary</label>
            <textarea
              value={editForm.buildingPlanSummary}
              onChange={(e) => setEditForm({ ...editForm, buildingPlanSummary: e.target.value })}
              rows={3}
              maxLength={5000}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Address Line 1</label>
            <input
              type="text"
              value={editForm.siteAddressLine1}
              onChange={(e) => setEditForm({ ...editForm, siteAddressLine1: e.target.value })}
              maxLength={200}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Address Line 2</label>
            <input
              type="text"
              value={editForm.siteAddressLine2}
              onChange={(e) => setEditForm({ ...editForm, siteAddressLine2: e.target.value })}
              maxLength={200}
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
                maxLength={100}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">State</label>
              <input
                type="text"
                value={editForm.siteState}
                onChange={(e) => setEditForm({ ...editForm, siteState: e.target.value })}
                maxLength={100}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Zip</label>
              <input
                type="text"
                value={editForm.sitePostalCode}
                onChange={(e) => setEditForm({ ...editForm, sitePostalCode: e.target.value })}
                maxLength={20}
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
              disabled={editSaving || !editForm.name}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
