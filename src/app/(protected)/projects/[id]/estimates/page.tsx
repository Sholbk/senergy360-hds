import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function EstimatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from('projects').select('name').eq('id', projectId).single();

  return (
    <div>
      <Link href="/projects" className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1">&larr; Back to Projects</Link>
      <h1 className="text-2xl font-bold text-foreground mb-4">{project?.name || 'Project'}</h1>
      <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
        <svg className="w-12 h-12 text-muted mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
        <h2 className="text-lg font-semibold text-foreground mb-2">Estimates</h2>
        <p className="text-sm text-muted mb-4 max-w-md mx-auto">
          Build and send professional cost estimates. Track revisions and client approvals.
        </p>
        <p className="text-xs text-muted italic">Coming soon</p>
      </div>
    </div>
  );
}
