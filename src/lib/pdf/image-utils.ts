/**
 * Fetch multiple image URLs in parallel and return as Buffers.
 * Used by the report generator to embed images in the PDF.
 */
export async function fetchImagesAsBuffers(
  urls: string[]
): Promise<Buffer[]> {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    })
  );

  // Return only successful fetches, skip failed ones
  const buffers: Buffer[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') {
      buffers.push(r.value);
    }
  }
  return buffers;
}

/**
 * Fetch a single image URL as a Buffer
 */
export async function fetchImageAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}
