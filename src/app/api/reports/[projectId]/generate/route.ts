import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { renderToBuffer } from '@react-pdf/renderer';
import ReportTemplate from '@/lib/pdf/report-template';
import { assembleReportData } from '@/lib/pdf/report-data';
import React from 'react';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

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

    // Assemble report data
    const reportData = await assembleReportData(projectId);

    // Render PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(ReportTemplate, { data: reportData }) as any
    );

    // Upload to Supabase Storage using admin client (bypass RLS)
    const adminClient = createAdminClient();
    const timestamp = Date.now();
    const storagePath = `${profile.tenant_id}/${projectId}/${timestamp}_report.pdf`;

    const { error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
    }

    // Insert document record
    const { data: doc, error: docError } = await adminClient
      .from('documents')
      .insert({
        tenant_id: profile.tenant_id,
        project_id: projectId,
        document_type: 'hds_checklist',
        title: `HDS Report - ${reportData.projectName}`,
        description: `Generated on ${reportData.reportDate}`,
        storage_path: storagePath,
        file_name: `${reportData.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`,
        file_size_bytes: pdfBuffer.length,
        mime_type: 'application/pdf',
        visibility: 'all_participants',
        created_by: user.id,
      })
      .select('id')
      .single();

    if (docError) {
      console.error('Document insert error:', docError);
      return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      documentId: doc.id,
      storagePath,
    });
  } catch (err) {
    console.error('Report generation error:', err);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
