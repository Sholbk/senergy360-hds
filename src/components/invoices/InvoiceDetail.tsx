'use client';

import { useState } from 'react';
import { formatCents, dollarsToCents } from '@/lib/stripe';
import { updateInvoiceAction } from '@/app/(protected)/invoices/actions';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  lineType: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  status: string;
  totalCents: number;
  subtotalCents: number;
  taxCents: number;
  dueDate: string | null;
  createdAt: string;
  notes: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  projectName: string | null;
  lineItems: LineItem[];
}

interface InvoiceDetailProps {
  invoice: InvoiceData;
  isAdmin: boolean;
  onUpdateStatus: (status: string) => void;
  onReload: () => void;
}

interface EditLineItem {
  description: string;
  quantity: number;
  unitPrice: string;
  lineType: string;
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  sent: 'bg-blue-50 text-blue-700 border-blue-300',
  paid: 'bg-green-50 text-green-700 border-green-300',
  overdue: 'bg-red-50 text-red-700 border-red-300',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-300 line-through',
};

const LINE_TYPE_LABELS: Record<string, string> = {
  hds: 'Service',
  inspection: 'Service',
  hourly: 'Labor',
  custom: 'Custom',
};

const LINE_TYPES = [
  { value: 'hds', label: 'Service' },
  { value: 'hourly', label: 'Labor' },
  { value: 'custom', label: 'Custom' },
];

function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default function InvoiceDetail({
  invoice,
  isAdmin,
  onUpdateStatus,
  onReload,
}: InvoiceDetailProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Edit state
  const [editItems, setEditItems] = useState<EditLineItem[]>([]);
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const discountCents = 0;

  const startEditing = () => {
    setEditItems(
      invoice.lineItems.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        unitPrice: centsToDisplay(li.unitPriceCents),
        lineType: li.lineType,
      }))
    );
    setEditDueDate(invoice.dueDate || '');
    setEditNotes(invoice.notes || '');
    setError('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError('');
  };

  const updateItem = (index: number, field: keyof EditLineItem, value: string | number) => {
    setEditItems((prev) =>
      prev.map((li, i) => (i === index ? { ...li, [field]: value } : li))
    );
  };

  const addItem = () => {
    setEditItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: '', lineType: 'custom' }]);
  };

  const removeItem = (index: number) => {
    if (editItems.length <= 1) return;
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  };

  const editSubtotal = editItems.reduce((sum, li) => {
    return sum + (li.quantity * (parseFloat(li.unitPrice) || 0));
  }, 0);

  const saveEdits = async () => {
    const validItems = editItems.filter((li) => li.description.trim() && li.unitPrice);
    if (validItems.length === 0) {
      setError('Add at least one line item with a description and price.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const result = await updateInvoiceAction({
        invoiceId: invoice.id,
        lineItems: validItems.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPriceCents: dollarsToCents(parseFloat(li.unitPrice) || 0),
          lineType: li.lineType,
        })),
        dueDate: editDueDate || undefined,
        notes: editNotes || undefined,
      });

      if (result.error) {
        setError(result.error);
        setSaving(false);
        return;
      }

      setEditing(false);
      setSaving(false);
      onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── Company Header ── */}
      <div className="bg-card-bg rounded-t-lg border border-border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-lg">S</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Senergy360, LLC.</h2>
              <p className="text-sm text-muted">Brian Johnson &bull; +19516343588</p>
              <p className="text-sm text-muted">Tucson, Arizona, 85739 &bull; License Number: ROC 341823</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">Invoice</p>
            <p className="text-sm text-muted">
              {invoice.clientName || 'Client Details'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Invoice Meta Row ── */}
      <div className="bg-card-bg border-x border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-sm text-muted">Invoice</span>
            <span className="text-sm font-semibold text-foreground ml-2">{invoice.invoiceNumber}</span>
          </div>
          {invoice.projectName && (
            <div className="text-sm text-muted">
              <span>Project:</span>
              <span className="text-foreground ml-1">{invoice.projectName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-muted">Date</p>
            <p className="text-sm font-medium text-foreground">
              {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          {editing ? (
            <div className="text-right">
              <p className="text-xs text-muted">Due Date</p>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="px-2 py-1 border border-border rounded text-sm bg-card-bg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ) : invoice.dueDate ? (
            <div className="text-right">
              <p className="text-xs text-muted">Due Date</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ) : null}
          <span
            className={`inline-block px-3 py-1 text-xs rounded-full font-medium border ${
              STATUS_BADGE[invoice.status] || 'bg-gray-100 text-gray-600 border-gray-300'
            }`}
          >
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </div>
      </div>

      {/* ── Bill To ── */}
      <div className="bg-card-bg border-x border-border px-6 py-4 border-t border-border">
        <p className="text-xs text-muted uppercase tracking-wide mb-1">Bill To</p>
        <p className="text-sm font-medium text-foreground">{invoice.clientName}</p>
        {invoice.clientEmail && (
          <p className="text-xs text-muted">{invoice.clientEmail}</p>
        )}
        {invoice.clientPhone && (
          <p className="text-xs text-muted">{invoice.clientPhone}</p>
        )}
      </div>

      {error && (
        <div className="bg-card-bg border-x border-border px-6 py-3">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* ── Items Table ── */}
      <div className="bg-card-bg border-x border-border">
        <div className="px-6 py-3 border-t border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Items</h3>
          {isAdmin && !editing && (
            <button
              onClick={startEditing}
              className="text-xs text-primary hover:text-primary-dark transition-colors font-medium"
            >
              Edit Invoice
            </button>
          )}
          {editing && (
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEditing}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdits}
                disabled={saving}
                className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent-dark transition-colors disabled:opacity-50 font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-border bg-background">
                <th className="text-center py-2.5 px-3 font-medium text-muted w-12">#</th>
                <th className="text-left py-2.5 px-3 font-medium text-muted">Item</th>
                <th className="text-left py-2.5 px-3 font-medium text-muted w-24">Type</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted w-28">Unit Price</th>
                <th className="text-center py-2.5 px-3 font-medium text-muted w-16">Qty</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted w-28">Total</th>
                {editing && <th className="w-8"></th>}
              </tr>
            </thead>
            <tbody>
              {editing ? (
                <>
                  {editItems.map((li, index) => (
                    <tr key={index} className="border-b border-border group">
                      <td className="py-2 px-3 text-center text-muted">{index + 1}</td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={li.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full px-2 py-1.5 text-sm border border-border rounded focus:border-primary focus:outline-none bg-card-bg"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={li.lineType}
                          onChange={(e) => updateItem(index, 'lineType', e.target.value)}
                          className="w-full px-1 py-1.5 text-sm border border-border rounded focus:border-primary focus:outline-none bg-card-bg"
                        >
                          {LINE_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={li.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 text-sm text-right border border-border rounded focus:border-primary focus:outline-none bg-card-bg"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={li.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          min={1}
                          className="w-full px-2 py-1.5 text-sm text-center border border-border rounded focus:border-primary focus:outline-none bg-card-bg"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-foreground">
                        ${(li.quantity * (parseFloat(li.unitPrice) || 0)).toFixed(2)}
                      </td>
                      <td className="py-2 px-1">
                        {editItems.length > 1 && (
                          <button
                            onClick={() => removeItem(index)}
                            className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all p-1"
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
                  <tr className="border-b border-border bg-background/50">
                    <td className="py-2 px-3"></td>
                    <td className="py-2 px-2" colSpan={editing ? 6 : 5}>
                      <button
                        onClick={addItem}
                        className="text-xs text-primary hover:text-primary-dark transition-colors font-medium"
                      >
                        + Add Item
                      </button>
                    </td>
                  </tr>
                </>
              ) : (
                invoice.lineItems.map((li, index) => (
                  <tr key={li.id} className="border-b border-border hover:bg-primary-bg/20 transition-colors">
                    <td className="py-3 px-3 text-center text-muted">{index + 1}</td>
                    <td className="py-3 px-3">
                      <p className="text-foreground font-medium">{li.description}</p>
                    </td>
                    <td className="py-3 px-3 text-muted">
                      {LINE_TYPE_LABELS[li.lineType] || li.lineType}
                    </td>
                    <td className="py-3 px-3 text-right text-foreground">
                      {formatCents(li.unitPriceCents)}
                    </td>
                    <td className="py-3 px-3 text-center text-foreground">{li.quantity}</td>
                    <td className="py-3 px-3 text-right text-foreground font-medium">
                      {formatCents(li.lineTotalCents)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Totals ── */}
      <div className="bg-card-bg border-x border-border px-6 py-4 border-t border-border">
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-foreground font-medium">
                {editing ? `$${editSubtotal.toFixed(2)}` : formatCents(invoice.subtotalCents)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Discount</span>
              <span className="text-foreground">{formatCents(discountCents)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Tax</span>
              <span className="text-foreground">{formatCents(invoice.taxCents)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-2">
              <span className="text-foreground">Total</span>
              <span className="text-foreground text-base">
                {editing ? `$${editSubtotal.toFixed(2)}` : formatCents(invoice.totalCents)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      {editing ? (
        <div className="bg-card-bg border-x border-border px-6 py-4 border-t border-border">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Notes</p>
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Optional notes..."
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          />
        </div>
      ) : invoice.notes ? (
        <div className="bg-card-bg border-x border-border px-6 py-4 border-t border-border">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Notes</p>
          <p className="text-sm text-muted whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      ) : null}

      {/* ── Bottom border ── */}
      <div className="bg-card-bg rounded-b-lg border border-t-0 border-border h-2" />

      {/* ── Action Buttons ── */}
      {!editing && (
        <div className="flex justify-center gap-3 mt-6">
          {isAdmin && invoice.status === 'draft' && (
            <>
              <button
                onClick={startEditing}
                className="px-5 py-2.5 text-sm border border-border text-foreground rounded-md hover:bg-background transition-colors font-medium"
              >
                Edit Invoice
              </button>
              <button
                onClick={() => onUpdateStatus('sent')}
                className="px-5 py-2.5 text-sm bg-accent text-white rounded-md hover:bg-accent-dark transition-colors font-medium"
              >
                Send Invoice
              </button>
            </>
          )}
          {isAdmin && (invoice.status === 'sent' || invoice.status === 'overdue') && (
            <button
              onClick={() => onUpdateStatus('paid')}
              className="px-5 py-2.5 text-sm bg-accent text-white rounded-md hover:bg-accent-dark transition-colors font-medium"
            >
              Mark as Paid
            </button>
          )}
          {isAdmin && invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
            <button
              onClick={() => onUpdateStatus('cancelled')}
              className="px-5 py-2.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Cancel Invoice
            </button>
          )}
          {!isAdmin && (invoice.status === 'sent' || invoice.status === 'overdue') && (
            <button
              onClick={() => {
                alert('Stripe checkout integration coming soon.');
              }}
              className="px-5 py-2.5 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-medium"
            >
              Pay Now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
