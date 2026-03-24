'use server';

import { createClient } from '@/lib/supabase/server';
import type { EstimateStatus } from '@/types';

interface LineItemInput {
  description: string;
  quantity: number;
  unitPriceCents: number;
  lineType: string;
}

interface CreateEstimateInput {
  organizationId: string;
  projectId?: string;
  leadId?: string;
  lineItems: LineItemInput[];
  validUntil?: string;
  notes?: string;
}

async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated.' };
  const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single();
  if (!profile) return { error: 'Profile not found.' };
  if (profile.role !== 'admin') return { error: 'Admin access required.' };
  return { supabase, tenantId: profile.tenant_id as string };
}

export async function createEstimateAction(input: CreateEstimateInput) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase, tenantId } = ctx;

  // Auto-generate estimate number
  const { data: latest } = await supabase
    .from('estimates')
    .select('estimate_number')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1);

  let nextNum = 1001;
  if (latest && latest.length > 0) {
    const match = latest[0].estimate_number.match(/EST-(\d+)/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }

  const subtotalCents = input.lineItems.reduce((s, li) => s + li.quantity * li.unitPriceCents, 0);

  const { data: estimate, error } = await supabase
    .from('estimates')
    .insert({
      tenant_id: tenantId,
      organization_id: input.organizationId,
      project_id: input.projectId || null,
      lead_id: input.leadId || null,
      estimate_number: `EST-${nextNum}`,
      subtotal_cents: subtotalCents,
      total_cents: subtotalCents,
      valid_until: input.validUntil || null,
      notes: input.notes?.trim() || null,
    })
    .select('id')
    .single();

  if (error || !estimate) return { error: error?.message || 'Failed to create estimate.' };

  const lineItems = input.lineItems.map((li, i) => ({
    estimate_id: estimate.id,
    description: li.description,
    quantity: li.quantity,
    unit_price_cents: li.unitPriceCents,
    total_cents: li.quantity * li.unitPriceCents,
    line_type: li.lineType,
    sort_order: i,
  }));

  const { error: liErr } = await supabase.from('estimate_line_items').insert(lineItems);
  if (liErr) return { error: liErr.message };

  return { success: true };
}

export async function updateEstimateStatusAction(estimateId: string, status: EstimateStatus) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'approved') payload.approved_at = new Date().toISOString();

  const { error } = await supabase.from('estimates').update(payload).eq('id', estimateId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function convertEstimateToInvoiceAction(estimateId: string) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase, tenantId } = ctx;

  const { data: estimate } = await supabase.from('estimates').select('*').eq('id', estimateId).single();
  if (!estimate) return { error: 'Estimate not found.' };
  if (estimate.converted_invoice_id) return { error: 'Estimate already converted.' };

  // Get line items
  const { data: lineItems } = await supabase
    .from('estimate_line_items')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('sort_order');

  // Auto-generate invoice number
  const { data: latestInv } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1);

  let nextInvNum = 1001;
  if (latestInv && latestInv.length > 0) {
    const match = latestInv[0].invoice_number.match(/INV-(\d+)/);
    if (match) nextInvNum = parseInt(match[1]) + 1;
  }

  // Create invoice
  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .insert({
      tenant_id: tenantId,
      client_id: estimate.organization_id,
      project_id: estimate.project_id,
      invoice_number: `INV-${nextInvNum}`,
      status: 'draft',
      subtotal_cents: estimate.subtotal_cents,
      tax_cents: estimate.tax_cents,
      total_cents: estimate.total_cents,
      notes: estimate.notes,
    })
    .select('id')
    .single();

  if (invErr || !invoice) return { error: invErr?.message || 'Failed to create invoice.' };

  // Copy line items
  if (lineItems && lineItems.length > 0) {
    await supabase.from('invoice_line_items').insert(
      lineItems.map((li) => ({
        invoice_id: invoice.id,
        description: li.description,
        quantity: li.quantity,
        unit_price_cents: li.unit_price_cents,
        total_cents: li.total_cents,
        line_type: li.line_type,
        sort_order: li.sort_order,
      }))
    );
  }

  // Update estimate
  await supabase.from('estimates').update({
    status: 'approved',
    approved_at: new Date().toISOString(),
    converted_invoice_id: invoice.id,
    updated_at: new Date().toISOString(),
  }).eq('id', estimateId);

  return { success: true, invoiceId: invoice.id };
}

export async function deleteEstimateAction(estimateId: string) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const { data: estimate } = await supabase.from('estimates').select('status').eq('id', estimateId).single();
  if (estimate?.status !== 'draft') return { error: 'Only draft estimates can be deleted.' };

  const { error } = await supabase.from('estimates').delete().eq('id', estimateId);
  if (error) return { error: error.message };
  return { success: true };
}
