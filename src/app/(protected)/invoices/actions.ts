'use server';

import { createClient } from '@/lib/supabase/server';

interface LineItemInput {
  description: string;
  quantity: number;
  unitPriceCents: number;
  lineType: string;
}

interface CreateInvoiceInput {
  clientId: string;
  projectId?: string;
  lineItems: LineItemInput[];
  dueDate?: string;
  notes?: string;
}

export async function createInvoiceAction(input: CreateInvoiceInput) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated. Please log out and log back in.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'Profile not found for your account. Please contact support.' };
  }

  if (profile.role !== 'admin' && profile.role !== 'owner') {
    return { error: 'Only admins can create invoices.' };
  }

  // Auto-generate invoice number
  const { data: lastInvoice } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1001;
  if (lastInvoice?.invoice_number) {
    const match = lastInvoice.invoice_number.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  const invoiceNumber = `INV-${nextNumber}`;

  // Calculate totals
  const subtotalCents = input.lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unitPriceCents,
    0
  );
  const taxCents = 0; // Tax can be added later
  const totalCents = subtotalCents + taxCents;

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      tenant_id: profile.tenant_id,
      client_id: input.clientId,
      project_id: input.projectId || null,
      invoice_number: invoiceNumber,
      status: 'draft',
      subtotal_cents: subtotalCents,
      tax_cents: taxCents,
      total_cents: totalCents,
      due_date: input.dueDate || null,
      notes: input.notes?.trim() || null,
    })
    .select('id')
    .single();

  if (invoiceError || !invoice) {
    return { error: 'Failed to create invoice. Please try again.' };
  }

  // Insert line items
  const lineItemRows = input.lineItems.map((li) => ({
    invoice_id: invoice.id,
    description: li.description.trim(),
    quantity: li.quantity,
    unit_price_cents: li.unitPriceCents,
    total_cents: li.quantity * li.unitPriceCents,
    line_type: li.lineType,
  }));

  const { error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .insert(lineItemRows);

  if (lineItemsError) {
    // Clean up the invoice if line items fail
    await supabase.from('invoices').delete().eq('id', invoice.id);
    return { error: 'Failed to create invoice line items. Please try again.' };
  }

  return { success: true, invoiceId: invoice.id };
}

export async function updateInvoiceStatusAction(invoiceId: string, status: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated.' };
  }

  const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return { error: 'Invalid status.' };
  }

  const { error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId);

  if (error) {
    return { error: 'Failed to update invoice status.' };
  }

  return { success: true };
}

export async function deleteInvoiceAction(invoiceId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated.' };
  }

  // Only allow deleting draft invoices
  const { data: invoice } = await supabase
    .from('invoices')
    .select('status')
    .eq('id', invoiceId)
    .single();

  if (!invoice) {
    return { error: 'Invoice not found.' };
  }

  if (invoice.status !== 'draft') {
    return { error: 'Only draft invoices can be deleted.' };
  }

  // Delete line items first
  await supabase.from('invoice_line_items').delete().eq('invoice_id', invoiceId);

  const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);

  if (error) {
    return { error: 'Failed to delete invoice.' };
  }

  return { success: true };
}
