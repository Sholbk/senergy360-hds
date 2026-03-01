'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchBox from '@/components/ui/SearchBox';
import Modal from '@/components/ui/Modal';
import { PHONE_REGEX } from '@/lib/utils';
import Link from 'next/link';

interface ClientRow {
  id: string;
  primaryFirstName: string;
  primaryLastName: string;
  primaryPhone: string | null;
  primaryEmail: string | null;
  billingCity: string | null;
  billingState: string | null;
  projectCount: number;
}

export default function ClientsPage() {
  const [supabase] = useState(() => createClient());
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
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
  const [phoneError, setPhoneError] = useState('');

  const loadClients = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('clients')
      .select('id, primary_first_name, primary_last_name, primary_phone, primary_email, billing_city, billing_state, projects(id)')
      .order('created_at', { ascending: false });

    if (data) {
      setClients(
        data.map((d) => ({
          id: d.id,
          primaryFirstName: d.primary_first_name,
          primaryLastName: d.primary_last_name,
          primaryPhone: d.primary_phone,
          primaryEmail: d.primary_email,
          billingCity: d.billing_city,
          billingState: d.billing_state,
          projectCount: Array.isArray(d.projects) ? d.projects.length : 0,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredClients = search.trim()
    ? clients.filter((c) => {
        const term = search.toLowerCase();
        return (
          `${c.primaryFirstName} ${c.primaryLastName}`.toLowerCase().includes(term) ||
          (c.primaryEmail && c.primaryEmail.toLowerCase().includes(term)) ||
          (c.primaryPhone && c.primaryPhone.toLowerCase().includes(term)) ||
          (c.billingCity && c.billingCity.toLowerCase().includes(term)) ||
          (c.billingState && c.billingState.toLowerCase().includes(term))
        );
      })
    : clients;

  const handleSave = async () => {
    if (!formData.primaryFirstName.trim() || !formData.primaryLastName.trim()) return;

    if (formData.primaryPhone && !PHONE_REGEX.test(formData.primaryPhone)) {
      setPhoneError('Invalid phone number format');
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPhoneError('Could not load your profile. Please log out and log back in.');
      setSaving(false);
      return;
    }
    const { data: profile, error: profileError } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (profileError || !profile) {
      setPhoneError('Could not load your profile. Please log out and log back in.');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('clients').insert({
      tenant_id: profile.tenant_id,
      primary_first_name: formData.primaryFirstName.trim(),
      primary_last_name: formData.primaryLastName.trim(),
      primary_phone: formData.primaryPhone.trim() || null,
      primary_email: formData.primaryEmail.trim() || null,
      secondary_first_name: formData.secondaryFirstName.trim() || null,
      secondary_last_name: formData.secondaryLastName.trim() || null,
      secondary_phone: formData.secondaryPhone.trim() || null,
      secondary_email: formData.secondaryEmail.trim() || null,
      billing_address_line1: formData.billingAddressLine1.trim() || null,
      billing_address_line2: formData.billingAddressLine2.trim() || null,
      billing_city: formData.billingCity.trim() || null,
      billing_state: formData.billingState.trim() || null,
      billing_postal_code: formData.billingPostalCode.trim() || null,
      billing_country: formData.billingCountry.trim() || 'US',
    });

    if (error) {
      setPhoneError('Failed to add client. Please try again.');
    } else {
      setShowAddModal(false);
      resetForm();
      loadClients();
    }
    setSaving(false);
  };

  const resetForm = () => {
    setFormData({
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
    setPhoneError('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
        >
          + New Client
        </button>
      </div>

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search clients..."
        className="mb-4"
      />

      {loading ? (
        <p className="text-muted text-sm">Loading clients...</p>
      ) : filteredClients.length === 0 ? (
        <p className="text-muted text-sm italic">No clients found.</p>
      ) : (
        <div className="space-y-2">
          {filteredClients.map((client) => (
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
                  {(client.billingCity || client.billingState) && (
                    <p className="text-sm text-muted">
                      {[client.billingCity, client.billingState].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {client.primaryEmail && (
                    <p className="text-sm text-muted">{client.primaryEmail}</p>
                  )}
                </div>
                <span className="text-xs text-muted bg-background px-2 py-1 rounded-full">
                  {client.projectCount} project{client.projectCount !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Client" maxWidth="max-w-2xl">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Primary Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                value={formData.primaryFirstName}
                onChange={(e) => setFormData({ ...formData, primaryFirstName: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name <span className="text-danger">*</span>
              </label>
              <input
                value={formData.primaryLastName}
                onChange={(e) => setFormData({ ...formData, primaryLastName: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                value={formData.primaryPhone}
                onChange={(e) => {
                  setFormData({ ...formData, primaryPhone: e.target.value });
                  setPhoneError('');
                }}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {phoneError && <p className="text-xs text-danger mt-1">{phoneError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={formData.primaryEmail}
                onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
                type="email"
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground pt-2">Secondary Contact (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                value={formData.secondaryFirstName}
                onChange={(e) => setFormData({ ...formData, secondaryFirstName: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                value={formData.secondaryLastName}
                onChange={(e) => setFormData({ ...formData, secondaryLastName: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground pt-2">Billing Address (Optional)</h3>
          <div className="space-y-3">
            <input
              placeholder="Address Line 1"
              value={formData.billingAddressLine1}
              onChange={(e) => setFormData({ ...formData, billingAddressLine1: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              placeholder="Address Line 2"
              value={formData.billingAddressLine2}
              onChange={(e) => setFormData({ ...formData, billingAddressLine2: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="City"
                value={formData.billingCity}
                onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="State"
                value={formData.billingState}
                onChange={(e) => setFormData({ ...formData, billingState: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="ZIP"
                value={formData.billingPostalCode}
                onChange={(e) => setFormData({ ...formData, billingPostalCode: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.primaryFirstName.trim() || !formData.primaryLastName.trim() || saving}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Client'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
