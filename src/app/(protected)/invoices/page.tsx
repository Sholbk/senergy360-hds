'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FinancialsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/invoices/pipeline'); }, [router]);
  return <p className="text-muted text-sm">Redirecting...</p>;
}
