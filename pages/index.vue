<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow animation-delay-2000"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-12 animate-fade-in">
        <div class="flex items-center space-x-4 mb-4">
          <div class="p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg shadow-primary-500/50">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
              Rikai Slide Maker
            </h1>
            <p class="text-gray-600 mt-1">Create beautiful presentations with AI</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 mb-8 p-2 animate-slide-up">
        <nav class="flex space-x-2">
          <button
            @click="activeTab = 'design'"
            :class="[
              'flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex-1 justify-center',
              activeTab === 'design'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/50 scale-105'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Design Structure</span>
          </button>
          <button
            @click="activeTab = 'create'"
            :class="[
              'flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex-1 justify-center',
              activeTab === 'create'
                ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/50 scale-105'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Create Slides</span>
          </button>
          <button
              @click="activeTab = 'information'"
              :class="[
              'flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex-1 justify-center',
              activeTab === 'information'
                ? 'bg-gradient-to-r from-other-500 to-other-600 text-white shadow-lg shadow-other-500/50 scale-105'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Job Cost Information</span>
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
        mode="out-in"
      >
        <div v-if="activeTab === 'design'" key="design">
          <DesignStructureTab />
        </div>
        <div
          v-else-if="activeTab === 'create'"
          key="create"
          style="height: calc(100vh - 280px); min-height: 600px; display: flex; flex-direction: column; overflow: hidden;"
        >
          <CreateSlideSplitView />
        </div>
        <div
            v-else
            key="information"
            style="height: calc(100vh - 280px); min-height: 600px; display: flex; flex-direction: column; overflow: hidden;"
        >
          <JobInformation />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const activeTab = ref<'design' | 'create' | 'information'>('design');
</script>