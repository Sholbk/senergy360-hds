'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { formatCents } from '@/lib/stripe';
import { cn } from '@/lib/utils';

// ── Types ──

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

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  sourcePage: string | null;
  stage: string;
  projectType: string | null;
  addressCity: string | null;
  addressState: string | null;
  projectId: string | null;
  createdAt: string;
}

const LEAD_STAGE_BADGE: Record<string, string> = {
  new: 'bg-amber-100 text-amber-700',
  followed_up: 'bg-blue-100 text-blue-700',
  connected: 'bg-purple-100 text-purple-700',
  meeting_scheduled: 'bg-indigo-100 text-indigo-700',
  estimate_sent: 'bg-cyan-100 text-cyan-700',
  won: 'bg-green-100 text-green-700',
  snoozed: 'bg-gray-100 text-gray-500',
  archived: 'bg-gray-100 text-gray-400',
};

const LEAD_STAGE_LABELS: Record<string, string> = {
  new: 'New',
  followed_up: 'Followed Up',
  connected: 'Connected',
  meeting_scheduled: 'Meeting Scheduled',
  estimate_sent: 'Estimate Sent',
  won: 'Won',
  snoozed: 'Snoozed',
  archived: 'Archived',
};

interface PipelineProject {
  id: string;
  name: string;
  status: string;
  projectType: string;
  clientName: string;
  city: string;
  state: string;
  createdOn: string;
  totalInvoiced: number;
  totalPaid: number;
  invoiceCount: number;
}

// ── Constants ──

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600 line-through',
};

const STATUS_OPTIONS = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'];

const PIPELINE_COLUMNS = [
  { key: 'leads', label: 'Leads', color: 'border-t-amber-400' },
  { key: 'draft', label: 'Drafts', color: 'border-t-gray-400' },
  { key: 'in_progress', label: 'In Process', color: 'border-t-blue-400' },
  { key: 'completed', label: 'Completed', color: 'border-t-green-400' },
] as const;

const PROJECT_TYPE_LABELS: Record<string, string> = {
  new_construction: 'New Construction',
  renovation: 'Renovation',
  addition: 'Addition',
  remodel: 'Remodel',
  commercial: 'Commercial',
  residential: 'Residential',
  multi_family: 'Multi-Family',
  custom_home: 'Custom Home',
  other: 'Other',
};

// ── Main Page ──

export default function FinancialsPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [activeTab, setActiveTab] = useState<'pipeline' | 'invoices'>('pipeline');

  // Pipeline state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<PipelineProject[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(true);

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Load pipeline data ──
  const loadPipeline = useCallback(async () => {
    setPipelineLoading(true);

    const [leadsRes, projectsRes, invoicesRes] = await Promise.all([
      supabase
        .from('leads')
        .select('id, name, email, phone, message, source_page, stage, project_type, address_city, address_state, project_id, created_at')
        .is('deleted_at', null)
        .not('stage', 'in', '("snoozed","archived")')
        .order('created_at', { ascending: false }),
      supabase
        .from('projects')
        .select('id, name, status, project_type, site_city, site_state, created_on, client_id, clients(primary_first_name, primary_last_name)')
        .order('created_on', { ascending: false }),
      supabase
        .from('invoices')
        .select('id, project_id, status, total_cents'),
    ]);

    if (leadsRes.data) {
      setLeads(
        leadsRes.data.map((l) => ({
          id: l.id,
          name: l.name,
          email: l.email,
          phone: l.phone,
          message: l.message,
          sourcePage: l.source_page,
          stage: l.stage || 'new',
          projectType: l.project_type,
          addressCity: l.address_city,
          addressState: l.address_state,
          projectId: l.project_id,
          createdAt: l.created_at,
        }))
      );
    }

    // Build invoice totals per project
    const projectInvoices = new Map<string, { total: number; paid: number; count: number }>();
    if (invoicesRes.data) {
      for (const inv of invoicesRes.data) {
        if (!inv.project_id) continue;
        const existing = projectInvoices.get(inv.project_id) || { total: 0, paid: 0, count: 0 };
        existing.total += inv.total_cents;
        existing.count += 1;
        if (inv.status === 'paid') existing.paid += inv.total_cents;
        projectInvoices.set(inv.project_id, existing);
      }
    }

    if (projectsRes.data) {
      setProjects(
        projectsRes.data.map((p) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const client = p.clients as any;
          const inv = projectInvoices.get(p.id) || { total: 0, paid: 0, count: 0 };
          return {
            id: p.id,
            name: p.name,
            status: p.status,
            projectType: p.project_type,
            clientName: client
              ? `${client.primary_first_name} ${client.primary_last_name}`
              : '',
            city: p.site_city,
            state: p.site_state,
            createdOn: p.created_on,
            totalInvoiced: inv.total,
            totalPaid: inv.paid,
            invoiceCount: inv.count,
          };
        })
      );
    }

    setPipelineLoading(false);
  }, [supabase]);

  // ── Load invoices ──
  const loadInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, total_cents, due_date, created_at, client_id, project_id, clients(primary_first_name, primary_last_name), projects(name)')
      .order('created_at', { ascending: false });

    if (invoicesData) {
      setInvoices(
        invoicesData.map((inv) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const client = inv.clients as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const project = inv.projects as any;
          return {
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            status: inv.status,
            totalCents: inv.total_cents,
            dueDate: inv.due_date,
            createdAt: inv.created_at,
            clientName: client
              ? `${client.primary_first_name} ${client.primary_last_name}`
              : '',
            projectName: project?.name || null,
          };
        })
      );
    }
    setInvoicesLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadPipeline();
    loadInvoices();
  }, [loadPipeline, loadInvoices]);

  // ── Filtered invoices ──
  const filtered = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      inv.clientName.toLowerCase().includes(searchLower) ||
      inv.invoiceNumber.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  // ── Pipeline totals ──
  const draftProjects = projects.filter((p) => p.status === 'draft');
  const inProgressProjects = projects.filter((p) => p.status === 'in_progress');
  const completedProjects = projects.filter((p) => p.status === 'completed');

  const columnData: Record<string, { items: (Lead | PipelineProject)[]; total: number; count: number }> = {
    leads: {
      items: leads,
      total: 0,
      count: leads.length,
    },
    draft: {
      items: draftProjects,
      total: draftProjects.reduce((sum, p) => sum + p.totalInvoiced, 0),
      count: draftProjects.length,
    },
    in_progress: {
      items: inProgressProjects,
      total: inProgressProjects.reduce((sum, p) => sum + p.totalInvoiced, 0),
      count: inProgressProjects.length,
    },
    completed: {
      items: completedProjects,
      total: completedProjects.reduce((sum, p) => sum + p.totalInvoiced, 0),
      count: completedProjects.length,
    },
  };

  const inputClass =
    'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-4">Financials</h1>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'pipeline'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          )}
        >
          Pipeline
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'invoices'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          )}
        >
          Invoices
        </button>
      </div>

      {/* ── Pipeline View ── */}
      {activeTab === 'pipeline' && (
        pipelineLoading ? (
          <p className="text-muted text-sm">Loading pipeline...</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
            {PIPELINE_COLUMNS.map((col) => {
              const data = columnData[col.key];
              return (
                <div
                  key={col.key}
                  className={cn(
                    'flex-shrink-0 w-72 bg-background rounded-lg border border-border border-t-4 flex flex-col',
                    col.color
                  )}
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                      <span className="text-xs bg-card-bg border border-border rounded-full px-2 py-0.5 text-muted font-medium">
                        {data.count}
                      </span>
                    </div>
                    {col.key !== 'leads' && (
                      <p className="text-xs text-muted">
                        {formatCents(data.total)} invoiced
                      </p>
                    )}
                  </div>

                  {/* Column Cards */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {data.items.length === 0 ? (
                      <p className="text-xs text-muted italic text-center py-4">
                        No {col.label.toLowerCase()}
                      </p>
                    ) : col.key === 'leads' ? (
                      // Lead cards
                      (data.items as Lead[]).map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-card-bg rounded-md border border-border p-3 hover:shadow-sm transition-shadow"
                        >
                          <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                          <p className="text-xs text-muted mt-1 truncate">{lead.email}</p>
                          {lead.phone && (
                            <p className="text-xs text-muted truncate">{lead.phone}</p>
                          )}
                          {lead.message && (
                            <p className="text-xs text-muted mt-1.5 line-clamp-2">{lead.message}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${LEAD_STAGE_BADGE[lead.stage] || 'bg-gray-100 text-gray-600'}`}>
                              {LEAD_STAGE_LABELS[lead.stage] || lead.stage}
                            </span>
                            <span className="text-[10px] text-muted">
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {lead.stage === 'won' && !lead.projectId && (
                            <button
                              onClick={() => router.push('/leads')}
                              className="mt-2 text-xs text-primary hover:text-primary-dark font-medium"
                            >
                              Convert to Project →
                            </button>
                          )}
                          {lead.projectId && (
                            <button
                              onClick={() => router.push(`/projects/${lead.projectId}`)}
                              className="mt-2 text-xs text-primary hover:text-primary-dark font-medium"
                            >
                              View Project →
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      // Project cards
                      (data.items as PipelineProject[]).map((proj) => (
                        <div
                          key={proj.id}
                          onClick={() => router.push(`/projects/${proj.id}`)}
                          className="bg-card-bg rounded-md border border-border p-3 hover:shadow-sm transition-shadow cursor-pointer"
                        >
                          <p className="text-sm font-medium text-foreground truncate">{proj.name}</p>
                          {proj.clientName && (
                            <p className="text-xs text-muted mt-0.5">
                              <span className="text-muted/70">Client:</span> {proj.clientName}
                            </p>
                          )}
                          <p className="text-xs text-muted mt-0.5">
                            {proj.city}, {proj.state}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] bg-primary-bg text-primary border border-primary/20 rounded px-1.5 py-0.5">
                              {PROJECT_TYPE_LABELS[proj.projectType] || proj.projectType}
                            </span>
                            {proj.totalInvoiced > 0 ? (
                              <span className="text-xs font-medium text-foreground">
                                {formatCents(proj.totalInvoiced)}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted">No invoices</span>
                            )}
                          </div>
                          {proj.invoiceCount > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-[10px] text-muted mb-0.5">
                                <span>{proj.invoiceCount} invoice{proj.invoiceCount !== 1 ? 's' : ''}</span>
                                <span>{formatCents(proj.totalPaid)} paid</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1">
                                <div
                                  className="bg-green-400 h-1 rounded-full transition-all"
                                  style={{
                                    width: proj.totalInvoiced > 0
                                      ? `${Math.round((proj.totalPaid / proj.totalInvoiced) * 100)}%`
                                      : '0%',
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <p className="text-[10px] text-muted mt-1.5">
                            Created {new Date(proj.createdOn).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Invoices View ── */}
      {activeTab === 'invoices' && (
        invoicesLoading ? (
          <p className="text-muted text-sm">Loading invoices...</p>
        ) : (
          <>
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
          </>
        )
      )}
    </div>
  );
}
