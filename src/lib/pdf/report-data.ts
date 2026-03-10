import { createClient } from '@/lib/supabase/server';
import type { ReportData, ChecklistSection, ParticipantSection, ReportPhoto } from './report-template';
import { fetchImagesAsBuffers } from './image-utils';

const ROLE_LABELS: Record<string, string> = {
  property_owner: 'Property Owner',
  architect: 'Architect',
  general_contractor: 'General Contractor',
  trade: 'Trade',
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  new_construction: 'New Construction',
  renovation: 'Renovation',
  addition: 'Addition',
  remodel: 'Remodel',
  commercial: 'Commercial',
  residential: 'Residential',
  multi_family: 'Multi-Family',
  custom_home: 'Custom Home',
  other: 'Other',
};

export async function assembleReportData(projectId: string): Promise<ReportData> {
  const supabase = await createClient();

  // 1. Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!project) throw new Error('Project not found');

  // 2. Fetch participants with organizations
  const { data: participantsData } = await supabase
    .from('project_participants')
    .select('id, project_role, organizations(business_name, primary_first_name, primary_last_name, primary_email, primary_phone, specialty)')
    .eq('project_id', projectId);

  // 3. Find property owner name for "Prepared for"
  const ownerParticipant = participantsData?.find(p => p.project_role === 'property_owner');
  const ownerOrg = ownerParticipant?.organizations as any;
  const preparedFor = ownerOrg
    ? (ownerOrg.business_name || `${ownerOrg.primary_first_name} ${ownerOrg.primary_last_name}`)
    : 'Property Owner';

  // 4. Fetch participant materials
  const ppIds = (participantsData || []).map(p => p.id);
  let materialsMap = new Map<string, any[]>();
  if (ppIds.length > 0) {
    const { data: matData } = await supabase
      .from('project_participant_materials')
      .select('project_participant_id, notes, materials(name, manufacturer, primary_use)')
      .in('project_participant_id', ppIds);

    for (const m of matData || []) {
      const existing = materialsMap.get(m.project_participant_id) || [];
      existing.push(m);
      materialsMap.set(m.project_participant_id, existing);
    }
  }

  // 5. Build participants array
  const participants: ParticipantSection[] = (participantsData || []).map(p => {
    const org = p.organizations as any;
    const orgName = org?.business_name || `${org?.primary_first_name || ''} ${org?.primary_last_name || ''}`.trim();
    const mats = materialsMap.get(p.id) || [];
    return {
      orgName,
      role: ROLE_LABELS[p.project_role] || p.project_role,
      contactName: `${org?.primary_first_name || ''} ${org?.primary_last_name || ''}`.trim(),
      email: org?.primary_email || undefined,
      phone: org?.primary_phone || undefined,
      materials: mats.map((m: any) => ({
        name: m.materials?.name || '',
        manufacturer: m.materials?.manufacturer || undefined,
        primaryUse: m.materials?.primary_use || undefined,
        notes: m.notes || undefined,
      })),
    };
  });

  // 6. Fetch checklists and items
  const { data: checklists } = await supabase
    .from('project_checklists')
    .select('id, title')
    .eq('project_id', projectId);

  let checklistSections: ChecklistSection[] = [];
  let totalItems = 0;
  let checkedItems = 0;

  if (checklists && checklists.length > 0) {
    const checklistIds = checklists.map(c => c.id);
    const { data: items } = await supabase
      .from('checklist_items')
      .select('checklist_id, label, is_checked, notes, checked_by, checked_at')
      .in('checklist_id', checklistIds)
      .order('sort_order');

    // Group by checklist
    const itemsByChecklist = new Map<string, any[]>();
    for (const item of items || []) {
      const existing = itemsByChecklist.get(item.checklist_id) || [];
      existing.push(item);
      itemsByChecklist.set(item.checklist_id, existing);
    }

    checklistSections = checklists.map(c => {
      const sectionItems = itemsByChecklist.get(c.id) || [];
      totalItems += sectionItems.length;
      checkedItems += sectionItems.filter((i: any) => i.is_checked).length;
      return {
        categoryName: c.title,
        items: sectionItems.map((i: any) => ({
          label: i.label,
          isChecked: i.is_checked,
          notes: i.notes || undefined,
          checkedBy: i.checked_by || undefined,
          checkedAt: i.checked_at || undefined,
        })),
      };
    });
  }

  // 7. Fetch photos from two sources:
  // Source A: Feed post images
  const { data: feedPosts } = await supabase
    .from('feed_posts')
    .select('image_paths, content')
    .eq('project_id', projectId)
    .is('deleted_at', null);

  const feedImagePaths: { path: string; caption?: string }[] = [];
  for (const post of feedPosts || []) {
    if (post.image_paths && Array.isArray(post.image_paths)) {
      for (const path of post.image_paths) {
        feedImagePaths.push({ path, caption: post.content?.substring(0, 80) });
      }
    }
  }

  // Source B: Dedicated report photos
  const { data: reportPhotos } = await supabase
    .from('report_photos')
    .select('storage_path, caption, category')
    .eq('project_id', projectId)
    .order('sort_order');

  // Generate signed URLs for all photos
  const allPhotoEntries: { path: string; bucket: string; caption?: string; category?: string }[] = [];

  for (const fp of feedImagePaths) {
    allPhotoEntries.push({ path: fp.path, bucket: 'feed-images', caption: fp.caption });
  }
  for (const rp of reportPhotos || []) {
    allPhotoEntries.push({ path: rp.storage_path, bucket: 'documents', caption: rp.caption, category: rp.category });
  }

  // Get signed URLs
  const signedUrls: string[] = [];
  const photoMeta: { caption?: string; category?: string }[] = [];

  for (const entry of allPhotoEntries) {
    const { data: urlData } = await supabase.storage
      .from(entry.bucket)
      .createSignedUrl(entry.path, 300); // 5 min expiry
    if (urlData?.signedUrl) {
      signedUrls.push(urlData.signedUrl);
      photoMeta.push({ caption: entry.caption, category: entry.category });
    }
  }

  // Fetch images as buffers (parallel)
  const imageBuffers = await fetchImagesAsBuffers(signedUrls);

  const photos: ReportPhoto[] = imageBuffers.map((buffer, idx) => ({
    buffer,
    caption: photoMeta[idx]?.caption,
    category: photoMeta[idx]?.category,
  }));

  // 8. Build site address string
  const siteAddress = [
    project.site_address_line1,
    project.site_address_line2,
    `${project.site_city}, ${project.site_state} ${project.site_postal_code}`,
  ].filter(Boolean).join('\n');

  // 9. Assemble
  return {
    projectName: project.name,
    projectType: PROJECT_TYPE_LABELS[project.project_type] || project.project_type,
    description: project.description || undefined,
    buildingPlanSummary: project.building_plan_summary || undefined,
    siteAddress,
    reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    preparedFor,
    preparedBy: 'SENERGY360',
    checklistSections,
    totalItems,
    checkedItems,
    photos,
    participants,
  };
}
