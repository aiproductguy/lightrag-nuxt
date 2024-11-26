<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <!-- Test LLM -->
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Test LLM</h3>
        <div class="space-y-3">
          <button 
            @click="testLLM" 
            :disabled="testState.isTestingLLM"
            :title="testState.isTestingLLM ? 'Test in progress...' : 'Test Large Language Model connection and response'"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <template v-if="testState.isTestingLLM">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Testing...
            </template>
            <span v-else>Run Test</span>
          </button>
          <div v-if="testState.llmTestResult" class="bg-white dark:bg-gray-800 rounded-md p-3 text-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900 dark:text-white">Status</span>
              <span :class="testState.llmTestResult.includes('successful') ? 'text-green-500' : 'text-red-500'">
                {{ testState.llmTestResult.includes('successful') ? '✓ Passed' : '✗ Failed' }}
              </span>
            </div>
            <div class="space-y-1 text-gray-600 dark:text-gray-400">
              <p>{{ testState.llmTestResult }}</p>
              <div v-if="testState.llmTestDetails" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p><span class="font-medium">Latency:</span> {{ testState.llmTestDetails.latency }}ms</p>
                <p><span class="font-medium">Memory:</span> {{ testState.llmTestDetails.memory }}</p>
                <p><span class="font-medium">Model:</span> {{ testState.llmTestDetails.model }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Embedding -->
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Test Embedding</h3>
        <div class="space-y-3">
          <button 
            @click="testEmbedding" 
            :disabled="testState.isTestingEmbedding"
            :title="testState.isTestingEmbedding ? 'Test in progress...' : 'Test embedding model connection and vector generation'"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <template v-if="testState.isTestingEmbedding">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Testing...
            </template>
            <span v-else>Run Test</span>
          </button>
          <div v-if="testState.embeddingTestResult" class="bg-white dark:bg-gray-800 rounded-md p-3 text-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900 dark:text-white">Status</span>
              <span :class="testState.embeddingTestResult.includes('successful') ? 'text-green-500' : 'text-red-500'">
                {{ testState.embeddingTestResult.includes('successful') ? '✓ Passed' : '✗ Failed' }}
              </span>
            </div>
            <div class="space-y-1 text-gray-600 dark:text-gray-400">
              <p>{{ testState.embeddingTestResult }}</p>
              <div v-if="testState.embeddingTestDetails" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p><span class="font-medium">Latency:</span> {{ testState.embeddingTestDetails.latency }}ms</p>
                <p><span class="font-medium">Dimensions:</span> {{ testState.embeddingTestDetails.dimensions }}</p>
                <p><span class="font-medium">Model:</span> {{ testState.embeddingTestDetails.model }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Index -->
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Test Index</h3>
        <div class="space-y-3">
          <button 
            @click="testIndex" 
            :disabled="testState.isTestingIndex"
            :title="testState.isTestingIndex ? 'Test in progress...' : 'Test vector store connection and search functionality'"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <template v-if="testState.isTestingIndex">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Testing...
            </template>
            <span v-else>Run Test</span>
          </button>
          <div v-if="testState.indexTestResult" class="bg-white dark:bg-gray-800 rounded-md p-3 text-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900 dark:text-white">Status</span>
              <span :class="testState.indexTestResult.includes('successful') ? 'text-green-500' : 'text-red-500'">
                {{ testState.indexTestResult.includes('successful') ? '✓ Passed' : '✗ Failed' }}
              </span>
            </div>
            <div class="space-y-1 text-gray-600 dark:text-gray-400">
              <p>{{ testState.indexTestResult }}</p>
              <div v-if="testState.indexTestDetails" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p><span class="font-medium">Total Documents:</span> {{ testState.indexTestDetails.totalDocuments }}</p>
                <p><span class="font-medium">Cache Hit Rate:</span> {{ testState.indexTestDetails.cacheHitRate }}%</p>
                <p><span class="font-medium">Storage Size:</span> {{ testState.indexTestDetails.storageSize }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTests } from '@/composables/useTests'

interface TestDetails {
  latency?: number
  memory?: string
  model?: string
  dimensions?: number
  totalDocuments?: number
  cacheHitRate?: string
  storageSize?: string
}

interface TestState {
  isTestingLLM: boolean
  isTestingEmbedding: boolean
  isTestingIndex: boolean
  llmTestResult: string | null
  embeddingTestResult: string | null
  indexTestResult: string | null
  llmTestDetails: TestDetails | null
  embeddingTestDetails: TestDetails | null
  indexTestDetails: TestDetails | null
}

const { testState, testLLM, testEmbedding, testIndex } = useTests()
</script> 