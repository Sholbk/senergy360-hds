'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCents } from '@/lib/stripe';

interface DashboardData {
  totalRevenue: number;
  outstanding: number;
  overdue: number;
  paidThisMonth: number;
}

export default function FinancialsDashboard() {
  const [supabase] = useState(() => createClient());
  const [data, setData] = useState<DashboardData>({ totalRevenue: 0, outstanding: 0, overdue: 0, paidThisMonth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('status, total_cents, paid_at');

      if (invoices) {
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        let totalRevenue = 0;
        let outstanding = 0;
        let overdue = 0;
        let paidThisMonth = 0;

        for (const inv of invoices) {
          if (inv.status === 'paid') {
            totalRevenue += inv.total_cents;
            if (inv.paid_at && inv.paid_at >= firstOfMonth) {
              paidThisMonth += inv.total_cents;
            }
          }
          if (inv.status === 'sent' || inv.status === 'overdue') {
            outstanding += inv.total_cents;
          }
          if (inv.status === 'overdue') {
            overdue += inv.total_cents;
          }
        }

        setData({ totalRevenue, outstanding, overdue, paidThisMonth });
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const cards = [
    { label: 'Total Revenue', value: data.totalRevenue, color: 'text-green-600' },
    { label: 'Outstanding', value: data.outstanding, color: 'text-blue-600' },
    { label: 'Overdue', value: data.overdue, color: 'text-red-600' },
    { label: 'Paid This Month', value: data.paidThisMonth, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-card-bg rounded-lg border border-border p-4">
          <p className="text-xs text-muted font-medium uppercase tracking-wide">{card.label}</p>
          <p className={`text-xl font-bold mt-1 ${loading ? 'text-muted' : card.color}`}>
            {loading ? '—' : formatCents(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
