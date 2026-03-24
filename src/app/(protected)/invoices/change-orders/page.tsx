'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCents, dollarsToCents } from '@/lib/stripe';
import { createChangeOrderAction, approveChangeOrderAction, rejectChangeOrderAction, deleteChangeOrderAction } from './actions';
import Modal from '@/components/ui/Modal';

interface ChangeOrderRow {
  id: string;
  changeOrderNumber: string;
  title: string;
  status: string;
  costImpactCents: number;
  requestedBy: string | null;
  projectName: string;
  createdAt: string;
}

interface ProjectOption { id: string; name: string; }

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', pending_approval: 'Pending Approval', approved: 'Approved', rejected: 'Rejected',
};

export default function ChangeOrdersPage() {
  const [supabase] = useState(() => createClient());
  const [changeOrders, setChangeOrders] = useState<ChangeOrderRow[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [costImpact, setCostImpact] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [notes, setNotes] = useState('');

  const loadChangeOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('change_orders')
      .select('id, change_order_number, title, status, cost_impact_cents, requested_by, created_at, project_id, projects(name)')
      .order('created_at', { ascending: false });

    if (data) {
      setChangeOrders(data.map((co: Record<string, unknown>) => {
        const proj = co.projects as Record<string, unknown> | null;
        return {
          id: co.id as string,
          changeOrderNumber: co.change_order_number as string,
          title: co.title as string,
          status: co.status as string,
          costImpactCents: co.cost_impact_cents as number,
          requestedBy: co.requested_by as string | null,
          projectName: proj ? (proj.name as string) : '',
          createdAt: co.created_at as string,
        };
      }));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadChangeOrders();
    supabase.from('projects').select('id, name').is('deleted_at', null).order('name').then(({ data }) => {
      if (data) setProjects(data.map((p) => ({ id: p.id, name: p.name })));
    });
  }, [supabase, loadChangeOrders]);

  const resetForm = () => { setProjectId(''); setTitle(''); setDescription(''); setCostImpact(''); setRequestedBy(''); setNotes(''); setError(''); };

  const handleCreate = async () => {
    if (!projectId || !title.trim()) { setError('Project and title are required.'); return; }
    setSaving(true); setError('');
    const result = await createChangeOrderAction({
      projectId, title, description: description || undefined,
      costImpactCents: dollarsToCents(parseFloat(costImpact) || 0),
      requestedBy: requestedBy || undefined, notes: notes || undefined,
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setShowCreate(false); resetForm(); loadChangeOrders();
  };

  const inputClass = 'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Change Orders</h2>
        <button onClick={() => { resetForm(); setShowCreate(true); }} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors">
          + New Change Order
        </button>
      </div>

      {loading ? <p className="text-muted text-sm">Loading change orders...</p> : changeOrders.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
          <p className="text-sm text-muted">No change orders yet. Track scope changes and cost impacts here.</p>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left py-3 px-4 font-medium text-muted">CO #</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Project</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Title</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Cost Impact</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Date</th>
                <th className="py-3 px-4 w-40"></th>
              </tr>
            </thead>
            <tbody>
              {changeOrders.map((co) => (
                <tr key={co.id} className="border-b border-border hover:bg-background transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{co.changeOrderNumber}</td>
                  <td className="py-3 px-4 text-foreground">{co.projectName}</td>
                  <td className="py-3 px-4 text-foreground">{co.title}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${STATUS_BADGE[co.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[co.status] || co.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-foreground">{formatCents(co.costImpactCents)}</td>
                  <td className="py-3 px-4 text-muted">{new Date(co.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {co.status === 'pending_approval' && (
                      <>
                        <button onClick={async () => { await approveChangeOrderAction(co.id); loadChangeOrders(); }} className="text-xs text-green-600 hover:text-green-800 font-medium">Approve</button>
                        <button onClick={async () => { await rejectChangeOrderAction(co.id); loadChangeOrders(); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Reject</button>
                      </>
                    )}
                    {co.status === 'draft' && (
                      <button onClick={async () => { await deleteChangeOrderAction(co.id); loadChangeOrders(); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Change Order" maxWidth="max-w-xl">
        <div className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Project <span className="text-red-500">*</span></label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass}>
              <option value="">Select project...</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cost Impact ($)</label>
              <input type="number" value={costImpact} onChange={(e) => setCostImpact(e.target.value)} min="0" step="0.01" placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Requested By</label>
              <input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Change Order'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
