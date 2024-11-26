import { ref, computed } from 'vue'

interface CloudflareConfig {
  accountId: string
  apiToken: string
  workerUrl: string
}

export function useCloudflareAdapter() {
  const config = ref<CloudflareConfig>({
    accountId: import.meta.env.CF_ACCOUNT_ID,
    apiToken: import.meta.env.CF_API_TOKEN,
    workerUrl: import.meta.env.CF_WORKER_URL
  })

  const isConfigured = computed(() => {
    return Boolean(config.value.accountId && config.value.apiToken && config.value.workerUrl)
  })

  const makeRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (!isConfigured.value) {
      throw new Error('Cloudflare configuration is incomplete')
    }

    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${config.value.apiToken}`)
    headers.set('Content-Type', 'application/json')

    const response = await fetch(`${config.value.workerUrl}${endpoint}`, {
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
    isConfigured,
    makeRequest
  }
} 