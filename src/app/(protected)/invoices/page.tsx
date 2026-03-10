'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { formatCents } from '@/lib/stripe';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  totalCents: number;
  dueDate: string | null;
  createdAt: string;
  clientName: string;
  projectName: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600 line-through',
};

const STATUS_OPTIONS = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'];

export default function AllInvoicesPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadInvoices = useCallback(async () => {
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, total_cents, due_date, created_at, organization_id, project_id, organizations(business_name, primary_first_name, primary_last_name), projects(name)')
      .order('created_at', { ascending: false });

    if (invoicesData) {
      setInvoices(
        invoicesData.map((inv) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const org = inv.organizations as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const project = inv.projects as any;
          return {
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            status: inv.status,
            totalCents: inv.total_cents,
            dueDate: inv.due_date,
            createdAt: inv.created_at,
            clientName: org
              ? org.business_name || `${org.primary_first_name} ${org.primary_last_name}`
              : '',
            projectName: project?.name || null,
          };
        })
      );
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const filtered = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      inv.clientName.toLowerCase().includes(searchLower) ||
      inv.invoiceNumber.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const inputClass =
    'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  if (loading) return <p className="text-muted text-sm">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">All Invoices</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by property owner name or invoice number..."
            className={inputClass}
          />
        </div>
        <div className="w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted italic">No invoices found.</p>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left py-3 px-4 font-medium text-muted">Invoice #</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Property Owner</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Project</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Total</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  className="border-b border-border hover:bg-background cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-foreground font-medium">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 text-foreground">{inv.clientName}</td>
                  <td className="py-3 px-4 text-muted">{inv.projectName || '-'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                        STATUS_BADGE[inv.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-foreground">{formatCents(inv.totalCents)}</td>
                  <td className="py-3 px-4 text-muted">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
