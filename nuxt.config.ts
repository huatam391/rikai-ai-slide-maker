// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss'
  ],

  runtimeConfig: {
    googleApiKey:  '',
    modelId:  'gemini-3-flash-preview',
    dbPath:  'jobs.db',
    public: {
      apiBase: '/api'
    }
  },

  nitro: {
    experimental: {
      openAPI: true
    }
  }
})