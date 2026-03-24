'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PROJECT_TYPES } from '@/lib/utils';
import { createLeadAction, updateLeadStageAction, convertLeadToProjectAction, deleteLeadAction } from './actions';
import SearchBox from '@/components/ui/SearchBox';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import type { LeadStage } from '@/types';

// ── Types ──

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  stage: LeadStage;
  leadSource: string | null;
  addressLine1: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressPostalCode: string | null;
  projectType: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  tags: string[];
  organizationId: string | null;
  projectId: string | null;
  notes: string | null;
  createdAt: string;
}

// ── Constants ──

const ACTIVE_STAGES: { value: LeadStage; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'followed_up', label: 'Followed Up' },
  { value: 'connected', label: 'Connected' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
  { value: 'estimate_sent', label: 'Estimate Sent' },
  { value: 'won', label: 'Won' },
];

const INACTIVE_STAGES: { value: LeadStage; label: string }[] = [
  { value: 'snoozed', label: 'Snoozed' },
  { value: 'archived', label: 'Archived' },
];

const ALL_STAGES = [...ACTIVE_STAGES, ...INACTIVE_STAGES];

const STAGE_LABELS: Record<string, string> = Object.fromEntries(ALL_STAGES.map((s) => [s.value, s.label]));

const STAGE_COLORS: Record<string, string> = {
  new: 'bg-amber-100 text-amber-700',
  followed_up: 'bg-blue-100 text-blue-700',
  connected: 'bg-purple-100 text-purple-700',
  meeting_scheduled: 'bg-indigo-100 text-indigo-700',
  estimate_sent: 'bg-cyan-100 text-cyan-700',
  won: 'bg-green-100 text-green-700',
  snoozed: 'bg-gray-100 text-gray-500',
  archived: 'bg-gray-100 text-gray-400',
};

const LEAD_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'houzz', label: 'Houzz' },
  { value: 'other', label: 'Other' },
];

// Avatar color palette
const AVATAR_COLORS = [
  'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600',
  'bg-pink-600', 'bg-teal-600', 'bg-red-600', 'bg-indigo-600',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

type SortField = 'name' | 'address' | 'projectType' | 'createdAt';
type SortDirection = 'asc' | 'desc';

// ── Main Page ──

export default function LeadsPage() {
  const [supabase] = useState(() => createClient());
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<LeadStage | 'all_active' | 'all'>('all_active');
  const [projectTypeFilter, setProjectTypeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', leadSource: 'website', projectType: '',
    addressLine1: '', addressCity: '', addressState: '', addressPostalCode: '',
    assignedTo: '', tags: '', notes: '', message: '',
  });

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leads')
      .select('*, profiles!leads_assigned_to_fkey(first_name, last_name)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (data) {
      setLeads(data.map((l: Record<string, unknown>) => {
        const profile = l.profiles as Record<string, unknown> | null;
        return {
          id: l.id as string,
          name: l.name as string,
          email: l.email as string,
          phone: l.phone as string | null,
          message: l.message as string | null,
          stage: (l.stage as LeadStage) || 'new',
          leadSource: l.lead_source as string | null,
          addressLine1: l.address_line1 as string | null,
          addressCity: l.address_city as string | null,
          addressState: l.address_state as string | null,
          addressPostalCode: l.address_postal_code as string | null,
          projectType: l.project_type as string | null,
          assignedTo: l.assigned_to as string | null,
          assignedToName: profile ? `${profile.first_name} ${profile.last_name}` : null,
          tags: (l.tags as string[]) || [],
          organizationId: l.organization_id as string | null,
          projectId: l.project_id as string | null,
          notes: l.notes as string | null,
          createdAt: l.created_at as string,
        };
      }));
    }
    setLoading(false);
  }, [supabase]);

  const loadManagers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('role', 'admin');
    if (data) {
      setManagers(data.map((p) => ({ id: p.id, name: `${p.first_name} ${p.last_name}` })));
    }
  }, [supabase]);

  useEffect(() => { loadLeads(); loadManagers(); }, [loadLeads, loadManagers]);

  // ── Filtering ──
  const activeStages = ACTIVE_STAGES.map((s) => s.value);
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      // Stage filter
      if (stageFilter === 'all_active' && !activeStages.includes(l.stage)) return false;
      if (stageFilter !== 'all_active' && stageFilter !== 'all' && l.stage !== stageFilter) return false;

      // Search
      if (search) {
        const term = search.toLowerCase();
        const match = l.name.toLowerCase().includes(term)
          || l.email.toLowerCase().includes(term)
          || (l.phone && l.phone.includes(term))
          || (l.addressCity && l.addressCity.toLowerCase().includes(term))
          || (l.addressState && l.addressState.toLowerCase().includes(term));
        if (!match) return false;
      }

      // Dropdown filters
      if (projectTypeFilter && l.projectType !== projectTypeFilter) return false;
      if (sourceFilter && l.leadSource !== sourceFilter) return false;
      if (managerFilter && l.assignedTo !== managerFilter) return false;

      return true;
    });
  }, [leads, stageFilter, search, projectTypeFilter, sourceFilter, managerFilter, activeStages]);

  // ── Sorting ──
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let aVal = '', bVal = '';
      switch (sortField) {
        case 'name': aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;
        case 'address':
          aVal = [a.addressCity, a.addressState].filter(Boolean).join(', ').toLowerCase();
          bVal = [b.addressCity, b.addressState].filter(Boolean).join(', ').toLowerCase();
          break;
        case 'projectType': aVal = a.projectType || ''; bVal = b.projectType || ''; break;
        case 'createdAt': aVal = a.createdAt; bVal = b.createdAt; break;
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  // ── Stage counts ──
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of ALL_STAGES) counts[s.value] = 0;
    counts['all_active'] = 0;
    for (const l of leads) {
      counts[l.stage] = (counts[l.stage] || 0) + 1;
      if (activeStages.includes(l.stage)) counts['all_active']++;
    }
    return counts;
  }, [leads, activeStages]);

  // ── Actions ──
  const handleStageChange = async (leadId: string, stage: LeadStage) => {
    const result = await updateLeadStageAction(leadId, stage);
    if (!result.error) {
      setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, stage } : l));
    }
  };

  const handleConvert = async (leadId: string) => {
    setSaving(true);
    const result = await convertLeadToProjectAction(leadId);
    setSaving(false);
    if (result.error) {
      setFormError(result.error);
    } else {
      loadLeads();
    }
  };

  const handleDelete = async (leadId: string) => {
    const result = await deleteLeadAction(leadId);
    if (!result.error) {
      setShowDeleteModal(null);
      loadLeads();
    }
  };

  const handleAddLead = async () => {
    setFormError('');
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and Email are required.');
      return;
    }
    setSaving(true);
    const result = await createLeadAction({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      leadSource: formData.leadSource || undefined,
      projectType: formData.projectType || undefined,
      addressLine1: formData.addressLine1 || undefined,
      addressCity: formData.addressCity || undefined,
      addressState: formData.addressState || undefined,
      addressPostalCode: formData.addressPostalCode || undefined,
      assignedTo: formData.assignedTo || undefined,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      notes: formData.notes || undefined,
      message: formData.message || undefined,
    });
    setSaving(false);
    if (result.error) {
      setFormError(result.error);
    } else {
      setShowAddModal(false);
      resetForm();
      loadLeads();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', leadSource: 'website', projectType: '',
      addressLine1: '', addressCity: '', addressState: '', addressPostalCode: '',
      assignedTo: '', tags: '', notes: '', message: '',
    });
    setFormError('');
  };

  const inputClass = 'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  const SortIcon = ({ field }: { field: SortField }) => (
    <svg
      className={`w-3.5 h-3.5 inline-block ml-1 ${sortField === field ? 'text-foreground' : 'text-muted/40'}`}
      viewBox="0 0 14 20" fill="currentColor"
    >
      <path d="M7 0L13 7H1L7 0Z" opacity={sortField === field && sortDirection === 'asc' ? 1 : 0.3} />
      <path d="M7 20L1 13H13L7 20Z" opacity={sortField === field && sortDirection === 'desc' ? 1 : 0.3} />
    </svg>
  );

  return (
    <div className="flex gap-0 -m-6">
      {/* ── Left Sidebar ── */}
      <div className="w-[220px] min-w-[220px] bg-background border-r border-border p-4 min-h-[calc(100vh-64px)]">
        {/* Active Leads */}
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Active Leads</h3>
        <button
          onClick={() => setStageFilter('all_active')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors mb-1 ${
            stageFilter === 'all_active' ? 'bg-primary-bg text-primary font-medium' : 'text-foreground hover:bg-primary-bg/50'
          }`}
        >
          <span>All Active Leads</span>
          <span className="text-xs font-medium bg-card-bg border border-border rounded-full px-2 py-0.5">
            {stageCounts['all_active']}
          </span>
        </button>
        {ACTIVE_STAGES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStageFilter(s.value)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${
              stageFilter === s.value ? 'bg-primary-bg text-primary font-medium' : 'text-foreground hover:bg-primary-bg/50'
            }`}
          >
            <span>{s.label}</span>
            <span className="text-xs text-muted">{stageCounts[s.value]}</span>
          </button>
        ))}

        {/* Inactive Leads */}
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mt-6 mb-2">Inactive Leads</h3>
        {INACTIVE_STAGES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStageFilter(s.value)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${
              stageFilter === s.value ? 'bg-primary-bg text-primary font-medium' : 'text-foreground hover:bg-primary-bg/50'
            }`}
          >
            <span>{s.label}</span>
            <span className="text-xs text-muted">{stageCounts[s.value]}</span>
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            + Add Lead
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 max-w-xs">
            <SearchBox value={search} onChange={setSearch} placeholder="Search leads..." />
          </div>
          <select value={projectTypeFilter} onChange={(e) => setProjectTypeFilter(e.target.value)} className={`${inputClass} w-40`}>
            <option value="">All Project Types</option>
            {PROJECT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className={`${inputClass} w-36`}>
            <option value="">All Sources</option>
            {LEAD_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)} className={`${inputClass} w-40`}>
            <option value="">All Managers</option>
            {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-muted text-sm">Loading leads...</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted italic">No leads found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card-bg">
                  <th
                    onClick={() => handleSort('name')}
                    className="px-4 py-3 text-left font-medium text-muted cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                  >
                    Lead Name <SortIcon field="name" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted whitespace-nowrap">Stage</th>
                  <th className="px-4 py-3 text-left font-medium text-muted whitespace-nowrap">Client Name</th>
                  <th
                    onClick={() => handleSort('address')}
                    className="px-4 py-3 text-left font-medium text-muted cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                  >
                    Lead Address <SortIcon field="address" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted whitespace-nowrap">Task</th>
                  <th
                    onClick={() => handleSort('projectType')}
                    className="px-4 py-3 text-left font-medium text-muted cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                  >
                    Project Type <SortIcon field="projectType" />
                  </th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((lead) => (
                  <tr key={lead.id} className="border-b border-border last:border-b-0 hover:bg-primary-bg transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.stage}
                        onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStage)}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${STAGE_COLORS[lead.stage] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {ALL_STAGES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full ${getAvatarColor(lead.name)} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                          {getInitials(lead.name)}
                        </span>
                        <span className="text-foreground">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {lead.addressPostalCode || [lead.addressCity, lead.addressState].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {lead.stage === 'won' && !lead.projectId ? (
                        <button
                          onClick={() => handleConvert(lead.id)}
                          disabled={saving}
                          className="text-xs text-primary hover:text-primary-dark font-medium"
                        >
                          Convert to Project
                        </button>
                      ) : lead.projectId ? (
                        <Link href={`/projects/${lead.projectId}`} className="text-xs text-primary hover:underline">
                          View Project
                        </Link>
                      ) : (
                        <span className="text-xs text-muted">+ Add New Task</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {lead.projectType
                        ? PROJECT_TYPES.find((t) => t.value === lead.projectType)?.label || lead.projectType
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setShowDeleteModal(lead.id)}
                        className="p-1.5 text-muted hover:text-red-500 transition-colors"
                        title="Delete lead"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Lead Modal ── */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormError(''); }} title="Add Lead" maxWidth="max-w-2xl">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{formError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
              <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lead Source</label>
              <select value={formData.leadSource} onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })} className={inputClass}>
                {LEAD_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Type</label>
              <select value={formData.projectType} onChange={(e) => setFormData({ ...formData, projectType: e.target.value })} className={inputClass}>
                <option value="">None</option>
                {PROJECT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assigned To</label>
              <select value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} className={inputClass}>
                <option value="">Unassigned</option>
                {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input placeholder="Street address" value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} className={`${inputClass} mb-2`} />
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="City" value={formData.addressCity} onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })} className={inputClass} />
              <input placeholder="State" value={formData.addressState} onChange={(e) => setFormData({ ...formData, addressState: e.target.value })} className={inputClass} />
              <input placeholder="ZIP" value={formData.addressPostalCode} onChange={(e) => setFormData({ ...formData, addressPostalCode: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g. high-priority, referral" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={2} className={`${inputClass} resize-none`} placeholder="Initial message or inquiry..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className={`${inputClass} resize-none`} placeholder="Internal notes..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors">
              Cancel
            </button>
            <button onClick={handleAddLead} disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50">
              {saving ? 'Creating...' : 'Add Lead'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal isOpen={!!showDeleteModal} onClose={() => setShowDeleteModal(null)} title="Delete Lead">
        <div className="space-y-4">
          <p className="text-sm text-foreground">Are you sure you want to delete this lead? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors">
              Cancel
            </button>
            <button onClick={() => showDeleteModal && handleDelete(showDeleteModal)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
