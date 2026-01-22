import { mkdir } from 'fs/promises';
import { join } from 'path';
import { getJobById, getJobContent } from '~/server/db';
import { PPTXGenerator } from '~/server/utils/pptx-generator';
import type { PPTXConfig } from '~/types';

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

    // Generate PPTX
    const generator = new PPTXGenerator(pptxConfig);
    const pres = await generator.generate();

    const outputDir = join(process.cwd(), 'output');
    await mkdir(outputDir, { recursive: true });

    const pptxPath = join(outputDir, `${jobId}.pptx`);
    await pres.writeFile({ fileName: pptxPath });

    console.log(`PPTX generated successfully at ${pptxPath}`);

    return {
      success: true,
      pptxPath
    };
  } catch (error: any) {
    console.error('Error generating PPTX:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to generate PPTX'
    });
  }
});