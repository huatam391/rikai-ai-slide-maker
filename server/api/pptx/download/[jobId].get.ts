import { readFile, stat } from 'fs/promises';
import { join } from 'path';

export default defineEventHandler(async (event) => {
  try {
    const jobId = getRouterParam(event, 'jobId');

    if (!jobId) {
      throw createError({
        statusCode: 400,
        message: 'jobId is required'
      });
    }

    const pptxPath = join(process.cwd(), 'output', `${jobId}.pptx`);

    // Check if file exists
    try {
      await stat(pptxPath);
    } catch {
      throw createError({
        statusCode: 404,
        message: 'PPTX file not found'
      });
    }

    // Read file
    const fileBuffer = await readFile(pptxPath);

    // Set headers for download
    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    setHeader(event, 'Content-Disposition', `attachment; filename="${jobId}.pptx"`);

    return fileBuffer;
  } catch (error: any) {
    console.error('Error downloading PPTX:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to download PPTX'
    });
  }
});