import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { AI_MODELS } from '@/config/ai-models'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  model?: string
  latency?: number
}

export interface ChatState {
  messages: ChatMessage[]
  pending: boolean
  error: string | null
  selectedModel: string
}

export function useChat() {
  const config = useRuntimeConfig()
  
  // State
  const chatState = ref<ChatState>({
    messages: [],
    pending: false,
    error: null,
    selectedModel: AI_MODELS.chat.default
  })

  const inputMessage = ref('')

  // Methods
  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    const startTime = performance.now()

    // Add user message
    chatState.value.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    })

    // Clear input and set pending
    inputMessage.value = ''
    chatState.value.pending = true
    chatState.value.error = null

    try {
      const response = await $fetch<{ response: string, model: string }>(`${config.public.workerUrl}/api/chat`, {
        method: 'POST',
        body: {
          message,
          settings: {
            embeddingModel: AI_MODELS.embedding.default,
            chatModel: chatState.value.selectedModel,
            processingPath: 'cloud'
          }
        }
      })

      const endTime = performance.now()
      const latency = (endTime - startTime) / 1000 // Convert to seconds

      // Add assistant response
      chatState.value.messages.push({
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        model: response.model,
        latency
      })
    } catch (err) {
      console.error('Chat error:', err)
      chatState.value.error = 'Failed to send message'
    } finally {
      chatState.value.pending = false
    }
  }

  const clearChat = () => {
    chatState.value.messages = []
    chatState.value.error = null
  }

  const setModel = (modelId: string) => {
    chatState.value.selectedModel = modelId
  }

  // Computed
  const canSendMessage = computed(() => {
    return !chatState.value.pending && inputMessage.value.trim().length > 0
  })

  const availableModels = computed(() => {
    return Object.entries(AI_MODELS.chat.options).map(([key, model]) => ({
      id: model.id,
      name: model.name,
      description: model.description
    }))
  })

  return {
    // State
    chatState,
    inputMessage,
    
    // Methods
    sendMessage,
    clearChat,
    setModel,
    
    // Computed
    canSendMessage,
    availableModels
  }
} 