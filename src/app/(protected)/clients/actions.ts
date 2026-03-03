'use server';

import { createClient } from '@/lib/supabase/server';

interface CreateClientInput {
  primaryFirstName: string;
  primaryLastName: string;
  primaryPhone: string;
  primaryEmail: string;
  secondaryFirstName: string;
  secondaryLastName: string;
  secondaryPhone: string;
  secondaryEmail: string;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
}

export async function createClientAction(input: CreateClientInput) {
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

  const { error } = await supabase.from('clients').insert({
    tenant_id: profile.tenant_id,
    primary_first_name: input.primaryFirstName.trim(),
    primary_last_name: input.primaryLastName.trim(),
    primary_phone: input.primaryPhone.trim() || null,
    primary_email: input.primaryEmail.trim() || null,
    secondary_first_name: input.secondaryFirstName.trim() || null,
    secondary_last_name: input.secondaryLastName.trim() || null,
    secondary_phone: input.secondaryPhone.trim() || null,
    secondary_email: input.secondaryEmail.trim() || null,
    billing_address_line1: input.billingAddressLine1.trim() || null,
    billing_address_line2: input.billingAddressLine2.trim() || null,
    billing_city: input.billingCity.trim() || null,
    billing_state: input.billingState.trim() || null,
    billing_postal_code: input.billingPostalCode.trim() || null,
    billing_country: input.billingCountry.trim() || 'US',
  });

  if (error) {
    return { error: 'Failed to add client. Please try again.' };
  }

  return { success: true };
}
