export interface Activity {
  action: 'upload' | 'delete' | 'search'
  details: string
  timestamp: string
  metadata?: any
}

export interface ActivityDetails extends Activity {
  documentContent?: string
}

export interface StatsResponse {
  totalDocuments: number
  totalChunks: number
  pathDistribution: Record<string, number>
  documentTypes: Record<string, number>
  recentActivity: Activity[]
  cacheStats: {
    hitRate: string
    totalCached: number
  }
  documents: Array<{
    id: string
    title: string
    timestamp: string
    type: string
    chunks: number
    path: string
  }>
}

export interface ApiKeyStatus {
  llm: boolean
  query: boolean
  embed: boolean
}

export interface ChatResponse {
  response: string
  model: string
  error?: string
}

export interface QueryResponse {
  knowledge: string
  response: string
}

export interface IndexStats {
  documents: number
  webpages: number
} 