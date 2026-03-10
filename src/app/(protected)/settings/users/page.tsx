'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import Modal from '@/components/ui/Modal';
import SearchBox from '@/components/ui/SearchBox';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface InviteTarget {
  type: 'client' | 'professional';
  id: string;
  name: string;
  email: string;
}

export default function UsersPage() {
  const { role, loading: authLoading } = useAuth();
  const [supabase] = useState(() => createClient());
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTargets, setInviteTargets] = useState<InviteTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (data) {
        setUsers(data.map((u) => ({
          id: u.id,
          firstName: u.first_name,
          lastName: u.last_name,
          email: u.email,
          role: u.role,
          createdAt: u.created_at,
        })));
      }
      setLoading(false);
    }
    loadUsers();
  }, [supabase]);

  const openInviteModal = async () => {
    setInviteError('');
    setInviteSuccess('');
    setSelectedTarget('');

    // Load clients and professionals without user accounts
    const [{ data: clients }, { data: professionals }] = await Promise.all([
      supabase
        .from('clients')
        .select('id, primary_first_name, primary_last_name, primary_email, user_id')
        .is('user_id', null)
        .is('deleted_at', null),
      supabase
        .from('professionals')
        .select('id, primary_first_name, primary_last_name, primary_email, user_id')
        .is('user_id', null)
        .is('deleted_at', null),
    ]);

    const targets: InviteTarget[] = [];
    if (clients) {
      clients.forEach((c) => {
        if (c.primary_email) {
          targets.push({
            type: 'client',
            id: c.id,
            name: `${c.primary_first_name} ${c.primary_last_name}`,
            email: c.primary_email,
          });
        }
      });
    }
    if (professionals) {
      professionals.forEach((p) => {
        if (p.primary_email) {
          targets.push({
            type: 'professional',
            id: p.id,
            name: `${p.primary_first_name} ${p.primary_last_name}`,
            email: p.primary_email,
          });
        }
      });
    }

    setInviteTargets(targets);
    setShowInviteModal(true);
  };

  const handleInvite = async () => {
    if (!selectedTarget) return;
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');

    const target = inviteTargets.find((t) => `${t.type}:${t.id}` === selectedTarget);
    if (!target) {
      setInviteError('Invalid selection');
      setInviting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: target.email,
          role: target.type,
          entityType: target.type,
          entityId: target.id,
          name: target.name,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setInviteError(data.error || 'Failed to create account');
      } else {
        setInviteSuccess(`Account created for ${target.name}. A password reset email has been sent to ${target.email}.`);
        // Refresh users list
        const { data } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role, created_at')
          .order('created_at', { ascending: false });
        if (data) {
          setUsers(data.map((u) => ({
            id: u.id,
            firstName: u.first_name,
            lastName: u.last_name,
            email: u.email,
            role: u.role,
            createdAt: u.created_at,
          })));
        }
      }
    } catch {
      setInviteError('Network error. Please try again.');
    }

    setInviting(false);
  };

  if (authLoading || loading) return <p className="text-muted text-sm">Loading...</p>;
  if (role !== 'admin') return <p className="text-muted text-sm">Access denied.</p>;

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const roleBadge = (r: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      client: 'bg-blue-100 text-blue-700',
      professional: 'bg-green-100 text-green-700',
    };
    return styles[r] || 'bg-gray-100 text-gray-700';
  };

  const inputClass = 'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">User Accounts</h1>
        <button
          onClick={openInviteModal}
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          + Create Account
        </button>
      </div>

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search users by name, email, or role..."
      />

      <div className="mt-4 bg-card-bg rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="text-left py-3 px-4 font-medium text-muted">Name</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Email</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Role</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-background transition-colors">
                <td className="py-3 px-4 font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </td>
                <td className="py-3 px-4 text-muted">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-muted">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted italic">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Create User Account">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Create a login account for a client or professional. They will receive a password reset email.
          </p>

          {inviteTargets.length === 0 ? (
            <p className="text-sm text-muted italic">
              No clients or professionals without accounts found. Make sure they have an email address set.
            </p>
          ) : (
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a client or professional...</option>
              <optgroup label="Clients">
                {inviteTargets.filter((t) => t.type === 'client').map((t) => (
                  <option key={`client:${t.id}`} value={`client:${t.id}`}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Professionals">
                {inviteTargets.filter((t) => t.type === 'professional').map((t) => (
                  <option key={`professional:${t.id}`} value={`professional:${t.id}`}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </optgroup>
            </select>
          )}

          {inviteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{inviteError}</div>
          )}
          {inviteSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{inviteSuccess}</div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleInvite}
              disabled={inviting || !selectedTarget || !!inviteSuccess}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {inviting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
