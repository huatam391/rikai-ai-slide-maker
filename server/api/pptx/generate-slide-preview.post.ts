import { mkdir } from 'fs/promises';
import { join } from 'path';
import { getJobById, getJobContent } from '~/server/db';
import { PPTXGenerator } from '~/server/utils/pptx-generator';
import { convertPPTXToImages } from '~/server/utils/pptx-to-image';

/**
 * Generate PPTX and preview image for a single slide
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { jobId, slideKey } = body;

    if (!jobId) {
      throw createError({
        statusCode: 400,
        message: 'jobId is required'
      });
    }

    if (slideKey === undefined || slideKey === null) {
      throw createError({
        statusCode: 400,
        message: 'slideKey is required'
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

    // Get content from database
    const pptxConfig = getJobContent(jobId);
    if (!pptxConfig) {
      throw createError({
        statusCode: 404,
        message: 'Content not found. Please generate content first.'
      });
    }

    // Validate slide exists
    if (!pptxConfig.slides[slideKey]) {
      throw createError({
        statusCode: 404,
        message: `Slide ${slideKey} not found in content`
      });
    }

    // Generate single slide PPTX
    const generator = new PPTXGenerator(pptxConfig);
    const pres = await generator.generateSingleSlide(slideKey);

    // Create output directories
    const outputDir = join(process.cwd(), 'output', 'single-slides', jobId);
    await mkdir(outputDir, { recursive: true });

    const pptxPath = join(outputDir, `slide-${slideKey}.pptx`);
    await pres.writeFile({ fileName: pptxPath });

    console.log(`Single slide PPTX generated at ${pptxPath}`);

    // Convert to image
    const imagesDir = join(process.cwd(), 'output', 'previews', jobId, `slide-${slideKey}`);
    const result = await convertPPTXToImages({
      pptxPath,
      outputDir: imagesDir,
      format: 'png',
      resolution: 150
    });

    if (!result.success) {
      throw createError({
        statusCode: 500,
        message: result.error || 'Failed to convert PPTX to image'
      });
    }

    // Get the first (and only) image
    const imageUrl = result.images.length > 0
      ? `/api/pptx/preview-image/${jobId}/slide-${slideKey}/${result.images[0].split('/').pop()}`
      : null;

    return {
      success: true,
      jobId,
      slideKey,
      pptxPath,
      imageUrl,
      message: `Slide ${slideKey} preview generated successfully`
    };
  } catch (error: any) {
    console.error('Error generating slide preview:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to generate slide preview'
    });
  }
});