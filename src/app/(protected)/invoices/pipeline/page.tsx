'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { formatCents } from '@/lib/stripe';
import { cn } from '@/lib/utils';

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
  new: 'New', followed_up: 'Followed Up', connected: 'Connected',
  meeting_scheduled: 'Meeting Scheduled', estimate_sent: 'Estimate Sent',
  won: 'Won', snoozed: 'Snoozed', archived: 'Archived',
};

const PIPELINE_COLUMNS = [
  { key: 'leads', label: 'Leads', color: 'border-t-amber-400' },
  { key: 'draft', label: 'Drafts', color: 'border-t-gray-400' },
  { key: 'in_progress', label: 'In Process', color: 'border-t-blue-400' },
  { key: 'completed', label: 'Completed', color: 'border-t-green-400' },
] as const;

const PROJECT_TYPE_LABELS: Record<string, string> = {
  new_construction: 'New Construction', renovation: 'Renovation', addition: 'Addition',
  remodel: 'Remodel', commercial: 'Commercial', residential: 'Residential',
  multi_family: 'Multi-Family', custom_home: 'Custom Home', other: 'Other',
};

export default function PipelinePage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<PipelineProject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPipeline = useCallback(async () => {
    setLoading(true);

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
      setLeads(leadsRes.data.map((l) => ({
        id: l.id, name: l.name, email: l.email, phone: l.phone,
        message: l.message, sourcePage: l.source_page,
        stage: l.stage || 'new', projectType: l.project_type,
        addressCity: l.address_city, addressState: l.address_state,
        projectId: l.project_id, createdAt: l.created_at,
      })));
    }

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
      setProjects(projectsRes.data.map((p) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const client = p.clients as any;
        const inv = projectInvoices.get(p.id) || { total: 0, paid: 0, count: 0 };
        return {
          id: p.id, name: p.name, status: p.status, projectType: p.project_type,
          clientName: client ? `${client.primary_first_name} ${client.primary_last_name}` : '',
          city: p.site_city, state: p.site_state, createdOn: p.created_on,
          totalInvoiced: inv.total, totalPaid: inv.paid, invoiceCount: inv.count,
        };
      }));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadPipeline(); }, [loadPipeline]);

  const draftProjects = projects.filter((p) => p.status === 'draft');
  const inProgressProjects = projects.filter((p) => p.status === 'in_progress');
  const completedProjects = projects.filter((p) => p.status === 'completed');

  const columnData: Record<string, { items: (Lead | PipelineProject)[]; total: number; count: number }> = {
    leads: { items: leads, total: 0, count: leads.length },
    draft: { items: draftProjects, total: draftProjects.reduce((s, p) => s + p.totalInvoiced, 0), count: draftProjects.length },
    in_progress: { items: inProgressProjects, total: inProgressProjects.reduce((s, p) => s + p.totalInvoiced, 0), count: inProgressProjects.length },
    completed: { items: completedProjects, total: completedProjects.reduce((s, p) => s + p.totalInvoiced, 0), count: completedProjects.length },
  };

  if (loading) return <p className="text-muted text-sm">Loading pipeline...</p>;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
      {PIPELINE_COLUMNS.map((col) => {
        const data = columnData[col.key];
        return (
          <div key={col.key} className={cn('flex-shrink-0 w-72 bg-background rounded-lg border border-border border-t-4 flex flex-col', col.color)}>
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                <span className="text-xs bg-card-bg border border-border rounded-full px-2 py-0.5 text-muted font-medium">{data.count}</span>
              </div>
              {col.key !== 'leads' && <p className="text-xs text-muted">{formatCents(data.total)} invoiced</p>}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {data.items.length === 0 ? (
                <p className="text-xs text-muted italic text-center py-4">No {col.label.toLowerCase()}</p>
              ) : col.key === 'leads' ? (
                (data.items as Lead[]).map((lead) => (
                  <div key={lead.id} className="bg-card-bg rounded-md border border-border p-3 hover:shadow-sm transition-shadow">
                    <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                    <p className="text-xs text-muted mt-1 truncate">{lead.email}</p>
                    {lead.phone && <p className="text-xs text-muted truncate">{lead.phone}</p>}
                    {lead.message && <p className="text-xs text-muted mt-1.5 line-clamp-2">{lead.message}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${LEAD_STAGE_BADGE[lead.stage] || 'bg-gray-100 text-gray-600'}`}>
                        {LEAD_STAGE_LABELS[lead.stage] || lead.stage}
                      </span>
                      <span className="text-[10px] text-muted">{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                    {lead.stage === 'won' && !lead.projectId && (
                      <button onClick={() => router.push('/leads')} className="mt-2 text-xs text-primary hover:text-primary-dark font-medium">
                        Convert to Project →
                      </button>
                    )}
                    {lead.projectId && (
                      <button onClick={() => router.push(`/projects/${lead.projectId}`)} className="mt-2 text-xs text-primary hover:text-primary-dark font-medium">
                        View Project →
                      </button>
                    )}
                  </div>
                ))
              ) : (
                (data.items as PipelineProject[]).map((proj) => (
                  <div key={proj.id} onClick={() => router.push(`/projects/${proj.id}`)} className="bg-card-bg rounded-md border border-border p-3 hover:shadow-sm transition-shadow cursor-pointer">
                    <p className="text-sm font-medium text-foreground truncate">{proj.name}</p>
                    {proj.clientName && <p className="text-xs text-muted mt-0.5"><span className="text-muted/70">Client:</span> {proj.clientName}</p>}
                    <p className="text-xs text-muted mt-0.5">{proj.city}, {proj.state}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] bg-primary-bg text-primary border border-primary/20 rounded px-1.5 py-0.5">
                        {PROJECT_TYPE_LABELS[proj.projectType] || proj.projectType}
                      </span>
                      {proj.totalInvoiced > 0 ? (
                        <span className="text-xs font-medium text-foreground">{formatCents(proj.totalInvoiced)}</span>
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
                          <div className="bg-green-400 h-1 rounded-full transition-all" style={{ width: proj.totalInvoiced > 0 ? `${Math.round((proj.totalPaid / proj.totalInvoiced) * 100)}%` : '0%' }} />
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-muted mt-1.5">Created {new Date(proj.createdOn).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
