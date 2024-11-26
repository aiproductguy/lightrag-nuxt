import { ref } from 'vue'
import { useCloudflareAdapter } from './useCloudflareAdapter'

interface VectorData {
  vector: number[]
  metadata?: Record<string, any>
}

interface SearchResult {
  key: string
  score: number
  metadata?: Record<string, any>
}

export function useCloudflareVKV(namespace: string) {
  const { makeRequest } = useCloudflareAdapter()
  const error = ref<Error | null>(null)

  const store = async (key: string, vector: number[], metadata?: Record<string, any>): Promise<boolean> => {
    try {
      await makeRequest(`/vkv/${namespace}/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ vector, metadata })
      })
      return true
    } catch (e) {
      error.value = e as Error
      return false
    }
  }

  const get = async (key: string): Promise<VectorData | null> => {
    try {
      return await makeRequest<VectorData>(`/vkv/${namespace}/${key}`, {
        method: 'GET'
      })
    } catch (e) {
      error.value = e as Error
      return null
    }
  }

  const remove = async (key: string): Promise<boolean> => {
    try {
      await makeRequest(`/vkv/${namespace}/${key}`, {
        method: 'DELETE'
      })
      return true
    } catch (e) {
      error.value = e as Error
      return false
    }
  }

  const search = async (
    vector: number[],
    limit: number = 10,
    threshold: number = 0.0
  ): Promise<SearchResult[]> => {
    try {
      return await makeRequest<SearchResult[]>(`/vkv/${namespace}/search`, {
        method: 'POST',
        body: JSON.stringify({ vector, limit, threshold })
      })
    } catch (e) {
      error.value = e as Error
      return []
    }
  }

  return {
    error,
    store,
    get,
    remove,
    search
  }
} 