'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import DocumentList from '@/components/documents/DocumentList';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentShareModal from '@/components/documents/DocumentShareModal';
import SignatureCanvas from '@/components/documents/SignatureCanvas';
import { postFeedActivity } from '@/lib/feedActivity';
import {
  uploadDocumentAction,
  shareDocumentAction,
  signDocumentAction,
  updateDocumentAction,
  deleteDocumentAction,
} from './actions';
import Modal from '@/components/ui/Modal';
import type { Document } from '@/types';

interface Participant {
  id: string;
  name: string;
  email: string;
  type: 'client' | 'professional';
}

export default function ProjectDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [documents, setDocuments] = useState<Document[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projectName, setProjectName] = useState('');

  // Modal state
  const [showUpload, setShowUpload] = useState(false);
  const [shareDoc, setShareDoc] = useState<Document | null>(null);
  const [signDoc, setSignDoc] = useState<Document | null>(null);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', documentType: '', visibility: '', description: '' });
  const [actionError, setActionError] = useState('');

  const loadDocuments = useCallback(async () => {
    // Get current user profile
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    const userIsAdmin = profile.role === 'admin';
    setIsAdmin(userIsAdmin);

    // Get project name
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();

    if (project) {
      setProjectName(project.name);
    }

    // Fetch documents
    let query = supabase
      .from('documents')
      .select('*, document_access(*)')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Non-admin users only see documents shared with them or visible to their role
    if (!userIsAdmin) {
      query = query.or(
        `visibility.eq.all_participants,visibility.eq.${profile.role}`
      );
    }

    const { data: docs } = await query;

    if (docs) {
      setDocuments(
        docs.map((d) => ({
          id: d.id,
          tenantId: d.tenant_id,
          projectId: d.project_id,
          clientId: d.client_id,
          documentType: d.document_type,
          title: d.title,
          description: d.description,
          storagePath: d.storage_path,
          fileName: d.file_name,
          fileSizeBytes: d.file_size_bytes,
          mimeType: d.mime_type,
          contentJson: d.content_json,
          visibility: d.visibility,
          sharedAt: d.shared_at,
          sharedBy: d.shared_by,
          sharedToEmails: d.shared_to_emails,
          signatureRequired: d.signature_required,
          signedAt: d.signed_at,
          signedByName: d.signed_by_name,
          signatureData: d.signature_data,
          createdBy: d.created_by,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          deletedAt: d.deleted_at,
          access: d.document_access?.map((a: Record<string, string>) => ({
            id: a.id,
            documentId: a.document_id,
            userId: a.user_id,
            professionalId: a.professional_id,
            clientId: a.client_id,
            grantedAt: a.granted_at,
            grantedBy: a.granted_by,
          })),
        }))
      );
    }

    // Load project participants for sharing
    if (userIsAdmin) {
      const participantList: Participant[] = [];

      // Get project client
      const { data: projectData } = await supabase
        .from('projects')
        .select('client_id, clients(id, primary_first_name, primary_last_name, primary_email)')
        .eq('id', projectId)
        .single();

      if (projectData?.clients) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const client = projectData.clients as any;
        if (client.primary_email) {
          participantList.push({
            id: client.id,
            name: `${client.primary_first_name} ${client.primary_last_name}`.trim(),
            email: client.primary_email,
            type: 'client',
          });
        }
      }

      // Get project professionals
      const { data: ppData } = await supabase
        .from('project_professionals')
        .select(
          'professional_id, professionals(id, primary_first_name, primary_last_name, primary_email, business_name)'
        )
        .eq('project_id', projectId);

      if (ppData) {
        for (const pp of ppData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const prof = pp.professionals as any;
          if (prof?.primary_email) {
            participantList.push({
              id: prof.id,
              name: prof.business_name || `${prof.primary_first_name} ${prof.primary_last_name}`.trim(),
              email: prof.primary_email,
              type: 'professional',
            });
          }
        }
      }

      setParticipants(participantList);
    }

    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = async (formData: FormData) => {
    setActionError('');
    const result = await uploadDocumentAction(formData);
    if (result.error) {
      throw new Error(result.error);
    }
    const docTitle = formData.get('title') as string || 'a document';
    await postFeedActivity(supabase, {
      projectId,
      content: `Document uploaded: ${docTitle}`,
      eventType: 'document_shared',
    });
    setShowUpload(false);
    await loadDocuments();
  };

  const handleShare = async (documentId: string, emails: string[]) => {
    setActionError('');
    const result = await shareDocumentAction(documentId, emails, projectId);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    setShareDoc(null);
    await loadDocuments();
  };

  const handleSign = async (signatureData: string, signerName: string) => {
    if (!signDoc) return;
    setActionError('');
    const result = await signDocumentAction(signDoc.id, signatureData, signerName);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    setSignDoc(null);
    await loadDocuments();
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Delete "${doc.title}"? This action cannot be undone.`)) return;
    setActionError('');
    const result = await deleteDocumentAction(doc.id);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    await postFeedActivity(supabase, {
      projectId,
      content: `Document deleted: ${doc.title}`,
      eventType: 'document_deleted',
    });
    await loadDocuments();
  };

  const handleEditOpen = (doc: Document) => {
    setEditDoc(doc);
    setEditForm({
      title: doc.title,
      documentType: doc.documentType,
      visibility: doc.visibility,
      description: doc.description || '',
    });
  };

  const handleEditSave = async () => {
    if (!editDoc) return;
    setEditSaving(true);
    setActionError('');
    const result = await updateDocumentAction(editDoc.id, editForm);
    setEditSaving(false);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    setEditDoc(null);
    await loadDocuments();
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.storagePath) return;
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storagePath, 60);

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  if (loading) return <p className="text-muted text-sm">Loading...</p>;

  return (
    <div>
      <button
        onClick={() => router.push('/projects')}
        className="text-sm text-primary hover:text-primary-dark mb-4 flex items-center gap-1"
      >
        &larr; Back to Projects
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-2">{projectName}</h1>


      <div className="space-y-4">
        {/* Header with upload button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Documents</h2>
          {isAdmin && (
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Upload Document
            </button>
          )}
        </div>

        {actionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {actionError}
          </div>
        )}

        {/* Document list */}
        <DocumentList
          documents={documents}
          isAdmin={isAdmin}
          onShare={(doc) => setShareDoc(doc)}
          onSign={(doc) => setSignDoc(doc)}
          onEdit={handleEditOpen}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      </div>

      {/* Upload Modal */}
      <DocumentUpload
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
        projectId={projectId}
      />

      {/* Share Modal */}
      <DocumentShareModal
        isOpen={!!shareDoc}
        onClose={() => setShareDoc(null)}
        document={shareDoc}
        participants={participants}
        onShare={handleShare}
      />

      {/* Signature Modal */}
      <SignatureCanvas
        isOpen={!!signDoc}
        onClose={() => setSignDoc(null)}
        onSave={handleSign}
        documentTitle={signDoc?.title || ''}
      />

      {/* Edit Document Modal */}
      <Modal isOpen={!!editDoc} onClose={() => setEditDoc(null)} title="Edit Document" maxWidth="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Document Type</label>
            <select
              value={editForm.documentType}
              onChange={(e) => setEditForm({ ...editForm, documentType: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="proposal_contract">Proposal / Contract</option>
              <option value="core_principles">Core Principles</option>
              <option value="core_systems_field_guide">Core Systems Field Guide</option>
              <option value="contract_recommendations">Contract Recommendations</option>
              <option value="building_science">Building Science</option>
              <option value="environmental_testing">Environmental Testing</option>
              <option value="owners_manual_intro">Owner&apos;s Manual Intro</option>
              <option value="hds_checklist">HDS Checklist</option>
              <option value="hds_trade_section">HDS Trade Section</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Visibility</label>
            <select
              value={editForm.visibility}
              onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="admin_only">Admin Only</option>
              <option value="client">Client</option>
              <option value="professional">Professional</option>
              <option value="all_participants">All Participants</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              maxLength={2000}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>
          {editDoc?.fileName && (
            <p className="text-xs text-muted">File: {editDoc.fileName}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setEditDoc(null)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={editSaving || !editForm.title.trim()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
