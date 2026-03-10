import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildReportEmailHtml } from '@/lib/pdf/email-template';
import { Resend } from 'resend';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  return new Resend(apiKey);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { documentId, recipients, customMessage } = body;

    if (!documentId || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Missing documentId or recipients' }, { status: 400 });
    }

    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch the document record
    const adminClient = createAdminClient();
    const { data: doc } = await adminClient
      .from('documents')
      .select('storage_path, title, project_id')
      .eq('id', documentId)
      .single();

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get project info for email
    const { data: project } = await adminClient
      .from('projects')
      .select('name, site_address_line1, site_city, site_state, site_postal_code')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get checklist stats
    const { data: checklists } = await adminClient
      .from('project_checklists')
      .select('id')
      .eq('project_id', projectId);

    let checklistStats = '0/0';
    if (checklists && checklists.length > 0) {
      const { data: items } = await adminClient
        .from('checklist_items')
        .select('is_checked')
        .in('checklist_id', checklists.map(c => c.id));

      const total = items?.length || 0;
      const checked = items?.filter(i => i.is_checked).length || 0;
      checklistStats = `${checked}/${total}`;
    }

    // Get photo count
    const { count: feedPhotoCount } = await adminClient
      .from('feed_posts')
      .select('image_paths', { count: 'exact' })
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .not('image_paths', 'eq', '{}');

    const { count: reportPhotoCount } = await adminClient
      .from('report_photos')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const photoCount = (feedPhotoCount || 0) + (reportPhotoCount || 0);

    // Generate signed URL (7 day expiry)
    const { data: urlData } = await adminClient.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 604800);

    if (!urlData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    // Build email HTML
    const siteAddress = `${project.site_address_line1}\n${project.site_city}, ${project.site_state} ${project.site_postal_code}`;
    const html = buildReportEmailHtml({
      projectName: project.name,
      siteAddress,
      checklistStats,
      photoCount,
      downloadUrl: urlData.signedUrl,
      customMessage,
    });

    // Send email via Resend
    const resend = getResend();
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'SENERGY360 <noreply@senergy360.com>',
      to: recipients,
      subject: `HDS Report: ${project.name}`,
      html,
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Log to email_log
    for (const recipient of recipients) {
      await adminClient.from('email_log').insert({
        tenant_id: profile.tenant_id,
        project_id: projectId,
        sent_by: user.id,
        recipient_email: recipient,
        subject: `HDS Report: ${project.name}`,
        body_html: html,
        resend_message_id: emailResult?.id || null,
        email_type: 'document_share',
      });
    }

    // Create feed post
    await adminClient.from('feed_posts').insert({
      tenant_id: profile.tenant_id,
      project_id: projectId,
      author_id: user.id,
      content: `HDS Report sent to ${recipients.length} recipient(s).`,
      visible_to: ['admin', 'property_owner', 'architect', 'general_contractor', 'trade'],
      event_type: 'hds_sent',
      image_paths: [],
    });

    return NextResponse.json({ success: true, emailId: emailResult?.id });
  } catch (err) {
    console.error('Report send error:', err);
    return NextResponse.json({ error: 'Failed to send report' }, { status: 500 });
  }
}
