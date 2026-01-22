import { getJobById, createSlide } from '~/server/db';

/**
 * Create a new slide for a job
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { jobId, slideIndex, slideTitle, slideDescription } = body;

    if (!jobId) {
      throw createError({
        statusCode: 400,
        message: 'jobId is required'
      });
    }

    if (slideIndex === undefined || slideIndex === null) {
      throw createError({
        statusCode: 400,
        message: 'slideIndex is required'
      });
    }

    if (!slideTitle) {
      throw createError({
        statusCode: 400,
        message: 'slideTitle is required'
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

    // Create slide
    const slide = createSlide(jobId, slideIndex, slideTitle, slideDescription);

    return {
      success: true,
      data: slide,
      message: 'Slide created successfully'
    };
  } catch (error: any) {
    console.error('Error creating slide:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create slide'
    });
  }
});