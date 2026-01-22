<template>
  <div class="space-y-6">
    <!-- Structure Generator Card -->
    <div class="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 overflow-hidden">
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <div>
            <h2 class="text-lg font-bold text-white">Structure Generator</h2>
            <p class="text-primary-100 text-sm">Let AI create your presentation outline</p>
          </div>
        </div>
      </div>

      <div class="p-6 space-y-5">
        <div>
          <label for="model-select" class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
            </svg>
            <span>AI Model</span>
          </label>
          <select
            id="model-select"
            v-model="selectedModel"
            class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-all duration-200 hover:border-primary-300"
          >
            <option value="gemini-3-pro-preview">Gemini 3 Pro Preview (Default - $2/$12 per 1M tokens)</option>
            <option value="gemini-3-flash-preview">Gemini 3 Flash Preview ($0.5/$3 per 1M tokens)</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro ($1.25/$10 per 1M tokens)</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash ($0.30/$2.50 per 1M tokens)</option>
          </select>
        </div>

        <div>
          <label for="user-input" class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span>Presentation Description</span>
          </label>
          <textarea
            id="user-input"
            v-model="userInput"
            rows="5"
            class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-all duration-200 hover:border-primary-300"
            placeholder="Example: Create a 10-slide pitch deck about AI-powered productivity tools for small businesses, including market analysis, product features, and growth strategy..."
          ></textarea>
        </div>

        <button
          @click="generateStructure"
          :disabled="loading || !userInput"
          class="w-full inline-flex items-center justify-center space-x-2 py-3 px-6 border border-transparent shadow-lg text-base font-semibold rounded-xl text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:hover:scale-100"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span>{{ loading ? 'Generating with AI...' : 'Generate Structure' }}</span>
        </button>

        <!-- Error Message -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="error" class="rounded-xl bg-red-50 border border-red-200 p-4">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm text-red-800 font-medium">{{ error }}</p>
            </div>
          </div>
        </Transition>

        <!-- Success Message -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="success" class="rounded-xl bg-green-50 border border-green-200 p-4">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm text-green-800 font-medium">{{ success }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Slides Preview & Edit -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-8"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-8"
    >
      <div v-if="slides.length > 0" class="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 overflow-hidden">
        <div class="bg-gradient-to-r from-secondary-500 to-secondary-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div>
                <h3 class="text-lg font-bold text-white">Slides Preview & Edit</h3>
                <p class="text-secondary-100 text-sm">{{ slides.length }} slide{{ slides.length > 1 ? 's' : '' }} in your presentation</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <TransitionGroup
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
            move-class="transition-transform duration-300"
          >
            <SlideEditor
              v-for="(slide, index) in slides"
              :key="slide.slide_index"
              :slide="slide"
              :index="index"
              @update="updateSlide"
              @delete="deleteSlide"
            />
          </TransitionGroup>

          <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              @click="addSlide"
              class="inline-flex items-center space-x-2 py-2.5 px-5 border-2 border-gray-300 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span>Add Slide</span>
            </button>

            <button
              @click="saveStructure"
              :disabled="saving"
              class="inline-flex items-center space-x-2 py-2.5 px-6 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              <span>{{ saving ? 'Saving...' : 'Save Structure & Create Job' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { SlideStructure } from '~/types';

const userInput = ref('');
const slides = ref<SlideStructure[]>([]);
const selectedModel = ref('gemini-3-flash-preview');
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');

// Store generation metadata for saving later
const generationMetadata = ref<{
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
} | null>(null);

async function generateStructure() {
  if (!userInput.value) return;

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const response = await $fetch('/api/structure/generate', {
      method: 'POST',
      body: {
        userRequest: userInput.value,
        model: selectedModel.value
      }
    }) as any;

    if (response.success) {
      slides.value = response.data;

      // Store metadata for saving
      generationMetadata.value = {
        model: response.model,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        cost: response.cost
      };

      success.value = `Structure generated successfully! Cost: $${response.cost.toFixed(6)}`;
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to generate structure';
  } finally {
    loading.value = false;
  }
}

function updateSlide(index: number, field: string, value: string) {
  if (slides.value[index]) {
    slides.value[index][field as keyof SlideStructure] = value as any;
  }
}

function deleteSlide(index: number) {
  slides.value.splice(index, 1);
  // Re-index slides
  slides.value.forEach((slide, i) => {
    slide.slide_index = i;
  });
}

function addSlide() {
  slides.value.push({
    slide_index: slides.value.length,
    slide_title: 'New Slide',
    slide_description: ''
  });
}

async function saveStructure() {
  saving.value = true;
  error.value = '';
  success.value = '';

  try {
    const response = await $fetch('/api/structure/save', {
      method: 'POST',
      body: {
        slides: slides.value,
        ...generationMetadata.value
      }
    }) as any;

    if (response.success) {
      success.value = `Success! Job ID: ${response.jobId}`;
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to save structure';
  } finally {
    saving.value = false;
  }
}
</script>