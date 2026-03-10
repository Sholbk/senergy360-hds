'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import ProjectTabs from '@/components/projects/ProjectTabs';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import Modal from '@/components/ui/Modal';
import { isValidUUID } from '@/lib/utils';
import { formatCents } from '@/lib/stripe';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  totalCents: number;
  dueDate: string | null;
  createdAt: string;
  clientName: string;
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600 line-through',
};

export default function ProjectInvoicesPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clientId, setClientId] = useState('');

  const loadInvoices = useCallback(async () => {
    // Load project info
    const { data: project } = await supabase
      .from('projects')
      .select('name, organization_id, organizations(business_name, primary_first_name, primary_last_name)')
      .eq('id', projectId)
      .single();

    if (project) {
      setProjectName(project.name);
      setClientId(project.organization_id);
    }

    // Check admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile && (profile.role === 'admin' || profile.role === 'owner')) {
        setIsAdmin(true);
      }
    }

    // Fetch invoices for this project
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, total_cents, due_date, created_at, organizations(business_name, primary_first_name, primary_last_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (invoicesData) {
      setInvoices(
        invoicesData.map((inv) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const org = inv.organizations as any;
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
          };
        })
      );
    }

    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleInvoiceCreated = () => {
    setShowCreateModal(false);
    loadInvoices();
  };

  if (!isValidUUID(projectId)) return <p className="text-muted text-sm">Project not found.</p>;
  if (loading) return <p className="text-muted text-sm">Loading...</p>;

  return (
    <div>
      <button
        onClick={() => router.push('/projects')}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Projects
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-4">{projectName}</h1>

      <ProjectTabs projectId={projectId} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Create Invoice
          </button>
        )}
      </div>

      {invoices.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted italic">No invoices for this project yet.</p>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left py-3 px-4 font-medium text-muted">Invoice #</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Total</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Created</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  className="border-b border-border hover:bg-background cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-foreground font-medium">{inv.invoiceNumber}</td>
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
                  <td className="py-3 px-4 text-muted">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Invoice"
        maxWidth="max-w-2xl"
      >
        <InvoiceForm
          clientId={clientId}
          projectId={projectId}
          onSuccess={handleInvoiceCreated}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
}
