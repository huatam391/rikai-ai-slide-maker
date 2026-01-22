import { randomUUID } from 'crypto';
import { createJob, bulkCreateSlides, updateJobStructureCost, updateTotalJobCost } from '~/server/db';
import type { SlideStructure } from '~/types';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { slides, model, inputTokens, outputTokens, cost } = body;

    if (!Array.isArray(slides) || slides.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'slides array is required and cannot be empty'
      });
    }

    // Re-index slides
    const indexedSlides: SlideStructure[] = slides.map((slide, index) => ({
      ...slide,
      slide_index: index
    }));

    const jobId = randomUUID();

    // Save structure JSON directly to database (for backward compatibility)
    const structureJson = JSON.stringify(indexedSlides);
    createJob(jobId, structureJson);

    // Create slide records in slides table
    bulkCreateSlides(jobId, indexedSlides);

    // Save structure cost if provided
    if (model && typeof inputTokens === 'number' && typeof outputTokens === 'number' && typeof cost === 'number') {
      updateJobStructureCost(jobId, model, inputTokens, outputTokens, cost);
      updateTotalJobCost(jobId);
    }

    console.log(`Structure and ${indexedSlides.length} slides saved to database for job ${jobId}`);

    return {
      success: true,
      jobId,
      message: 'Structure saved to database'
    };
  } catch (error: any) {
    console.error('Error saving structure:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to save structure'
    });
  }
});