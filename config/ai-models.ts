export interface AIModel {
  id: string
  name: string
  description: string
  type: 'chat' | 'embedding'
  features?: string[]
}

export interface AIModelGroup {
  default: string
  options: Record<string, AIModel>
}

export interface AIModels {
  chat: AIModelGroup
  embedding: AIModelGroup
}

export const AI_MODELS: AIModels = {
  chat: {
    default: '@cf/meta/llama-3.1-8b-instruct',
    options: {
      'llama-3.1-8b': {
        id: '@cf/meta/llama-3.1-8b-instruct',
        name: 'Llama 3.1 8B',
        description: 'Fast and efficient model for most use cases',
        type: 'chat'
      },
      'llama-3.1-8b-awq': {
        id: '@cf/meta/llama-3.1-8b-instruct-awq',
        name: 'Llama 3.1 8B AWQ',
        description: 'Quantized version for faster inference',
        type: 'chat'
      },
      'llama-3.1-8b-fast': {
        id: '@cf/meta/llama-3.1-8b-instruct-fast',
        name: 'Llama 3.1 8B Fast',
        description: 'Optimized for speed',
        type: 'chat',
        features: ['fast']
      },
      'llama-3.1-70b': {
        id: '@cf/meta/llama-3.1-70b-instruct',
        name: 'Llama 3.1 70B',
        description: 'Most powerful model for complex tasks',
        type: 'chat',
        features: ['high-quality']
      },
      'mistral-7b-v0.2': {
        id: '@cf/mistral/mistral-7b-instruct-v0.2',
        name: 'Mistral 7B v0.2',
        description: 'Alternative high-quality model',
        type: 'chat'
      },
      'mistral-7b-v0.2-lora': {
        id: '@cf/mistral/mistral-7b-instruct-v0.2-lora',
        name: 'Mistral 7B v0.2 (LoRA)',
        description: 'Supports fine-tuning with LoRA',
        type: 'chat',
        features: ['lora']
      },
      'gemma-7b': {
        id: '@cf/google/gemma-7b-it',
        name: 'Gemma 7B',
        description: 'Google\'s efficient and capable model',
        type: 'chat'
      },
      'gemma-7b-lora': {
        id: '@cf/google/gemma-7b-it-lora',
        name: 'Gemma 7B (LoRA)',
        description: 'Supports fine-tuning with LoRA',
        type: 'chat',
        features: ['lora']
      }
    }
  },
  embedding: {
    default: '@cf/baai/bge-base-en-v1.5',
    options: {
      'bge-small': {
        id: '@cf/baai/bge-small-en-v1.5',
        name: 'BGE Small',
        description: 'Fast and efficient embeddings',
        type: 'embedding'
      },
      'bge-base': {
        id: '@cf/baai/bge-base-en-v1.5',
        name: 'BGE Base',
        description: 'Balanced performance and quality',
        type: 'embedding'
      },
      'bge-large': {
        id: '@cf/baai/bge-large-en-v1.5',
        name: 'BGE Large',
        description: 'Highest quality embeddings',
        type: 'embedding',
        features: ['high-quality']
      }
    }
  }
}
