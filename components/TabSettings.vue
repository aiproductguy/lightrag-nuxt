<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <!-- Model Selection -->
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg group relative">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Model Selection</h3>
        <div class="space-y-3">
          <div>
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300" title="Model used for chat interactions">SLM (for Chat)</label>
              <span class="text-sm" :title="getModelStatusIcon('llm') === '✅' ? 'API key valid' : 'API key invalid or missing'">{{ getModelStatusIcon('llm') }}</span>
            </div>
            <select 
              v-model="settings.llmModel" 
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              :title="'Current model: ' + settings.llmModel + '\n' + getModelStats(settings.llmModel)"
            >
              <option v-for="option in modelOptions.llm" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ getModelStats(settings.llmModel) }}</p>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300" title="Model used for query processing">LLM (for Query)</label>
              <span class="text-sm" :title="getModelStatusIcon('query') === '✅' ? 'API key valid' : 'API key invalid or missing'">{{ getModelStatusIcon('query') }}</span>
            </div>
            <select 
              v-model="settings.queryModel" 
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              :title="'Current model: ' + settings.queryModel + '\n' + getModelStats(settings.queryModel)"
            >
              <option v-for="option in modelOptions.llm" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ getModelStats(settings.queryModel) }}</p>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300" title="Model used for generating embeddings">Embed (for Index)</label>
              <span class="text-sm" :title="getModelStatusIcon('embed') === '✅' ? 'API key valid' : 'API key invalid or missing'">{{ getModelStatusIcon('embed') }}</span>
            </div>
            <select 
              v-model="settings.embeddingModel" 
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              :title="'Current model: ' + settings.embeddingModel + '\n' + getModelStats(settings.embeddingModel)"
            >
              <option v-for="option in modelOptions.embedding" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ getModelStats(settings.embeddingModel) }}</p>
          </div>
        </div>
      </div>

      <!-- Storage Selection -->
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Storage Selection</h3>
        <div class="space-y-3">
          <button
            @click="$emit('clearCache')"
            disabled
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 opacity-50 cursor-not-allowed"
            :title="'Clear cache\n' + formattedCacheStats"
          >
            Clear Cache
          </button>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ formattedCacheStats }}</p>
        </div>
      </div>

      <!-- Theme Selection -->
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Theme</h3>
        <button
          @click="$emit('toggleDarkMode')"
          class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          {{ isDark ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </div>

      <!-- System Prompt -->
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">System Prompt</h3>
        <div class="space-y-2">
          <textarea
            v-model="settings.systemPrompt"
            rows="3"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Enter system prompt for the AI assistant"
          ></textarea>
          <p class="text-xs text-gray-500 dark:text-gray-400">This prompt guides the AI assistant's behavior and responses.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Settings {
  llmModel: string
  queryModel: string
  embeddingModel: string
  processingPath: string
  systemPrompt: string
}

interface ModelOptions {
  llm: Array<{ value: string; label: string }>
  embedding: Array<{ value: string; label: string }>
}

defineProps<{
  settings: Settings
  modelOptions: ModelOptions
  isDark: boolean
  formattedCacheStats: string
  getModelStatusIcon: (type: 'llm' | 'query' | 'embed') => string
  getModelStats: (modelId: string) => string
}>()

defineEmits<{
  (e: 'clearCache'): void
  (e: 'toggleDarkMode'): void
}>()
</script> 