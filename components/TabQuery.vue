<template>
  <div class="space-y-4">
    <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
      <div class="space-y-4">
        <!-- Query Input -->
        <div class="flex space-x-3">
          <input 
            v-model="queryInput"
            @keyup.enter="sendQuery"
            type="text"
            placeholder="Enter your query..."
            class="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
          <button 
            @click="sendQuery"
            :disabled="!queryInput.trim() || isQuerying"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ isQuerying ? 'Querying...' : 'Query' }}
          </button>
        </div>

        <!-- Query History -->
        <div class="space-y-3 max-h-60 overflow-y-auto">
          <div v-for="(item, index) in queryHistory" :key="index" 
               class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-gray-900 dark:text-white">Query</span>
              <span class="text-xs text-gray-500">{{ formatTimestamp(item.timestamp) }}</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ item.query }}</p>
            <div class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded mb-2">
              <div class="font-medium mb-1">Knowledge Context</div>
              {{ item.knowledge }}
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <div class="font-medium mb-1">Response</div>
              {{ item.response }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from '#imports'
import { format } from 'date-fns'

interface QueryHistoryItem {
  query: string
  knowledge: string
  response: string
  timestamp: string
}

const props = defineProps<{
  queryHistory: QueryHistoryItem[]
  isQuerying: boolean
}>()

const emit = defineEmits<{
  (e: 'sendQuery', query: string): void
}>()

const queryInput = ref('')

const sendQuery = () => {
  if (!queryInput.value.trim() || props.isQuerying) return
  emit('sendQuery', queryInput.value)
  queryInput.value = ''
}

const formatTimestamp = (timestamp: string) => {
  return format(new Date(timestamp), 'MMM d, HH:mm:ss')
}
</script> 