import { ref } from 'vue'
import { AI_MODELS } from '@/config/ai-models'

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

export function useTests() {
  const config = useRuntimeConfig()
  
  // Test states
  const testState = ref<TestState>({
    isTestingLLM: false,
    isTestingEmbedding: false,
    isTestingIndex: false,
    llmTestResult: null,
    embeddingTestResult: null,
    indexTestResult: null,
    llmTestDetails: null,
    embeddingTestDetails: null,
    indexTestDetails: null
  })

  // Test LLM functionality
  const testLLM = async () => {
    testState.value.isTestingLLM = true
    testState.value.llmTestResult = null
    testState.value.llmTestDetails = null
    
    const startTime = performance.now()
    
    try {
      const response = await $fetch<{ response: string; metrics: { memory: string } }>(`${config.public.workerUrl}/api/chat`, {
        method: 'POST',
        body: {
          message: 'Test message: Please respond with "LLM test successful"',
          settings: {
            chatModel: AI_MODELS.chat.default,
            processingPath: 'cloud'
          }
        }
      })

      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)

      if (response.response.includes('successful')) {
        testState.value.llmTestResult = 'LLM test completed successfully'
        testState.value.llmTestDetails = {
          latency,
          memory: response.metrics.memory,
          model: AI_MODELS.chat.default
        }
      } else {
        throw new Error('Unexpected response')
      }
    } catch (err) {
      console.error('LLM test error:', err)
      testState.value.llmTestResult = 'LLM test failed. Please check console for details.'
    } finally {
      testState.value.isTestingLLM = false
    }
  }

  // Test embedding functionality
  const testEmbedding = async () => {
    testState.value.isTestingEmbedding = true
    testState.value.embeddingTestResult = null
    testState.value.embeddingTestDetails = null
    
    const startTime = performance.now()
    
    try {
      const response = await $fetch<{ matches: any[]; metrics: { dimensions: number } }>(`${config.public.workerUrl}/api/query`, {
        method: 'POST',
        body: {
          query: 'Test query for embedding generation',
          settings: {
            embeddingModel: AI_MODELS.embedding.default,
            processingPath: 'cloud'
          }
        }
      })

      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)

      if (response.matches) {
        testState.value.embeddingTestResult = 'Embedding test completed successfully'
        testState.value.embeddingTestDetails = {
          latency,
          dimensions: response.metrics.dimensions,
          model: AI_MODELS.embedding.default
        }
      } else {
        throw new Error('No vector matches returned')
      }
    } catch (err) {
      console.error('Embedding test error:', err)
      testState.value.embeddingTestResult = 'Embedding test failed. Please check console for details.'
    } finally {
      testState.value.isTestingEmbedding = false
    }
  }

  // Test vector index functionality
  const testIndex = async () => {
    testState.value.isTestingIndex = true
    testState.value.indexTestResult = null
    testState.value.indexTestDetails = null
    
    try {
      const response = await $fetch<{
        totalDocuments: number
        cacheStats: { hitRate: string }
        storageSize: string
      }>(`${config.public.workerUrl}/api/stats`)

      if (typeof response.totalDocuments === 'number') {
        testState.value.indexTestResult = 'Index test completed successfully'
        testState.value.indexTestDetails = {
          totalDocuments: response.totalDocuments,
          cacheHitRate: response.cacheStats.hitRate,
          storageSize: response.storageSize
        }
      } else {
        throw new Error('Invalid stats response')
      }
    } catch (err) {
      console.error('Index test error:', err)
      testState.value.indexTestResult = 'Index test failed. Please check console for details.'
    } finally {
      testState.value.isTestingIndex = false
    }
  }

  return {
    testState,
    testLLM,
    testEmbedding,
    testIndex
  }
} 