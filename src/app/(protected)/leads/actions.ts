'use server';

import { createClient } from '@/lib/supabase/server';
import type { LeadStage } from '@/types';

interface CreateLeadInput {
  name: string;
  email: string;
  phone?: string;
  leadSource?: string;
  projectType?: string;
  addressLine1?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  assignedTo?: string;
  tags?: string[];
  notes?: string;
  message?: string;
}

interface UpdateLeadInput extends Partial<CreateLeadInput> {
  stage?: LeadStage;
}

async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found.' };
  if (profile.role !== 'admin') return { error: 'Admin access required.' };

  return { supabase, user, tenantId: profile.tenant_id as string };
}

export async function createLeadAction(input: CreateLeadInput) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase, tenantId } = ctx;

  const { error } = await supabase.from('leads').insert({
    tenant_id: tenantId,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    lead_source: input.leadSource || null,
    project_type: input.projectType || null,
    address_line1: input.addressLine1?.trim() || null,
    address_city: input.addressCity?.trim() || null,
    address_state: input.addressState?.trim() || null,
    address_postal_code: input.addressPostalCode?.trim() || null,
    assigned_to: input.assignedTo || null,
    tags: input.tags || [],
    notes: input.notes?.trim() || null,
    message: input.message?.trim() || null,
    stage: 'new',
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateLeadStageAction(leadId: string, stage: LeadStage) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const { error } = await supabase
    .from('leads')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('id', leadId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateLeadAction(leadId: string, input: UpdateLeadInput) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.email !== undefined) payload.email = input.email.trim();
  if (input.phone !== undefined) payload.phone = input.phone?.trim() || null;
  if (input.leadSource !== undefined) payload.lead_source = input.leadSource || null;
  if (input.projectType !== undefined) payload.project_type = input.projectType || null;
  if (input.addressLine1 !== undefined) payload.address_line1 = input.addressLine1?.trim() || null;
  if (input.addressCity !== undefined) payload.address_city = input.addressCity?.trim() || null;
  if (input.addressState !== undefined) payload.address_state = input.addressState?.trim() || null;
  if (input.addressPostalCode !== undefined) payload.address_postal_code = input.addressPostalCode?.trim() || null;
  if (input.assignedTo !== undefined) payload.assigned_to = input.assignedTo || null;
  if (input.tags !== undefined) payload.tags = input.tags;
  if (input.notes !== undefined) payload.notes = input.notes?.trim() || null;
  if (input.message !== undefined) payload.message = input.message?.trim() || null;
  if (input.stage !== undefined) payload.stage = input.stage;

  const { error } = await supabase.from('leads').update(payload).eq('id', leadId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteLeadAction(leadId: string) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const { error } = await supabase
    .from('leads')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', leadId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function convertLeadToProjectAction(leadId: string) {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { error: ctx.error };
  const { supabase, tenantId } = ctx;

  // 1. Fetch the lead
  const { data: lead, error: leadErr } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (leadErr || !lead) return { error: 'Lead not found.' };
  if (lead.project_id) return { error: 'Lead already converted to a project.' };

  // 2. Parse name into first/last
  const nameParts = (lead.name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // 3. Create organization (property_owner)
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .insert({
      tenant_id: tenantId,
      org_type: 'property_owner',
      primary_first_name: firstName,
      primary_last_name: lastName,
      primary_email: lead.email || null,
      primary_phone: lead.phone || null,
      address_line1: lead.address_line1 || null,
      city: lead.address_city || null,
      state: lead.address_state || null,
      postal_code: lead.address_postal_code || null,
    })
    .select('id')
    .single();

  if (orgErr || !org) return { error: `Failed to create organization: ${orgErr?.message}` };

  // 4. Create draft project
  const projectName = lastName ? `${lastName} Residence` : `${firstName} Project`;
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .insert({
      tenant_id: tenantId,
      name: projectName,
      status: 'draft',
      project_type: lead.project_type || 'other',
      site_address_line1: lead.address_line1 || '',
      site_city: lead.address_city || '',
      site_state: lead.address_state || '',
      site_postal_code: lead.address_postal_code || '',
      site_country: 'US',
    })
    .select('id')
    .single();

  if (projErr || !project) return { error: `Failed to create project: ${projErr?.message}` };

  // 5. Link org to project as property_owner
  await supabase.from('project_participants').insert({
    project_id: project.id,
    organization_id: org.id,
    project_role: 'property_owner',
  });

  // 6. Update lead with conversion references
  await supabase
    .from('leads')
    .update({
      organization_id: org.id,
      project_id: project.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  return { success: true, projectId: project.id, organizationId: org.id };
}
