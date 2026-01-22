import { getJobById, updateJobStructure, bulkCreateSlides, getSlidesByJobId } from '~/server/db';
import type { SlideStructure } from '~/types';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { jobId, slides } = body;

    if (!jobId) {
      throw createError({
        statusCode: 400,
        message: 'jobId is required'
      });
    }

    if (!slides || !Array.isArray(slides)) {
      throw createError({
        statusCode: 400,
        message: 'slides array is required'
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

    // Validate and re-index slides
    const validatedSlides: SlideStructure[] = slides.map((slide, index) => ({
      slide_index: index,
      slide_title: slide.slide_title || '',
      slide_description: slide.slide_description || ''
    }));

    // Save updated structure to jobs table (for backward compatibility)
    const structureJson = JSON.stringify(validatedSlides);
    updateJobStructure(jobId, structureJson);

    // Sync with slides table
    // Option 1: Delete all existing slides and recreate (simpler, preserves order)
    // Option 2: Update existing + add new + delete removed (more complex, preserves content)

    // Using Option 1 for simplicity - we'll preserve content in next iteration
    const existingSlides = getSlidesByJobId(jobId);

    // For now, just ensure all slides exist in slides table
    // This uses INSERT OR REPLACE to update existing or create new
    bulkCreateSlides(jobId, validatedSlides);

    console.log(`Structure and ${validatedSlides.length} slides updated in database for job ${jobId}`);

    return {
      success: true,
      message: 'Structure updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating structure:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update structure'
    });
  }
});