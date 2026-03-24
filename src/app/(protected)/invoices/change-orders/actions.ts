'use server';

import { createClient } from '@/lib/supabase/server';

interface CreateChangeOrderInput {
  projectId: string;
  title: string;
  description?: string;
  costImpactCents: number;
  requestedBy?: string;
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

export async function createChangeOrderAction(input: CreateChangeOrderInput) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase, tenantId } = ctx;

  const { data: latest } = await supabase
    .from('change_orders')
    .select('change_order_number')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1);

  let nextNum = 1001;
  if (latest && latest.length > 0) {
    const match = latest[0].change_order_number.match(/CO-(\d+)/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }

  const { error } = await supabase.from('change_orders').insert({
    tenant_id: tenantId,
    project_id: input.projectId,
    change_order_number: `CO-${nextNum}`,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    cost_impact_cents: input.costImpactCents,
    requested_by: input.requestedBy?.trim() || null,
    notes: input.notes?.trim() || null,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function approveChangeOrderAction(changeOrderId: string) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const { error } = await supabase.from('change_orders').update({
    status: 'approved',
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', changeOrderId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function rejectChangeOrderAction(changeOrderId: string) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const { error } = await supabase.from('change_orders').update({
    status: 'rejected',
    updated_at: new Date().toISOString(),
  }).eq('id', changeOrderId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteChangeOrderAction(changeOrderId: string) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const { data: co } = await supabase.from('change_orders').select('status').eq('id', changeOrderId).single();
  if (co?.status !== 'draft') return { error: 'Only draft change orders can be deleted.' };

  const { error } = await supabase.from('change_orders').delete().eq('id', changeOrderId);
  if (error) return { error: error.message };
  return { success: true };
}
