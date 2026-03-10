'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchBox from '@/components/ui/SearchBox';
import Modal from '@/components/ui/Modal';
import { PHONE_REGEX, isValidEmail } from '@/lib/utils';
import Link from 'next/link';

interface OrganizationRow {
  id: string;
  orgType: string;
  businessName: string | null;
  specialty: string | null;
  primaryFirstName: string;
  primaryLastName: string;
  primaryPhone: string | null;
  primaryEmail: string | null;
  city: string | null;
  state: string | null;
}

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

const FILTER_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Property Owners', value: 'property_owner' },
  { label: 'Architects', value: 'architect' },
  { label: 'General Contractors', value: 'general_contractor' },
  { label: 'Trades', value: 'trade' },
];

const INITIAL_FORM_DATA = {
  orgType: '',
  businessName: '',
  specialty: '',
  primaryFirstName: '',
  primaryLastName: '',
  primaryPhone: '',
  primaryEmail: '',
  secondaryFirstName: '',
  secondaryLastName: '',
  secondaryPhone: '',
  secondaryEmail: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
};

export default function OrganizationsPage() {
  const [supabase] = useState(() => createClient());
  const [organizations, setOrganizations] = useState<OrganizationRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_FORM_DATA });
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleteOrgName, setDeleteOrgName] = useState('');

  const loadOrganizations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('organizations')
      .select('id, org_type, business_name, specialty, primary_first_name, primary_last_name, primary_phone, primary_email, city, state, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (data) {
      setOrganizations(
        data.map((d) => ({
          id: d.id,
          orgType: d.org_type,
          businessName: d.business_name,
          specialty: d.specialty,
          primaryFirstName: d.primary_first_name,
          primaryLastName: d.primary_last_name,
          primaryPhone: d.primary_phone,
          primaryEmail: d.primary_email,
          city: d.city,
          state: d.state,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrganizations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredOrganizations = organizations
    .filter((org) => activeTab === 'all' || org.orgType === activeTab)
    .filter((org) => {
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const displayName = org.businessName || `${org.primaryFirstName} ${org.primaryLastName}`;
      return (
        displayName.toLowerCase().includes(term) ||
        `${org.primaryFirstName} ${org.primaryLastName}`.toLowerCase().includes(term) ||
        (org.primaryEmail && org.primaryEmail.toLowerCase().includes(term)) ||
        (org.city && org.city.toLowerCase().includes(term)) ||
        (org.state && org.state.toLowerCase().includes(term)) ||
        (org.specialty && org.specialty.toLowerCase().includes(term))
      );
    });

  const handleSave = async () => {
    if (!formData.orgType) {
      setFormError('Organization type is required.');
      return;
    }
    if (!formData.primaryFirstName.trim() || !formData.primaryLastName.trim()) {
      setFormError('First Name and Last Name are required.');
      return;
    }
    if (formData.primaryPhone && !PHONE_REGEX.test(formData.primaryPhone)) {
      setFormError('Invalid phone number format.');
      return;
    }
    if (formData.primaryEmail && !isValidEmail(formData.primaryEmail)) {
      setFormError('Invalid email format.');
      return;
    }
    if (formData.secondaryPhone && !PHONE_REGEX.test(formData.secondaryPhone)) {
      setFormError('Invalid secondary phone number format.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('organizations').insert({
      org_type: formData.orgType,
      business_name: formData.businessName.trim() || null,
      specialty: formData.specialty.trim() || null,
      primary_first_name: formData.primaryFirstName.trim(),
      primary_last_name: formData.primaryLastName.trim(),
      primary_phone: formData.primaryPhone.trim() || null,
      primary_email: formData.primaryEmail.trim() || null,
      secondary_first_name: formData.secondaryFirstName.trim() || null,
      secondary_last_name: formData.secondaryLastName.trim() || null,
      secondary_phone: formData.secondaryPhone.trim() || null,
      secondary_email: formData.secondaryEmail.trim() || null,
      address_line1: formData.addressLine1.trim() || null,
      address_line2: formData.addressLine2.trim() || null,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      postal_code: formData.postalCode.trim() || null,
    });

    if (error) {
      setFormError(error.message);
    } else {
      setShowAddModal(false);
      resetForm();
      loadOrganizations();
    }
    setSaving(false);
  };

  const resetForm = () => {
    setFormData({ ...INITIAL_FORM_DATA });
    setFormError('');
  };

  const handleDelete = async (orgId: string) => {
    const { error } = await supabase
      .from('organizations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', orgId);
    if (!error) {
      setShowDeleteModal(null);
      loadOrganizations();
    }
  };

  const getDisplayName = (org: OrganizationRow) =>
    org.businessName || `${org.primaryFirstName} ${org.primaryLastName}`;

  const showSpecialtyField = formData.orgType === 'trade' || formData.orgType === 'other';
  const showBusinessNameRequired = formData.orgType !== '' && formData.orgType !== 'property_owner';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
        >
          + New Organization
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.value
                ? 'bg-primary text-white'
                : 'bg-card-bg border border-border text-muted hover:text-foreground hover:bg-primary-bg'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search organizations..."
        className="mb-4"
      />

      {loading ? (
        <p className="text-muted text-sm">Loading organizations...</p>
      ) : filteredOrganizations.length === 0 ? (
        <p className="text-muted text-sm italic">No organizations found.</p>
      ) : (
        <div className="space-y-2">
          {filteredOrganizations.map((org) => (
            <div
              key={org.id}
              className="bg-card-bg rounded-lg border border-border p-4 hover:bg-primary-bg transition-colors flex items-center justify-between"
            >
              <Link
                href={`/organizations/${org.id}`}
                className="flex-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{getDisplayName(org)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORG_TYPE_COLORS[org.orgType] || 'bg-gray-100 text-gray-700'}`}>
                        {ORG_TYPE_LABELS[org.orgType] || org.orgType}
                      </span>
                    </div>
                    {(org.city || org.state) && (
                      <p className="text-sm text-muted">
                        {[org.city, org.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {org.primaryEmail && (
                      <p className="text-sm text-muted">{org.primaryEmail}</p>
                    )}
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteOrgName(getDisplayName(org));
                  setShowDeleteModal(org.id);
                }}
                className="ml-3 p-2 text-muted hover:text-red-500 transition-colors"
                title="Delete organization"
              >
                <svg className="w-4 h-4" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Organization Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormError(''); }} title="New Organization" maxWidth="max-w-2xl">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}

          <h3 className="text-sm font-semibold text-foreground">Organization Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Org Type <span className="text-danger">*</span>
              </label>
              <select
                value={formData.orgType}
                onChange={(e) => {
                  setFormData({ ...formData, orgType: e.target.value });
                  setFormError('');
                }}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card-bg"
                required
              >
                <option value="">Select type...</option>
                <option value="property_owner">Property Owner</option>
                <option value="architect">Architect</option>
                <option value="general_contractor">General Contractor</option>
                <option value="trade">Trade</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Business Name {showBusinessNameRequired && <span className="text-danger">*</span>}
                {formData.orgType === 'property_owner' && <span className="text-muted text-xs ml-1">(Optional)</span>}
              </label>
              <input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                maxLength={200}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {showSpecialtyField && (
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Specialty</label>
                <input
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          <h3 className="text-sm font-semibold text-foreground pt-2">Primary Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                value={formData.primaryFirstName}
                onChange={(e) => setFormData({ ...formData, primaryFirstName: e.target.value })}
                maxLength={100}
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
                maxLength={100}
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
                  setFormError('');
                }}
                maxLength={20}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={formData.primaryEmail}
                onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
                type="email"
                maxLength={254}
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
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                value={formData.secondaryLastName}
                onChange={(e) => setFormData({ ...formData, secondaryLastName: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                maxLength={20}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={formData.secondaryEmail}
                onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                type="email"
                maxLength={254}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground pt-2">Address (Optional)</h3>
          <div className="space-y-3">
            <input
              placeholder="Address Line 1"
              aria-label="Address Line 1"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              placeholder="Address Line 2"
              aria-label="Address Line 2"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="City"
                aria-label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="State"
                aria-label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="ZIP"
                aria-label="ZIP"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                maxLength={20}
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
              disabled={!formData.orgType || !formData.primaryFirstName.trim() || !formData.primaryLastName.trim() || saving}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Organization'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!showDeleteModal} onClose={() => setShowDeleteModal(null)} title="Delete Organization">
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Are you sure you want to delete <strong>{deleteOrgName}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteModal(null)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => showDeleteModal && handleDelete(showDeleteModal)}
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
