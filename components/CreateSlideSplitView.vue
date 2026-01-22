<template>
  <div class="create-slide-split-view">
    <!-- Header -->
    <div class="view-header">
      <h2>Create Presentation - Split View</h2>

      <div class="header-controls">
        <div class="job-selector">
          <label>Job:</label>
          <select v-model="selectedJobId" @change="loadJob" class="select-input">
            <option value="">-- Select Job --</option>
            <option v-for="job in jobs" :key="job.job_id" :value="job.job_id">
              {{ job.job_id }}
            </option>
          </select>
        </div>

        <div class="model-selector">
          <label>Model:</label>
          <select v-model="selectedModel" class="select-input">
            <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
            <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          </select>
        </div>

        <div class="language-selector">
          <label>Language:</label>
          <select v-model="selectedLanguage" class="select-input">
            <option value="English">English</option>
            <option value="Vietnamese">Vietnamese</option>
            <option value="Japanese">Japanese</option>
          </select>
        </div>
      </div>
    </div>
    <!-- Loading State -->
    <div v-if="loadingJobs || loadingJob" class="loading-container">
      <div class="spinner"></div>
      <div>Loading...</div>
    </div>

    <!-- Main Content - Split View -->
    <div v-else-if="selectedJobId && slides.length > 0" class="split-container">
      <!-- Left Panel: Slide Structure -->
      <SlideStructurePanel
        :slides="slides"
        :selected-slide-index="selectedSlideIndex"
        :generated-slides="generatedSlides"
        :loading-slides="loadingSlides"
        :is-generating-all="isGeneratingAll"
        @select-slide="selectSlide"
        @update-slide="updateSlide"
        @regenerate-slide="regenerateSlide"
        @delete-slide="deleteSlide"
        @add-slide="addSlide"
        @generate-all="generateAll"
      />

      <!-- Right Panel: Slide Preview -->
      <SlidePreviewPanel
        :current-slide="currentSlide"
        :slide-content="currentSlideContent"
        :is-generated="isCurrentSlideGenerated"
        :can-download="canDownload"
        :pptx-exists="pptxExists"
        :loading-full-preview="loadingFullPreview"
        :slide-image-url="slidePreviewImages[selectedSlideIndex]"
        :is-loading="loadingSlides.has(selectedSlideIndex)"
        @download="downloadPPTX"
        @preview-full="previewFullPPTX"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📄</div>
      <div class="empty-text">Please select a job to start</div>
    </div>

    <!-- Full Preview Modal -->
    <div v-if="showFullPreviewModal" class="modal-overlay" @click="closeFullPreview">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Full PPTX Preview ({{ previewImages.length }} slides)</h3>
          <button @click="closeFullPreview" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <!-- Image Preview -->
          <div v-if="previewImages.length > 0" class="preview-images">
            <div v-for="(imageUrl, index) in previewImages" :key="index" class="preview-slide">
              <div class="slide-number">Slide {{ index + 1 }}</div>
              <img :src="imageUrl" :alt="`Slide ${index + 1}`" class="slide-image" />
            </div>
          </div>
          <!-- Loading or No Preview -->
          <div v-else class="preview-loading">
            <div class="spinner"></div>
            <div>Loading preview...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SlideStructure, SlideContent, PPTXConfig, Job } from '~/types';

// State
const jobs = ref<Job[]>([]);
const selectedJobId = ref('');
const selectedLanguage = ref('English');
const slides = ref<SlideStructure[]>([]);
const content = ref<PPTXConfig | null>(null);
const selectedSlideIndex = ref(0);

const loadingJobs = ref(false);
const loadingJob = ref(false);
const loadingSlides = ref(new Set<number>());
const isGeneratingAll = ref(false);
const pptxExists = ref(false);
const selectedModel = ref('gemini-3-flash-preview')
// Full preview modal
const showFullPreviewModal = ref(false);
const loadingFullPreview = ref(false);
const previewImages = ref<string[]>([]);
// Slide preview images (for individual slide preview)
const slidePreviewImages = ref<Record<number, string>>({});

// Computed
const generatedSlides = computed(() => {
  const generated = new Set<number>();
  // Check if slides have preview images (means they are generated)
  Object.keys(slidePreviewImages.value).forEach(key => {
    const index = parseInt(key);
    if (!isNaN(index)) {
      generated.add(index);
    }
  });
  return generated;
});

const currentSlide = computed(() => {
  return slides.value.find(s => s.slide_index === selectedSlideIndex.value) || null;
});

const currentSlideContent = computed(() => {
  if (!content.value?.slides) return null;
  return content.value.slides[String(selectedSlideIndex.value)] || null;
});

const isCurrentSlideGenerated = computed(() => {
  return generatedSlides.value.has(selectedSlideIndex.value);
});

const canDownload = computed(() => {
  return slides.value.length > 0 && generatedSlides.value.size > 0;
});

// Methods
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};

const loadJobs = async () => {
  loadingJobs.value = true;
  try {
    const response = await $fetch('/api/jobs');
    if (response.success && response.data) {
      jobs.value = response.data;
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    alert('Failed to load jobs');
  } finally {
    loadingJobs.value = false;
  }
};

const loadJob = async () => {
  if (!selectedJobId.value) return;

  loadingJob.value = true;
  try {
    // Load structure
    const job = jobs.value.find(j => j.job_id === selectedJobId.value);
    if (!job) {
      throw new Error('Job not found');
    }

    // Fetch slides from new slides table
    const slidesResponse = await $fetch(`/api/slides/${selectedJobId.value}`);
    if (slidesResponse.success && slidesResponse.data) {
      // Convert Slide[] to SlideStructure[] and populate slidePreviewImages
      slides.value = slidesResponse.data.map((slide: any) => ({
        slide_index: slide.slide_index,
        slide_title: slide.slide_title,
        slide_description: slide.slide_description || ''
      }));

      // Populate preview images from database
      const imageMap: Record<number, string> = {};
      slidesResponse.data.forEach((slide: any) => {
        if (slide.image_url) {
          imageMap[slide.slide_index] = slide.image_url;
        }
      });
      slidePreviewImages.value = imageMap;

      selectedSlideIndex.value = 0;
    }

    // Fetch content (if exists) - for backward compatibility
    const contentResponse = await $fetch(`/api/pptx/content/${selectedJobId.value}`);
    if (contentResponse.success && contentResponse.hasContent) {
      content.value = contentResponse.content;
    } else {
      content.value = null;
    }

    // Check if PPTX exists
    checkPPTXExists();
  } catch (error) {
    console.error('Error loading job:', error);
    alert('Failed to load job');
  } finally {
    loadingJob.value = false;
  }
};

const checkPPTXExists = async () => {
  try {
    const response = await $fetch(`/api/pptx/exists/${selectedJobId.value}`);
    pptxExists.value = response.exists || false;
  } catch {
    pptxExists.value = false;
  }
};

const selectSlide = (index: number) => {
  selectedSlideIndex.value = index;
};

const updateSlide = async (index: number, field: string, value: string) => {
  const slide = slides.value.find(s => s.slide_index === index);
  if (!slide) return;

  // Update local state
  (slide as any)[field] = value;

  // Update slide in database
  try {
    const updateData: any = {
      jobId: selectedJobId.value,
      slideIndex: index
    };

    if (field === 'slide_title') {
      updateData.slideTitle = value;
    } else if (field === 'slide_description') {
      updateData.slideDescription = value;
    }

    await $fetch('/api/slides/update', {
      method: 'POST',
      body: updateData
    });
  } catch (error) {
    console.error('Error updating slide:', error);
    alert('Failed to update slide');
  }
};

const regenerateSlide = async (index: number) => {
  loadingSlides.value.add(index);

  try {
    // Regenerate slide content and image
    const response = await $fetch('/api/pptx/regenerate-slide', {
      method: 'POST',
      body: {
        jobId: selectedJobId.value,
        slideIndex: index,
        language: selectedLanguage.value,
        model: selectedModel.value
      }
    });

    if (response.success) {
      // Update preview image
      if (response.imageUrl) {
        slidePreviewImages.value[index] = response.imageUrl;
      }

      // Update content for backward compatibility
      if (response.slideContent) {
        if (!content.value) {
          content.value = {
            slideConfig: {
              title: 'Generated Presentation',
              layout: {
                name: 'CUSTOM_LAYOUT',
                width: 13.33,
                height: 7.50
              }
            },
            slides: {},
            font: 'Times New Roman'
          };
        }
        content.value.slides[String(index)] = response.slideContent;
      }

      selectedSlideIndex.value = index; // Auto-select to show preview

      // Reset PPTX exists flag (needs regeneration)
      pptxExists.value = false;
    }
  } catch (error) {
    console.error('Error regenerating slide:', error);
    alert('Failed to regenerate slide');
  } finally {
    loadingSlides.value.delete(index);
  }
};

const deleteSlide = async (index: number) => {
  if (index === 0) {
    alert('Cannot delete title slide');
    return;
  }

  if (!confirm(`Delete slide ${index}?`)) return;

  // Delete slide using new API
  try {
    const response = await $fetch('/api/slides/delete', {
      method: 'POST',
      body: {
        jobId: selectedJobId.value,
        slideIndex: index
      }
    });

    if (response.success && response.data) {
      // Update local slides from server response
      slides.value = response.data.map((slide: any) => ({
        slide_index: slide.slide_index,
        slide_title: slide.slide_title,
        slide_description: slide.slide_description || ''
      }));

      // Update preview images (remove deleted slide)
      const newImageMap: Record<number, string> = {};
      response.data.forEach((slide: any) => {
        if (slide.image_url) {
          newImageMap[slide.slide_index] = slide.image_url;
        }
      });
      slidePreviewImages.value = newImageMap;

      // Update selection
      if (selectedSlideIndex.value >= slides.value.length) {
        selectedSlideIndex.value = slides.value.length - 1;
      }
    }
  } catch (error) {
    console.error('Error deleting slide:', error);
    alert('Failed to delete slide');
  }
};

const addSlide = async () => {
  const newIndex = slides.value.length;

  try {
    const response = await $fetch('/api/slides/create', {
      method: 'POST',
      body: {
        jobId: selectedJobId.value,
        slideIndex: newIndex,
        slideTitle: `New Slide ${newIndex}`,
        slideDescription: 'Slide description'
      }
    });

    if (response.success && response.data) {
      // Add to local slides
      const newSlide: SlideStructure = {
        slide_index: response.data.slide_index,
        slide_title: response.data.slide_title,
        slide_description: response.data.slide_description || ''
      };

      slides.value.push(newSlide);
    }
  } catch (error) {
    console.error('Error adding slide:', error);
    alert('Failed to add slide');
  }
};

const generateAll = async () => {
  isGeneratingAll.value = true;

  try {
    // Get all pending slides
    const pendingSlides = slides.value.filter(s => !generatedSlides.value.has(s.slide_index));

    if (pendingSlides.length === 0) {
      alert('All slides are already generated!');
      return;
    }

    console.log(`Generating ${pendingSlides.length} slides...`);

    // Process each slide independently
    const promises = pendingSlides.map(async (slide) => {
      const slideIndex = slide.slide_index;

      // Mark as loading
      loadingSlides.value.add(slideIndex);

      try {
        // Generate content and image for this slide
        const response = await $fetch('/api/pptx/regenerate-slide', {
          method: 'POST',
          body: {
            jobId: selectedJobId.value,
            slideIndex: slideIndex,
            language: selectedLanguage.value,
            selectedModel: selectedModel.value
          }
        });

        if (response.success) {
          // Update content (backward compatibility)
          if (response.slideContent) {
            if (!content.value) {
              content.value = {
                slideConfig: {
                  title: 'Generated Presentation',
                  layout: {
                    name: 'CUSTOM_LAYOUT',
                    width: 13.33,
                    height: 7.50
                  }
                },
                slides: {},
                font: 'Times New Roman'
              };
            }
            content.value.slides[String(slideIndex)] = response.slideContent;
          }

          // Update preview image immediately
          if (response.imageUrl) {
            slidePreviewImages.value[slideIndex] = response.imageUrl;
            console.log(`✓ Slide ${slideIndex} generated successfully`);
          }
        }
      } catch (error) {
        console.error(`✗ Error generating slide ${slideIndex}:`, error);
      } finally {
        // Remove loading state
        loadingSlides.value.delete(slideIndex);
      }
    });

    // Wait for all slides to complete
    await Promise.all(promises);

    console.log(`Completed generating ${pendingSlides.length} slides`);

    // Reset PPTX exists flag
    pptxExists.value = false;
  } catch (error) {
    console.error('Error in generateAll:', error);
    alert('Failed to generate all slides');
  } finally {
    isGeneratingAll.value = false;
  }
};

const downloadPPTX = async () => {
  // Check if any slides are generated
  if (generatedSlides.value.size === 0) {
    alert('Please generate at least one slide before downloading.');
    return;
  }

  try {
    // Generate PPTX (full presentation)
    const response = await $fetch('/api/pptx/generate', {
      method: 'POST',
      body: {
        jobId: selectedJobId.value
      }
    });

    if (response.success) {
      // Download file
      window.location.href = `/api/pptx/download/${selectedJobId.value}`;
      pptxExists.value = true;
    }
  } catch (error: any) {
    console.error('Error generating PPTX:', error);
    const errorMessage = error?.data?.message || error?.message || 'Failed to generate PPTX';
    alert(`Error: ${errorMessage}`);
  }
};

const previewFullPPTX = async () => {
  loadingFullPreview.value = true;

  try {
    const response = await $fetch('/api/pptx/preview-images', {
      method: 'POST',
      body: {
        jobId: selectedJobId.value
      }
    });

    if (response.success && response.images) {
      previewImages.value = response.images;
      showFullPreviewModal.value = true;
    }
  } catch (error) {
    console.error('Error previewing PPTX:', error);
    alert('Failed to preview PPTX. Please generate the PPTX first.');
  } finally {
    loadingFullPreview.value = false;
  }
};

const closeFullPreview = () => {
  showFullPreviewModal.value = false;
  previewImages.value = [];
};

// Lifecycle
onMounted(() => {
  loadJobs();
});
</script>

<style scoped>
.create-slide-split-view {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
  flex:1;
}

.view-header {
  padding: 10px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  flex-shrink: 0;
}

.view-header h2 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.header-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.job-selector,
.language-selector {
  display: flex;
  align-items: center;
  gap: 6px;
}

.job-selector label,
.language-selector label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.select-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  min-width: 200px;
}

.select-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.split-container {
  flex: 1;
  display: grid;
  grid-template-columns: 350px 1fr;
  overflow: hidden;
  min-height: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  height: 90%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.preview-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  padding-bottom: 20px;
  align-items: start;
}

.preview-slide {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.slide-number {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.slide-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background: white;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px;
  color: #666;
}
</style>