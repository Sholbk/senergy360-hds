import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DailyLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from('projects').select('name').eq('id', projectId).single();

  return (
    <div>
      <Link href="/projects" className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1">&larr; Back to Projects</Link>
      <h1 className="text-2xl font-bold text-foreground mb-4">{project?.name || 'Project'}</h1>
      <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
        <svg className="w-12 h-12 text-muted mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
        <h2 className="text-lg font-semibold text-foreground mb-2">Daily Logs</h2>
        <p className="text-sm text-muted mb-4 max-w-md mx-auto">
          Record daily site activity — weather, crew, progress, notes, and photos. Keep a complete project journal.
        </p>
        <p className="text-xs text-muted italic">Coming soon</p>
      </div>
    </div>
  );
}
