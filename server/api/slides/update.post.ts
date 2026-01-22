import { getJobById, getSlideByIndex, updateSlideStructure } from '~/server/db';

/**
 * Update slide structure (title, description)
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

    // Check if job exists
    const job = getJobById(jobId);
    if (!job) {
      throw createError({
        statusCode: 404,
        message: 'Job not found'
      });
    }

    // Check if slide exists
    const slide = getSlideByIndex(jobId, slideIndex);
    if (!slide) {
      throw createError({
        statusCode: 404,
        message: `Slide with index ${slideIndex} not found`
      });
    }

    // Update slide structure
    updateSlideStructure(jobId, slideIndex, slideTitle, slideDescription);

    // Get updated slide
    const updatedSlide = getSlideByIndex(jobId, slideIndex);

    return {
      success: true,
      data: updatedSlide,
      message: 'Slide updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating slide:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update slide'
    });
  }
});