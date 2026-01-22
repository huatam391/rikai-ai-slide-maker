import { getJobCostSummary } from '~/server/db';

export default defineEventHandler(async (event) => {
  try {
    const jobId = getRouterParam(event, 'jobId');

    if (!jobId) {
      throw createError({
        statusCode: 400,
        message: 'jobId is required'
      });
    }

    const costSummary = getJobCostSummary(jobId);

    if (!costSummary) {
      throw createError({
        statusCode: 404,
        message: 'Job not found'
      });
    }

    return {
      success: true,
      data: costSummary
    };
  } catch (error: any) {
    console.error('Error retrieving job cost:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to retrieve job cost'
    });
  }
});