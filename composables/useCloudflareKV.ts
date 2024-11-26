import { ref } from 'vue'
import { useCloudflareAdapter } from './useCloudflareAdapter'

export function useCloudflareKV(namespace: string) {
  const { makeRequest } = useCloudflareAdapter()
  const error = ref<Error | null>(null)

  const get = async <T>(key: string): Promise<T | null> => {
    try {
      return await makeRequest<T>(`/kv/${namespace}/${key}`, {
        method: 'GET'
      })
    } catch (e) {
      error.value = e as Error
      return null
    }
  }

  const put = async <T>(key: string, value: T): Promise<boolean> => {
    try {
      await makeRequest(`/kv/${namespace}/${key}`, {
        method: 'PUT',
        body: JSON.stringify(value)
      })
      return true
    } catch (e) {
      error.value = e as Error
      return false
    }
  }

  const remove = async (key: string): Promise<boolean> => {
    try {
      await makeRequest(`/kv/${namespace}/${key}`, {
        method: 'DELETE'
      })
      return true
    } catch (e) {
      error.value = e as Error
      return false
    }
  }

  const list = async (prefix?: string): Promise<string[]> => {
    try {
      const params = prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''
      return await makeRequest<string[]>(`/kv/${namespace}/list${params}`, {
        method: 'GET'
      })
    } catch (e) {
      error.value = e as Error
      return []
    }
  }

  return {
    error,
    get,
    put,
    remove,
    list
  }
} 