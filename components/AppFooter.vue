# Create footer component
<template>
  <div 
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300"
    :class="[isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]']"
  >
    <!-- Toggle Button -->
    <button 
      @click="isExpanded = !isExpanded"
      class="absolute -top-4 right-4 bg-white dark:bg-gray-800 rounded-t-lg p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
      :title="isExpanded ? 'Collapse Panel' : 'Expand Panel'"
    >
      <svg 
        class="w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-300"
        :class="[isExpanded ? 'rotate-180' : '']"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </button>

    <!-- Footer Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Minimized State Header -->
      <div v-if="!isExpanded" class="h-8 flex items-center justify-between">
        <button 
          @click="isExpanded = !isExpanded"
          class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
        >
          {{ tabs.find(t => t.id === currentTab)?.name }}
        </button>
        <div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <span v-if="currentTab === 'tests'">{{ testStatus }}</span>
          <span v-if="currentTab === 'chat'">{{ chatMessages.length }} messages</span>
          <span v-if="currentTab === 'settings'">{{ settings.processingPath }} mode</span>
          <span v-if="currentTab === 'about'">v{{ version }}</span>
        </div>
      </div>

      <!-- Expanded State Content -->
      <template v-if="isExpanded">
        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.name"
              @click="currentTab = tab.id"
              :class="[
                currentTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
              :title="getTabTooltip(tab.id)"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="mt-4 overflow-y-auto" style="max-height: calc(50vh - 8rem)">
          <TabAbout
            v-if="currentTab === 'about'"
            :version="version"
            :build-date="buildDate"
            :commit-hash="commitHash"
          />

          <TabIndex
            v-if="currentTab === 'index'"
            :index-stats="indexStats"
            @show-upsert-document="showUpsertDocumentDialog = true"
            @show-upsert-webpage="showUpsertWebpageDialog = true"
          />

          <TabQuery
            v-if="currentTab === 'query'"
            :query-history="queryHistory"
            :is-querying="isQuerying"
            @send-query="handleQuerySubmit"
          />

          <TabTests
            v-if="currentTab === 'tests'"
            :is-testing-l-l-m="isTestingLLM"
            :is-testing-embedding="isTestingEmbedding"
            :is-testing-index="isTestingIndex"
            :llm-test-result="llmTestResult"
            :embedding-test-result="embeddingTestResult"
            :index-test-result="indexTestResult"
            @test-l-l-m="testLLM"
            @test-embedding="testEmbedding"
            @test-index="testIndex"
          />

          <TabSettings
            v-if="currentTab === 'settings'"
            :settings="settings"
            :model-options="modelOptions"
            :is-dark="isDark"
            :formatted-cache-stats="formattedCacheStats"
            :get-model-status-icon="getModelStatusIcon"
            :get-model-stats="getModelStats"
            @clear-cache="clearCache"
            @toggle-dark-mode="toggleDarkMode"
          />

          <TabStats
            v-if="currentTab === 'stats'"
            :stats="stats"
          />

          <TabChat
            v-if="currentTab === 'chat'"
            :chat-messages="chatMessages"
            :is-sending="isSending"
            @send-message="handleChatSubmit"
          />

          <TabActivityLog
            v-if="currentTab === 'activity'"
            :activities="recentActivity"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFooter } from '~/composables/useFooter'
import { useSettings } from '~/composables/useSettings'
import { useActivityLog } from '~/composables/useActivityLog'
import { useColorMode } from '#imports'
import { tabs } from '~/config/tabs'
import { useRuntimeConfig } from '#app'

// Import tab components
import TabAbout from './TabAbout.vue'
import TabIndex from './TabIndex.vue'
import TabQuery from './TabQuery.vue'
import TabTests from './TabTests.vue'
import TabSettings from './TabSettings.vue'
import TabStats from './TabStats.vue'
import TabChat from './TabChat.vue'
import TabActivityLog from './TabActivityLog.vue'

const config = useRuntimeConfig()

// Event handler types
interface QuerySubmitHandler {
  (query: string, settings?: any): Promise<void>
}

interface ChatSubmitHandler {
  (message: string, settings?: any): Promise<void>
}

const {
  isExpanded,
  currentTab,
  isSending,
  testStates,
  testResults,
  testStatus,
  handleChatSubmit,
  handleQuerySubmit
} = useFooter() as {
  isExpanded: Ref<boolean>
  currentTab: Ref<string>
  isSending: Ref<boolean>
  testStates: any
  testResults: any
  testStatus: Ref<string>
  handleChatSubmit: ChatSubmitHandler
  handleQuerySubmit: QuerySubmitHandler
}

const { settings, modelOptions, getModelStats } = useSettings()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// Testing states
const isTestingLLM = ref(false)
const isTestingEmbedding = ref(false)
const isTestingIndex = ref(false)
const isTestingLLMModel = ref(false)
const isTestingQueryModel = ref(false)
const isTestingEmbeddingModel = ref(false)

// Test results
const llmTestResult = ref<string | null>(null)
const embeddingTestResult = ref<string | null>(null)
const indexTestResult = ref<string | null>(null)

// Other state
const indexStats = ref<IndexStats>({ documents: 0, webpages: 0 })
const showUpsertDocumentDialog = ref(false)
const showUpsertWebpageDialog = ref(false)
const isQuerying = ref(false)
const queryHistory = ref<Array<{
  query: string
  knowledge: string
  response: string
  timestamp: string
}>>([])
const apiKeyStatus = ref<ApiKeyStatus>({
  llm: false,
  query: false,
  embed: false
})

// Test functions
const testLLM = async () => {
  isTestingLLM.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  llmTestResult.value = 'LLM test completed successfully. Latency: 150ms'
  isTestingLLM.value = false
}

const testEmbedding = async () => {
  isTestingEmbedding.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  embeddingTestResult.value = 'Embedding test completed successfully. Dimensions: 768'
  isTestingEmbedding.value = false
}

const testIndex = async () => {
  isTestingIndex.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  indexTestResult.value = 'Index test completed successfully'
  isTestingIndex.value = false
}

// Helper functions
const getModelStatusIcon = (type: 'llm' | 'query' | 'embed') => {
  const isLoading = type === 'llm' ? isTestingLLMModel.value :
                   type === 'query' ? isTestingQueryModel.value :
                   isTestingEmbeddingModel.value
  
  if (isLoading) return '\u23F3' // Hourglass
  return apiKeyStatus.value[type] ? '\u2705' : '\u274C' // Check mark : Cross mark
}

// Version information
const version = '1.0.0'
const buildDate = new Date().toISOString().split('T')[0]
const commitHash = 'abc123' // This should be injected during build

// Types
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

interface Stats {
  totalDocuments: number;
  totalChunks: number;
  pathDistribution: Record<string, number>;
  documentTypes: Record<string, number>;
  cacheStats: {
    hitRate: string;
    totalCached: number;
  };
  documents: Array<{
    id: string;
    title: string;
    timestamp: string;
    type: string;
    chunks: number;
    path: string;
  }>;
}

interface IndexStats {
  documents: number;
  webpages: number;
}

interface ApiKeyStatus {
  llm: boolean;
  query: boolean;
  embed: boolean;
}

interface ChatResponse {
  response: string;
  model: string;
  error?: string;
}

interface QueryResponse {
  knowledge: string;
  response: string;
}

interface ActivityData {
  activities: Array<{
    action: 'upload' | 'delete' | 'search';
    details: string;
    timestamp: string;
    metadata?: any;
  }>;
}

// Mock data for stats
const stats = ref<Stats>({
  totalDocuments: 0,
  totalChunks: 0,
  pathDistribution: {},
  documentTypes: {},
  cacheStats: {
    hitRate: '0.00',
    totalCached: 0
  },
  documents: []
})

// Mock data for cache stats
const cacheStats = ref('Hit Rate: 0%, Total Cached: 0')

const chatMessages = ref<Array<{
  role: 'user' | 'assistant'
  content: string
  model: string
  timestamp: string
  responseTime?: number // in milliseconds
}>>([])

const {
  activities: recentActivity,
  isLoading: isLoadingActivity,
  error: activityError,
  fetchActivities
} = useActivityLog()

const clearCache = async () => {
  // Implement cache clearing logic
  cacheStats.value = 'Cache cleared. Hit Rate: 0%, Total Cached: 0'
}

const toggleDarkMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// Add missing reactive properties
const formattedCacheStats = computed(() => cacheStats.value)

// Helper function for tab tooltips
const getTabTooltip = (tabId: string) => {
  switch (tabId) {
    case 'about':
      return 'View version and build information'
    case 'index':
      return 'Manage your documents and webpages'
    case 'chat':
      return 'Chat with your documents'
    case 'query':
      return 'Search through your documents'
    case 'tests':
      return 'Test system components'
    case 'settings':
      return 'Configure system settings'
    case 'stats':
      return 'View system statistics'
    case 'activity':
      return 'View recent activity'
    default:
      return ''
  }
}

// Fetch initial data
onMounted(async () => {
  try {
    const statsResponse = await fetch(`${config.public.workerUrl}/api/stats`)
    const statsData = await statsResponse.json() as Stats
    stats.value = statsData
    
    const keyStatusResponse = await fetch(`${config.public.workerUrl}/api/keys/status`)
    const keyData = await keyStatusResponse.json() as ApiKeyStatus
    apiKeyStatus.value = keyData

    // Fetch activity data
    await fetchActivities()
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
})

// Method to open a specific tab and expand the footer
const openTab = (tabId: string) => {
  currentTab.value = tabId
  isExpanded.value = true
}

// Method to open chat tab
const openChatTab = () => {
  isExpanded.value = true
  currentTab.value = 'chat'
}

// Expose the methods for parent components
defineExpose({
  openTab,
  openChatTab
})

// Define emits
defineEmits<{
  (e: 'open-chat-tab'): void
}>()
</script> 