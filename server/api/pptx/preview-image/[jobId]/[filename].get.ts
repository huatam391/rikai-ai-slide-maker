import { join } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

export default defineEventHandler(async (event) => {
  try {
    const jobId = getRouterParam(event, 'jobId');
    const filename = getRouterParam(event, 'filename');

    if (!jobId || !filename) {
      throw createError({
        statusCode: 400,
        message: 'jobId and filename are required'
      });
    }

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      throw createError({
        statusCode: 400,
        message: 'Invalid filename'
      });
    }

    // Construct image path
    const imagePath = join(process.cwd(), 'output', 'previews', jobId, filename);

    // Check if image exists
    if (!existsSync(imagePath)) {
      throw createError({
        statusCode: 404,
        message: 'Image not found'
      });
    }

    // Read image file
    const imageBuffer = await readFile(imagePath);

    // Determine content type
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

    // Set headers and return image
    setHeader(event, 'Content-Type', contentType);
    setHeader(event, 'Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    return imageBuffer;
  } catch (error: any) {
    console.error('Error serving image:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to serve image'
    });
  }
});
