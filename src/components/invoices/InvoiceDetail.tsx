'use client';

import { formatCents } from '@/lib/stripe';

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
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600 line-through',
};

const LINE_TYPE_LABELS: Record<string, string> = {
  hds: 'HDS Service',
  inspection: 'Inspection',
  hourly: 'Hourly',
  custom: 'Custom',
};

export default function InvoiceDetail({
  invoice,
  isAdmin,
  onUpdateStatus,
}: InvoiceDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card-bg rounded-lg border border-border p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{invoice.invoiceNumber}</h1>
            <span
              className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-medium ${
                STATUS_BADGE[invoice.status] || 'bg-gray-100 text-gray-600'
              }`}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
          <div className="text-right text-sm text-muted">
            <p>Created: {new Date(invoice.createdAt).toLocaleDateString()}</p>
            {invoice.dueDate && (
              <p>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Bill To</h2>
          <p className="text-sm text-foreground">{invoice.clientName}</p>
          {invoice.clientEmail && (
            <p className="text-xs text-muted">{invoice.clientEmail}</p>
          )}
          {invoice.clientPhone && (
            <p className="text-xs text-muted">{invoice.clientPhone}</p>
          )}
          {invoice.projectName && (
            <p className="text-xs text-muted mt-1">Project: {invoice.projectName}</p>
          )}
        </div>

        {/* Line Items Table */}
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted">Description</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Type</th>
                <th className="text-center py-3 px-4 font-medium text-muted">Qty</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Unit Price</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((li) => (
                <tr key={li.id} className="border-b border-border">
                  <td className="py-3 px-4 text-foreground">{li.description}</td>
                  <td className="py-3 px-4 text-muted">
                    {LINE_TYPE_LABELS[li.lineType] || li.lineType}
                  </td>
                  <td className="py-3 px-4 text-center text-foreground">{li.quantity}</td>
                  <td className="py-3 px-4 text-right text-foreground">
                    {formatCents(li.unitPriceCents)}
                  </td>
                  <td className="py-3 px-4 text-right text-foreground font-medium">
                    {formatCents(li.lineTotalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-foreground">{formatCents(invoice.subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Tax</span>
              <span className="text-foreground">{formatCents(invoice.taxCents)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-border pt-2">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatCents(invoice.totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 pt-4 border-t border-border">
            <h2 className="text-sm font-semibold text-foreground mb-1">Notes</h2>
            <p className="text-sm text-muted whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {isAdmin && invoice.status === 'draft' && (
          <button
            onClick={() => onUpdateStatus('sent')}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Send Invoice
          </button>
        )}
        {isAdmin && (invoice.status === 'sent' || invoice.status === 'overdue') && (
          <button
            onClick={() => onUpdateStatus('paid')}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Mark as Paid
          </button>
        )}
        {isAdmin && invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
          <button
            onClick={() => onUpdateStatus('cancelled')}
            className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            Cancel Invoice
          </button>
        )}
        {!isAdmin && (invoice.status === 'sent' || invoice.status === 'overdue') && (
          <button
            onClick={() => {
              // Placeholder for Stripe checkout integration
              alert('Stripe checkout integration coming soon.');
            }}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Pay Now
          </button>
        )}
      </div>
    </div>
  );
}
