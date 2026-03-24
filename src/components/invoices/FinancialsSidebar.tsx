'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavGroup {
  label: string;
  items: { label: string; path: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Pipeline', path: '/invoices/pipeline' },
    ],
  },
  {
    label: 'Billing',
    items: [
      { label: 'Invoices', path: '/invoices/list' },
      { label: 'Estimates', path: '/invoices/estimates' },
    ],
  },
  {
    label: 'Tracking',
    items: [
      { label: 'Change Orders', path: '/invoices/change-orders' },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { label: 'Reports', path: '/invoices/reports' },
    ],
  },
];

export default function FinancialsSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className="space-y-1">
      {NAV_GROUPS.map((group) => {
        const isCollapsed = collapsed[group.label];
        const hasActive = group.items.some((item) => pathname.startsWith(item.path));

        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <span className={cn(hasActive && 'text-primary')}>{group.label}</span>
              <svg
                className={cn('w-3 h-3 transition-transform', isCollapsed && '-rotate-90')}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {!isCollapsed && (
              <div className="space-y-0.5 mb-2">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        'block px-3 py-2 text-sm rounded-md transition-colors ml-1',
                        isActive
                          ? 'bg-primary-bg text-primary font-medium'
                          : 'text-foreground/70 hover:text-foreground hover:bg-background'
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
