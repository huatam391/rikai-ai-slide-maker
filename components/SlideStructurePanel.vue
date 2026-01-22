<template>
  <div class="slide-structure-panel">
    <div class="panel-header">
      <h3>Slide Structure</h3>
      <div class="slide-count">{{ slides.length }} slides</div>
    </div>

    <div class="slides-list">
      <SlideStructureItem
        v-for="slide in slides"
        :key="slide.slide_index"
        :slide="slide"
        :is-selected="selectedSlideIndex === slide.slide_index"
        :is-generated="generatedSlides.has(slide.slide_index)"
        :loading="loadingSlides.has(slide.slide_index)"
        @select="$emit('select-slide', slide.slide_index)"
        @update="(field, value) => handleUpdate(slide.slide_index, field, value)"
        @regenerate="$emit('regenerate-slide', slide.slide_index)"
        @delete="$emit('delete-slide', slide.slide_index)"
      />
    </div>

    <div class="panel-actions">
      <button
        @click="$emit('add-slide')"
        class="btn btn-outline"
      >
        ➕ Add Slide
      </button>

      <button
        v-if="pendingCount > 0"
        @click="$emit('generate-all')"
        :disabled="isGeneratingAll"
        class="btn btn-primary"
      >
        {{ isGeneratingAll ? '⏳ Generating...' : `🚀 Generate All (${pendingCount})` }}
      </button>

      <!-- Progress Indicator -->
      <div v-if="isGeneratingAll" class="progress-container">
        <div class="progress-info">
          <span>{{ completedCount }} / {{ totalCount }} slides</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SlideStructure } from '~/types';

interface Props {
  slides: SlideStructure[];
  selectedSlideIndex: number;
  generatedSlides: Set<number>;
  loadingSlides: Set<number>;
  isGeneratingAll?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isGeneratingAll: false
});

const emit = defineEmits<{
  'select-slide': [index: number];
  'update-slide': [index: number, field: string, value: string];
  'regenerate-slide': [index: number];
  'delete-slide': [index: number];
  'add-slide': [];
  'generate-all': [];
}>();

const pendingCount = computed(() => {
  return props.slides.filter(s => !props.generatedSlides.has(s.slide_index)).length;
});

const completedCount = computed(() => {
  return props.generatedSlides.size;
});

const totalCount = computed(() => {
  return props.slides.length;
});

const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((completedCount.value / totalCount.value) * 100);
});

const handleUpdate = (index: number, field: string, value: string) => {
  emit('update-slide', index, field, value);
};
</script>

<style scoped>
.slide-structure-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  background: #f8f9fa;
  border-right: 1px solid #e0e0e0;
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

.slide-count {
  font-size: 11px;
  color: #666;
}

.slides-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  min-height: 0;
}

.panel-actions {
  padding: 10px 12px;
  border-top: 1px solid #e0e0e0;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
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

.btn-outline:hover {
  background: #f8f8f8;
  border-color: #4CAF50;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.progress-container {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.progress-info {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  text-align: center;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Scrollbar styling */
.slides-list::-webkit-scrollbar {
  width: 6px;
}

.slides-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.slides-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.slides-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>