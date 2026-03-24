'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCents, dollarsToCents } from '@/lib/stripe';
import { createEstimateAction, updateEstimateStatusAction, convertEstimateToInvoiceAction, deleteEstimateAction } from './actions';
import Modal from '@/components/ui/Modal';

interface EstimateRow {
  id: string;
  estimateNumber: string;
  status: string;
  totalCents: number;
  validUntil: string | null;
  createdAt: string;
  clientName: string;
  projectName: string | null;
  convertedInvoiceId: string | null;
}

interface OrgOption { id: string; name: string; }
interface ProjectOption { id: string; name: string; }

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600 line-through',
};

interface LineItem { description: string; quantity: number; unitPrice: string; lineType: string; }
const emptyLineItem: LineItem = { description: '', quantity: 1, unitPrice: '', lineType: 'custom' };
const LINE_TYPES = [
  { value: 'hds', label: 'Service' },
  { value: 'inspection', label: 'Service' },
  { value: 'hourly', label: 'Labor' },
  { value: 'custom', label: 'Custom' },
];

export default function EstimatesPage() {
  const [supabase] = useState(() => createClient());
  const [estimates, setEstimates] = useState<EstimateRow[]>([]);
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [orgId, setOrgId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...emptyLineItem }]);

  const loadEstimates = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('estimates')
      .select('id, estimate_number, status, total_cents, valid_until, created_at, converted_invoice_id, organization_id, project_id, organizations(business_name, primary_first_name, primary_last_name), projects(name)')
      .order('created_at', { ascending: false });

    if (data) {
      setEstimates(data.map((e: Record<string, unknown>) => {
        const org = e.organizations as Record<string, unknown> | null;
        const proj = e.projects as Record<string, unknown> | null;
        return {
          id: e.id as string,
          estimateNumber: e.estimate_number as string,
          status: e.status as string,
          totalCents: e.total_cents as number,
          validUntil: e.valid_until as string | null,
          createdAt: e.created_at as string,
          clientName: org ? ((org.business_name as string) || `${org.primary_first_name} ${org.primary_last_name}`) : '',
          projectName: proj ? (proj.name as string) : null,
          convertedInvoiceId: e.converted_invoice_id as string | null,
        };
      }));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadEstimates();
    supabase.from('organizations').select('id, business_name, primary_first_name, primary_last_name').is('deleted_at', null).order('primary_last_name').then(({ data }) => {
      if (data) setOrgs(data.map((o) => ({ id: o.id, name: o.business_name || `${o.primary_first_name} ${o.primary_last_name}` })));
    });
    supabase.from('projects').select('id, name').is('deleted_at', null).order('name').then(({ data }) => {
      if (data) setProjects(data.map((p) => ({ id: p.id, name: p.name })));
    });
  }, [supabase, loadEstimates]);

  const resetForm = () => { setOrgId(''); setProjectId(''); setValidUntil(''); setNotes(''); setLineItems([{ ...emptyLineItem }]); setError(''); };

  const handleCreate = async () => {
    if (!orgId) { setError('Please select a client.'); return; }
    const validItems = lineItems.filter((li) => li.description.trim() && li.unitPrice);
    if (validItems.length === 0) { setError('Please add at least one line item.'); return; }
    setSaving(true); setError('');
    const result = await createEstimateAction({
      organizationId: orgId,
      projectId: projectId || undefined,
      lineItems: validItems.map((li) => ({ description: li.description, quantity: li.quantity, unitPriceCents: dollarsToCents(parseFloat(li.unitPrice) || 0), lineType: li.lineType })),
      validUntil: validUntil || undefined,
      notes: notes || undefined,
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setShowCreate(false); resetForm(); loadEstimates();
  };

  const handleConvert = async (id: string) => {
    const result = await convertEstimateToInvoiceAction(id);
    if (!result.error) loadEstimates();
  };

  const handleDelete = async (id: string) => {
    const result = await deleteEstimateAction(id);
    if (!result.error) loadEstimates();
  };

  const subtotal = lineItems.reduce((s, li) => s + (li.quantity * (parseFloat(li.unitPrice) || 0)), 0);
  const inputClass = 'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Estimates</h2>
        <button onClick={() => { resetForm(); setShowCreate(true); }} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors">
          + New Estimate
        </button>
      </div>

      {loading ? <p className="text-muted text-sm">Loading estimates...</p> : estimates.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
          <p className="text-sm text-muted">No estimates yet. Create your first estimate to get started.</p>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left py-3 px-4 font-medium text-muted">Estimate #</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Client</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Project</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Total</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Valid Until</th>
                <th className="py-3 px-4 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((est) => (
                <tr key={est.id} className="border-b border-border hover:bg-background transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{est.estimateNumber}</td>
                  <td className="py-3 px-4 text-foreground">{est.clientName}</td>
                  <td className="py-3 px-4 text-muted">{est.projectName || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${STATUS_BADGE[est.status] || 'bg-gray-100 text-gray-600'}`}>
                      {est.status.charAt(0).toUpperCase() + est.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-foreground">{formatCents(est.totalCents)}</td>
                  <td className="py-3 px-4 text-muted">{est.validUntil ? new Date(est.validUntil).toLocaleDateString() : '-'}</td>
                  <td className="py-3 px-4 text-right">
                    {est.status === 'sent' && !est.convertedInvoiceId && (
                      <button onClick={() => handleConvert(est.id)} className="text-xs text-primary hover:text-primary-dark font-medium mr-2">Convert</button>
                    )}
                    {est.status === 'draft' && (
                      <button onClick={() => handleDelete(est.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Estimate Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Estimate" maxWidth="max-w-3xl">
        <div className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client <span className="text-red-500">*</span></label>
              <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className={inputClass}>
                <option value="">Select client...</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass}>
                <option value="">None</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valid Until</label>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputClass} />
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Items</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted">Item</th>
                    <th className="text-left py-2 px-2 font-medium text-muted w-24">Type</th>
                    <th className="text-right py-2 px-2 font-medium text-muted w-28">Unit Price</th>
                    <th className="text-center py-2 px-2 font-medium text-muted w-16">Qty</th>
                    <th className="text-right py-2 px-2 font-medium text-muted w-28">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, i) => (
                    <tr key={i} className="border-b border-border group">
                      <td className="py-2 px-2">
                        <input type="text" value={li.description} onChange={(e) => setLineItems((prev) => prev.map((item, idx) => idx === i ? { ...item, description: e.target.value } : item))} placeholder="Description" className="w-full px-2 py-1.5 text-sm border border-transparent rounded hover:border-border focus:border-primary focus:outline-none bg-transparent" />
                      </td>
                      <td className="py-2 px-2">
                        <select value={li.lineType} onChange={(e) => setLineItems((prev) => prev.map((item, idx) => idx === i ? { ...item, lineType: e.target.value } : item))} className="w-full px-1 py-1.5 text-sm border border-transparent rounded hover:border-border focus:border-primary focus:outline-none bg-transparent">
                          {LINE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" value={li.unitPrice} onChange={(e) => setLineItems((prev) => prev.map((item, idx) => idx === i ? { ...item, unitPrice: e.target.value } : item))} min="0" step="0.01" placeholder="0.00" className="w-full px-2 py-1.5 text-sm text-right border border-transparent rounded hover:border-border focus:border-primary focus:outline-none bg-transparent" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" value={li.quantity} onChange={(e) => setLineItems((prev) => prev.map((item, idx) => idx === i ? { ...item, quantity: Math.max(1, parseInt(e.target.value) || 1) } : item))} min={1} className="w-full px-2 py-1.5 text-sm text-center border border-transparent rounded hover:border-border focus:border-primary focus:outline-none bg-transparent" />
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-foreground pr-3">${(li.quantity * (parseFloat(li.unitPrice) || 0)).toFixed(2)}</td>
                      <td className="py-2 px-1">
                        {lineItems.length > 1 && (
                          <button onClick={() => setLineItems((prev) => prev.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all p-1">×</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-background/50">
                    <td className="py-2 px-2" colSpan={6}>
                      <button onClick={() => setLineItems((prev) => [...prev, { ...emptyLineItem }])} className="text-xs text-primary hover:text-primary-dark font-medium">+ Add Item</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-2">
              <p className="text-sm font-bold text-foreground">Total: ${subtotal.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Optional notes..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Estimate'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
