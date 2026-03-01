'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

interface AuthState {
  userId: string | null;
  tenantId: string | null;
  role: UserRole | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [supabase] = useState(() => createClient());
  const [state, setState] = useState<AuthState>({
    userId: null,
    tenantId: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ userId: null, tenantId: null, role: null, loading: false });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

      setState({
        userId: user.id,
        tenantId: profile?.tenant_id || null,
        role: profile?.role || null,
        loading: false,
      });
    }
    load();
  }, [supabase]);

  return state;
}

// Helper to get tenant_id securely (verifies user first)
export async function getSecureTenantId(supabaseClient: ReturnType<typeof createClient>): Promise<string | null> {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  return profile?.tenant_id || null;
}
