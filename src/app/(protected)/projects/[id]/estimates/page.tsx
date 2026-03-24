'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { formatCents } from '@/lib/stripe';
import Link from 'next/link';

interface EstimateRow {
  id: string;
  estimateNumber: string;
  status: string;
  totalCents: number;
  validUntil: string | null;
  createdAt: string;
  clientName: string;
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600 line-through',
};

export default function ProjectEstimatesPage() {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';
  const [supabase] = useState(() => createClient());
  const [estimates, setEstimates] = useState<EstimateRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEstimates = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('estimates')
      .select('id, estimate_number, status, total_cents, valid_until, created_at, organizations(business_name, primary_first_name, primary_last_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (data) {
      setEstimates(data.map((e: Record<string, unknown>) => {
        const org = e.organizations as Record<string, unknown> | null;
        return {
          id: e.id as string,
          estimateNumber: e.estimate_number as string,
          status: e.status as string,
          totalCents: e.total_cents as number,
          validUntil: e.valid_until as string | null,
          createdAt: e.created_at as string,
          clientName: org ? ((org.business_name as string) || `${org.primary_first_name} ${org.primary_last_name}`) : '',
        };
      }));
    }
    setLoading(false);
  }, [supabase, projectId]);

  useEffect(() => { loadEstimates(); }, [loadEstimates]);

  if (loading) return <p className="text-muted text-sm">Loading estimates...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Estimates</h2>
        <Link href="/invoices/estimates" className="text-sm text-primary hover:text-primary-dark">
          Manage All Estimates →
        </Link>
      </div>

      {estimates.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
          <p className="text-sm text-muted">No estimates for this project yet.</p>
          <Link href="/invoices/estimates" className="text-sm text-primary hover:text-primary-dark mt-2 inline-block">
            Create an Estimate →
          </Link>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left py-3 px-4 font-medium text-muted">Estimate #</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Client</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted">Total</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Valid Until</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((est) => (
                <tr key={est.id} className="border-b border-border hover:bg-background transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{est.estimateNumber}</td>
                  <td className="py-3 px-4 text-foreground">{est.clientName}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${STATUS_BADGE[est.status] || 'bg-gray-100 text-gray-600'}`}>
                      {est.status.charAt(0).toUpperCase() + est.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-foreground">{formatCents(est.totalCents)}</td>
                  <td className="py-3 px-4 text-muted">{est.validUntil ? new Date(est.validUntil).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
