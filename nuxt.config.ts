// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode'
  ],

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    dataValue: 'theme',
    storageKey: 'nuxt-color-mode'
  },

  typescript: {
    strict: true,
    typeCheck: true
  },

  app: {
    head: {
      title: 'LightRAG',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'LightRAG - Lightweight RAG Implementation' }
      ]
    }
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'https://kv-vector-store.aiproductguy.workers.dev',
        changeOrigin: true
      }
    }
  },

  runtimeConfig: {
    public: {
      workerUrl: process.env.WORKER_URL || 'https://kv-vector-store.aiproductguy.workers.dev'
    }
  },

  compatibilityDate: '2024-11-25'
})