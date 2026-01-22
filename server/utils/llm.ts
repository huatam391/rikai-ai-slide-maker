import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMResponse, TokenUsage } from '~/types';

let genAI: GoogleGenerativeAI | null = null;

// Model pricing per 1M tokens (in USD)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gemini-3-pro-preview': { input: 2.0, output: 12.0 },
  'gemini-3-flash-preview': { input: 0.5, output: 3.0 },
  'gemini-2.5-pro': { input: 1.25, output: 10.0 },
  'gemini-2.5-flash': { input: 0.30, output: 2.50 }
};

export function getGeminiClient() {
  if (!genAI) {
    const config = useRuntimeConfig();
    const apiKey = config.googleApiKey;

    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    genAI = new GoogleGenerativeAI(apiKey);
  }

  return genAI;
}

/**
 * Calculate cost based on token usage and model
 */
export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[modelId];
  if (!pricing) {
    console.warn(`Unknown model pricing for ${modelId}, using default pricing`);
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;

  return inputCost + outputCost;
}

/**
 * Generate content with Gemini and track token usage
 */
export async function generateWithGemini<T = any>(
  prompt: string,
  modelId?: string
): Promise<LLMResponse<T>> {
  const config = useRuntimeConfig();
  const genAI = getGeminiClient();

  // Use provided model or fallback to config
  const selectedModel = modelId || config.modelId || 'gemini-3-pro-preview';

  const model = genAI.getGenerativeModel({
    model: selectedModel,
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Extract token usage from response
  const usageMetadata = response.usageMetadata;
  const usage: TokenUsage = {
    inputTokens: usageMetadata?.promptTokenCount || 0,
    outputTokens: usageMetadata?.candidatesTokenCount || 0
  };

  return {
    result: JSON.parse(text) as T,
    usage
  };
}