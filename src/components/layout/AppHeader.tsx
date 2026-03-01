'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppHeader() {
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserName(`${profile.first_name} ${profile.last_name}`.trim() || user.email || '');
        } else {
          setUserName(user.email || '');
        }
      }
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-14 border-b border-border bg-card-bg flex items-center justify-end px-6">
      <div className="flex items-center gap-4">
        {userName && (
          <span className="text-sm text-muted">Welcome, {userName}</span>
        )}
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="text-sm text-muted hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
