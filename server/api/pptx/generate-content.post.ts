import { getJobById, getSlidesByJobId, bulkCreateSlides, getJobStructure, updateSlideCost, updateTotalJobCost } from '~/server/db';
import { generateWithGemini, calculateCost } from '~/server/utils/llm';
import { PPTX_ELEMENT_PROMPT } from '~/server/utils/prompts';
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
): Promise<[number, SlideContent, TokenUsage]> {
  const fontName = FONT_MAPPING[language] || 'Helvetica Neue';

  const prompt = PPTX_ELEMENT_PROMPT
    .replace('{slide_title}', slide.slide_title)
    .replace('{slide_description}', slide.slide_description)
    .replace('{language}', language)
    .replace(/{font_name}/g, fontName);

  try {
    const response = await generateWithGemini<SlideContent>(prompt, model);
    return [slide.slide_index, response.result, response.usage];
  } catch (error) {
    console.error(`Error generating slide ${slide.slide_index}:`, error);
    return [slide.slide_index, {
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
    const { jobId, language = 'English', model = 'gemini-3-pro-preview' } = body;

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

    // Get structure from database (old format)
    const slideStructures = getJobStructure(jobId);
    if (!slideStructures) {
      throw createError({
        statusCode: 404,
        message: 'Structure not found for this job'
      });
    }

    // Check if slides already exist in database, if not create them
    const existingSlides = getSlidesByJobId(jobId);
    if (existingSlides.length === 0) {
      console.log(`Creating slide records for job ${jobId}...`);
      bulkCreateSlides(jobId, slideStructures);
    }

    // Initialize PPTX config
    const pptxConfig: PPTXConfig = {
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

    // Generate content for slides (skip first slide - title slide)
    const contentSlides = slideStructures.slice(1);
    const results = await Promise.all(
      contentSlides.map(slide => generateSlideElements(slide, language, model))
    );

    // Build slides object and track costs
    for (const [slideIndex, content, usage] of results) {
      pptxConfig.slides[String(slideIndex)] = content;

      // Calculate and save cost for each slide
      const cost = calculateCost(model, usage.inputTokens, usage.outputTokens);
      updateSlideCost(jobId, slideIndex, model, usage.inputTokens, usage.outputTokens, cost);
    }

    // Add title slide
    pptxConfig.slides['0'] = slideStructures[0] as any;

    // Save content JSON to database
    const contentJson = JSON.stringify(pptxConfig);
    updateJobContent(jobId, contentJson);

    // Update total job cost
    updateTotalJobCost(jobId);

    console.log(`Content saved to database for job ${jobId}`);

    return {
      success: true,
      message: 'Content saved to database',
      pptxConfig
    };
  } catch (error: any) {
    console.error('Error generating content:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to generate content'
    });
  }
});