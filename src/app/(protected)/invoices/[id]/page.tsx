'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import InvoiceDetail from '@/components/invoices/InvoiceDetail';
import { isValidUUID } from '@/lib/utils';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  lineType: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  status: string;
  totalCents: number;
  subtotalCents: number;
  taxCents: number;
  dueDate: string | null;
  createdAt: string;
  notes: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  projectName: string | null;
  lineItems: LineItem[];
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const invoiceId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadInvoice = useCallback(async () => {
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

    // Fetch invoice
    const { data: inv } = await supabase
      .from('invoices')
      .select('*, clients(primary_first_name, primary_last_name, primary_email, primary_phone), projects(name)')
      .eq('id', invoiceId)
      .single();

    if (!inv) {
      setLoading(false);
      return;
    }

    // Fetch line items
    const { data: lineItemsData } = await supabase
      .from('invoice_line_items')
      .select('id, description, quantity, unit_price_cents, line_total_cents, line_type')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = inv.clients as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = inv.projects as any;

    setInvoice({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      status: inv.status,
      totalCents: inv.total_cents,
      subtotalCents: inv.subtotal_cents,
      taxCents: inv.tax_cents,
      dueDate: inv.due_date,
      createdAt: inv.created_at,
      notes: inv.notes,
      clientName: client
        ? `${client.primary_first_name} ${client.primary_last_name}`
        : '',
      clientEmail: client?.primary_email || null,
      clientPhone: client?.primary_phone || null,
      projectName: project?.name || null,
      lineItems: (lineItemsData || []).map((li) => ({
        id: li.id,
        description: li.description,
        quantity: li.quantity,
        unitPriceCents: li.unit_price_cents,
        lineTotalCents: li.line_total_cents,
        lineType: li.line_type,
      })),
    });

    setLoading(false);
  }, [invoiceId, supabase]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleUpdateStatus = async (status: string) => {
    const { error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', invoiceId);

    if (!error) {
      await loadInvoice();
    }
  };

  if (!isValidUUID(invoiceId)) return <p className="text-muted text-sm">Invoice not found.</p>;
  if (loading) return <p className="text-muted text-sm">Loading...</p>;
  if (!invoice) return <p className="text-muted text-sm">Invoice not found.</p>;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back
      </button>

      <InvoiceDetail
        invoice={invoice}
        isAdmin={isAdmin}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
