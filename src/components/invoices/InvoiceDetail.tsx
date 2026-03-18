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

export default function InvoiceDetail({
  invoice,
  isAdmin,
  onUpdateStatus,
}: InvoiceDetailProps) {
  const discountCents = 0;

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
          {invoice.dueDate && (
            <div className="text-right">
              <p className="text-xs text-muted">Due Date</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
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

      {/* ── Items Table ── */}
      <div className="bg-card-bg border-x border-border">
        <div className="px-6 py-3 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground">Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-border bg-background">
                <th className="text-center py-2.5 px-3 font-medium text-muted w-12">#</th>
                <th className="text-left py-2.5 px-3 font-medium text-muted">Item</th>
                <th className="text-left py-2.5 px-3 font-medium text-muted w-24">Type</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted w-24">Unit Price</th>
                <th className="text-center py-2.5 px-3 font-medium text-muted w-16">Qty</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((li, index) => (
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
              ))}
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
              <span className="text-foreground font-medium">{formatCents(invoice.subtotalCents)}</span>
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
              <span className="text-foreground text-base">{formatCents(invoice.totalCents)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      {invoice.notes && (
        <div className="bg-card-bg border-x border-border px-6 py-4 border-t border-border">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Notes</p>
          <p className="text-sm text-muted whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* ── Bottom border ── */}
      <div className="bg-card-bg rounded-b-lg border border-t-0 border-border h-2" />

      {/* ── Action Buttons ── */}
      <div className="flex justify-end gap-3 mt-6">
        {isAdmin && invoice.status === 'draft' && (
          <button
            onClick={() => onUpdateStatus('sent')}
            className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Send Invoice
          </button>
        )}
        {isAdmin && (invoice.status === 'sent' || invoice.status === 'overdue') && (
          <button
            onClick={() => onUpdateStatus('paid')}
            className="px-5 py-2.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
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
    </div>
  );
}
