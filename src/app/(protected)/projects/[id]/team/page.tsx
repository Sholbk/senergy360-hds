'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import ProjectTabs from '@/components/projects/ProjectTabs';
import { isValidUUID } from '@/lib/utils';

// --- Interfaces ---

interface ParticipantRow {
  id: string;
  organizationId: string;
  projectRole: string;
  parentParticipantId: string | null;
  invitedAt: string | null;
  acceptedAt: string | null;
  notes: string | null;
  orgName: string;
  businessName: string | null;
  specialty: string | null;
  contactName: string;
  email: string | null;
  phone: string | null;
  userId: string | null;
  materials: { id: string; name: string; primaryUse: string | null; notes: string | null }[];
}

interface OrgOption {
  id: string;
  orgType: string;
  businessName: string | null;
  primaryFirstName: string;
  primaryLastName: string;
}

interface MaterialOption {
  id: string;
  name: string;
  primaryUse: string | null;
}

// --- Constants ---

const ROLE_LABELS: Record<string, string> = {
  property_owner: 'Property Owner',
  architect: 'Architect',
  general_contractor: 'General Contractor',
  trade: 'Trade',
};

const ROLE_COLORS: Record<string, string> = {
  property_owner: 'bg-blue-100 text-blue-700 border-blue-200',
  architect: 'bg-purple-100 text-purple-700 border-purple-200',
  general_contractor: 'bg-green-100 text-green-700 border-green-200',
  trade: 'bg-orange-100 text-orange-700 border-orange-200',
};

const ROLE_OPTIONS = [
  { value: 'property_owner', label: 'Property Owner' },
  { value: 'architect', label: 'Architect' },
  { value: 'general_contractor', label: 'General Contractor' },
  { value: 'trade', label: 'Trade' },
];

// --- Component ---

export default function ProjectTeamPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  // Data state
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  // Add Participant modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [allOrgs, setAllOrgs] = useState<OrgOption[]>([]);
  const [addForm, setAddForm] = useState({ organizationId: '', projectRole: 'trade', parentParticipantId: '', notes: '' });
  const [addSaving, setAddSaving] = useState(false);

  // Add Trade modal state (pre-filled parent)
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [tradeParentId, setTradeParentId] = useState('');
  const [tradeForm, setTradeForm] = useState({ organizationId: '', notes: '' });
  const [tradeSaving, setTradeSaving] = useState(false);

  // Add Material modal state
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialTarget, setMaterialTarget] = useState<{ participantId: string; orgName: string } | null>(null);
  const [allMaterials, setAllMaterials] = useState<MaterialOption[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [materialNotes, setMaterialNotes] = useState('');
  const [materialSaving, setMaterialSaving] = useState(false);

  // Email dropdown state
  const [openEmailDropdown, setOpenEmailDropdown] = useState<string | null>(null);

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const requestConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  // --- Data Loading ---

  const loadParticipants = useCallback(async () => {
    const { data: ppData } = await supabase
      .from('project_participants')
      .select('id, organization_id, project_role, parent_participant_id, invited_at, accepted_at, notes, organizations(id, org_type, business_name, specialty, primary_first_name, primary_last_name, primary_email, primary_phone, user_id)')
      .eq('project_id', projectId);

    if (!ppData || ppData.length === 0) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    const ppIds = ppData.map((pp) => pp.id);

    const { data: matData } = await supabase
      .from('project_participant_materials')
      .select('id, material_id, notes, project_participant_id, materials(name, primary_use)')
      .in('project_participant_id', ppIds);

    const matsByPpId = new Map<string, typeof matData>();
    for (const m of matData || []) {
      const existing = matsByPpId.get(m.project_participant_id) || [];
      existing.push(m);
      matsByPpId.set(m.project_participant_id, existing);
    }

    const rows: ParticipantRow[] = ppData.map((pp) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const org = pp.organizations as any;
      const mats = matsByPpId.get(pp.id) || [];
      const contactName = `${org?.primary_first_name || ''} ${org?.primary_last_name || ''}`.trim();
      const orgName = org?.business_name || contactName || 'Unknown';
      return {
        id: pp.id,
        organizationId: pp.organization_id,
        projectRole: pp.project_role,
        parentParticipantId: pp.parent_participant_id,
        invitedAt: pp.invited_at,
        acceptedAt: pp.accepted_at,
        notes: pp.notes,
        orgName,
        businessName: org?.business_name || null,
        specialty: org?.specialty || null,
        contactName,
        email: org?.primary_email || null,
        phone: org?.primary_phone || null,
        userId: org?.user_id || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        materials: mats.map((m: any) => ({
          id: m.id,
          name: m.materials?.name || '',
          primaryUse: m.materials?.primary_use || null,
          notes: m.notes,
        })),
      };
    });

    setParticipants(rows);
    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  // Close email dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenEmailDropdown(null);
    if (openEmailDropdown) {
      document.addEventListener('click', handleClick);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [openEmailDropdown]);

  // --- Helpers ---

  const getPortalBadge = (p: ParticipantRow) => {
    if (p.userId) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>;
    }
    if (p.invitedAt && !p.acceptedAt) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Invited</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Not Invited</span>;
  };

  // Organize participants by role hierarchy
  const topLevel = participants.filter((p) => !p.parentParticipantId);
  const tradesByParent = new Map<string, ParticipantRow[]>();
  for (const p of participants) {
    if (p.parentParticipantId) {
      const existing = tradesByParent.get(p.parentParticipantId) || [];
      existing.push(p);
      tradesByParent.set(p.parentParticipantId, existing);
    }
  }

  // Sort top-level: property_owner first, then architect, then general_contractor, then trade
  const roleOrder: Record<string, number> = { property_owner: 0, architect: 1, general_contractor: 2, trade: 3 };
  const sortedTopLevel = [...topLevel].sort((a, b) => (roleOrder[a.projectRole] ?? 9) - (roleOrder[b.projectRole] ?? 9));

  // GC participants (for parent dropdown)
  const gcParticipants = participants.filter((p) => p.projectRole === 'general_contractor');

  // --- Add Participant ---

  const openAddModal = async () => {
    const { data } = await supabase
      .from('organizations')
      .select('id, org_type, business_name, primary_first_name, primary_last_name')
      .order('business_name');

    if (data) {
      const existingOrgIds = new Set(participants.map((p) => p.organizationId));
      setAllOrgs(
        data
          .filter((o) => !existingOrgIds.has(o.id))
          .map((o) => ({
            id: o.id,
            orgType: o.org_type,
            businessName: o.business_name,
            primaryFirstName: o.primary_first_name,
            primaryLastName: o.primary_last_name,
          }))
      );
    }

    setAddForm({ organizationId: '', projectRole: 'trade', parentParticipantId: '', notes: '' });
    setShowAddModal(true);
  };

  const addParticipant = async () => {
    if (!addForm.organizationId || !addForm.projectRole) return;
    setAddSaving(true);
    setActionError('');

    const insertData: Record<string, unknown> = {
      project_id: projectId,
      organization_id: addForm.organizationId,
      project_role: addForm.projectRole,
      notes: addForm.notes || null,
    };

    if (addForm.projectRole === 'trade' && addForm.parentParticipantId) {
      insertData.parent_participant_id = addForm.parentParticipantId;
    }

    const { error } = await supabase.from('project_participants').insert(insertData);
    if (error) {
      setActionError('Failed to add participant. Please try again.');
    } else {
      setShowAddModal(false);
      await loadParticipants();
    }
    setAddSaving(false);
  };

  // --- Add Trade (under GC) ---

  const openAddTradeModal = async (parentId: string) => {
    setTradeParentId(parentId);

    const { data } = await supabase
      .from('organizations')
      .select('id, org_type, business_name, primary_first_name, primary_last_name')
      .order('business_name');

    if (data) {
      const existingOrgIds = new Set(participants.map((p) => p.organizationId));
      setAllOrgs(
        data
          .filter((o) => !existingOrgIds.has(o.id))
          .map((o) => ({
            id: o.id,
            orgType: o.org_type,
            businessName: o.business_name,
            primaryFirstName: o.primary_first_name,
            primaryLastName: o.primary_last_name,
          }))
      );
    }

    setTradeForm({ organizationId: '', notes: '' });
    setShowAddTradeModal(true);
  };

  const addTrade = async () => {
    if (!tradeForm.organizationId) return;
    setTradeSaving(true);
    setActionError('');

    const { error } = await supabase.from('project_participants').insert({
      project_id: projectId,
      organization_id: tradeForm.organizationId,
      project_role: 'trade',
      parent_participant_id: tradeParentId,
      notes: tradeForm.notes || null,
    });

    if (error) {
      setActionError('Failed to add trade. Please try again.');
    } else {
      setShowAddTradeModal(false);
      await loadParticipants();
    }
    setTradeSaving(false);
  };

  // --- Add Material ---

  const openMaterialModal = async (participantId: string, orgName: string) => {
    setMaterialTarget({ participantId, orgName });
    const { data } = await supabase.from('materials').select('id, name, primary_use').order('name');
    if (data) {
      setAllMaterials(data.map((m) => ({ id: m.id, name: m.name, primaryUse: m.primary_use })));
    }
    setSelectedMaterialId('');
    setMaterialNotes('');
    setShowMaterialModal(true);
  };

  const addMaterial = async () => {
    if (!selectedMaterialId || !materialTarget) return;
    setMaterialSaving(true);
    setActionError('');

    const { error } = await supabase.from('project_participant_materials').insert({
      project_participant_id: materialTarget.participantId,
      material_id: selectedMaterialId,
      notes: materialNotes || null,
    });

    if (error) {
      setActionError('Failed to add material. Please try again.');
    } else {
      setShowMaterialModal(false);
      await loadParticipants();
    }
    setMaterialSaving(false);
  };

  // --- Remove Material ---

  const removeMaterial = (materialRowId: string) => {
    requestConfirm('Remove this material?', async () => {
      setActionError('');
      const { error } = await supabase.from('project_participant_materials').delete().eq('id', materialRowId);
      if (error) {
        setActionError('Failed to remove material. Please try again.');
      } else {
        await loadParticipants();
      }
    });
  };

  // --- Remove Participant ---

  const removeParticipant = (participantId: string) => {
    requestConfirm('Remove this participant and all their assigned materials from the project?', async () => {
      setActionError('');
      const { error } = await supabase.from('project_participants').delete().eq('id', participantId);
      if (error) {
        setActionError('Failed to remove participant. Please try again.');
      } else {
        await loadParticipants();
      }
    });
  };

  // --- Invite to Portal ---

  const inviteToPortal = async (participant: ParticipantRow) => {
    if (!participant.email) {
      setActionError('This participant has no email address on file.');
      return;
    }
    setActionError('');
    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: participant.email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Failed to send invitation.');
      } else {
        await loadParticipants();
      }
    } catch {
      setActionError('Failed to send invitation. Please try again.');
    }
  };

  // --- Render ---

  if (!isValidUUID(projectId)) return <p className="text-muted text-sm">Project not found.</p>;
  if (loading) return <p className="text-muted text-sm">Loading...</p>;

  const inputClass = 'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  const renderParticipantCard = (p: ParticipantRow, isNested = false) => {
    const roleColor = ROLE_COLORS[p.projectRole] || 'bg-gray-100 text-gray-700 border-gray-200';
    const roleLabel = ROLE_LABELS[p.projectRole] || p.projectRole;
    const trades = tradesByParent.get(p.id) || [];
    const isGC = p.projectRole === 'general_contractor';

    return (
      <div
        key={p.id}
        className={`bg-card-bg rounded-lg border border-border ${isNested ? 'ml-8 mt-3' : ''}`}
      >
        {/* Card header with role badge */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${roleColor}`}>
                {roleLabel}
              </span>
              {getPortalBadge(p)}
            </div>
            <div className="flex items-center gap-2">
              {/* Send Email Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenEmailDropdown(openEmailDropdown === p.id ? null : p.id);
                  }}
                  className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors inline-flex items-center gap-1"
                >
                  Send Email
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {openEmailDropdown === p.id && (
                  <div className="absolute right-0 mt-1 w-56 bg-card-bg border border-border rounded-md shadow-lg z-10">
                    <button
                      onClick={() => {
                        setOpenEmailDropdown(null);
                        inviteToPortal(p);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-background transition-colors text-foreground"
                    >
                      Invite to Portal
                    </button>
                    <button
                      onClick={() => {
                        setOpenEmailDropdown(null);
                        // Placeholder for future implementation
                      }}
                      disabled
                      className="block w-full text-left px-4 py-2 text-sm text-muted cursor-not-allowed"
                    >
                      Send Material Instructions (coming soon)
                    </button>
                    <button
                      onClick={() => {
                        setOpenEmailDropdown(null);
                        // Placeholder for future implementation
                      }}
                      disabled
                      className="block w-full text-left px-4 py-2 text-sm text-muted cursor-not-allowed"
                    >
                      Send Custom Email (coming soon)
                    </button>
                  </div>
                )}
              </div>

              {/* Add Material */}
              <button
                onClick={() => openMaterialModal(p.id, p.orgName)}
                className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Add Material
              </button>

              {/* Add Trade (only for GC) */}
              {isGC && (
                <button
                  onClick={() => openAddTradeModal(p.id)}
                  className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Add Trade
                </button>
              )}

              {/* Remove */}
              <button
                onClick={() => removeParticipant(p.id)}
                className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Contact info */}
          <div className="mb-2">
            <h3 className="font-medium text-foreground text-base">
              {p.businessName || p.contactName}
            </h3>
            <p className="text-sm text-muted">
              {p.businessName && p.contactName && <span>{p.contactName}</span>}
              {p.email && (
                <>
                  {p.businessName && p.contactName && <span> &middot; </span>}
                  <span>{p.email}</span>
                </>
              )}
              {p.phone && (
                <>
                  <span> &middot; </span>
                  <span>{p.phone}</span>
                </>
              )}
            </p>
            {p.specialty && (
              <p className="text-xs text-muted mt-0.5">Specialty: {p.specialty}</p>
            )}
            {p.notes && (
              <p className="text-xs text-muted mt-0.5 italic">Notes: {p.notes}</p>
            )}
          </div>

          {/* Materials */}
          {p.materials.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted mb-1">Materials:</p>
              <div className="flex flex-wrap gap-2">
                {p.materials.map((mat) => (
                  <span
                    key={mat.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-background rounded text-xs text-foreground border border-border"
                  >
                    {mat.name}
                    {mat.primaryUse && <span className="text-muted">({mat.primaryUse})</span>}
                    {mat.notes && <span className="text-muted italic">&mdash; {mat.notes}</span>}
                    <button
                      onClick={() => removeMaterial(mat.id)}
                      className="ml-1 text-red-400 hover:text-red-600 transition-colors"
                      title="Remove material"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {p.materials.length === 0 && (
            <p className="text-xs text-muted italic mt-2">No materials assigned.</p>
          )}
        </div>

        {/* Nested trades under GC */}
        {isGC && trades.length > 0 && (
          <div className="border-t border-border px-5 pb-5">
            {trades.map((trade) => (
              <div key={trade.id} className="mt-4 pl-4 border-l-2 border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${ROLE_COLORS.trade}`}>
                      Trade
                    </span>
                    {getPortalBadge(trade)}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Send Email Dropdown for trade */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenEmailDropdown(openEmailDropdown === trade.id ? null : trade.id);
                        }}
                        className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors inline-flex items-center gap-1"
                      >
                        Send Email
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {openEmailDropdown === trade.id && (
                        <div className="absolute right-0 mt-1 w-56 bg-card-bg border border-border rounded-md shadow-lg z-10">
                          <button
                            onClick={() => {
                              setOpenEmailDropdown(null);
                              inviteToPortal(trade);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-background transition-colors text-foreground"
                          >
                            Invite to Portal
                          </button>
                          <button
                            onClick={() => setOpenEmailDropdown(null)}
                            disabled
                            className="block w-full text-left px-4 py-2 text-sm text-muted cursor-not-allowed"
                          >
                            Send Material Instructions (coming soon)
                          </button>
                          <button
                            onClick={() => setOpenEmailDropdown(null)}
                            disabled
                            className="block w-full text-left px-4 py-2 text-sm text-muted cursor-not-allowed"
                          >
                            Send Custom Email (coming soon)
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => openMaterialModal(trade.id, trade.orgName)}
                      className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Add Material
                    </button>
                    <button
                      onClick={() => removeParticipant(trade.id)}
                      className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <h4 className="font-medium text-foreground text-sm">
                  {trade.businessName || trade.contactName}
                </h4>
                <p className="text-xs text-muted">
                  {trade.businessName && trade.contactName && <span>{trade.contactName}</span>}
                  {trade.email && (
                    <>
                      {trade.businessName && trade.contactName && <span> &middot; </span>}
                      <span>{trade.email}</span>
                    </>
                  )}
                  {trade.phone && (
                    <>
                      <span> &middot; </span>
                      <span>{trade.phone}</span>
                    </>
                  )}
                </p>
                {trade.specialty && (
                  <p className="text-xs text-muted mt-0.5">Specialty: {trade.specialty}</p>
                )}
                {trade.notes && (
                  <p className="text-xs text-muted mt-0.5 italic">Notes: {trade.notes}</p>
                )}

                {trade.materials.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted mb-1">Materials:</p>
                    <div className="flex flex-wrap gap-2">
                      {trade.materials.map((mat) => (
                        <span
                          key={mat.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-background rounded text-xs text-foreground border border-border"
                        >
                          {mat.name}
                          {mat.primaryUse && <span className="text-muted">({mat.primaryUse})</span>}
                          {mat.notes && <span className="text-muted italic">&mdash; {mat.notes}</span>}
                          <button
                            onClick={() => removeMaterial(mat.id)}
                            className="ml-1 text-red-400 hover:text-red-600 transition-colors"
                            title="Remove material"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {trade.materials.length === 0 && (
                  <p className="text-xs text-muted italic mt-1">No materials assigned.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <button
        onClick={() => router.push('/projects')}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Projects
      </button>

      <ProjectTabs projectId={projectId} />

      {actionError && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {actionError}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Project Team</h2>
        <button
          onClick={openAddModal}
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Add Participant
        </button>
      </div>

      {participants.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
          <p className="text-muted text-sm">No team members added yet.</p>
          <p className="text-muted text-xs mt-1">Click &ldquo;Add Participant&rdquo; to add the first team member.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTopLevel.map((p) => renderParticipantCard(p))}
        </div>
      )}

      {/* Add Participant Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Participant">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Organization</label>
            {allOrgs.length === 0 ? (
              <p className="text-sm text-muted italic">No available organizations. Create one first from the Organizations page.</p>
            ) : (
              <select
                value={addForm.organizationId}
                onChange={(e) => setAddForm({ ...addForm, organizationId: e.target.value })}
                className={inputClass}
              >
                <option value="">Select an organization</option>
                {allOrgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.businessName || `${o.primaryFirstName} ${o.primaryLastName}`} ({o.orgType})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <select
              value={addForm.projectRole}
              onChange={(e) => setAddForm({ ...addForm, projectRole: e.target.value })}
              className={inputClass}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {addForm.projectRole === 'trade' && gcParticipants.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Under General Contractor (optional)</label>
              <select
                value={addForm.parentParticipantId}
                onChange={(e) => setAddForm({ ...addForm, parentParticipantId: e.target.value })}
                className={inputClass}
              >
                <option value="">No parent (standalone trade)</option>
                {gcParticipants.map((gc) => (
                  <option key={gc.id} value={gc.id}>{gc.orgName}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
            <input
              type="text"
              value={addForm.notes}
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
              maxLength={500}
              placeholder="Optional notes..."
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addParticipant}
              disabled={addSaving || !addForm.organizationId}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {addSaving ? 'Adding...' : 'Add Participant'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Trade Modal */}
      <Modal isOpen={showAddTradeModal} onClose={() => setShowAddTradeModal(false)} title="Add Trade">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Organization</label>
            {allOrgs.length === 0 ? (
              <p className="text-sm text-muted italic">No available organizations. Create one first from the Organizations page.</p>
            ) : (
              <select
                value={tradeForm.organizationId}
                onChange={(e) => setTradeForm({ ...tradeForm, organizationId: e.target.value })}
                className={inputClass}
              >
                <option value="">Select an organization</option>
                {allOrgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.businessName || `${o.primaryFirstName} ${o.primaryLastName}`} ({o.orgType})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
            <input
              type="text"
              value={tradeForm.notes}
              onChange={(e) => setTradeForm({ ...tradeForm, notes: e.target.value })}
              maxLength={500}
              placeholder="Optional notes..."
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAddTradeModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addTrade}
              disabled={tradeSaving || !tradeForm.organizationId}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {tradeSaving ? 'Adding...' : 'Add Trade'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Material Modal */}
      <Modal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        title={`Add Material - ${materialTarget?.orgName || ''}`}
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
              maxLength={500}
              placeholder="Optional notes..."
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowMaterialModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addMaterial}
              disabled={materialSaving || !selectedMaterialId}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {materialSaving ? 'Adding...' : 'Add Material'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm">
        <div className="space-y-4">
          <p className="text-sm text-foreground">{confirmMessage}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                confirmAction?.();
                setShowConfirmModal(false);
              }}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
