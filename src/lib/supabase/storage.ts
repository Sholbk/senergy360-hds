import { createClient } from './client';

export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  FEED_IMAGES: 'feed-images',
} as const;

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ path: string; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    return { path: '', error: error.message };
  }

  return { path: data.path, error: null };
}

/**
 * Get a signed URL for downloading a file (1 hour expiry)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<{ url: string; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    return { url: '', error: error.message };
  }

  return { url: data.signedUrl, error: null };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Generate a unique file path for uploads
 */
export function generateFilePath(
  tenantId: string,
  projectId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${tenantId}/${projectId}/${timestamp}_${sanitizedName}`;
}
