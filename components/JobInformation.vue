<template>
  <div class="job-info-container">
    <!-- Header -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-title-group">
          <div class="icon-wrapper">
            <svg class="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h1>Job Information</h1>
            <p class="subtitle">Manage and track your job details</p>
          </div>
        </div>

        <div class="job-selector-group">
          <label for="job-select" class="selector-label">Select Job</label>
          <div class="select-wrapper">
            <svg class="select-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
            <select
                id="job-select"
                v-model="selectedJobId"
                @change="loadJob"
                class="job-select"
            >
              <option value="">-- Choose a job --</option>
              <option v-for="job in jobs" :key="job.job_id" :value="job.job_id">
                {{ job.job_id }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loadingJobs" class="loading-state">
      <div class="spinner"></div>
      <p>Loading jobs...</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="selectedJobId" class="main-content">
      <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-4"
      >
        <div v-if="costSummary" class="cost-card">
          <div class="cost-header">
            <div class="cost-title-group">
              <svg class="cost-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h2>Cost Summary</h2>
            </div>
          </div>

          <div class="cost-details">
            <div class="cost-item">
              <div class="cost-label-group">
                <span class="cost-label">Structure Generation</span>
                <span class="cost-model">{{ costSummary.structureModel || 'N/A' }}</span>
              </div>
              <span class="cost-amount">{{ Math.round(costSummary.structureCost * 26000) }} VND</span>
            </div>

            <div class="cost-item">
              <div class="cost-label-group">
                <span class="cost-label">Slides Generation</span>
                <span class="cost-badge">{{ costSummary.slides.length }} slides</span>
              </div>
              <span class="cost-amount">{{ Math.round(costSummary.slidesCost * 26000) }} VND</span>
            </div>

            <div class="cost-divider"></div>

            <div class="cost-total">
              <span class="total-label">Total Cost</span>
              <span class="total-amount">{{ Math.round(costSummary.totalCost * 26000) }} VND</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m7-4a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h2>No Job Selected</h2>
      <p>Choose a job from the dropdown above to view cost details</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface Job {
  job_id: string;
}

interface CostSummary {
  structureCost: number;
  slidesCost: number;
  totalCost: number;
  structureModel?: string;
  structureInputTokens: number;
  structureOutputTokens: number;
  slides: Array<{
    slideIndex: number;
    model?: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }>;
}

const jobs = ref<Job[]>([]);
const selectedJobId = ref('');
const loadingJobs = ref(false);
const costSummary = ref<CostSummary | null>(null);

const loadJobs = async () => {
  loadingJobs.value = true;
  try {
    const response = await fetch('/api/jobs').then(r => r.json());
    if (response.success && response.data) {
      jobs.value = response.data;
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
  } finally {
    loadingJobs.value = false;
  }
};

async function loadJobCost(jobId: string) {
  try {
    const response = await fetch(`/api/jobs/${jobId}/cost`).then(r => r.json());
    if (response.success) {
      costSummary.value = response.data;
    }
  } catch (err) {
    console.error('Failed to load job cost:', err);
    costSummary.value = null;
  }
}

const loadJob = () => {
  if (selectedJobId.value) {
    loadJobCost(selectedJobId.value);
  }
};

watch(selectedJobId, async (newJobId) => {
  if (newJobId) {
    await loadJobCost(newJobId);
  } else {
    costSummary.value = null;
  }
});

onMounted(() => {
  loadJobs();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.job-info-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
}

/* Header */
.header-section {
  background: white;
  padding: 32px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.header-icon {
  width: 32px;
  height: 32px;
  color: white;
  stroke-width: 2;
}

.header-title-group h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.job-selector-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 280px;
}

.selector-label {
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon {
  position: absolute;
  right: 12px;
  width: 20px;
  height: 20px;
  color: #667eea;
  pointer-events: none;
}

.job-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: white;
  color: #1a202c;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
}

.job-select:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.job-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

/* Loading State */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #718096;
  font-weight: 500;
  padding: 60px 24px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(102, 126, 234, 0.1);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Main Content */
.main-content {
  padding: 32px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  justify-content: center;
}

.cost-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: visible;
  border: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 600px;
}

.cost-header {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cost-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cost-icon {
  width: 28px;
  height: 28px;
  stroke-width: 2;
}

.cost-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.cost-details {
  padding: 24px;
  background: white;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #edf2f7;
}

.cost-item:last-of-type {
  border-bottom: none;
}

.cost-label-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cost-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.cost-model,
.cost-badge {
  font-size: 12px;
  padding: 4px 10px;
  background: #edf2f7;
  color: #667eea;
  border-radius: 6px;
  font-weight: 600;
}

.cost-amount {
  font-size: 16px;
  font-weight: 700;
  color: #667eea;
  font-family: 'Courier New', monospace;
}

.cost-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin: 8px 0;
}

.cost-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0 0 0;
  margin-top: 8px;
}

.total-label {
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
}

.total-amount {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Courier New', monospace;
}

/* Slides Breakdown */
.slides-breakdown {
  padding: 24px;
  background: #f7fafc;
  border-top: 1px solid #edf2f7;
}

.slides-breakdown h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 700;
  color: #2d3748;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.slide-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.slide-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.slide-number {
  font-size: 12px;
  font-weight: 700;
  color: #667eea;
}

.slide-cost {
  font-size: 13px;
  font-weight: 700;
  color: #2d3748;
  font-family: 'Courier New', monospace;
}

.slide-tokens {
  display: flex;
  gap: 6px;
}

.token-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.token-badge.input {
  background: #e6fffa;
  color: #234e52;
}

.token-badge.output {
  background: #fef3c7;
  color: #78350f;
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #718096;
  padding: 60px 24px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon svg {
  width: 48px;
  height: 48px;
  color: #667eea;
  stroke-width: 1.5;
}

.empty-state h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #718096;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .job-selector-group {
    width: 100%;
    min-width: auto;
  }

  .header-title-group h1 {
    font-size: 24px;
  }

  .main-content {
    padding: 16px 12px;
  }

  .slides-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>