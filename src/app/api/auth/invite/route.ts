import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // Verify the requesting user is an admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, role, entityType, entityId, name } = await request.json();

    if (!email || !role || !entityType || !entityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Create the user account
    const nameParts = (name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        tenant_id: profile.tenant_id,
        role,
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (createError) {
      console.error('Create user error:', createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!newUser.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Link the user to the organization record
    const { error: linkError } = await adminClient
      .from('organizations')
      .update({ user_id: newUser.user.id })
      .eq('id', entityId);

    if (linkError) {
      console.error('Link user error:', linkError);
    }

    // Ensure profile exists (trigger may have already created it)
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', newUser.user.id)
      .single();

    if (!existingProfile) {
      await adminClient.from('profiles').insert({
        id: newUser.user.id,
        tenant_id: profile.tenant_id,
        role,
        first_name: firstName,
        last_name: lastName,
        email,
      });
    }

    // Send password reset email so user can set their password
    const { error: resetError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    if (resetError) {
      console.error('Password reset email error:', resetError);
    }

    return NextResponse.json({ success: true, userId: newUser.user.id });
  } catch (err) {
    console.error('Invite API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
