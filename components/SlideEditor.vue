<template>
  <div class="group relative bg-white border-2 border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-primary-300 hover:shadow-lg">
    <!-- Gradient accent bar -->
    <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-500 to-secondary-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

    <div class="flex items-start space-x-5">
      <!-- Slide Number Badge -->
      <div class="flex-shrink-0">
        <div class="relative">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
            <span class="text-2xl font-bold text-white">{{ index + 1 }}</span>
          </div>
          <div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Form Fields -->
      <div class="flex-1 space-y-4">
        <div>
          <label :for="`title-${index}`" class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
            </svg>
            <span>Slide Title</span>
          </label>
          <input
            :id="`title-${index}`"
            type="text"
            :value="slide.slide_title"
            @input="$emit('update', index, 'slide_title', ($event.target as HTMLInputElement).value)"
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-all duration-200 hover:border-primary-300 font-medium"
            placeholder="Enter slide title..."
          />
        </div>

        <div>
          <label :for="`desc-${index}`" class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <svg class="w-4 h-4 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
            </svg>
            <span>Description</span>
          </label>
          <textarea
            :id="`desc-${index}`"
            :value="slide.slide_description"
            @input="$emit('update', index, 'slide_description', ($event.target as HTMLTextAreaElement).value)"
            rows="3"
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm transition-all duration-200 hover:border-secondary-300 resize-none"
            placeholder="Describe the content for this slide..."
          ></textarea>
        </div>
      </div>

      <!-- Delete Button -->
      <div class="flex-shrink-0">
        <button
          @click="$emit('delete', index)"
          class="group/delete inline-flex items-center space-x-2 px-4 py-2.5 border-2 border-red-200 text-sm font-semibold rounded-xl text-red-600 bg-white hover:bg-red-600 hover:border-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105"
          title="Delete this slide"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          <span class="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SlideStructure } from '~/types';

defineProps<{
  slide: SlideStructure;
  index: number;
}>();

defineEmits<{
  update: [index: number, field: string, value: string];
  delete: [index: number];
}>();
</script>