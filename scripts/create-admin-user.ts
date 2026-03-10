import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAdminUser() {
  const email = 'trevorsdesignventures@gmail.com';
  const password = 'TrevorisCool2@26!';

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  if (existing) {
    console.log('User already exists with ID:', existing.id);
    // Ensure profile exists with admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', existing.id)
      .single();

    if (profile) {
      console.log('Profile exists:', profile);
      if (profile.role !== 'admin') {
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', existing.id);
        if (error) {
          console.error('Error updating role:', error);
        } else {
          console.log('Updated role to admin');
        }
      } else {
        console.log('Already has admin role. No changes needed.');
      }
    } else {
      console.log('No profile found — creating one...');
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'senergy360')
        .single();

      const { error } = await supabase.from('profiles').insert({
        id: existing.id,
        tenant_id: tenant?.id,
        role: 'admin',
        email,
        first_name: 'Trevor',
        last_name: 'Admin',
      });
      if (error) console.error('Error creating profile:', error);
      else console.log('Profile created successfully');
    }
    return;
  }

  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email so they can log in immediately
    user_metadata: {
      first_name: 'Trevor',
      last_name: 'Admin',
    },
  });

  if (error) {
    console.error('Error creating user:', error.message);
    return;
  }

  console.log('User created successfully!');
  console.log('User ID:', data.user.id);
  console.log('Email:', data.user.email);

  // Verify the profile was auto-created by the database trigger
  // Wait a moment for the trigger to fire
  await new Promise((r) => setTimeout(r, 1000));

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('Profile not auto-created, creating manually...');
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', 'senergy360')
      .single();

    await supabase.from('profiles').insert({
      id: data.user.id,
      tenant_id: tenant?.id,
      role: 'admin',
      email,
      first_name: 'Trevor',
      last_name: 'Admin',
    });
    console.log('Profile created manually');
  } else {
    console.log('Profile auto-created:', profile);
    // Ensure admin role
    if (profile.role !== 'admin') {
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', data.user.id);
      console.log('Updated role to admin');
    }
  }

  console.log('\nAdmin user is ready! They can now log in at:');
  console.log('https://senergy360-hds.netlify.app/login');
  console.log('Email:', email);
}

createAdminUser().catch(console.error);
