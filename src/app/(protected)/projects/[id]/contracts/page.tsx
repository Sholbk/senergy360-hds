import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ContractsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from('projects').select('name').eq('id', projectId).single();

  return (
    <div>
      <Link href="/projects" className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1">&larr; Back to Projects</Link>
      <h1 className="text-2xl font-bold text-foreground mb-4">{project?.name || 'Project'}</h1>
      <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
        <svg className="w-12 h-12 text-muted mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <h2 className="text-lg font-semibold text-foreground mb-2">Contracts</h2>
        <p className="text-sm text-muted mb-4 max-w-md mx-auto">
          Create, manage, and track contracts for this project. Upload signed agreements and keep all parties aligned.
        </p>
        <p className="text-xs text-muted italic">Coming soon</p>
      </div>
    </div>
  );
}
