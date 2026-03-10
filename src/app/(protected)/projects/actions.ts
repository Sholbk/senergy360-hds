'use server';

import { createClient } from '@/lib/supabase/server';

interface CreateProjectInput {
  name: string;
  propertyOwnerId: string;
  projectType: string;
  otherDescription: string;
  description: string;
  buildingPlanSummary: string;
  siteAddressLine1: string;
  siteAddressLine2: string;
  siteCity: string;
  siteState: string;
  sitePostalCode: string;
  siteCountry: string;
}

export async function createProjectAction(input: CreateProjectInput) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated. Please log out and log back in.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: `Profile not found for your account (${user.email}). Please contact support.` };
  }

  const { data: newProject, error } = await supabase.from('projects').insert({
    tenant_id: profile.tenant_id,
    name: input.name.trim(),
    project_type: input.projectType,
    project_type_other_description: input.projectType === 'other' ? input.otherDescription.trim() : null,
    description: input.description.trim() || null,
    building_plan_summary: input.buildingPlanSummary.trim() || null,
    site_address_line1: input.siteAddressLine1.trim(),
    site_address_line2: input.siteAddressLine2.trim() || null,
    site_city: input.siteCity.trim(),
    site_state: input.siteState.trim(),
    site_postal_code: input.sitePostalCode.trim(),
    site_country: input.siteCountry.trim() || 'US',
  }).select('id').single();

  if (error || !newProject) {
    return { error: 'Failed to create project. Please try again.' };
  }

  // Add property owner as participant
  if (input.propertyOwnerId) {
    await supabase.from('project_participants').insert({
      project_id: newProject.id,
      organization_id: input.propertyOwnerId,
      project_role: 'property_owner',
    });
  }

  return { success: true };
}
