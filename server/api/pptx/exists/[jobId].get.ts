import { existsSync } from 'fs';
import { join } from 'path';
import { getJobById } from '~/server/db';

export default defineEventHandler(async (event) => {
  try {
    const jobId = getRouterParam(event, 'jobId');

    if (!jobId) {
      throw createError({
        statusCode: 400,
        message: 'jobId is required'
      });
    }

    // Get job from database to verify it exists
    const job = getJobById(jobId);
    if (!job) {
      throw createError({
        statusCode: 404,
        message: 'Job not found'
      });
    }

    // Check if PPTX file exists
    const outputDir = join(process.cwd(), 'output');
    const pptxPath = join(outputDir, `${jobId}.pptx`);
    const exists = existsSync(pptxPath);

    return {
      success: true,
      exists
    };
  } catch (error: any) {
    console.error('Error checking PPTX existence:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to check PPTX existence'
    });
  }
});