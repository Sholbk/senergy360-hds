'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchBox from '@/components/ui/SearchBox';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  projectType: string;
  clientName: string;
  clientId: string;
  siteCity: string;
  siteState: string;
  createdOn: string;
  description: string | null;
  buildingPlanSummary: string | null;
}

const PROJECT_TYPES = [
  { value: 'new_construction', label: 'New Construction' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'addition', label: 'Addition' },
  { value: 'remodel', label: 'Remodel' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'residential', label: 'Residential' },
  { value: 'multi_family', label: 'Multi-Family' },
  { value: 'custom_home', label: 'Custom Home' },
  { value: 'other', label: 'Other' },
];

export default function ProjectsPage() {
  const [supabase] = useState(() => createClient());
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleteProjectName, setDeleteProjectName] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
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

  // Build a map of client IDs to names for display
  const clientMap = new Map(clients.map((c) => [c.id, c.name]));

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, status, project_type, site_city, site_state, created_on, client_id, description, building_plan_summary')
      .is('deleted_at', null)
      .order('created_on', { ascending: false });

    if (error) {
      // Projects query failed - may be empty, which is fine
    }

    if (data) {
      setProjects(
        data.map((d) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          projectType: d.project_type,
          clientId: d.client_id,
          clientName: '',
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

    // Load clients for dropdown and name display
    supabase
      .from('clients')
      .select('id, primary_first_name, primary_last_name')
      .order('primary_last_name')
      .then(({ data }) => {
        if (data) {
          setClients(
            data.map((d) => ({
              id: d.id,
              name: `${d.primary_first_name} ${d.primary_last_name}`,
            }))
          );
        }
      });
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredProjects = search.trim()
    ? projects.filter((p) => {
        const term = search.toLowerCase();
        const cName = clientMap.get(p.clientId) || '';
        return (
          p.name.toLowerCase().includes(term) ||
          cName.toLowerCase().includes(term) ||
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
    if (!formData.name.trim() || !formData.clientId || !formData.siteAddressLine1.trim()) {
      const missing = [];
      if (!formData.name.trim()) missing.push('Project Name');
      if (!formData.clientId) missing.push('Client');
      if (!formData.siteAddressLine1.trim()) missing.push('Site Address');
      setFormError('Please fill in: ' + missing.join(', '));
      return;
    }
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setFormError('Could not load your profile. Please log out and log back in.');
      setSaving(false);
      return;
    }
    const { data: profile, error: profileError } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (profileError || !profile) {
      setFormError('Could not load your profile. Please log out and log back in.');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('projects').insert({
      tenant_id: profile.tenant_id,
      name: formData.name.trim(),
      client_id: formData.clientId,
      project_type: formData.projectType,
      project_type_other_description: formData.projectType === 'other' ? formData.otherDescription.trim() : null,
      description: formData.description.trim() || null,
      building_plan_summary: formData.buildingPlanSummary.trim() || null,
      site_address_line1: formData.siteAddressLine1.trim(),
      site_address_line2: formData.siteAddressLine2.trim() || null,
      site_city: formData.siteCity.trim(),
      site_state: formData.siteState.trim(),
      site_postal_code: formData.sitePostalCode.trim(),
      site_country: formData.siteCountry.trim() || 'US',
    });

    if (error) {
      setFormError('Failed to create project. Please try again.');
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
      clientId: '',
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

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    in_progress: 'In Progress',
    completed: 'Completed',
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
                {statusLabels[status]}
                <span className="text-sm text-muted font-normal">({grouped[status].length})</span>
              </h2>
              {grouped[status].length === 0 ? (
                <p className="text-sm text-muted italic pl-4">No {statusLabels[status].toLowerCase()} projects.</p>
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
                              {clientMap.get(project.clientId) || ''}{' '}
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
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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
                Client <span className="text-danger">*</span>
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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
              value={formData.siteAddressLine1}
              onChange={(e) => setFormData({ ...formData, siteAddressLine1: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              placeholder="Address Line 2"
              value={formData.siteAddressLine2}
              onChange={(e) => setFormData({ ...formData, siteAddressLine2: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="City"
                value={formData.siteCity}
                onChange={(e) => setFormData({ ...formData, siteCity: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="State"
                value={formData.siteState}
                onChange={(e) => setFormData({ ...formData, siteState: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="ZIP"
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
