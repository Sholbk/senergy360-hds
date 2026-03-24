'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type SortField = 'title' | 'status' | 'created' | 'sent' | 'updated';
type SortDir = 'asc' | 'desc';

const STATUS_OPTIONS = ['None', 'Draft', 'Pending', 'Sent', 'Viewed', 'Signed', 'Declined', 'Expired'];
const TYPE_OPTIONS = ['Active', 'Archived', 'All'];

interface Contract {
  id: string;
  title: string;
  recipient: string;
  status: string;
  shared: boolean;
  signedCopy: boolean;
  created: string;
  sent: string | null;
  updated: string;
}

export default function ContractsPage() {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Active');
  const [statusFilter, setStatusFilter] = useState('None');
  const [sortField, setSortField] = useState<SortField>('created');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Placeholder — no contracts yet
  const contracts: Contract[] = [];

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <svg
      className={`w-3 h-3 inline-block ml-1 ${sortField === field ? 'text-foreground' : 'text-muted/40'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M8 9l4-4 4 4" />
      <path d="M8 15l4 4 4-4" />
    </svg>
  );

  return (
    <div>
      <Link href="/projects" className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1">
        &larr; Back to Projects
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Contracts</h1>
        <button className="px-4 py-2 bg-foreground text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
          New Contract ▾
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <svg className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary w-48"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>Type: {t}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>Status: {s}</option>
          ))}
        </select>
      </div>

      {/* Table Header */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-background border-b border-border">
          <button onClick={() => toggleSort('title')} className="px-4 py-3 text-left text-xs font-medium text-muted hover:text-foreground transition-colors">
            Title <SortIcon field="title" />
          </button>
          <div className="px-4 py-3 text-xs font-medium text-muted">Recipient</div>
          <button onClick={() => toggleSort('status')} className="px-4 py-3 text-left text-xs font-medium text-muted hover:text-foreground transition-colors">
            Status <SortIcon field="status" />
          </button>
          <div className="px-4 py-3 text-xs font-medium text-muted">Shared</div>
          <button onClick={() => toggleSort('created')} className="px-4 py-3 text-left text-xs font-medium text-muted hover:text-foreground transition-colors">
            Created <SortIcon field="created" />
          </button>
          <div className="px-4 py-3 text-xs font-medium text-muted">Signed Copy</div>
          <button onClick={() => toggleSort('sent')} className="px-4 py-3 text-left text-xs font-medium text-muted hover:text-foreground transition-colors">
            Sent <SortIcon field="sent" />
          </button>
          <button onClick={() => toggleSort('updated')} className="px-4 py-3 text-left text-xs font-medium text-muted hover:text-foreground transition-colors">
            Updated <SortIcon field="updated" />
          </button>
        </div>

        {/* Empty State */}
        {contracts.length === 0 && (
          <div className="bg-card-bg py-16 text-center">
            <svg className="w-12 h-12 text-muted mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h2 className="text-lg font-semibold text-foreground mb-2">No contracts yet</h2>
            <p className="text-sm text-muted mb-5">Create, share, and sign contracts with your clients.</p>
            <button className="px-6 py-2.5 bg-foreground text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
              Create Contract
            </button>
          </div>
        )}

        {/* Contract Rows (when data exists) */}
        {contracts.length > 0 && contracts.map((contract) => (
          <div key={contract.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-border last:border-b-0 hover:bg-primary-bg/30 transition-colors">
            <div className="px-4 py-3 text-sm font-medium text-foreground truncate">{contract.title}</div>
            <div className="px-4 py-3 text-sm text-muted truncate">{contract.recipient}</div>
            <div className="px-4 py-3">
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">{contract.status}</span>
            </div>
            <div className="px-4 py-3 text-sm text-muted">{contract.shared ? 'Yes' : '—'}</div>
            <div className="px-4 py-3 text-xs text-muted">{contract.created}</div>
            <div className="px-4 py-3 text-sm text-muted">{contract.signedCopy ? '✓' : '—'}</div>
            <div className="px-4 py-3 text-xs text-muted">{contract.sent || '—'}</div>
            <div className="px-4 py-3 text-xs text-muted">{contract.updated}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
