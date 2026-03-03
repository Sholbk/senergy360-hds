'use server';

import { createClient } from '@/lib/supabase/server';

interface CreateProfessionalInput {
  businessName: string;
  primarySpecialty: string;
  primaryFirstName: string;
  primaryLastName: string;
  primaryPhone: string;
  primaryEmail: string;
  secondaryFirstName: string;
  secondaryLastName: string;
  secondaryPhone: string;
  secondaryEmail: string;
  businessAddressLine1: string;
  businessAddressLine2: string;
  businessCity: string;
  businessState: string;
  businessPostalCode: string;
  businessCountry: string;
}

export async function createProfessionalAction(input: CreateProfessionalInput) {
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

  const { error } = await supabase.from('professionals').insert({
    tenant_id: profile.tenant_id,
    business_name: input.businessName.trim(),
    primary_specialty: input.primarySpecialty.trim(),
    primary_first_name: input.primaryFirstName.trim(),
    primary_last_name: input.primaryLastName.trim(),
    primary_phone: input.primaryPhone.trim() || null,
    primary_email: input.primaryEmail.trim() || null,
    secondary_first_name: input.secondaryFirstName.trim() || null,
    secondary_last_name: input.secondaryLastName.trim() || null,
    secondary_phone: input.secondaryPhone.trim() || null,
    secondary_email: input.secondaryEmail.trim() || null,
    business_address_line1: input.businessAddressLine1.trim() || null,
    business_address_line2: input.businessAddressLine2.trim() || null,
    business_city: input.businessCity.trim() || null,
    business_state: input.businessState.trim() || null,
    business_postal_code: input.businessPostalCode.trim() || null,
    business_country: input.businessCountry.trim() || 'US',
  });

  if (error) {
    return { error: 'Failed to add professional. Please try again.' };
  }

  return { success: true };
}
