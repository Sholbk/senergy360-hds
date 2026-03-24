'use client';

import FinancialsSidebar from '@/components/invoices/FinancialsSidebar';
import FinancialsDashboard from '@/components/invoices/FinancialsDashboard';
import { usePathname } from 'next/navigation';

export default function FinancialsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Don't show sidebar/dashboard on invoice detail pages
  const isDetailPage = /^\/invoices\/[0-9a-f-]{36}/.test(pathname);

  if (isDetailPage) {
    return <>{children}</>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-4">Financials</h1>
      <FinancialsDashboard />
      <div className="flex gap-6">
        <div className="w-[200px] min-w-[200px] flex-shrink-0">
          <FinancialsSidebar />
        </div>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
