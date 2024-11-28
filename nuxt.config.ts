// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode'
  ],

  css: ['~/assets/css/main.css'],

  // @ts-ignore - Known module configuration
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    dataValue: 'theme',
    storageKey: 'nuxt-color-mode'
  },

  typescript: {
    strict: false,
    typeCheck: false
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
    preset: 'cloudflare-pages',
    routeRules: {
      '/api/**': {
        proxy: process.env.NUXT_PUBLIC_CF_WORKER_URL || 'https://kv-vector-store.aiproductguy.workers.dev'
      }
    },
    compatibilityDate: '2024-11-25'
  },

  runtimeConfig: {
    cfApiToken: process.env.NUXT_CF_API_TOKEN || '',
    public: {
      cfAccountId: process.env.NUXT_PUBLIC_CF_ACCOUNT_ID || '',
      cfWorkerUrl: process.env.NUXT_PUBLIC_CF_WORKER_URL || 'https://kv-vector-store.aiproductguy.workers.dev'
    }
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
      'postcss-nested': {},
    },
  },
})