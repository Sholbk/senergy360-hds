'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createInvoiceAction } from '@/app/(protected)/invoices/actions';
import { dollarsToCents } from '@/lib/stripe';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: string; // stored as string for input, converted to cents on submit
  lineType: string;
}

interface ClientOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface InvoiceFormProps {
  clientId?: string;
  projectId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const LINE_TYPES = [
  { value: 'hds', label: 'HDS Service' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'custom', label: 'Custom' },
];

const emptyLineItem: LineItem = {
  description: '',
  quantity: 1,
  unitPrice: '',
  lineType: 'custom',
};

export default function InvoiceForm({
  clientId: initialClientId,
  projectId,
  onSuccess,
  onCancel,
}: InvoiceFormProps) {
  const [supabase] = useState(() => createClient());
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || '');
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...emptyLineItem }]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialClientId) {
      // Load clients for selector
      supabase
        .from('clients')
        .select('id, primary_first_name, primary_last_name')
        .order('primary_last_name')
        .then(({ data }) => {
          if (data) {
            setClients(
              data.map((c) => ({
                id: c.id,
                firstName: c.primary_first_name,
                lastName: c.primary_last_name,
              }))
            );
          }
        });
    }
  }, [initialClientId, supabase]);

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((li, i) => (i === index ? { ...li, [field]: value } : li))
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { ...emptyLineItem }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateLineTotal = (li: LineItem): number => {
    const price = parseFloat(li.unitPrice) || 0;
    return li.quantity * price;
  };

  const subtotal = lineItems.reduce((sum, li) => sum + calculateLineTotal(li), 0);

  const handleSubmit = async () => {
    if (!selectedClientId) {
      setError('Please select a client.');
      return;
    }

    const validItems = lineItems.filter((li) => li.description.trim() && li.unitPrice);
    if (validItems.length === 0) {
      setError('Please add at least one line item with a description and price.');
      return;
    }

    setSaving(true);
    setError('');

    const result = await createInvoiceAction({
      clientId: selectedClientId,
      projectId,
      lineItems: validItems.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        unitPriceCents: dollarsToCents(parseFloat(li.unitPrice) || 0),
        lineType: li.lineType,
      })),
      dueDate: dueDate || undefined,
      notes: notes || undefined,
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    onSuccess();
  };

  const inputClass =
    'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Client selector (if not in project context) */}
      {!initialClientId && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Client</label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Line Items */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Line Items</label>
        <div className="space-y-3">
          {lineItems.map((li, index) => (
            <div key={index} className="flex items-start gap-2 p-3 border border-border rounded-md bg-background">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={li.description}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  placeholder="Description"
                  maxLength={500}
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <div className="w-20">
                    <input
                      type="number"
                      value={li.quantity}
                      onChange={(e) =>
                        updateLineItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                      }
                      min={1}
                      placeholder="Qty"
                      className={inputClass}
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      value={li.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="Unit Price ($)"
                      className={inputClass}
                    />
                  </div>
                  <div className="w-36">
                    <select
                      value={li.lineType}
                      onChange={(e) => updateLineItem(index, 'lineType', e.target.value)}
                      className={inputClass}
                    >
                      {LINE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24 flex items-center justify-end text-sm text-foreground font-medium">
                    ${calculateLineTotal(li).toFixed(2)}
                  </div>
                </div>
              </div>
              {lineItems.length > 1 && (
                <button
                  onClick={() => removeLineItem(index)}
                  className="mt-1 px-2 py-1 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addLineItem}
          className="mt-2 px-3 py-1 text-xs text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
        >
          + Add Line Item
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right text-sm font-medium text-foreground">
        Subtotal: ${subtotal.toFixed(2)}
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Optional notes for this invoice..."
          className={inputClass}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </div>
  );
}
