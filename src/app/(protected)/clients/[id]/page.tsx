'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import PrivateNotesList from '@/components/ui/PrivateNotesList';
import { PHONE_REGEX, isValidEmail, isValidUUID } from '@/lib/utils';

interface ClientDetail {
  id: string;
  primaryFirstName: string;
  primaryLastName: string;
  primaryPhone: string | null;
  primaryEmail: string | null;
  secondaryFirstName: string | null;
  secondaryLastName: string | null;
  secondaryPhone: string | null;
  secondaryEmail: string | null;
  billingAddressLine1: string | null;
  billingAddressLine2: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
}

interface ProjectRow {
  id: string;
  name: string;
  status: string;
}

interface NoteRow {
  id: string;
  note: string;
  createdAt: string;
  tenantId: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const clientId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editData, setEditData] = useState({
    primaryFirstName: '',
    primaryLastName: '',
    primaryPhone: '',
    primaryEmail: '',
    secondaryFirstName: '',
    secondaryLastName: '',
    secondaryPhone: '',
    secondaryEmail: '',
    billingAddressLine1: '',
    billingAddressLine2: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'US',
  });

  const loadClient = useCallback(async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, primary_first_name, primary_last_name, primary_phone, primary_email, secondary_first_name, secondary_last_name, secondary_phone, secondary_email, billing_address_line1, billing_address_line2, billing_city, billing_state, billing_postal_code, billing_country')
      .eq('id', clientId)
      .single();

    if (data) {
      setClient({
        id: data.id,
        primaryFirstName: data.primary_first_name,
        primaryLastName: data.primary_last_name,
        primaryPhone: data.primary_phone,
        primaryEmail: data.primary_email,
        secondaryFirstName: data.secondary_first_name,
        secondaryLastName: data.secondary_last_name,
        secondaryPhone: data.secondary_phone,
        secondaryEmail: data.secondary_email,
        billingAddressLine1: data.billing_address_line1,
        billingAddressLine2: data.billing_address_line2,
        billingCity: data.billing_city,
        billingState: data.billing_state,
        billingPostalCode: data.billing_postal_code,
        billingCountry: data.billing_country,
      });
    }

    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, name, status')
      .eq('client_id', clientId)
      .order('created_on', { ascending: false });

    if (projectsData) setProjects(projectsData);

    const { data: notesData } = await supabase
      .from('private_notes')
      .select('id, note, created_at, tenant_id')
      .eq('client_id', clientId)
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
  }, [clientId, supabase]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  const openEditModal = () => {
    if (!client) return;
    setEditData({
      primaryFirstName: client.primaryFirstName,
      primaryLastName: client.primaryLastName,
      primaryPhone: client.primaryPhone || '',
      primaryEmail: client.primaryEmail || '',
      secondaryFirstName: client.secondaryFirstName || '',
      secondaryLastName: client.secondaryLastName || '',
      secondaryPhone: client.secondaryPhone || '',
      secondaryEmail: client.secondaryEmail || '',
      billingAddressLine1: client.billingAddressLine1 || '',
      billingAddressLine2: client.billingAddressLine2 || '',
      billingCity: client.billingCity || '',
      billingState: client.billingState || '',
      billingPostalCode: client.billingPostalCode || '',
      billingCountry: client.billingCountry || 'US',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const saveClient = async () => {
    if (!editData.primaryFirstName.trim() || !editData.primaryLastName.trim()) {
      setEditError('First and last name are required.');
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
      .from('clients')
      .update({
        primary_first_name: editData.primaryFirstName.trim(),
        primary_last_name: editData.primaryLastName.trim(),
        primary_phone: editData.primaryPhone.trim() || null,
        primary_email: editData.primaryEmail.trim() || null,
        secondary_first_name: editData.secondaryFirstName.trim() || null,
        secondary_last_name: editData.secondaryLastName.trim() || null,
        secondary_phone: editData.secondaryPhone.trim() || null,
        secondary_email: editData.secondaryEmail.trim() || null,
        billing_address_line1: editData.billingAddressLine1.trim() || null,
        billing_address_line2: editData.billingAddressLine2.trim() || null,
        billing_city: editData.billingCity.trim() || null,
        billing_state: editData.billingState.trim() || null,
        billing_postal_code: editData.billingPostalCode.trim() || null,
        billing_country: editData.billingCountry.trim() || 'US',
      })
      .eq('id', clientId);

    if (error) {
      setEditError('Failed to update client. Please try again.');
    } else {
      setShowEditModal(false);
      loadClient();
    }
    setSaving(false);
  };

  const handleAddNote = async (note: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    const { data: newNote } = await supabase
      .from('private_notes')
      .insert({ tenant_id: profile.tenant_id, note, client_id: clientId })
      .select('id, note, created_at, tenant_id')
      .single();

    if (newNote) {
      setNotes((prev) => [
        { id: newNote.id, note: newNote.note, createdAt: newNote.created_at, tenantId: newNote.tenant_id },
        ...prev,
      ]);
    }
  };

  if (!isValidUUID(clientId)) return <p className="text-muted text-sm">Client not found.</p>;
  if (loading) return <p className="text-muted text-sm">Loading...</p>;
  if (!client) return <p className="text-muted text-sm">Client not found.</p>;

  const statusStyles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  return (
    <div>
      <button
        onClick={() => router.push('/clients')}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Clients
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client Info Card */}
        <div className="bg-card-bg rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">
              {client.primaryFirstName} {client.primaryLastName}
            </h1>
            <button
              onClick={openEditModal}
              className="text-xs px-3 py-1 border border-border rounded hover:bg-primary-bg transition-colors"
            >
              Edit Client
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-foreground">Primary Contact</p>
              {client.primaryEmail && <p className="text-muted">{client.primaryEmail}</p>}
              {client.primaryPhone && <p className="text-muted">{client.primaryPhone}</p>}
            </div>

            {(client.secondaryFirstName || client.secondaryLastName) && (
              <div>
                <p className="font-medium text-foreground">Secondary Contact</p>
                <p className="text-muted">
                  {client.secondaryFirstName} {client.secondaryLastName}
                </p>
                {client.secondaryEmail && <p className="text-muted">{client.secondaryEmail}</p>}
                {client.secondaryPhone && <p className="text-muted">{client.secondaryPhone}</p>}
              </div>
            )}

            {client.billingAddressLine1 && (
              <div>
                <p className="font-medium text-foreground">Billing Address</p>
                <p className="text-muted">{client.billingAddressLine1}</p>
                {client.billingAddressLine2 && <p className="text-muted">{client.billingAddressLine2}</p>}
                <p className="text-muted">
                  {[client.billingCity, client.billingState].filter(Boolean).join(', ')}{' '}
                  {client.billingPostalCode}
                </p>
              </div>
            )}
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
          {projects.length === 0 ? (
            <p className="text-sm text-muted italic">No projects yet.</p>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block bg-card-bg rounded-lg border border-border p-4 hover:bg-primary-bg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{project.name}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[project.status] || ''}`}>
                      {project.status === 'in_progress' ? 'In Progress' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Client Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Client" maxWidth="max-w-2xl">
        <div className="space-y-4">
          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {editError}
            </div>
          )}

          <h3 className="text-sm font-semibold text-foreground">Primary Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                value={editData.primaryFirstName}
                onChange={(e) => setEditData({ ...editData, primaryFirstName: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name <span className="text-danger">*</span>
              </label>
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

          <h3 className="text-sm font-semibold text-foreground pt-2">Billing Address</h3>
          <div className="space-y-3">
            <input
              placeholder="Address Line 1"
              value={editData.billingAddressLine1}
              onChange={(e) => setEditData({ ...editData, billingAddressLine1: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              placeholder="Address Line 2"
              value={editData.billingAddressLine2}
              onChange={(e) => setEditData({ ...editData, billingAddressLine2: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="City"
                value={editData.billingCity}
                onChange={(e) => setEditData({ ...editData, billingCity: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="State"
                value={editData.billingState}
                onChange={(e) => setEditData({ ...editData, billingState: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="ZIP"
                value={editData.billingPostalCode}
                onChange={(e) => setEditData({ ...editData, billingPostalCode: e.target.value })}
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
              onClick={saveClient}
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
