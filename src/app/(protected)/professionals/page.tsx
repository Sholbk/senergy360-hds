'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchBox from '@/components/ui/SearchBox';
import Modal from '@/components/ui/Modal';
import { PHONE_REGEX, isValidEmail } from '@/lib/utils';
import { createProfessionalAction } from './actions';
import Link from 'next/link';

interface ProfessionalRow {
  id: string;
  businessName: string;
  primarySpecialty: string;
  primaryFirstName: string;
  primaryLastName: string;
  primaryPhone: string | null;
  primaryEmail: string | null;
  businessCity: string | null;
  businessState: string | null;
  clientCount: number;
}

export default function ProfessionalsPage() {
  const [supabase] = useState(() => createClient());
  const [professionals, setProfessionals] = useState<ProfessionalRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
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
  const [formError, setFormError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleteProName, setDeleteProName] = useState('');

  const loadProfessionals = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('professionals')
      .select('id, business_name, primary_specialty, primary_first_name, primary_last_name, primary_phone, primary_email, business_city, business_state')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (data) {
      setProfessionals(
        data.map((d) => ({
          id: d.id,
          businessName: d.business_name,
          primarySpecialty: d.primary_specialty,
          primaryFirstName: d.primary_first_name,
          primaryLastName: d.primary_last_name,
          primaryPhone: d.primary_phone,
          primaryEmail: d.primary_email,
          businessCity: d.business_city,
          businessState: d.business_state,
          clientCount: 0,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfessionals();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProfessionals = search.trim()
    ? professionals.filter((p) => {
        const term = search.toLowerCase();
        return (
          p.businessName.toLowerCase().includes(term) ||
          p.primarySpecialty.toLowerCase().includes(term) ||
          `${p.primaryFirstName} ${p.primaryLastName}`.toLowerCase().includes(term) ||
          (p.businessCity && p.businessCity.toLowerCase().includes(term)) ||
          (p.businessState && p.businessState.toLowerCase().includes(term))
        );
      })
    : professionals;

  const handleSave = async () => {
    if (!formData.businessName.trim() || !formData.primarySpecialty.trim() || !formData.primaryFirstName.trim() || !formData.primaryLastName.trim()) {
      setFormError('Business Name, Primary Specialty, First Name, and Last Name are required.');
      return;
    }

    if (formData.primaryPhone && !PHONE_REGEX.test(formData.primaryPhone)) {
      setFormError('Invalid phone number format');
      return;
    }
    if (formData.primaryEmail && !isValidEmail(formData.primaryEmail)) {
      setFormError('Invalid email format');
      return;
    }
    if (formData.secondaryPhone && !PHONE_REGEX.test(formData.secondaryPhone)) {
      setFormError('Invalid secondary phone number format');
      return;
    }

    setSaving(true);
    const result = await createProfessionalAction(formData);

    if (result.error) {
      setFormError(result.error);
    } else {
      setShowAddModal(false);
      resetForm();
      loadProfessionals();
    }
    setSaving(false);
  };

  const resetForm = () => {
    setFormData({
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
    setFormError('');
  };

  const handleDelete = async (profId: string) => {
    const { error } = await supabase
      .from('professionals')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', profId);
    if (!error) {
      setShowDeleteModal(null);
      loadProfessionals();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Professionals</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
        >
          + New Professional
        </button>
      </div>

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search professionals..."
        className="mb-4"
      />

      {loading ? (
        <p className="text-muted text-sm">Loading professionals...</p>
      ) : filteredProfessionals.length === 0 ? (
        <p className="text-muted text-sm italic">No professionals found.</p>
      ) : (
        <div className="space-y-2">
          {filteredProfessionals.map((prof) => (
            <div
              key={prof.id}
              className="bg-card-bg rounded-lg border border-border p-4 hover:bg-primary-bg transition-colors flex items-center justify-between"
            >
              <Link
                href={`/professionals/${prof.id}`}
                className="flex-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{prof.businessName}</p>
                    <p className="text-sm text-muted">{prof.primarySpecialty}</p>
                    {(prof.primaryFirstName || prof.primaryLastName) && (
                      <p className="text-sm text-muted">
                        {[prof.primaryFirstName, prof.primaryLastName].filter(Boolean).join(' ')}
                      </p>
                    )}
                    {(prof.businessCity || prof.businessState) && (
                      <p className="text-sm text-muted">
                        {[prof.businessCity, prof.businessState].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteProName(prof.businessName);
                  setShowDeleteModal(prof.id);
                }}
                className="ml-3 p-2 text-muted hover:text-red-500 transition-colors"
                title="Delete professional"
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

      {/* Add Professional Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormError(''); }} title="New Professional" maxWidth="max-w-2xl">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}
          <h3 className="text-sm font-semibold text-foreground">Business Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Business Name <span className="text-danger">*</span>
              </label>
              <input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                maxLength={200}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Primary Specialty <span className="text-danger">*</span>
              </label>
              <input
                value={formData.primarySpecialty}
                onChange={(e) => setFormData({ ...formData, primarySpecialty: e.target.value })}
                maxLength={200}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground pt-2">Primary Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name <span className="text-danger">*</span></label>
              <input
                value={formData.primaryFirstName}
                onChange={(e) => setFormData({ ...formData, primaryFirstName: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name <span className="text-danger">*</span></label>
              <input
                value={formData.primaryLastName}
                onChange={(e) => setFormData({ ...formData, primaryLastName: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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

          <h3 className="text-sm font-semibold text-foreground pt-2">Business Address (Optional)</h3>
          <div className="space-y-3">
            <input
              placeholder="Address Line 1"
              aria-label="Address Line 1"
              value={formData.businessAddressLine1}
              onChange={(e) => setFormData({ ...formData, businessAddressLine1: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              placeholder="Address Line 2"
              aria-label="Address Line 2"
              value={formData.businessAddressLine2}
              onChange={(e) => setFormData({ ...formData, businessAddressLine2: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="City"
                aria-label="City"
                value={formData.businessCity}
                onChange={(e) => setFormData({ ...formData, businessCity: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="State"
                aria-label="State"
                value={formData.businessState}
                onChange={(e) => setFormData({ ...formData, businessState: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="ZIP"
                aria-label="ZIP"
                value={formData.businessPostalCode}
                onChange={(e) => setFormData({ ...formData, businessPostalCode: e.target.value })}
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
              disabled={!formData.businessName.trim() || !formData.primarySpecialty.trim() || !formData.primaryFirstName.trim() || !formData.primaryLastName.trim() || saving}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Professional'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!showDeleteModal} onClose={() => setShowDeleteModal(null)} title="Delete Professional">
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Are you sure you want to delete <strong>{deleteProName}</strong>? This action cannot be undone.
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
