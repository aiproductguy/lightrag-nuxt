import { ref } from 'vue'

export interface Settings {
  embeddingModel: string
  llmModel: string
  queryModel: string
  processingPath: 'cloud' | 'local'
  cacheDuration: number
  systemPrompt: string
}

export const defaultSettings: Settings = {
  embeddingModel: '@cf/baai/bge-base-en-v1.5',
  llmModel: '@cf/meta/llama-3-7b-chat-int8',
  queryModel: '@cf/meta/llama-3-7b-chat-int8',
  processingPath: 'cloud',
  cacheDuration: 1,
  systemPrompt: 'You are a helpful AI assistant. Answer questions accurately and concisely.'
}

export const modelOptions = {
  llm: [
    { value: '@cf/meta/llama-3-7b-chat-int8', label: 'Llama 3 7B Chat' },
    { value: '@cf/meta/llama-3-7b-chat-fp16', label: 'Llama 3 7B Chat FP16' },
    { value: '@cf/mistral/mistral-7b-instruct-v0.1', label: 'Mistral 7B Instruct' }
  ],
  embedding: [
    { value: '@cf/baai/bge-base-en-v1.5', label: 'BGE Base v1.5' },
    { value: '@cf/baai/bge-small-en-v1.5', label: 'BGE Small v1.5' },
    { value: '@cf/baai/bge-large-en-v1.5', label: 'BGE Large v1.5' }
  ]
}

export const tabs = [
  { id: 'settings', name: 'Settings' },
  { id: 'chat', name: 'Chat' },
  { id: 'test', name: 'Test' }
]

export type ModelStats = {
  [key: string]: string
}

const modelStats: ModelStats = {
  '@cf/meta/llama-3-7b-chat-int8': 'Avg. latency: 150ms, Memory: 7GB',
  '@cf/meta/llama-3-7b-chat-fp16': 'Avg. latency: 200ms, Memory: 14GB',
  '@cf/mistral/mistral-7b-instruct-v0.1': 'Avg. latency: 180ms, Memory: 7GB',
  '@cf/baai/bge-base-en-v1.5': 'Avg. latency: 50ms, Dimensions: 768',
  '@cf/baai/bge-small-en-v1.5': 'Avg. latency: 30ms, Dimensions: 384',
  '@cf/baai/bge-large-en-v1.5': 'Avg. latency: 80ms, Dimensions: 1024'
}

export function useSettings() {
  const settings = ref<Settings>(defaultSettings)
  
  const resetSettings = () => {
    settings.value = { ...defaultSettings }
  }

  const getModelStats = (modelId: string): string => {
    return modelStats[modelId] || 'Stats not available'
  }

  return {
    settings,
    resetSettings,
    modelOptions,
    tabs,
    getModelStats
  }
} 