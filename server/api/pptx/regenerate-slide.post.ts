import { mkdir } from 'fs/promises';
import { join } from 'path';
import {
  getJobById,
  getSlideByIndex,
  updateSlideStatus,
  updateSlideContent,
  updateSlideImageUrl,
  getJobContent,
  updateJobContent,
  updateSlideCost,
  updateTotalJobCost
} from '~/server/db';
import { generateWithGemini, calculateCost } from '~/server/utils/llm';
import { PPTX_ELEMENT_PROMPT } from '~/server/utils/prompts';
import { PPTXGenerator } from '~/server/utils/pptx-generator';
import { convertPPTXToImages } from '~/server/utils/pptx-to-image';
import { deleteTemporaryPPTX } from '~/server/utils/file-cleanup';
import type { SlideStructure, SlideContent, PPTXConfig, TokenUsage } from '~/types';

const FONT_MAPPING: Record<string, string> = {
  'Vietnamese': 'Times New Roman',
  'Japanese': 'Yu Mincho',
  'English': 'Helvetica Neue'
};

async function generateSlideElements(
  slide: SlideStructure,
  language: string,
  model: string
): Promise<[SlideContent, TokenUsage]> {
  const fontName = FONT_MAPPING[language] || 'Helvetica Neue';

  const prompt = PPTX_ELEMENT_PROMPT
    .replace('{slide_title}', slide.slide_title)
    .replace('{slide_description}', slide.slide_description)
    .replace('{language}', language)
    .replace(/{font_name}/g, fontName);

  try {
    const response = await generateWithGemini<SlideContent>(prompt, model);
    return [response.result, response.usage];
  } catch (error) {
    console.error(`Error generating slide ${slide.slide_index}:`, error);
    return [{
      slide_title: slide.slide_title,
      elements: [{
        type: 'text',
        content: `Error generating content: ${error}`,
        props: { x: 1, y: 1, w: 8, h: 1 }
      }]
    }, { inputTokens: 0, outputTokens: 0 }];
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { jobId, slideIndex, language = 'English', model = 'gemini-3-flash-preview' } = body;

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

    // Get job from database
    const job = getJobById(jobId);
    if (!job) {
      throw createError({
        statusCode: 404,
        message: 'Job not found'
      });
    }

    // Get slide from database
    const slide = getSlideByIndex(jobId, slideIndex);
    if (!slide) {
      throw createError({
        statusCode: 404,
        message: `Slide with index ${slideIndex} not found`
      });
    }

    // Update status to 'generating'
    updateSlideStatus(jobId, slideIndex, 'generating');

    try {
      // Generate content for the specific slide
      let slideContent: SlideContent | SlideStructure;
      let usage: TokenUsage = { inputTokens: 0, outputTokens: 0 };

      if (slideIndex === 0) {
        // Title slide - just use structure
        slideContent = {
          slide_title: slide.slide_title,
          slide_description: slide.slide_description,
          elements: []
        } as SlideStructure;
      } else {
        // Content slide - generate elements
        const slideStructure: SlideStructure = {
          slide_index: slide.slide_index,
          slide_title: slide.slide_title,
          slide_description: slide.slide_description || ''
        };
        const [content, tokenUsage] = await generateSlideElements(slideStructure, language, model);
        slideContent = content;
        usage = tokenUsage;

        // Calculate and save cost for this slide
        const cost = calculateCost(model, usage.inputTokens, usage.outputTokens);
        updateSlideCost(jobId, slideIndex, model, usage.inputTokens, usage.outputTokens, cost);
      }

      // Save content to slide record
      const contentJson = JSON.stringify(slideContent);
      updateSlideContent(jobId, slideIndex, contentJson);

      // Also update the old content_json format for backward compatibility
      let pptxConfig = getJobContent(jobId);
      if (!pptxConfig) {
        pptxConfig = {
          slideConfig: {
            title: 'Generated Presentation',
            layout: {
              name: 'CUSTOM_LAYOUT',
              width: 13.33,
              height: 7.50
            }
          },
          slides: {},
          font: FONT_MAPPING[language] || 'Helvetica Neue'
        };
      }
      pptxConfig.slides[String(slideIndex)] = slideContent;
      updateJobContent(jobId, JSON.stringify(pptxConfig));

      // Generate PPTX and convert to image
      const generator = new PPTXGenerator(pptxConfig);
      const pres = await generator.generateSingleSlide(String(slideIndex));

      // Save temporary PPTX
      const outputDir = join(process.cwd(), 'output', 'single-slides', jobId);
      await mkdir(outputDir, { recursive: true });

      const pptxPath = join(outputDir, `slide-${slideIndex}.pptx`);
      await pres.writeFile({ fileName: pptxPath });

      // Convert to image
      const imagesDir = join(process.cwd(), 'output', 'previews', jobId, `slide-${slideIndex}`);
      const result = await convertPPTXToImages({
        pptxPath,
        outputDir: imagesDir,
        format: 'png',
        resolution: 150
      });

      if (!result.success || result.images.length === 0) {
        throw new Error(result.error || 'Failed to convert PPTX to image');
      }

      // Save image URL to database
      const imageUrl = `/api/pptx/preview-image/${jobId}/slide-${slideIndex}/${result.images[0].split('/').pop()}`;
      updateSlideImageUrl(jobId, slideIndex, imageUrl);

      // Delete temporary PPTX file
      await deleteTemporaryPPTX(jobId, String(slideIndex));

      // Update status to 'completed'
      updateSlideStatus(jobId, slideIndex, 'completed');

      // Update total job cost
      updateTotalJobCost(jobId);

      console.log(`Slide ${slideIndex} regenerated successfully for job ${jobId}`);

      return {
        success: true,
        slideIndex,
        slideContent,
        imageUrl,
        message: 'Slide regenerated successfully'
      };
    } catch (error: any) {
      // Update status to 'error'
      updateSlideStatus(jobId, slideIndex, 'error', error.message);
      throw error;
    }
  } catch (error: any) {
    console.error('Error regenerating slide:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to regenerate slide'
    });
  }
});
