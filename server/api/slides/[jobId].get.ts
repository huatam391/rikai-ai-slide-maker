import { getSlidesByJobId, getJobById } from '~/server/db';

/**
 * Get all slides for a job
 */
export default defineEventHandler(async (event) => {
  try {
    const jobId = getRouterParam(event, 'jobId');

    if (!jobId) {
      throw createError({
        statusCode: 400,
        message: 'jobId is required'
      });
    }

    // Check if job exists
    const job = getJobById(jobId);
    if (!job) {
      throw createError({
        statusCode: 404,
        message: 'Job not found'
      });
    }

    // Get all slides for this job
    const slides = getSlidesByJobId(jobId);

    return {
      success: true,
      data: slides,
      total: slides.length
    };
  } catch (error: any) {
    console.error('Error getting slides:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get slides'
    });
  }
});