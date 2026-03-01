import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch counts
  const [clientsResult, projectsResult, materialsResult] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }).neq('status', 'completed'),
    supabase.from('materials').select('id', { count: 'exact', head: true }),
  ]);

  const totalClients = clientsResult.count ?? 0;
  const activeProjects = projectsResult.count ?? 0;
  const totalMaterials = materialsResult.count ?? 0;

  // Fetch recent clients
  const { data: recentClients } = await supabase
    .from('clients')
    .select('id, primary_first_name, primary_last_name, billing_city, billing_state')
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent projects with client info
  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id, name, status, client_id, clients(primary_first_name, primary_last_name)')
    .order('created_on', { ascending: false })
    .limit(5);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted text-sm">Welcome to SENERGY360 Core Framework Contractor Guide</p>
        </div>
        <Link
          href="/clients"
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
        >
          + New Client
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Total Clients" value={totalClients} color="blue" />
        <StatsCard title="Active Projects" value={activeProjects} color="green" />
        <StatsCard title="Materials Database" value={totalMaterials} color="gold" />
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Recent Clients */}
        <div className="bg-card-bg rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Clients</h2>
            <Link href="/clients" className="text-sm text-muted hover:text-foreground flex items-center gap-1">
              View All <span>&rarr;</span>
            </Link>
          </div>
          {recentClients && recentClients.length > 0 ? (
            <div className="space-y-2">
              {recentClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-primary-bg transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {client.primary_first_name} {client.primary_last_name}
                    </p>
                    {(client.billing_city || client.billing_state) && (
                      <p className="text-xs text-muted">
                        {[client.billing_city, client.billing_state].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted italic">No clients yet.</p>
          )}
        </div>

        {/* Recent Projects */}
        <div className="bg-card-bg rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Projects</h2>
            <Link href="/projects" className="text-sm text-muted hover:text-foreground flex items-center gap-1">
              View All <span>&rarr;</span>
            </Link>
          </div>
          {recentProjects && recentProjects.length > 0 ? (
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-primary-bg transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{project.name}</p>
                    <p className="text-xs text-muted">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(project as any).clients
                        ? `${(project as any).clients.primary_first_name} ${(project as any).clients.primary_last_name}`
                        : ''}
                    </p>
                  </div>
                  <StatusBadge status={project.status} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted italic">No projects yet.</p>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-bg rounded-lg p-6 flex items-center justify-between border border-primary-light">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Ready to create a new project report?</h2>
          <p className="text-sm text-muted mt-1">
            Select materials from our healthy building database and generate contractor-ready specifications.
          </p>
        </div>
        <Link
          href="/materials"
          className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors whitespace-nowrap"
        >
          Browse Materials
        </Link>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'gold';
}) {
  const iconColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    gold: 'bg-primary-bg text-primary-dark',
  };

  return (
    <div className="bg-card-bg rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{title}</p>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColors[color]}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  const labels: Record<string, string> = {
    draft: 'Draft',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {labels[status] || status}
    </span>
  );
}
