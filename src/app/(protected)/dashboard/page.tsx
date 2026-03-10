import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { STATUS_LABELS, STATUS_STYLES } from '@/lib/utils';

interface ProjectWithOwner {
  id: string;
  name: string;
  status: string;
}

const ORG_TYPE_LABELS: Record<string, string> = {
  property_owner: 'Property Owner',
  architect: 'Architect',
  general_contractor: 'General Contractor',
  trade: 'Trade',
  other: 'Other',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch counts
  const [projectsResult, orgsResult, materialsResult] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact', head: true }).neq('status', 'completed').is('deleted_at', null),
    supabase.from('organizations').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('materials').select('id', { count: 'exact', head: true }),
  ]);

  const activeProjects = projectsResult.count ?? 0;
  const totalOrgs = orgsResult.count ?? 0;
  const totalMaterials = materialsResult.count ?? 0;

  // Fetch recent organizations
  const { data: recentOrgs } = await supabase
    .from('organizations')
    .select('id, org_type, business_name, primary_first_name, primary_last_name, city, state')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent projects
  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id, name, status')
    .is('deleted_at', null)
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
          href="/projects"
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
        >
          + New Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Active Projects" value={activeProjects} color="green" />
        <StatsCard title="Organizations" value={totalOrgs} color="blue" />
        <StatsCard title="Materials Database" value={totalMaterials} color="gold" />
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Recent Organizations */}
        <div className="bg-card-bg rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Organizations</h2>
            <Link href="/organizations" className="text-sm text-muted hover:text-foreground flex items-center gap-1">
              View All <span>&rarr;</span>
            </Link>
          </div>
          {recentOrgs && recentOrgs.length > 0 ? (
            <div className="space-y-2">
              {recentOrgs.map((org) => {
                const displayName = org.business_name
                  ? org.business_name
                  : `${org.primary_first_name ?? ''} ${org.primary_last_name ?? ''}`.trim();

                return (
                  <Link
                    key={org.id}
                    href={`/organizations/${org.id}`}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-primary-bg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {displayName || 'Unnamed Organization'}
                      </p>
                      {(org.city || org.state) && (
                        <p className="text-xs text-muted">
                          {[org.city, org.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                    {org.org_type && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                        {ORG_TYPE_LABELS[org.org_type] || org.org_type}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted italic">No organizations yet.</p>
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
              {(recentProjects as unknown as ProjectWithOwner[]).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-primary-bg transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{project.name}</p>
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
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
