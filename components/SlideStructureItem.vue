<template>
  <div
    class="slide-structure-item"
    :class="{ 'selected': isSelected, 'generated': isGenerated, 'loading': loading }"
    @click="$emit('select')"
  >
    <!-- Slide Header -->
    <div class="slide-header">
      <div class="slide-number">
        <span class="status-icon">
          <span v-if="loading" class="spinner"></span>
          <span v-else>{{ isGenerated ? '✓' : '○' }}</span>
        </span>
        <span>Slide {{ slide.slide_index }}</span>
      </div>

      <button
        v-if="!isExpanded && !loading"
        @click.stop="toggleExpand"
        class="btn-icon"
        title="Edit"
      >
        ✏️
      </button>
    </div>

    <!-- Slide Title (always visible) -->
    <div class="slide-title">
      {{ slide.slide_title || 'Untitled Slide' }}
    </div>

    <!-- Expanded Edit Form -->
    <div v-if="isExpanded" class="slide-edit-form">
      <div class="form-group">
        <label>Title</label>
        <input
          v-model="editedTitle"
          type="text"
          class="form-input"
          placeholder="Slide title"
        />
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea
          v-model="editedDescription"
          class="form-textarea"
          rows="4"
          placeholder="Slide description"
        />
      </div>

      <div class="form-actions">
        <button @click="saveChanges" class="btn btn-primary btn-sm">
          Save
        </button>
        <button @click="cancelEdit" class="btn btn-secondary btn-sm">
          Cancel
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="slide-actions">
      <button
        v-if="!isExpanded"
        @click.stop="$emit('regenerate')"
        :disabled="loading"
        class="btn btn-sm btn-outline"
        title="Regenerate this slide"
      >
        {{ loading ? '⏳ Generating...' : '🔄 Regenerate' }}
      </button>

      <button
        v-if="slide.slide_index > 0 && !isExpanded"
        @click.stop="$emit('delete')"
        class="btn btn-sm btn-danger"
        title="Delete slide"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SlideStructure } from '~/types';

interface Props {
  slide: SlideStructure;
  isSelected?: boolean;
  isGenerated?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isGenerated: false,
  loading: false
});

const emit = defineEmits<{
  select: [];
  update: [field: string, value: string];
  regenerate: [];
  delete: [];
}>();

const isExpanded = ref(false);
const editedTitle = ref(props.slide.slide_title);
const editedDescription = ref(props.slide.slide_description);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) {
    // Reset to current values
    editedTitle.value = props.slide.slide_title;
    editedDescription.value = props.slide.slide_description;
  }
};

const saveChanges = () => {
  emit('update', 'slide_title', editedTitle.value);
  emit('update', 'slide_description', editedDescription.value);
  isExpanded.value = false;
};

const cancelEdit = () => {
  editedTitle.value = props.slide.slide_title;
  editedDescription.value = props.slide.slide_description;
  isExpanded.value = false;
};

// Watch for prop changes
watch(() => props.slide, (newSlide) => {
  if (!isExpanded.value) {
    editedTitle.value = newSlide.slide_title;
    editedDescription.value = newSlide.slide_description;
  }
}, { deep: true });
</script>

<style scoped>
.slide-structure-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.slide-structure-item:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.slide-structure-item.selected {
  border-color: #4CAF50;
  background: #f1f8f4;
}

.slide-structure-item.generated .status-icon {
  color: #4CAF50;
}

.slide-structure-item.loading {
  border-color: #FF9800;
  background: #FFF3E0;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #FF9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.slide-number {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.status-icon {
  font-size: 14px;
  color: #999;
}

.slide-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.slide-edit-form {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.slide-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
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

.btn-danger {
  background: #ff5252;
  color: white;
}

.btn-danger:hover {
  background: #ff1744;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 1;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
