import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ChangeOrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from('projects').select('name').eq('id', projectId).single();

  return (
    <div>
      <Link href="/projects" className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1">&larr; Back to Projects</Link>
      <h1 className="text-2xl font-bold text-foreground mb-4">{project?.name || 'Project'}</h1>
      <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
        <svg className="w-12 h-12 text-muted mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <h2 className="text-lg font-semibold text-foreground mb-2">Change Orders</h2>
        <p className="text-sm text-muted mb-4 max-w-md mx-auto">
          Document scope changes, track cost impacts, and get client approvals. Keep your budget on track.
        </p>
        <p className="text-xs text-muted italic">Coming soon</p>
      </div>
    </div>
  );
}
