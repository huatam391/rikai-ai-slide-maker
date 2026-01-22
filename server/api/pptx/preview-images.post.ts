import { join } from 'path';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { getJobById, getJobContent } from '~/server/db';
import { convertPPTXToImages, getImageUrls } from '~/server/utils/pptx-to-image';
import { PPTXGenerator } from '~/server/utils/pptx-generator';

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

    // Check if PPTX file exists
    const outputDir = join(process.cwd(), 'output');
    const pptxPath = join(outputDir, `${jobId}.pptx`);

    // If PPTX doesn't exist, generate it
    if (!existsSync(pptxPath)) {
      console.log('PPTX file not found, generating...');

      // Get content from database
      const pptxConfig = getJobContent(jobId);
      if (!pptxConfig) {
        throw createError({
          statusCode: 404,
          message: 'Content not found. Please generate content first.'
        });
      }

      // Generate PPTX
      const generator = new PPTXGenerator(pptxConfig);
      const pres = await generator.generate();

      await mkdir(outputDir, { recursive: true });
      await pres.writeFile({ fileName: pptxPath });

      console.log(`PPTX generated successfully at ${pptxPath}`);
    }

    // Create directory for images
    const imagesDir = join(outputDir, 'previews', jobId);

    // Convert PPTX to images
    const result = await convertPPTXToImages({
      pptxPath,
      outputDir: imagesDir,
      format: 'png',
      resolution: 150
    });

    if (!result.success) {
      throw createError({
        statusCode: 500,
        message: result.error || 'Failed to convert PPTX to images'
      });
    }

    // Generate image URLs
    const imageUrls = result.images.map(imagePath => {
      const filename = imagePath.split('/').pop() || '';
      return `/api/pptx/preview-image/${jobId}/${filename}`;
    });

    return {
      success: true,
      jobId,
      totalSlides: result.images.length,
      images: imageUrls
    };
  } catch (error: any) {
    console.error('Error generating image preview:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to generate image preview'
    });
  }
});