import { mkdir } from 'fs/promises';
import { join } from 'path';
import { getJobById, getJobContent } from '~/server/db';
import { PPTXGenerator } from '~/server/utils/pptx-generator';
import { convertPPTXToImages } from '~/server/utils/pptx-to-image';

/**
 * Generate PPTX and preview images for all slides individually
 * This is used for "Generate All" functionality where each slide gets its own PPTX and preview
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { jobId } = body;

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

    // Get content from database
    const pptxConfig = getJobContent(jobId);
    if (!pptxConfig) {
      throw createError({
        statusCode: 404,
        message: 'Content not found. Please generate content first.'
      });
    }

    const slideKeys = Object.keys(pptxConfig.slides).sort((a, b) => parseInt(a) - parseInt(b));
    const generator = new PPTXGenerator(pptxConfig);

    const results: Array<{
      slideKey: string;
      success: boolean;
      pptxPath?: string;
      imageUrl?: string;
      error?: string;
    }> = [];

    // Generate each slide individually
    for (const slideKey of slideKeys) {
      try {
        console.log(`Generating preview for slide ${slideKey}...`);

        // Generate single slide PPTX
        const pres = await generator.generateSingleSlide(slideKey);

        // Create output directories
        const outputDir = join(process.cwd(), 'output', 'single-slides', jobId);
        await mkdir(outputDir, { recursive: true });

        const pptxPath = join(outputDir, `slide-${slideKey}.pptx`);
        await pres.writeFile({ fileName: pptxPath });

        console.log(`Single slide PPTX generated at ${pptxPath}`);

        // Convert to image
        const imagesDir = join(process.cwd(), 'output', 'previews', jobId, `slide-${slideKey}`);
        const convertResult = await convertPPTXToImages({
          pptxPath,
          outputDir: imagesDir,
          format: 'png',
          resolution: 150
        });

        if (!convertResult.success) {
          results.push({
            slideKey,
            success: false,
            error: convertResult.error || 'Failed to convert PPTX to image'
          });
          continue;
        }

        // Get the first (and only) image
        const imageUrl = convertResult.images.length > 0
          ? `/api/pptx/preview-image/${jobId}/slide-${slideKey}/${convertResult.images[0].split('/').pop()}`
          : undefined;

        results.push({
          slideKey,
          success: true,
          pptxPath,
          imageUrl
        });

        console.log(`Slide ${slideKey} preview generated successfully`);
      } catch (error: any) {
        console.error(`Error generating preview for slide ${slideKey}:`, error);
        results.push({
          slideKey,
          success: false,
          error: error.message || 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      success: failureCount === 0,
      jobId,
      totalSlides: slideKeys.length,
      successCount,
      failureCount,
      results,
      message: `Generated ${successCount}/${slideKeys.length} slide previews`
    };
  } catch (error: any) {
    console.error('Error generating all slide previews:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to generate all slide previews'
    });
  }
});