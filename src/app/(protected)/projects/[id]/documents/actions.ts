'use server';

import { createClient } from '@/lib/supabase/server';

export async function uploadDocumentAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated. Please log out and log back in.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'Profile not found for your account. Please contact support.' };
  }

  const file = formData.get('file') as File | null;
  const title = (formData.get('title') as string)?.trim();
  const documentType = formData.get('documentType') as string;
  const visibility = formData.get('visibility') as string;
  const description = (formData.get('description') as string)?.trim() || null;
  const projectId = formData.get('projectId') as string;
  const signatureRequired = formData.get('signatureRequired') === 'true';

  if (!title || !documentType || !visibility || !projectId) {
    return { error: 'Missing required fields.' };
  }

  let storagePath: string | null = null;
  let fileName: string | null = null;
  let fileSizeBytes: number | null = null;
  let mimeType: string | null = null;

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    storagePath = `${profile.tenant_id}/${projectId}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, { contentType: file.type });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { error: `Failed to upload file: ${uploadError.message}` };
    }

    fileName = file.name;
    fileSizeBytes = file.size;
    mimeType = file.type;
  }

  const { error: insertError } = await supabase.from('documents').insert({
    tenant_id: profile.tenant_id,
    project_id: projectId,
    document_type: documentType,
    title,
    description,
    storage_path: storagePath,
    file_name: fileName,
    file_size_bytes: fileSizeBytes,
    mime_type: mimeType,
    visibility,
    signature_required: signatureRequired,
    created_by: user.id,
  });

  if (insertError) {
    console.error('Document insert error:', insertError);
    return { error: `Failed to save document record: ${insertError.message}` };
  }

  return { success: true };
}

export async function shareDocumentAction(
  documentId: string,
  recipientEmails: string[],
  projectId: string
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { error: 'Profile not found.' };
  }

  // Update document shared fields
  const { error: updateError } = await supabase
    .from('documents')
    .update({
      shared_at: new Date().toISOString(),
      shared_by: user.id,
      shared_to_emails: recipientEmails,
    })
    .eq('id', documentId);

  if (updateError) {
    return { error: 'Failed to update document sharing info.' };
  }

  // Get document title for the feed post
  const { data: doc } = await supabase
    .from('documents')
    .select('title')
    .eq('id', documentId)
    .single();

  // Create a feed post for the share event
  const { error: feedError } = await supabase.from('feed_posts').insert({
    tenant_id: profile.tenant_id,
    project_id: projectId,
    author_id: user.id,
    content: `Shared document "${doc?.title || 'Untitled'}" with ${recipientEmails.join(', ')}`,
    visible_to: ['all'],
    document_id: documentId,
    image_paths: [],
    event_type: 'document_shared',
    event_metadata: { recipientEmails },
  });

  if (feedError) {
    // Non-critical: sharing still succeeded even if feed post failed
    console.error('Failed to create feed post for document share:', feedError);
  }

  return { success: true };
}

export async function updateDocumentAccessAction(
  documentId: string,
  accessList: { userId?: string; professionalId?: string; clientId?: string }[]
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated.' };
  }

  // Delete existing access rows for this document
  const { error: deleteError } = await supabase
    .from('document_access')
    .delete()
    .eq('document_id', documentId);

  if (deleteError) {
    return { error: 'Failed to update document access.' };
  }

  // Insert new access rows
  if (accessList.length > 0) {
    const rows = accessList.map((access) => ({
      document_id: documentId,
      user_id: access.userId || null,
      professional_id: access.professionalId || null,
      client_id: access.clientId || null,
      granted_by: user.id,
    }));

    const { error: insertError } = await supabase
      .from('document_access')
      .insert(rows);

    if (insertError) {
      return { error: 'Failed to create access records.' };
    }
  }

  return { success: true };
}

export async function signDocumentAction(
  documentId: string,
  signatureData: string,
  signerName: string
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated.' };
  }

  const { error } = await supabase
    .from('documents')
    .update({
      signed_at: new Date().toISOString(),
      signed_by_name: signerName.trim(),
      signature_data: signatureData,
    })
    .eq('id', documentId);

  if (error) {
    return { error: 'Failed to save signature. Please try again.' };
  }

  return { success: true };
}

export async function updateDocumentAction(
  documentId: string,
  input: { title?: string; documentType?: string; visibility?: string; description?: string }
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated.' };

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.documentType !== undefined) payload.document_type = input.documentType;
  if (input.visibility !== undefined) payload.visibility = input.visibility;
  if (input.description !== undefined) payload.description = input.description?.trim() || null;

  const { error } = await supabase.from('documents').update(payload).eq('id', documentId);
  if (error) return { error: 'Failed to update document: ' + error.message };

  return { success: true };
}

export async function deleteDocumentAction(documentId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated.' };
  }

  // Soft delete
  const { error } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', documentId);

  if (error) {
    return { error: 'Failed to delete document. Please try again.' };
  }

  return { success: true };
}
