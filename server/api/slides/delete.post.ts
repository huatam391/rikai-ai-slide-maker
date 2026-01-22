import { getJobById, getSlidesByJobId, deleteSlide, getDatabase } from '~/server/db';

/**
 * Delete a slide and re-index remaining slides
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { jobId, slideIndex } = body;

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

    if (slideIndex === 0) {
      throw createError({
        statusCode: 400,
        message: 'Cannot delete title slide (index 0)'
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

    const db = getDatabase();

    // Use transaction to ensure atomicity
    db.transaction(() => {
      // Delete the slide
      deleteSlide(jobId, slideIndex);

      // Re-index all slides after the deleted one
      const stmt = db.prepare(`
        UPDATE slides
        SET slide_index = slide_index - 1, updated_at = CURRENT_TIMESTAMP
        WHERE job_id = ? AND slide_index > ?
      `);
      stmt.run(jobId, slideIndex);
    })();

    // Get updated slides
    const updatedSlides = getSlidesByJobId(jobId);

    return {
      success: true,
      data: updatedSlides,
      message: 'Slide deleted and remaining slides re-indexed successfully'
    };
  } catch (error: any) {
    console.error('Error deleting slide:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete slide'
    });
  }
});