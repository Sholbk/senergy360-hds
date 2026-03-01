'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import PrivateNotesList from '@/components/ui/PrivateNotesList';
import { PHONE_REGEX, isValidEmail, isValidUUID } from '@/lib/utils';

interface ProfessionalDetail {
  id: string;
  businessName: string;
  primarySpecialty: string;
  primaryFirstName: string | null;
  primaryLastName: string | null;
  primaryPhone: string | null;
  primaryEmail: string | null;
  secondaryFirstName: string | null;
  secondaryLastName: string | null;
  secondaryPhone: string | null;
  secondaryEmail: string | null;
  businessAddressLine1: string | null;
  businessAddressLine2: string | null;
  businessCity: string | null;
  businessState: string | null;
  businessPostalCode: string | null;
  businessCountry: string | null;
}

interface ClientRow {
  id: string;
  primaryFirstName: string;
  primaryLastName: string;
  primaryEmail: string | null;
}

interface MaterialRow {
  id: string;
  name: string;
  unit: string | null;
}

interface NoteRow {
  id: string;
  note: string;
  createdAt: string;
  tenantId: string;
}

export default function ProfessionalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const professionalId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [professional, setProfessional] = useState<ProfessionalDetail | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editData, setEditData] = useState({
    businessName: '',
    primarySpecialty: '',
    primaryFirstName: '',
    primaryLastName: '',
    primaryPhone: '',
    primaryEmail: '',
    secondaryFirstName: '',
    secondaryLastName: '',
    secondaryPhone: '',
    secondaryEmail: '',
    businessAddressLine1: '',
    businessAddressLine2: '',
    businessCity: '',
    businessState: '',
    businessPostalCode: '',
    businessCountry: 'US',
  });

  const loadProfessional = useCallback(async () => {
    const { data } = await supabase
      .from('professionals')
      .select('id, business_name, primary_specialty, primary_first_name, primary_last_name, primary_phone, primary_email, secondary_first_name, secondary_last_name, secondary_phone, secondary_email, business_address_line1, business_address_line2, business_city, business_state, business_postal_code, business_country')
      .eq('id', professionalId)
      .single();

    if (data) {
      setProfessional({
        id: data.id,
        businessName: data.business_name,
        primarySpecialty: data.primary_specialty,
        primaryFirstName: data.primary_first_name,
        primaryLastName: data.primary_last_name,
        primaryPhone: data.primary_phone,
        primaryEmail: data.primary_email,
        secondaryFirstName: data.secondary_first_name,
        secondaryLastName: data.secondary_last_name,
        secondaryPhone: data.secondary_phone,
        secondaryEmail: data.secondary_email,
        businessAddressLine1: data.business_address_line1,
        businessAddressLine2: data.business_address_line2,
        businessCity: data.business_city,
        businessState: data.business_state,
        businessPostalCode: data.business_postal_code,
        businessCountry: data.business_country,
      });
    }

    // Load clients through junction table
    const { data: clientLinks } = await supabase
      .from('professional_clients')
      .select('client_id, clients(id, primary_first_name, primary_last_name, primary_email)')
      .eq('professional_id', professionalId);

    if (clientLinks) {
      setClients(
        clientLinks
          .filter((link) => link.clients)
          .map((link) => {
            const c = link.clients as unknown as { id: string; primary_first_name: string; primary_last_name: string; primary_email: string | null };
            return {
              id: c.id,
              primaryFirstName: c.primary_first_name,
              primaryLastName: c.primary_last_name,
              primaryEmail: c.primary_email,
            };
          })
      );
    }

    // Load materials through junction table
    const { data: materialLinks } = await supabase
      .from('professional_materials')
      .select('material_id, materials(id, name, unit)')
      .eq('professional_id', professionalId);

    if (materialLinks) {
      setMaterials(
        materialLinks
          .filter((link) => link.materials)
          .map((link) => {
            const m = link.materials as unknown as { id: string; name: string; unit: string | null };
            return {
              id: m.id,
              name: m.name,
              unit: m.unit,
            };
          })
      );
    }

    // Load private notes
    const { data: notesData } = await supabase
      .from('private_notes')
      .select('id, note, created_at, tenant_id')
      .eq('professional_id', professionalId)
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
  }, [professionalId, supabase]);

  useEffect(() => {
    loadProfessional();
  }, [loadProfessional]);

  const openEditModal = () => {
    if (!professional) return;
    setEditData({
      businessName: professional.businessName,
      primarySpecialty: professional.primarySpecialty,
      primaryFirstName: professional.primaryFirstName || '',
      primaryLastName: professional.primaryLastName || '',
      primaryPhone: professional.primaryPhone || '',
      primaryEmail: professional.primaryEmail || '',
      secondaryFirstName: professional.secondaryFirstName || '',
      secondaryLastName: professional.secondaryLastName || '',
      secondaryPhone: professional.secondaryPhone || '',
      secondaryEmail: professional.secondaryEmail || '',
      businessAddressLine1: professional.businessAddressLine1 || '',
      businessAddressLine2: professional.businessAddressLine2 || '',
      businessCity: professional.businessCity || '',
      businessState: professional.businessState || '',
      businessPostalCode: professional.businessPostalCode || '',
      businessCountry: professional.businessCountry || 'US',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const saveProfessional = async () => {
    if (!editData.businessName.trim() || !editData.primarySpecialty.trim()) {
      setEditError('Business name and primary specialty are required.');
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
      .from('professionals')
      .update({
        business_name: editData.businessName.trim(),
        primary_specialty: editData.primarySpecialty.trim(),
        primary_first_name: editData.primaryFirstName.trim() || null,
        primary_last_name: editData.primaryLastName.trim() || null,
        primary_phone: editData.primaryPhone.trim() || null,
        primary_email: editData.primaryEmail.trim() || null,
        secondary_first_name: editData.secondaryFirstName.trim() || null,
        secondary_last_name: editData.secondaryLastName.trim() || null,
        secondary_phone: editData.secondaryPhone.trim() || null,
        secondary_email: editData.secondaryEmail.trim() || null,
        business_address_line1: editData.businessAddressLine1.trim() || null,
        business_address_line2: editData.businessAddressLine2.trim() || null,
        business_city: editData.businessCity.trim() || null,
        business_state: editData.businessState.trim() || null,
        business_postal_code: editData.businessPostalCode.trim() || null,
        business_country: editData.businessCountry.trim() || 'US',
      })
      .eq('id', professionalId);

    if (error) {
      setEditError('Failed to update professional. Please try again.');
    } else {
      setShowEditModal(false);
      loadProfessional();
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
      .insert({ tenant_id: profile.tenant_id, note, professional_id: professionalId })
      .select('id, note, created_at, tenant_id')
      .single();

    if (newNote) {
      setNotes((prev) => [
        { id: newNote.id, note: newNote.note, createdAt: newNote.created_at, tenantId: newNote.tenant_id },
        ...prev,
      ]);
    }
  };

  if (!isValidUUID(professionalId)) return <p className="text-muted text-sm">Professional not found.</p>;
  if (loading) return <p className="text-muted text-sm">Loading...</p>;
  if (!professional) return <p className="text-muted text-sm">Professional not found.</p>;

  return (
    <div>
      <button
        onClick={() => router.push('/professionals')}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Professionals
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Professional Info Card */}
        <div className="bg-card-bg rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">{professional.businessName}</h1>
            <button
              onClick={openEditModal}
              className="text-xs px-3 py-1 border border-border rounded hover:bg-primary-bg transition-colors"
            >
              Edit
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-foreground">Specialty</p>
              <p className="text-muted">{professional.primarySpecialty}</p>
            </div>

            {(professional.primaryFirstName || professional.primaryLastName) && (
              <div>
                <p className="font-medium text-foreground">Primary Contact</p>
                <p className="text-muted">
                  {[professional.primaryFirstName, professional.primaryLastName].filter(Boolean).join(' ')}
                </p>
                {professional.primaryEmail && <p className="text-muted">{professional.primaryEmail}</p>}
                {professional.primaryPhone && <p className="text-muted">{professional.primaryPhone}</p>}
              </div>
            )}

            {(professional.secondaryFirstName || professional.secondaryLastName) && (
              <div>
                <p className="font-medium text-foreground">Secondary Contact</p>
                <p className="text-muted">
                  {[professional.secondaryFirstName, professional.secondaryLastName].filter(Boolean).join(' ')}
                </p>
                {professional.secondaryEmail && <p className="text-muted">{professional.secondaryEmail}</p>}
                {professional.secondaryPhone && <p className="text-muted">{professional.secondaryPhone}</p>}
              </div>
            )}

            {professional.businessAddressLine1 && (
              <div>
                <p className="font-medium text-foreground">Business Address</p>
                <p className="text-muted">{professional.businessAddressLine1}</p>
                {professional.businessAddressLine2 && <p className="text-muted">{professional.businessAddressLine2}</p>}
                <p className="text-muted">
                  {[professional.businessCity, professional.businessState].filter(Boolean).join(', ')}{' '}
                  {professional.businessPostalCode}
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

        {/* Clients & Materials */}
        <div className="md:col-span-2 space-y-8">
          {/* Clients */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Clients</h2>
            {clients.length === 0 ? (
              <p className="text-sm text-muted italic">No clients linked yet.</p>
            ) : (
              <div className="space-y-2">
                {clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="block bg-card-bg rounded-lg border border-border p-4 hover:bg-primary-bg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {client.primaryFirstName} {client.primaryLastName}
                        </p>
                        {client.primaryEmail && (
                          <p className="text-sm text-muted">{client.primaryEmail}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Materials */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Materials</h2>
            {materials.length === 0 ? (
              <p className="text-sm text-muted italic">No materials linked yet.</p>
            ) : (
              <div className="space-y-2">
                {materials.map((material) => (
                  <Link
                    key={material.id}
                    href={`/materials/${material.id}`}
                    className="block bg-card-bg rounded-lg border border-border p-4 hover:bg-primary-bg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{material.name}</p>
                      {material.unit && (
                        <span className="text-xs text-muted bg-background px-2 py-1 rounded-full">
                          {material.unit}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Professional Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Professional" maxWidth="max-w-2xl">
        <div className="space-y-4">
          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {editError}
            </div>
          )}

          <h3 className="text-sm font-semibold text-foreground">Business Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Business Name <span className="text-danger">*</span>
              </label>
              <input
                value={editData.businessName}
                onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                maxLength={200}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Primary Specialty <span className="text-danger">*</span>
              </label>
              <input
                value={editData.primarySpecialty}
                onChange={(e) => setEditData({ ...editData, primarySpecialty: e.target.value })}
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

          <h3 className="text-sm font-semibold text-foreground pt-2">Business Address</h3>
          <div className="space-y-3">
            <input
              placeholder="Address Line 1"
              aria-label="Address Line 1"
              value={editData.businessAddressLine1}
              onChange={(e) => setEditData({ ...editData, businessAddressLine1: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              placeholder="Address Line 2"
              aria-label="Address Line 2"
              value={editData.businessAddressLine2}
              onChange={(e) => setEditData({ ...editData, businessAddressLine2: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="City"
                aria-label="City"
                value={editData.businessCity}
                onChange={(e) => setEditData({ ...editData, businessCity: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="State"
                aria-label="State"
                value={editData.businessState}
                onChange={(e) => setEditData({ ...editData, businessState: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="ZIP"
                aria-label="ZIP"
                value={editData.businessPostalCode}
                onChange={(e) => setEditData({ ...editData, businessPostalCode: e.target.value })}
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
              onClick={saveProfessional}
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
