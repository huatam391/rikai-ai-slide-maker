<template>
  <div class="slide-preview-panel">
    <div class="panel-header">
      <h3>Slide Preview</h3>
      <div class="slide-info" v-if="currentSlide">
        Slide {{ currentSlide.slide_index }}: {{ currentSlide.slide_title }}
      </div>
    </div>

    <div class="preview-container">
      <div v-if="!currentSlide" class="empty-state">
        <div class="empty-icon">📊</div>
        <div class="empty-text">Select a slide to preview</div>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="loading-state">
        <div class="spinner-large"></div>
        <div class="loading-text">Generating slide preview...</div>
      </div>

      <!-- Image Preview -->
      <div v-else-if="slideImageUrl" class="image-preview">
        <img :src="slideImageUrl" :alt="`Slide ${currentSlide.slide_index}`" class="preview-image" />
      </div>

      <!-- No Preview Available -->
      <div v-else class="empty-state">
        <div class="empty-icon">🖼️</div>
        <div class="empty-text">
          {{ isGenerated ? 'Preview not available' : 'Generate slide to see preview' }}
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <button
        @click="$emit('download')"
        :disabled="!canDownload"
        class="btn btn-primary"
      >
        💾 Download PPTX
      </button>

      <button
        v-if="pptxExists"
        @click="$emit('preview-full')"
        :disabled="loadingFullPreview"
        class="btn btn-outline"
      >
        {{ loadingFullPreview ? '⏳ Loading...' : '👁️ Preview Full PPTX' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SlideStructure, SlideContent } from '~/types';

interface Props {
  currentSlide: SlideStructure | null;
  slideContent: SlideContent | null;
  isGenerated: boolean;
  canDownload: boolean;
  pptxExists: boolean;
  loadingFullPreview: boolean;
  slideImageUrl?: string;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentSlide: null,
  slideContent: null,
  isGenerated: false,
  canDownload: false,
  pptxExists: false,
  loadingFullPreview: false,
  slideImageUrl: undefined,
  isLoading: false
});

const emit = defineEmits<{
  download: [];
  'preview-full': [];
}>();
</script>

<style scoped>
.slide-preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  background: #fff;
  overflow: hidden;
}

.panel-header {
  padding: 10px 12px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.slide-info {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.preview-container {
  flex: 1;
  overflow: hidden;
  padding: 8px;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #FF9800;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 6px solid #f3f3f3;
  border-top: 6px solid #FF9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
}

.panel-footer {
  padding: 10px 12px;
  border-top: 1px solid #e0e0e0;
  background: white;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.btn-outline {
  background: white;
  border: 1px solid #ddd;
  color: #333;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f8f8;
  border-color: #4CAF50;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar styling */
.preview-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.preview-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.preview-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.preview-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>