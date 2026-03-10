'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface MaterialOption {
  id: string;
  name: string;
}

interface ProfessionalOption {
  id: string;
  businessName: string;
  contactName: string;
}

interface ManualEntryFormData {
  category: string;
  materialId: string;
  professionalId: string;
  warrantyInfo: string;
  warrantyExpiry: string;
  contactInfo: string;
  notes: string;
}

interface ManualEntryFormProps {
  projectId: string;
  initialData?: ManualEntryFormData;
  onSubmit: (data: ManualEntryFormData) => void;
  onCancel: () => void;
}

export default function ManualEntryForm({
  projectId,
  initialData,
  onSubmit,
  onCancel,
}: ManualEntryFormProps) {
  const [supabase] = useState(() => createClient());
  const [materials, setMaterials] = useState<MaterialOption[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([]);

  const [category, setCategory] = useState(initialData?.category || '');
  const [materialId, setMaterialId] = useState(initialData?.materialId || '');
  const [professionalId, setProfessionalId] = useState(initialData?.professionalId || '');
  const [warrantyInfo, setWarrantyInfo] = useState(initialData?.warrantyInfo || '');
  const [warrantyExpiry, setWarrantyExpiry] = useState(initialData?.warrantyExpiry || '');
  const [contactInfo, setContactInfo] = useState(initialData?.contactInfo || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  useEffect(() => {
    // Load materials
    supabase
      .from('materials')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) {
          setMaterials(data.map((m) => ({ id: m.id, name: m.name })));
        }
      });

    // Load professionals assigned to this project
    supabase
      .from('project_professionals')
      .select('professional_id, professionals(business_name, primary_first_name, primary_last_name)')
      .eq('project_id', projectId)
      .then(({ data }) => {
        if (data) {
          setProfessionals(
            data.map((pp) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const prof = pp.professionals as any;
              return {
                id: pp.professional_id,
                businessName: prof?.business_name || '',
                contactName: `${prof?.primary_first_name || ''} ${prof?.primary_last_name || ''}`.trim(),
              };
            })
          );
        }
      });
  }, [projectId, supabase]);

  const handleSubmit = () => {
    if (!category.trim()) return;
    onSubmit({
      category,
      materialId,
      professionalId,
      warrantyInfo,
      warrantyExpiry,
      contactInfo,
      notes,
    });
  };

  const inputClass =
    'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          maxLength={200}
          placeholder="e.g., HVAC, Plumbing, Electrical, Roofing..."
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Material</label>
        <select
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          className={inputClass}
        >
          <option value="">None</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Professional</label>
        <select
          value={professionalId}
          onChange={(e) => setProfessionalId(e.target.value)}
          className={inputClass}
        >
          <option value="">None</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.businessName}{p.contactName ? ` (${p.contactName})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Warranty Info</label>
        <textarea
          value={warrantyInfo}
          onChange={(e) => setWarrantyInfo(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Warranty details, coverage, terms..."
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Warranty Expiry Date</label>
        <input
          type="date"
          value={warrantyExpiry}
          onChange={(e) => setWarrantyExpiry(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Contact Info</label>
        <textarea
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="Additional contact information..."
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Additional notes..."
          className={inputClass}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!category.trim()}
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {initialData ? 'Save Changes' : 'Add Entry'}
        </button>
      </div>
    </div>
  );
}
