import { generateWithGemini, calculateCost } from '~/server/utils/llm';
import { STRUCTURE_PROMPT } from '~/server/utils/prompts';
import type { SlideStructure } from '~/types';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userRequest, model = 'gemini-3-flash-preview' } = body;

    if (!userRequest) {
      throw createError({
        statusCode: 400,
        message: 'userRequest is required'
      });
    }

    const prompt = STRUCTURE_PROMPT.replace('{user_request}', userRequest);
    const response = await generateWithGemini<SlideStructure[]>(prompt, model);

    // Validate structure
    if (!Array.isArray(response.result)) {
      throw createError({
        statusCode: 500,
        message: 'Invalid structure format from LLM'
      });
    }

    // Calculate cost
    const cost = calculateCost(
      model,
      response.usage.inputTokens,
      response.usage.outputTokens
    );

    return {
      success: true,
      data: response.result,
      usage: response.usage,
      cost,
      model
    };
  } catch (error: any) {
    console.error('Error generating structure:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to generate structure'
    });
  }
});