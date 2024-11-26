<template>
  <div class="space-y-4">
    <!-- Recent Activity -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Recent Activity ({{ activities.length }} events)
      </h3>
      <div class="space-y-2">
        <div v-if="isLoading" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>

        <div v-else-if="error" class="text-center py-4">
          <div class="text-red-500 dark:text-red-400">
            {{ error }}
          </div>
        </div>

        <template v-else>
          <div v-for="(activity, index) in activities" :key="index" 
               class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 text-sm"
               :title="getActivityTooltip(activity)">
            <!-- Action Icon -->
            <div class="flex-shrink-0">
              <span class="text-xl" :title="activity.action === 'upload' ? 'Upload action' : activity.action === 'delete' ? 'Delete action' : 'Search action'">
                {{ getActionEmoji(activity.action) }}
              </span>
            </div>

            <!-- Main Content -->
            <div class="flex-grow min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-900 dark:text-white truncate">
                  {{ activity.details }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {{ formatTimestamp(activity.timestamp) }}
                </span>
              </div>
              <!-- Metadata Preview -->
              <div v-if="activity.metadata" class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ formatMetadataPreview(activity.metadata) }}
              </div>
            </div>

            <!-- Action Button -->
            <div class="flex-shrink-0">
              <button 
                @click="showActivityDetails(activity)"
                class="p-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded"
                :title="'View full details of ' + activity.action + ' action from ' + formatTimestamp(activity.timestamp)"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="!activities.length" class="text-center py-4">
            <div class="text-gray-400 dark:text-gray-500 text-sm">
              No recent activity
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Activity Details Dialog -->
    <div v-if="selectedActivity" class="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50">
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Activity Details</h3>
                <button 
                  @click="closeActivityDetails"
                  class="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                  title="Close details"
                >
                  <span class="sr-only">Close</span>
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="px-6 py-4">
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Action</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ selectedActivity.action.charAt(0).toUpperCase() + selectedActivity.action.slice(1) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Details</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedActivity.details }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatTimestamp(selectedActivity.timestamp) }}</dd>
                </div>
                <div v-if="selectedActivity.metadata">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Additional Information</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                    <pre class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto">{{ formatMetadata(selectedActivity.metadata) }}</pre>
                  </dd>
                </div>
                <div v-if="selectedActivity.action === 'upload' && selectedActivity.documentContent">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Document Content</dt>
                  <dd class="mt-1">
                    <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <pre class="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">{{ selectedActivity.documentContent }}</pre>
                    </div>
                  </dd>
                </div>
                <div v-else-if="selectedActivity.action === 'upload' && !selectedActivity.documentContent" class="text-sm text-gray-500 dark:text-gray-400">
                  Loading document content...
                </div>
              </dl>
            </div>
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <button 
                @click="closeActivityDetails"
                class="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from '#imports'
import { useActivityLog } from '~/composables/useActivityLog'

// Define interface inline
interface Activity {
  action: 'upload' | 'delete' | 'search'
  details: string
  timestamp: string
  metadata?: any
  documentContent?: string
}

const {
  activities,
  selectedActivity,
  isLoading,
  error,
  fetchActivities,
  showActivityDetails,
  closeActivityDetails,
  formatTimestamp,
  getActionEmoji
} = useActivityLog()

// Format metadata for display
const formatMetadata = (metadata: any): string => {
  try {
    if (typeof metadata === 'string') {
      // Try to parse if it's a JSON string
      return JSON.stringify(JSON.parse(metadata), null, 2)
    }
    // If it's already an object
    return JSON.stringify(metadata, null, 2)
  } catch (err) {
    // If parsing fails, return as is
    return typeof metadata === 'string' ? metadata : JSON.stringify(metadata, null, 2)
  }
}

// Format metadata preview (shortened version)
const formatMetadataPreview = (metadata: any): string => {
  try {
    const metadataObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata
    const keys = Object.keys(metadataObj)
    if (keys.length === 0) return ''
    
    // Show first key-value pair and indicate if there are more
    const firstKey = keys[0]
    const firstValue = metadataObj[firstKey]
    const preview = `${firstKey}: ${JSON.stringify(firstValue)}`
    return keys.length > 1 ? `${preview} ...` : preview
  } catch (err) {
    return typeof metadata === 'string' ? metadata.slice(0, 50) : JSON.stringify(metadata).slice(0, 50)
  }
}

// Get tooltip text for activity
const getActivityTooltip = (activity: Activity): string => {
  const parts = [
    `Type: ${activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}`,
    `Time: ${formatTimestamp(activity.timestamp)}`
  ]
  
  if (activity.metadata) {
    try {
      const metadataObj = typeof activity.metadata === 'string' ? 
        JSON.parse(activity.metadata) : activity.metadata
      const metadataStr = Object.entries(metadataObj)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n')
      parts.push(`Metadata:\n${metadataStr}`)
    } catch (err) {
      parts.push(`Metadata: ${activity.metadata}`)
    }
  }
  
  return parts.join('\n')
}

onMounted(() => {
  fetchActivities()
})
</script> 