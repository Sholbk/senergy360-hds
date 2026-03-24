'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCents } from '@/lib/stripe';

type ReportType = 'payments' | 'open_invoices' | 'transactions' | 'time_team' | 'time_project' | null;

interface InvoiceData {
  id: string;
  status: string;
  totalCents: number;
  paidAt: string | null;
  dueDate: string | null;
  clientName: string;
  projectName: string | null;
  invoiceNumber: string;
}

const REPORT_CARDS = [
  { key: 'payments' as const, title: 'Payments', description: 'Summary of incoming payments, amounts invoiced and remaining liability.', icon: '💳', color: 'border-l-purple-400' },
  { key: 'open_invoices' as const, title: 'Open Invoices', description: 'Aging report of unpaid and overdue invoices.', icon: '📄', color: 'border-l-amber-400' },
  { key: 'transactions' as const, title: 'Transactions by Project', description: 'Incoming transactions grouped by project.', icon: '⚡', color: 'border-l-blue-400' },
  { key: 'time_team' as const, title: 'Time Billing by Team Member', description: 'Hours and billing grouped by team member.', icon: '👥', color: 'border-l-green-400' },
  { key: 'time_project' as const, title: 'Time Billing by Project', description: 'Hours and billing grouped by project.', icon: '📊', color: 'border-l-teal-400' },
];

export default function ReportsPage() {
  const [supabase] = useState(() => createClient());
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<ReportType>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, total_cents, paid_at, due_date, clients(primary_first_name, primary_last_name), projects(name)')
      .order('created_at', { ascending: false });

    if (data) {
      setInvoices(data.map((inv) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const client = inv.clients as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const project = inv.projects as any;
        return {
          id: inv.id, invoiceNumber: inv.invoice_number, status: inv.status,
          totalCents: inv.total_cents, paidAt: inv.paid_at, dueDate: inv.due_date,
          clientName: client ? `${client.primary_first_name} ${client.primary_last_name}` : '',
          projectName: project?.name || null,
        };
      }));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <p className="text-muted text-sm">Loading reports...</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Reports</h2>

      {/* Report Cards */}
      {!activeReport && (
        <div className="space-y-3">
          {REPORT_CARDS.map((card) => (
            <div key={card.key} className={`bg-card-bg rounded-lg border border-border border-l-4 ${card.color} p-4 flex items-center justify-between`}>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                <p className="text-xs text-muted mt-1">{card.description}</p>
              </div>
              <button
                onClick={() => setActiveReport(card.key)}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors whitespace-nowrap"
              >
                View Report
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active Report */}
      {activeReport && (
        <div>
          <button onClick={() => setActiveReport(null)} className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1">
            &larr; Back to Reports
          </button>

          {activeReport === 'payments' && <PaymentsReport invoices={invoices} />}
          {activeReport === 'open_invoices' && <OpenInvoicesReport invoices={invoices} />}
          {activeReport === 'transactions' && <TransactionsReport invoices={invoices} />}
          {activeReport === 'time_team' && <TimeBillingPlaceholder title="Time Billing by Team Member" />}
          {activeReport === 'time_project' && <TimeBillingPlaceholder title="Time Billing by Project" />}
        </div>
      )}
    </div>
  );
}

function PaymentsReport({ invoices }: { invoices: InvoiceData[] }) {
  const totalInvoiced = invoices.reduce((s, i) => s + i.totalCents, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalCents, 0);
  const totalOutstanding = invoices.filter((i) => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + i.totalCents, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.totalCents, 0);

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Payments Summary</h3>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card-bg rounded-lg border border-border p-4">
          <p className="text-xs text-muted">Total Invoiced</p>
          <p className="text-xl font-bold text-foreground mt-1">{formatCents(totalInvoiced)}</p>
        </div>
        <div className="bg-card-bg rounded-lg border border-border p-4">
          <p className="text-xs text-muted">Total Paid</p>
          <p className="text-xl font-bold text-green-600 mt-1">{formatCents(totalPaid)}</p>
        </div>
        <div className="bg-card-bg rounded-lg border border-border p-4">
          <p className="text-xs text-muted">Outstanding</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{formatCents(totalOutstanding)}</p>
        </div>
        <div className="bg-card-bg rounded-lg border border-border p-4">
          <p className="text-xs text-muted">Overdue</p>
          <p className="text-xl font-bold text-red-600 mt-1">{formatCents(totalOverdue)}</p>
        </div>
      </div>
      <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="text-left py-3 px-4 font-medium text-muted">Invoice #</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Client</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
              <th className="text-right py-3 px-4 font-medium text-muted">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Paid At</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-border">
                <td className="py-3 px-4 text-foreground">{inv.invoiceNumber}</td>
                <td className="py-3 px-4 text-foreground">{inv.clientName}</td>
                <td className="py-3 px-4 text-muted capitalize">{inv.status}</td>
                <td className="py-3 px-4 text-right text-foreground">{formatCents(inv.totalCents)}</td>
                <td className="py-3 px-4 text-muted">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OpenInvoicesReport({ invoices }: { invoices: InvoiceData[] }) {
  const open = invoices.filter((i) => ['sent', 'overdue'].includes(i.status));
  const now = new Date();

  const buckets = { '0-30': [] as InvoiceData[], '31-60': [] as InvoiceData[], '61-90': [] as InvoiceData[], '90+': [] as InvoiceData[] };
  for (const inv of open) {
    const due = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.paidAt || now);
    const days = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 30) buckets['0-30'].push(inv);
    else if (days <= 60) buckets['31-60'].push(inv);
    else if (days <= 90) buckets['61-90'].push(inv);
    else buckets['90+'].push(inv);
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Open Invoices — Aging Report</h3>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(buckets).map(([label, items]) => (
          <div key={label} className="bg-card-bg rounded-lg border border-border p-4">
            <p className="text-xs text-muted">{label} Days</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatCents(items.reduce((s, i) => s + i.totalCents, 0))}</p>
            <p className="text-xs text-muted mt-1">{items.length} invoice{items.length !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>
      {open.length === 0 ? (
        <p className="text-sm text-muted italic">No open invoices.</p>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left py-3 px-4 font-medium text-muted">Invoice #</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Client</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Due Date</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Days Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {open.map((inv) => {
                const due = inv.dueDate ? new Date(inv.dueDate) : now;
                const days = Math.max(0, Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
                return (
                  <tr key={inv.id} className="border-b border-border">
                    <td className="py-3 px-4 text-foreground">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-foreground">{inv.clientName}</td>
                    <td className="py-3 px-4 text-right text-foreground">{formatCents(inv.totalCents)}</td>
                    <td className="py-3 px-4 text-muted">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</td>
                    <td className={`py-3 px-4 text-right font-medium ${days > 60 ? 'text-red-600' : days > 30 ? 'text-amber-600' : 'text-foreground'}`}>{days}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TransactionsReport({ invoices }: { invoices: InvoiceData[] }) {
  const byProject = new Map<string, { name: string; invoiced: number; paid: number; count: number }>();
  for (const inv of invoices) {
    const key = inv.projectName || 'No Project';
    const existing = byProject.get(key) || { name: key, invoiced: 0, paid: 0, count: 0 };
    existing.invoiced += inv.totalCents;
    if (inv.status === 'paid') existing.paid += inv.totalCents;
    existing.count += 1;
    byProject.set(key, existing);
  }
  const projects = Array.from(byProject.values()).sort((a, b) => b.invoiced - a.invoiced);

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Transactions by Project</h3>
      {projects.length === 0 ? (
        <p className="text-sm text-muted italic">No transactions.</p>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left py-3 px-4 font-medium text-muted">Project</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Invoices</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Total Invoiced</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Total Paid</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.name} className="border-b border-border">
                  <td className="py-3 px-4 text-foreground font-medium">{p.name}</td>
                  <td className="py-3 px-4 text-right text-muted">{p.count}</td>
                  <td className="py-3 px-4 text-right text-foreground">{formatCents(p.invoiced)}</td>
                  <td className="py-3 px-4 text-right text-green-600">{formatCents(p.paid)}</td>
                  <td className="py-3 px-4 text-right text-amber-600">{formatCents(p.invoiced - p.paid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TimeBillingPlaceholder({ title }: { title: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
        <p className="text-sm text-muted">Time billing reports will aggregate hourly line items from invoices. Add invoices with &quot;Labor&quot; line items to see data here.</p>
      </div>
    </div>
  );
}
