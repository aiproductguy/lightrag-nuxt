import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#app'

interface CloudflareConfig {
  accountId: string
  apiToken: string
  workerUrl: string
}

export function useCloudflareAdapter() {
  const config = useRuntimeConfig()
  
  const cloudflareConfig = ref<CloudflareConfig>({
    accountId: config.public.cfAccountId as string,
    apiToken: config.cfApiToken as string,
    workerUrl: config.public.cfWorkerUrl as string
  })

  const isConfigured = computed(() => {
    return Boolean(cloudflareConfig.value.accountId && cloudflareConfig.value.apiToken && cloudflareConfig.value.workerUrl)
  })

  const makeRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (!isConfigured.value) {
      throw new Error('Cloudflare configuration is incomplete')
    }

    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${cloudflareConfig.value.apiToken}`)
    headers.set('Content-Type', 'application/json')

    const response = await fetch(`${cloudflareConfig.value.workerUrl}${endpoint}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.statusText}`)
    }

    return response.json()
  }

  return {
    config,
    cloudflareConfig,
    isConfigured,
    makeRequest
  }
} 