import { ref, computed } from 'vue'
import type { Ref } from 'vue'

export interface UploadForm {
  title: string
  file: File | null
}

export interface DocumentDetails {
  id: string
  title: string
  timestamp: string
  type: string
  chunks: number
  path: string
}

export interface StatsResponse {
  totalDocuments: number
  totalChunks: number
  pathDistribution: Record<string, number>
  documentTypes: Record<string, number>
  recentActivity: Array<{
    action: 'upload' | 'delete' | 'search'
    details: string
    timestamp: string
  }>
  cacheStats: {
    hitRate: string
    totalCached: number
  }
  documents: DocumentDetails[]
}

export function useIndex() {
  const config = useRuntimeConfig()
  
  // State
  const isDocumentExpanded = ref(false)
  const uploading = ref(false)
  const fileInput = ref<HTMLInputElement>()
  const documents = ref<DocumentDetails[]>([])
  const uploadForm = ref<UploadForm>({
    title: '',
    file: null
  })

  // Methods
  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files?.length) {
      uploadForm.value.file = input.files[0]
    }
  }

  const resetForm = () => {
    uploadForm.value = {
      title: '',
      file: null
    }
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      await $fetch(`${config.public.workerUrl}/api/documents/${id}`, {
        method: 'DELETE'
      })
      await fetchDocuments() // Refresh the list
      return true
    } catch (err) {
      console.error('Delete error:', err)
      return false
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await $fetch<StatsResponse>(`${config.public.workerUrl}/api/stats`)
      if ('documents' in response) {
        documents.value = response.documents
      } else {
        console.error('Invalid response format')
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    }
  }

  const uploadDocument = async () => {
    if (!uploadForm.value.file) return
    
    uploading.value = true
    try {
      const formData = new FormData()
      formData.append('title', uploadForm.value.title)
      formData.append('file', uploadForm.value.file)
      formData.append('path', 'cloud')
      
      await $fetch(`${config.public.workerUrl}/api/documents`, {
        method: 'POST',
        body: formData
      })
      
      resetForm()
      isDocumentExpanded.value = false
      await fetchDocuments() // Refresh documents after upload
      return true // Success
    } catch (err) {
      console.error('Upload error:', err)
      return false // Failure
    } finally {
      uploading.value = false
    }
  }

  // Computed
  const canUpload = computed(() => {
    return !uploading.value && uploadForm.value.title && uploadForm.value.file
  })

  const documentCount = computed(() => documents.value.length)

  // Initialize
  fetchDocuments()

  return {
    // State
    isDocumentExpanded,
    uploading,
    fileInput,
    uploadForm,
    documents,
    
    // Methods
    handleFileChange,
    resetForm,
    uploadDocument,
    fetchDocuments,
    deleteDocument,
    
    // Computed
    canUpload,
    documentCount
  }
} 