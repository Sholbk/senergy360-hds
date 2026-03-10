'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PROJECT_TYPES, STATUS_LABELS } from '@/lib/utils';
import { createProjectAction } from './actions';
import SearchBox from '@/components/ui/SearchBox';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  projectType: string;
  ownerName: string;
  siteCity: string;
  siteState: string;
  createdOn: string;
  description: string | null;
  buildingPlanSummary: string | null;
}

export default function ProjectsPage() {
  const [supabase] = useState(() => createClient());
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [propertyOwners, setPropertyOwners] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleteProjectName, setDeleteProjectName] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    propertyOwnerId: '',
    projectType: 'new_construction',
    otherDescription: '',
    description: '',
    buildingPlanSummary: '',
    siteAddressLine1: '',
    siteAddressLine2: '',
    siteCity: '',
    siteState: '',
    sitePostalCode: '',
    siteCountry: 'US',
  });

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, status, project_type, site_city, site_state, created_on, description, building_plan_summary')
      .is('deleted_at', null)
      .order('created_on', { ascending: false });

    if (error) {
      // Projects query failed - may be empty, which is fine
    }

    if (data) {
      // Fetch property owner names for display
      const projectIds = data.map((d) => d.id);
      const ownerMap = new Map<string, string>();

      if (projectIds.length > 0) {
        const { data: participants } = await supabase
          .from('project_participants')
          .select('project_id, organizations(business_name, primary_first_name, primary_last_name)')
          .in('project_id', projectIds)
          .eq('project_role', 'property_owner');

        if (participants) {
          for (const p of participants) {
            const org = p.organizations as unknown as { business_name: string | null; primary_first_name: string | null; primary_last_name: string | null } | null;
            if (org) {
              const name = org.business_name || `${org.primary_first_name} ${org.primary_last_name}`;
              ownerMap.set(p.project_id, name);
            }
          }
        }
      }

      setProjects(
        data.map((d) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          projectType: d.project_type,
          ownerName: ownerMap.get(d.id) || '',
          siteCity: d.site_city,
          siteState: d.site_state,
          createdOn: d.created_on,
          description: d.description,
          buildingPlanSummary: d.building_plan_summary,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();

    // Load property owners for dropdown
    supabase
      .from('organizations')
      .select('id, business_name, primary_first_name, primary_last_name')
      .eq('org_type', 'property_owner')
      .is('deleted_at', null)
      .order('primary_last_name')
      .then(({ data }) => {
        if (data) {
          setPropertyOwners(
            data.map((d) => ({
              id: d.id,
              name: d.business_name || `${d.primary_first_name} ${d.primary_last_name}`,
            }))
          );
        }
      });
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredProjects = search.trim()
    ? projects.filter((p) => {
        const term = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(term) ||
          p.ownerName.toLowerCase().includes(term) ||
          p.siteCity?.toLowerCase().includes(term) ||
          p.siteState?.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)) ||
          (p.buildingPlanSummary && p.buildingPlanSummary.toLowerCase().includes(term))
        );
      })
    : projects;

  const grouped = {
    draft: filteredProjects.filter((p) => p.status === 'draft'),
    in_progress: filteredProjects.filter((p) => p.status === 'in_progress'),
    completed: filteredProjects.filter((p) => p.status === 'completed'),
  };

  const handleSave = async () => {
    setFormError('');
    if (!formData.name.trim() || !formData.propertyOwnerId || !formData.siteAddressLine1.trim()) {
      const missing = [];
      if (!formData.name.trim()) missing.push('Project Name');
      if (!formData.propertyOwnerId) missing.push('Property Owner');
      if (!formData.siteAddressLine1.trim()) missing.push('Site Address');
      setFormError('Please fill in: ' + missing.join(', '));
      return;
    }
    setSaving(true);
    const result = await createProjectAction(formData);

    if (result.error) {
      setFormError(result.error);
    } else {
      setShowAddModal(false);
      resetForm();
      loadProjects();
    }
    setSaving(false);
  };

  const handleDelete = async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', projectId);
    if (error) {
      setFormError('Failed to delete project. Please try again.');
    } else {
      setShowDeleteModal(null);
      loadProjects();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      propertyOwnerId: '',
      projectType: 'new_construction',
      otherDescription: '',
      description: '',
      buildingPlanSummary: '',
      siteAddressLine1: '',
      siteAddressLine2: '',
      siteCity: '',
      siteState: '',
      sitePostalCode: '',
      siteCountry: 'US',
    });
  };

  const statusColors: Record<string, string> = {
    draft: 'border-l-gray-400',
    in_progress: 'border-l-green-500',
    completed: 'border-l-blue-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
        >
          + New Project
        </button>
      </div>

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search projects..."
        className="mb-6"
      />

      {loading ? (
        <p className="text-muted text-sm">Loading projects...</p>
      ) : (
        <div className="space-y-8">
          {(['draft', 'in_progress', 'completed'] as const).map((status) => (
            <div key={status}>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                {STATUS_LABELS[status]}
                <span className="text-sm text-muted font-normal">({grouped[status].length})</span>
              </h2>
              {grouped[status].length === 0 ? (
                <p className="text-sm text-muted italic pl-4">No {STATUS_LABELS[status].toLowerCase()} projects.</p>
              ) : (
                <div className="space-y-2">
                  {grouped[status].map((project) => (
                    <div
                      key={project.id}
                      className={`bg-card-bg rounded-lg border border-border border-l-4 ${statusColors[status]} p-4 hover:bg-primary-bg transition-colors flex items-center justify-between`}
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex-1"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{project.name}</p>
                            <p className="text-sm text-muted">
                              {project.ownerName}{' '}
                              {[project.siteCity, project.siteState].filter(Boolean).join(', ') &&
                                `\u00B7 ${[project.siteCity, project.siteState].filter(Boolean).join(', ')}`}
                            </p>
                          </div>
                          <span className="text-xs text-muted">
                            {PROJECT_TYPES.find((t) => t.value === project.projectType)?.label || project.projectType}
                          </span>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteProjectName(project.name);
                          setShowDeleteModal(project.id);
                        }}
                        className="ml-3 p-2 text-muted hover:text-red-500 transition-colors"
                        title="Delete project"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormError(''); }} title="New Project" maxWidth="max-w-2xl">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              Project Name <span className="text-danger">*</span>
            </label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Property Owner <span className="text-danger">*</span>
              </label>
              <select
                value={formData.propertyOwnerId}
                onChange={(e) => setFormData({ ...formData, propertyOwnerId: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select property owner...</option>
                {propertyOwners.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Type</label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.projectType === 'other' && (
            <div>
              <label className="block text-sm font-medium mb-1">Other Description</label>
              <input
                value={formData.otherDescription}
                onChange={(e) => setFormData({ ...formData, otherDescription: e.target.value })}
                maxLength={200}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={5000}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Building Plan Summary</label>
            <textarea
              value={formData.buildingPlanSummary}
              onChange={(e) => setFormData({ ...formData, buildingPlanSummary: e.target.value })}
              rows={3}
              maxLength={5000}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>

          <h3 className="text-sm font-semibold text-foreground pt-2">
            Site Address <span className="text-danger">*</span>
          </h3>
          <div className="space-y-3">
            <input
              placeholder="Address Line 1"
              aria-label="Address Line 1"
              value={formData.siteAddressLine1}
              onChange={(e) => setFormData({ ...formData, siteAddressLine1: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              placeholder="Address Line 2"
              aria-label="Address Line 2"
              value={formData.siteAddressLine2}
              onChange={(e) => setFormData({ ...formData, siteAddressLine2: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="City"
                aria-label="City"
                value={formData.siteCity}
                onChange={(e) => setFormData({ ...formData, siteCity: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="State"
                aria-label="State"
                value={formData.siteState}
                onChange={(e) => setFormData({ ...formData, siteState: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="ZIP"
                aria-label="ZIP"
                value={formData.sitePostalCode}
                onChange={(e) => setFormData({ ...formData, sitePostalCode: e.target.value })}
                maxLength={20}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!showDeleteModal} onClose={() => setShowDeleteModal(null)} title="Delete Project">
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Are you sure you want to delete <strong>{deleteProjectName}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteModal(null)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => showDeleteModal && handleDelete(showDeleteModal)}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
