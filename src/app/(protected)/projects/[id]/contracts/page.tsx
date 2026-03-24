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
          <div className="bg-card-bg py-16">
            <div className="flex items-center justify-center gap-12 max-w-3xl mx-auto px-8">
              {/* Illustration placeholder */}
              <div className="flex-shrink-0 w-64 h-40 bg-foreground rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-foreground to-foreground/80" />
                <div className="relative text-center">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Project Management</p>
                  <p className="text-white text-sm font-semibold leading-tight">How to Create<br />Contracts</p>
                  <div className="mt-2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
                {/* Side preview */}
                <div className="absolute right-0 top-2 bottom-2 w-20 bg-white rounded-l-lg shadow-lg opacity-70">
                  <div className="p-2">
                    <div className="text-[6px] font-semibold text-foreground mb-1">Contract</div>
                    <div className="space-y-1">
                      <div className="h-1 bg-muted/30 rounded" />
                      <div className="h-1 bg-muted/30 rounded w-3/4" />
                      <div className="h-1 bg-muted/30 rounded w-1/2" />
                      <div className="h-1 bg-muted/30 rounded" />
                      <div className="h-1 bg-muted/30 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <div className="w-48 h-48 rounded-full bg-primary-bg/50 flex items-center justify-center mx-auto mb-0 -mt-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">Start Your First Contract</h2>
                    <p className="text-sm text-muted mb-5">Create, share, and sign contracts with your clients.</p>
                    <button className="px-6 py-2.5 bg-foreground text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
                      Create Contract
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
