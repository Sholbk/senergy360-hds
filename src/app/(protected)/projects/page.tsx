'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PROJECT_TYPES, STATUS_LABELS } from '@/lib/utils';
import { createProjectAction } from './actions';
import SearchBox from '@/components/ui/SearchBox';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';

type SortField = 'ownerName' | 'createdOn' | 'location' | 'status' | 'projectType' | 'code' | 'tags';
type SortDirection = 'asc' | 'desc';

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
  const [showNewOwnerForm, setShowNewOwnerForm] = useState(false);
  const [newOwner, setNewOwner] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [creatingOwner, setCreatingOwner] = useState(false);
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

  const loadPropertyOwners = async () => {
    const { data } = await supabase
      .from('organizations')
      .select('id, business_name, primary_first_name, primary_last_name')
      .eq('org_type', 'property_owner')
      .is('deleted_at', null)
      .order('primary_last_name');
    if (data) {
      setPropertyOwners(
        data.map((d) => ({
          id: d.id,
          name: d.business_name || `${d.primary_first_name} ${d.primary_last_name}`,
        }))
      );
    }
  };

  const handleCreateOwner = async () => {
    if (!newOwner.firstName.trim() || !newOwner.lastName.trim()) return;
    setCreatingOwner(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single();

    const { data: org, error } = await supabase
      .from('organizations')
      .insert({
        tenant_id: profile?.tenant_id,
        org_type: 'property_owner',
        primary_first_name: newOwner.firstName.trim(),
        primary_last_name: newOwner.lastName.trim(),
        primary_email: newOwner.email.trim() || null,
        primary_phone: newOwner.phone.trim() || null,
      })
      .select('id')
      .single();

    if (!error && org) {
      await loadPropertyOwners();
      setFormData({ ...formData, propertyOwnerId: org.id });
      setShowNewOwnerForm(false);
      setNewOwner({ firstName: '', lastName: '', email: '', phone: '' });
    }
    setCreatingOwner(false);
  };

  useEffect(() => {
    loadProjects();
    loadPropertyOwners();
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  const [sortField, setSortField] = useState<SortField>('createdOn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  const sortedProjects = useMemo(() => {
    const sorted = [...filteredProjects];
    sorted.sort((a, b) => {
      let aVal = '';
      let bVal = '';
      switch (sortField) {
        case 'ownerName':
          aVal = (a.ownerName || '').toLowerCase();
          bVal = (b.ownerName || '').toLowerCase();
          break;
        case 'createdOn':
          aVal = a.createdOn || '';
          bVal = b.createdOn || '';
          break;
        case 'location':
          aVal = [a.siteCity, a.siteState].filter(Boolean).join(', ').toLowerCase();
          bVal = [b.siteCity, b.siteState].filter(Boolean).join(', ').toLowerCase();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'projectType':
          aVal = a.projectType;
          bVal = b.projectType;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredProjects, sortField, sortDirection]);

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
    setShowNewOwnerForm(false);
    setNewOwner({ firstName: '', lastName: '', email: '', phone: '' });
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
      ) : sortedProjects.length === 0 ? (
        <p className="text-sm text-muted italic">No projects found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card-bg">
                {([
                  { field: 'ownerName' as SortField, label: 'Client Name' },
                  { field: 'createdOn' as SortField, label: 'Created' },
                  { field: 'location' as SortField, label: 'Location' },
                  { field: 'status' as SortField, label: 'Status' },
                  { field: 'projectType' as SortField, label: 'Type' },
                  { field: 'code' as SortField, label: '#Code' },
                  { field: 'tags' as SortField, label: 'Tags' },
                ]).map(({ field, label }) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-4 py-3 text-left font-medium text-muted cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      <svg
                        className={`w-3.5 h-3.5 ${sortField === field ? 'text-foreground' : 'text-muted/40'}`}
                        viewBox="0 0 14 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          d="M7 0L13 7H1L7 0Z"
                          opacity={sortField === field && sortDirection === 'asc' ? 1 : 0.3}
                        />
                        <path
                          d="M7 20L1 13H13L7 20Z"
                          opacity={sortField === field && sortDirection === 'desc' ? 1 : 0.3}
                        />
                      </svg>
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-border last:border-b-0 hover:bg-primary-bg transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link href={`/projects/${project.id}`} className="hover:underline">
                      <p className="font-medium text-foreground">{project.ownerName || '—'}</p>
                      <p className="text-xs text-muted">{project.name}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {project.createdOn
                      ? new Date(project.createdOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {[project.siteCity, project.siteState].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                      project.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : project.status === 'in_progress'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {STATUS_LABELS[project.status as keyof typeof STATUS_LABELS] || project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {PROJECT_TYPES.find((t) => t.value === project.projectType)?.label || project.projectType}
                  </td>
                  <td className="px-4 py-3 text-muted">—</td>
                  <td className="px-4 py-3 text-muted">—</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setDeleteProjectName(project.name);
                        setShowDeleteModal(project.id);
                      }}
                      className="p-1.5 text-muted hover:text-red-500 transition-colors"
                      title="Delete project"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              {!showNewOwnerForm ? (
                <>
                  <select
                    value={formData.propertyOwnerId}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setShowNewOwnerForm(true);
                      } else {
                        setFormData({ ...formData, propertyOwnerId: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select property owner...</option>
                    {propertyOwners.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                    <option value="__new__">+ Add New Property Owner</option>
                  </select>
                </>
              ) : (
                <div className="border border-border rounded-md p-3 space-y-2 bg-primary-bg">
                  <p className="text-xs font-semibold text-foreground">New Property Owner</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="First Name *"
                      value={newOwner.firstName}
                      onChange={(e) => setNewOwner({ ...newOwner, firstName: e.target.value })}
                      className="px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      placeholder="Last Name *"
                      value={newOwner.lastName}
                      onChange={(e) => setNewOwner({ ...newOwner, lastName: e.target.value })}
                      className="px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Email"
                      value={newOwner.email}
                      onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                      className="px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      placeholder="Phone"
                      value={newOwner.phone}
                      onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                      className="px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateOwner}
                      disabled={creatingOwner || !newOwner.firstName.trim() || !newOwner.lastName.trim()}
                      className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {creatingOwner ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      onClick={() => {
                        setShowNewOwnerForm(false);
                        setNewOwner({ firstName: '', lastName: '', email: '', phone: '' });
                      }}
                      className="px-3 py-1 text-xs border border-border rounded hover:bg-background transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
