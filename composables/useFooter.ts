import { ref, computed } from '#imports'
import { useRuntimeConfig } from 'nuxt/app'

export function useFooter() {
  const config = useRuntimeConfig()
  const isExpanded = ref(false)
  const currentTab = ref('about')
  const isSending = ref(false)
  
  // Testing states
  const testStates = ref({
    llm: false,
    embedding: false,
    index: false,
    llmModel: false,
    queryModel: false,
    embeddingModel: false
  })
  
  // Test results
  const testResults = ref({
    llm: null,
    embedding: null,
    index: null
  })

  const testStatus = computed(() => {
    if (testStates.value.llm) return 'Testing LLM...'
    if (testStates.value.embedding) return 'Testing Embedding...'
    if (testStates.value.index) return 'Testing Index...'
    return 'Ready'
  })

  // API functions
  async function handleChatSubmit(message: string, settings: any) {
    isSending.value = true
    // ... chat submission logic ...
  }

  async function handleQuerySubmit(query: string, settings: any) {
    // ... query submission logic ...
  }

  return {
    isExpanded,
    currentTab,
    isSending,
    testStates,
    testResults,
    testStatus,
    handleChatSubmit,
    handleQuerySubmit
  }
} 