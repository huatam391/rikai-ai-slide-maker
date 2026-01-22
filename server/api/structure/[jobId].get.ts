import { getJobById, getJobStructure } from '~/server/db';
import type { SlideStructure } from '~/types';

export default defineEventHandler(async (event) => {
  try {
    const jobId = getRouterParam(event, 'jobId');

    if (!jobId) {
      throw createError({
        statusCode: 400,
        message: 'jobId is required'
      });
    }

    // Get job from database
    const job = getJobById(jobId);
    if (!job) {
      throw createError({
        statusCode: 404,
        message: 'Job not found'
      });
    }

    // Get structure from database
    const slides = getJobStructure(jobId);

    if (!slides) {
      throw createError({
        statusCode: 404,
        message: 'Structure not found for this job'
      });
    }

    return {
      success: true,
      data: slides
    };
  } catch (error: any) {
    console.error('Error getting structure:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get structure'
    });
  }
});