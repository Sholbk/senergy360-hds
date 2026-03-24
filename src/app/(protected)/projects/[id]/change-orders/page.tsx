'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { formatCents } from '@/lib/stripe';
import Link from 'next/link';

interface ChangeOrderRow {
  id: string;
  changeOrderNumber: string;
  title: string;
  status: string;
  costImpactCents: number;
  createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', pending_approval: 'Pending', approved: 'Approved', rejected: 'Rejected',
};

export default function ProjectChangeOrdersPage() {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';
  const [supabase] = useState(() => createClient());
  const [changeOrders, setChangeOrders] = useState<ChangeOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('change_orders')
      .select('id, change_order_number, title, status, cost_impact_cents, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (data) {
      setChangeOrders(data.map((co) => ({
        id: co.id, changeOrderNumber: co.change_order_number, title: co.title,
        status: co.status, costImpactCents: co.cost_impact_cents, createdAt: co.created_at,
      })));
    }
    setLoading(false);
  }, [supabase, projectId]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <p className="text-muted text-sm">Loading change orders...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Change Orders</h2>
        <Link href="/invoices/change-orders" className="text-sm text-primary hover:text-primary-dark">
          Manage All Change Orders →
        </Link>
      </div>

      {changeOrders.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
          <p className="text-sm text-muted">No change orders for this project yet.</p>
          <Link href="/invoices/change-orders" className="text-sm text-primary hover:text-primary-dark mt-2 inline-block">
            Create a Change Order →
          </Link>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left py-3 px-4 font-medium text-muted">CO #</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Title</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Cost Impact</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {changeOrders.map((co) => (
                <tr key={co.id} className="border-b border-border hover:bg-background transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{co.changeOrderNumber}</td>
                  <td className="py-3 px-4 text-foreground">{co.title}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${STATUS_BADGE[co.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[co.status] || co.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-foreground">{formatCents(co.costImpactCents)}</td>
                  <td className="py-3 px-4 text-muted">{new Date(co.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
