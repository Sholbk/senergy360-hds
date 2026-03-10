'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import PrivateNotesList from '@/components/ui/PrivateNotesList';
import { PHONE_REGEX, isValidEmail, isValidUUID, STATUS_LABELS, STATUS_STYLES } from '@/lib/utils';

const ORG_TYPE_LABELS: Record<string, string> = {
  property_owner: 'Property Owner',
  architect: 'Architect',
  general_contractor: 'General Contractor',
  trade: 'Trade',
  other: 'Other',
};

const ORG_TYPE_COLORS: Record<string, string> = {
  property_owner: 'bg-blue-100 text-blue-700',
  architect: 'bg-purple-100 text-purple-700',
  general_contractor: 'bg-green-100 text-green-700',
  trade: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
};

interface OrganizationDetail {
  id: string;
  displayName: string;
  orgType: string;
  businessName: string | null;
  specialty: string | null;
  primaryFirstName: string | null;
  primaryLastName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  secondaryFirstName: string | null;
  secondaryLastName: string | null;
  secondaryEmail: string | null;
  secondaryPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  userId: string | null;
}

interface ParticipationRow {
  id: string;
  projectRole: string;
  project: {
    id: string;
    name: string;
    status: string;
  };
}

interface NoteRow {
  id: string;
  note: string;
  createdAt: string;
  tenantId: string;
}

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const orgId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [org, setOrg] = useState<OrganizationDetail | null>(null);
  const [participations, setParticipations] = useState<ParticipationRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [editData, setEditData] = useState({
    displayName: '',
    orgType: 'other',
    businessName: '',
    specialty: '',
    primaryFirstName: '',
    primaryLastName: '',
    primaryEmail: '',
    primaryPhone: '',
    secondaryFirstName: '',
    secondaryLastName: '',
    secondaryEmail: '',
    secondaryPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  const loadOrganization = useCallback(async () => {
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (data) {
      setOrg({
        id: data.id,
        displayName: data.display_name,
        orgType: data.org_type,
        businessName: data.business_name,
        specialty: data.specialty,
        primaryFirstName: data.primary_first_name,
        primaryLastName: data.primary_last_name,
        primaryEmail: data.primary_email,
        primaryPhone: data.primary_phone,
        secondaryFirstName: data.secondary_first_name,
        secondaryLastName: data.secondary_last_name,
        secondaryEmail: data.secondary_email,
        secondaryPhone: data.secondary_phone,
        addressLine1: data.address_line1,
        addressLine2: data.address_line2,
        city: data.city,
        state: data.state,
        postalCode: data.postal_code,
        country: data.country,
        userId: data.user_id,
      });
    }

    // Load projects this org participates in
    const { data: participationsData } = await supabase
      .from('project_participants')
      .select('id, project_role, projects(id, name, status)')
      .eq('organization_id', orgId);

    if (participationsData) {
      setParticipations(
        participationsData
          .filter((p) => p.projects)
          .map((p) => {
            const proj = p.projects as unknown as { id: string; name: string; status: string };
            return {
              id: p.id,
              projectRole: p.project_role,
              project: {
                id: proj.id,
                name: proj.name,
                status: proj.status,
              },
            };
          })
      );
    }

    // Load private notes
    const { data: notesData } = await supabase
      .from('private_notes')
      .select('id, note, created_at, tenant_id')
      .eq('organization_id', orgId)
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
  }, [orgId, supabase]);

  useEffect(() => {
    loadOrganization();
  }, [loadOrganization]);

  const openEditModal = () => {
    if (!org) return;
    setEditData({
      displayName: org.displayName,
      orgType: org.orgType,
      businessName: org.businessName || '',
      specialty: org.specialty || '',
      primaryFirstName: org.primaryFirstName || '',
      primaryLastName: org.primaryLastName || '',
      primaryEmail: org.primaryEmail || '',
      primaryPhone: org.primaryPhone || '',
      secondaryFirstName: org.secondaryFirstName || '',
      secondaryLastName: org.secondaryLastName || '',
      secondaryEmail: org.secondaryEmail || '',
      secondaryPhone: org.secondaryPhone || '',
      addressLine1: org.addressLine1 || '',
      addressLine2: org.addressLine2 || '',
      city: org.city || '',
      state: org.state || '',
      postalCode: org.postalCode || '',
      country: org.country || 'US',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const saveOrganization = async () => {
    if (!editData.displayName.trim()) {
      setEditError('Display name is required.');
      return;
    }
    if (editData.primaryPhone && !PHONE_REGEX.test(editData.primaryPhone)) {
      setEditError('Invalid phone number format.');
      return;
    }
    if (editData.primaryEmail && !isValidEmail(editData.primaryEmail)) {
      setEditError('Invalid email format.');
      return;
    }
    if (editData.secondaryPhone && !PHONE_REGEX.test(editData.secondaryPhone)) {
      setEditError('Invalid secondary phone number format.');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('organizations')
      .update({
        display_name: editData.displayName.trim(),
        org_type: editData.orgType,
        business_name: editData.businessName.trim() || null,
        specialty: editData.specialty.trim() || null,
        primary_first_name: editData.primaryFirstName.trim() || null,
        primary_last_name: editData.primaryLastName.trim() || null,
        primary_email: editData.primaryEmail.trim() || null,
        primary_phone: editData.primaryPhone.trim() || null,
        secondary_first_name: editData.secondaryFirstName.trim() || null,
        secondary_last_name: editData.secondaryLastName.trim() || null,
        secondary_email: editData.secondaryEmail.trim() || null,
        secondary_phone: editData.secondaryPhone.trim() || null,
        address_line1: editData.addressLine1.trim() || null,
        address_line2: editData.addressLine2.trim() || null,
        city: editData.city.trim() || null,
        state: editData.state.trim() || null,
        postal_code: editData.postalCode.trim() || null,
        country: editData.country.trim() || 'US',
      })
      .eq('id', orgId);

    if (error) {
      setEditError('Failed to update organization. Please try again.');
    } else {
      setShowEditModal(false);
      loadOrganization();
    }
    setSaving(false);
  };

  const handleInviteToPortal = async () => {
    if (!org || !org.primaryEmail) {
      setInviteMessage('No primary email set for this organization.');
      return;
    }
    setInviting(true);
    setInviteMessage('');
    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: org.primaryEmail,
          role: org.orgType,
          entityType: 'organization',
          entityId: org.id,
          name: `${org.primaryFirstName || ''} ${org.primaryLastName || ''}`.trim(),
        }),
      });
      if (res.ok) {
        setInviteMessage('Invitation sent successfully.');
      } else {
        const body = await res.json().catch(() => null);
        setInviteMessage(body?.error || 'Failed to send invitation.');
      }
    } catch {
      setInviteMessage('Failed to send invitation.');
    }
    setInviting(false);
  };

  const handleAddNote = async (note: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    const { data: newNote } = await supabase
      .from('private_notes')
      .insert({ tenant_id: profile.tenant_id, note, organization_id: orgId })
      .select('id, note, created_at, tenant_id')
      .single();

    if (newNote) {
      setNotes((prev) => [
        { id: newNote.id, note: newNote.note, createdAt: newNote.created_at, tenantId: newNote.tenant_id },
        ...prev,
      ]);
    }
  };

  if (!isValidUUID(orgId)) return <p className="text-muted text-sm">Organization not found.</p>;
  if (loading) return <p className="text-muted text-sm">Loading...</p>;
  if (!org) return <p className="text-muted text-sm">Organization not found.</p>;

  return (
    <div>
      <button
        onClick={() => router.push('/organizations')}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Organizations
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Organization Info Card */}
        <div className="bg-card-bg rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-foreground">{org.displayName}</h1>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${ORG_TYPE_COLORS[org.orgType] || 'bg-gray-100 text-gray-700'}`}>
              {ORG_TYPE_LABELS[org.orgType] || org.orgType}
            </span>
            <button
              onClick={openEditModal}
              className="text-xs px-3 py-1 border border-border rounded hover:bg-primary-bg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleInviteToPortal}
              disabled={inviting}
              className="text-xs px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {inviting ? 'Inviting...' : 'Invite to Portal'}
            </button>
          </div>

          {inviteMessage && (
            <p className={`text-xs mb-3 ${inviteMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {inviteMessage}
            </p>
          )}

          <div className="space-y-3 text-sm">
            {org.businessName && (
              <div>
                <p className="font-medium text-foreground">Business Name</p>
                <p className="text-muted">{org.businessName}</p>
              </div>
            )}

            {org.orgType === 'trade' && org.specialty && (
              <div>
                <p className="font-medium text-foreground">Specialty</p>
                <p className="text-muted">{org.specialty}</p>
              </div>
            )}

            {(org.primaryFirstName || org.primaryLastName || org.primaryEmail || org.primaryPhone) && (
              <div>
                <p className="font-medium text-foreground">Primary Contact</p>
                {(org.primaryFirstName || org.primaryLastName) && (
                  <p className="text-muted">
                    {[org.primaryFirstName, org.primaryLastName].filter(Boolean).join(' ')}
                  </p>
                )}
                {org.primaryEmail && <p className="text-muted">{org.primaryEmail}</p>}
                {org.primaryPhone && <p className="text-muted">{org.primaryPhone}</p>}
              </div>
            )}

            {(org.secondaryFirstName || org.secondaryLastName) && (
              <div>
                <p className="font-medium text-foreground">Secondary Contact</p>
                <p className="text-muted">
                  {[org.secondaryFirstName, org.secondaryLastName].filter(Boolean).join(' ')}
                </p>
                {org.secondaryEmail && <p className="text-muted">{org.secondaryEmail}</p>}
                {org.secondaryPhone && <p className="text-muted">{org.secondaryPhone}</p>}
              </div>
            )}

            {org.addressLine1 && (
              <div>
                <p className="font-medium text-foreground">Address</p>
                <p className="text-muted">{org.addressLine1}</p>
                {org.addressLine2 && <p className="text-muted">{org.addressLine2}</p>}
                <p className="text-muted">
                  {[org.city, org.state].filter(Boolean).join(', ')}{' '}
                  {org.postalCode}
                </p>
              </div>
            )}

            <div>
              <p className="font-medium text-foreground">Portal Status</p>
              {org.userId ? (
                <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
                  Has Account
                </span>
              ) : (
                <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                  No Account
                </span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <PrivateNotesList
              notes={notes.map((n) => ({ id: n.id, tenantId: n.tenantId, note: n.note, createdAt: n.createdAt }))}
              onAddNote={handleAddNote}
            />
          </div>
        </div>

        {/* Projects */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">Projects</h2>
          {participations.length === 0 ? (
            <p className="text-sm text-muted italic">No projects yet.</p>
          ) : (
            <div className="space-y-2">
              {participations.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.project.id}`}
                  className="block bg-card-bg rounded-lg border border-border p-4 hover:bg-primary-bg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{p.project.name}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${ORG_TYPE_COLORS[p.projectRole] || 'bg-gray-100 text-gray-700'}`}>
                        {ORG_TYPE_LABELS[p.projectRole] || p.projectRole}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[p.project.status] || ''}`}>
                      {STATUS_LABELS[p.project.status] || p.project.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Organization Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Organization" maxWidth="max-w-2xl">
        <div className="space-y-4">
          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {editError}
            </div>
          )}

          <h3 className="text-sm font-semibold text-foreground">Organization Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Display Name <span className="text-danger">*</span>
              </label>
              <input
                value={editData.displayName}
                onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                maxLength={200}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Organization Type <span className="text-danger">*</span>
              </label>
              <select
                value={editData.orgType}
                onChange={(e) => setEditData({ ...editData, orgType: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="property_owner">Property Owner</option>
                <option value="architect">Architect</option>
                <option value="general_contractor">General Contractor</option>
                <option value="trade">Trade</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Business Name</label>
              <input
                value={editData.businessName}
                onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                maxLength={200}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Specialty</label>
              <input
                value={editData.specialty}
                onChange={(e) => setEditData({ ...editData, specialty: e.target.value })}
                maxLength={200}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground pt-2">Primary Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                value={editData.primaryFirstName}
                onChange={(e) => setEditData({ ...editData, primaryFirstName: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                value={editData.primaryLastName}
                onChange={(e) => setEditData({ ...editData, primaryLastName: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                value={editData.primaryPhone}
                onChange={(e) => setEditData({ ...editData, primaryPhone: e.target.value })}
                maxLength={20}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={editData.primaryEmail}
                onChange={(e) => setEditData({ ...editData, primaryEmail: e.target.value })}
                type="email"
                maxLength={254}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground pt-2">Secondary Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                value={editData.secondaryFirstName}
                onChange={(e) => setEditData({ ...editData, secondaryFirstName: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                value={editData.secondaryLastName}
                onChange={(e) => setEditData({ ...editData, secondaryLastName: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                value={editData.secondaryPhone}
                onChange={(e) => setEditData({ ...editData, secondaryPhone: e.target.value })}
                maxLength={20}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={editData.secondaryEmail}
                onChange={(e) => setEditData({ ...editData, secondaryEmail: e.target.value })}
                type="email"
                maxLength={254}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground pt-2">Address</h3>
          <div className="space-y-3">
            <input
              placeholder="Address Line 1"
              aria-label="Address Line 1"
              value={editData.addressLine1}
              onChange={(e) => setEditData({ ...editData, addressLine1: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              placeholder="Address Line 2"
              aria-label="Address Line 2"
              value={editData.addressLine2}
              onChange={(e) => setEditData({ ...editData, addressLine2: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="City"
                aria-label="City"
                value={editData.city}
                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="State"
                aria-label="State"
                value={editData.state}
                onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="ZIP"
                aria-label="ZIP"
                value={editData.postalCode}
                onChange={(e) => setEditData({ ...editData, postalCode: e.target.value })}
                maxLength={20}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
              onClick={saveOrganization}
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
