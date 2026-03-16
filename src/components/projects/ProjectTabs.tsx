'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ProjectTabsProps {
  projectId: string;
}

const TABS = [
  { label: 'Overview', path: '' },
  { label: 'Feed', path: '/feed' },
  { label: 'Team', path: '/team' },
  { label: 'Documents', path: '/documents' },
  { label: 'Checklist', path: '/checklist' },
  { label: 'Reports', path: '/reports' },
  { label: 'Invoices', path: '/invoices' },
  { label: 'Calendar', path: '/calendar' },
  { label: "Owner's Manual", path: '/owners-manual' },
];

export default function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname();
  const basePath = `/projects/${projectId}`;

  return (
    <div className="border-b border-border mb-6">
      <nav className="flex gap-0 -mb-px">
        {TABS.map((tab) => {
          const tabPath = `${basePath}${tab.path}`;
          const isActive = tab.path === ''
            ? pathname === basePath
            : pathname.startsWith(tabPath);

          return (
            <Link
              key={tab.path}
              href={tabPath}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground hover:border-border'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
