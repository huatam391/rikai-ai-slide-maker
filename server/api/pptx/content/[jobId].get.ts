import { getJobById, getJobContent } from '~/server/db';
import type { PPTXConfig } from '~/types';

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

    // Get content from database
    const content = getJobContent(jobId);

    if (!content) {
      // Content doesn't exist yet
      return {
        success: true,
        content: null,
        hasContent: false
      };
    }

    return {
      success: true,
      content,
      hasContent: true
    };
  } catch (error: any) {
    console.error('Error getting content:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get content'
    });
  }
});
