'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createInvoiceAction } from '@/app/(protected)/invoices/actions';
import { dollarsToCents } from '@/lib/stripe';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: string;
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
  { value: 'hds', label: 'Service' },
  { value: 'inspection', label: 'Service' },
  { value: 'hourly', label: 'Labor' },
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

    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ── Company Header ── */}
      <div className="flex items-start justify-between pb-4 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-sm">S</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Senergy360, LLC.</h2>
            <p className="text-xs text-muted">Brian Johnson &bull; +19516343588</p>
            <p className="text-xs text-muted">Tucson, Arizona, 85739</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">New Invoice</p>
          <div className="flex items-center gap-3 mt-2">
            <div>
              <label className="text-[10px] text-muted block">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-2 py-1 border border-border rounded text-xs bg-card-bg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Client ── */}
      <div>
        <label className="text-xs text-muted uppercase tracking-wide block mb-1">Bill To</label>
        {!initialClientId ? (
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm font-medium text-foreground">
            {clients.find((c) => c.id === initialClientId)
              ? `${clients.find((c) => c.id === initialClientId)!.firstName} ${clients.find((c) => c.id === initialClientId)!.lastName}`
              : 'Project Client'}
          </p>
        )}
      </div>

      {/* ── Items Table ── */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Items</h3>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="text-center py-2 px-2 font-medium text-muted w-10">#</th>
                <th className="text-left py-2 px-2 font-medium text-muted">Item</th>
                <th className="text-left py-2 px-2 font-medium text-muted w-24">Type</th>
                <th className="text-right py-2 px-2 font-medium text-muted w-28">Unit Price</th>
                <th className="text-center py-2 px-2 font-medium text-muted w-16">Qty</th>
                <th className="text-right py-2 px-2 font-medium text-muted w-28">Total</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li, index) => (
                <tr key={index} className="border-b border-border group">
                  <td className="py-2 px-2 text-center text-muted">{index + 1}</td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={li.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      maxLength={500}
                      className="w-full px-2 py-1.5 text-sm border border-transparent rounded hover:border-border focus:border-primary focus:outline-none bg-transparent"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={li.lineType}
                      onChange={(e) => updateLineItem(index, 'lineType', e.target.value)}
                      className="w-full px-1 py-1.5 text-sm border border-transparent rounded hover:border-border focus:border-primary focus:outline-none bg-transparent"
                    >
                      {LINE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={li.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-2 py-1.5 text-sm text-right border border-transparent rounded hover:border-border focus:border-primary focus:outline-none bg-transparent"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={li.quantity}
                      onChange={(e) =>
                        updateLineItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                      }
                      min={1}
                      className="w-full px-2 py-1.5 text-sm text-center border border-transparent rounded hover:border-border focus:border-primary focus:outline-none bg-transparent"
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-medium text-foreground pr-3">
                    ${calculateLineTotal(li).toFixed(2)}
                  </td>
                  <td className="py-2 px-1">
                    {lineItems.length > 1 && (
                      <button
                        onClick={() => removeLineItem(index)}
                        className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all p-1"
                        title="Remove"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {/* Add Item Row */}
              <tr className="border-b border-border bg-background/50">
                <td className="py-2 px-2"></td>
                <td className="py-2 px-2" colSpan={6}>
                  <button
                    onClick={addLineItem}
                    className="text-xs text-primary hover:text-primary-dark transition-colors font-medium"
                  >
                    + Add Item
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Totals ── */}
      <div className="flex justify-end">
        <div className="w-72 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Discount</span>
            <span className="text-foreground">$0.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Tax</span>
            <span className="text-foreground">$0.00</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-1">
            <span className="text-foreground">Total</span>
            <span className="text-foreground text-base">${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      <div>
        <label className="text-xs text-muted uppercase tracking-wide block mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Optional notes..."
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 font-medium"
        >
          {saving ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </div>
  );
}
