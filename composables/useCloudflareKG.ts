import { ref } from 'vue'
import { useCloudflareAdapter } from './useCloudflareAdapter'

interface Node {
  id: string
  type: string
  properties: Record<string, any>
}

interface Edge {
  source: string
  target: string
  type: string
  properties?: Record<string, any>
}

interface GraphQuery {
  startNode?: string
  edgeType?: string
  nodeType?: string
  limit?: number
  depth?: number
}

export function useCloudflareKG(namespace: string) {
  const { makeRequest } = useCloudflareAdapter()
  const error = ref<Error | null>(null)

  const addNode = async (node: Node): Promise<boolean> => {
    try {
      await makeRequest(`/kg/${namespace}/nodes`, {
        method: 'POST',
        body: JSON.stringify(node)
      })
      return true
    } catch (e) {
      error.value = e as Error
      return false
    }
  }

  const addEdge = async (edge: Edge): Promise<boolean> => {
    try {
      await makeRequest(`/kg/${namespace}/edges`, {
        method: 'POST',
        body: JSON.stringify(edge)
      })
      return true
    } catch (e) {
      error.value = e as Error
      return false
    }
  }

  const getNode = async (id: string): Promise<Node | null> => {
    try {
      return await makeRequest<Node>(`/kg/${namespace}/nodes/${id}`, {
        method: 'GET'
      })
    } catch (e) {
      error.value = e as Error
      return null
    }
  }

  const query = async (params: GraphQuery): Promise<{nodes: Node[], edges: Edge[]}> => {
    try {
      const queryString = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryString.append(key, value.toString())
        }
      })

      return await makeRequest(`/kg/${namespace}/query?${queryString.toString()}`, {
        method: 'GET'
      })
    } catch (e) {
      error.value = e as Error
      return { nodes: [], edges: [] }
    }
  }

  const removeNode = async (id: string): Promise<boolean> => {
    try {
      await makeRequest(`/kg/${namespace}/nodes/${id}`, {
        method: 'DELETE'
      })
      return true
    } catch (e) {
      error.value = e as Error
      return false
    }
  }

  const removeEdge = async (source: string, target: string, type: string): Promise<boolean> => {
    try {
      await makeRequest(`/kg/${namespace}/edges`, {
        method: 'DELETE',
        body: JSON.stringify({ source, target, type })
      })
      return true
    } catch (e) {
      error.value = e as Error
      return false
    }
  }

  return {
    error,
    addNode,
    addEdge,
    getNode,
    query,
    removeNode,
    removeEdge
  }
} 