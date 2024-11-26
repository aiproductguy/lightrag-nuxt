<template>
  <div class="flex flex-col h-full">
    <div class="grid grid-cols-2 gap-4 p-4">
      <!-- Documents Column -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <button
            @click="toggleDocumentList"
            class="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            title="Toggle document list visibility"
          >
            <span class="transform transition-transform" :class="{ 'rotate-90': isDocumentListVisible }">
              ▶
            </span>
            <span>Upsert Documents ({{ documentCount }})</span>
          </button>
          <button
            @click="toggleUploadForm"
            class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            title="Upload or insert a new document"
          >
            + Upsert
          </button>
        </div>

        <!-- Document List -->
        <div v-if="isDocumentListVisible" class="space-y-2">
          <div 
            v-for="doc in documents" 
            :key="doc.id" 
            class="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="flex justify-between items-center">
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ doc.title }}</h3>
                <div class="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ doc.type }}</span>
                  <span>•</span>
                  <span>{{ doc.chunks }} chunks</span>
                  <span>•</span>
                  <span>{{ new Date(doc.timestamp).toLocaleDateString() }}</span>
                </div>
              </div>
              <div class="flex items-center space-x-2 ml-2">
                <button
                  class="p-1.5 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  @click="viewDocument(doc)"
                  :title="'View contents of ' + doc.title"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  class="p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  @click="confirmDelete(doc)"
                  :title="'Delete ' + doc.title"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Viewer Modal -->
        <div v-if="viewerDialog.isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                {{ viewerDialog.document?.title }}
              </h3>
              <button
                @click="closeViewerDialog"
                class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Content -->
            <div class="flex-1 p-4 overflow-auto">
              <div v-if="viewerDialog.loading" class="flex items-center justify-center h-full">
                <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div v-else-if="viewerDialog.error" class="text-red-500 dark:text-red-400">
                {{ viewerDialog.error }}
              </div>
              <div 
                v-else 
                class="prose dark:prose-invert max-w-none"
                v-html="viewerDialog.content"
              ></div>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <div v-if="deleteDialog.isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Confirm Delete</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              To delete "<span class="font-medium">{{ deleteDialog.document?.title }}</span>", please type the document title below:
            </p>
            <div>
              <input
                v-model="deleteDialog.confirmTitle"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Type document title"
              />
            </div>
            <div class="flex justify-end space-x-3">
              <button
                @click="closeDeleteDialog"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                @click="handleDelete"
                :disabled="!canDelete"
                class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Upload Form -->
        <div v-if="isUploadFormVisible" class="space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Document Title</label>
            <input
              v-model="uploadForm.title"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
              placeholder="Enter document title"
            />
          </div>
          
          <div class="flex items-center justify-center w-full">
            <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">PDF, TXT, MD (MAX. 10MB)</p>
              </div>
              <input 
                ref="fileInput"
                @change="handleFileChange"
                type="file" 
                class="hidden"
                accept=".pdf,.txt,.md"
              />
            </label>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closeUploadForm"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              title="Cancel document upload"
            >
              Cancel
            </button>
            <button
              @click="handleUpload"
              :disabled="!canUpload"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
              :title="canUpload ? 'Upload document' : 'Please fill in all required fields'"
            >
              <span v-if="uploading">Uploading...</span>
              <span v-else>Upload</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Webpages Column -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <button
            disabled
            class="flex items-center space-x-2 text-gray-400 cursor-not-allowed"
            title="Webpage support coming soon"
          >
            <span class="transform transition-transform">
              ▶
            </span>
            <span>Webpages (0)</span>
          </button>
          <button
            disabled
            class="px-3 py-1 text-sm bg-gray-300 text-gray-500 rounded cursor-not-allowed"
            title="Webpage support coming soon"
          >
            + Upsert
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIndex, type DocumentDetails } from '~/composables/useIndex'

const {
  uploading,
  fileInput,
  uploadForm,
  documents,
  documentCount,
  handleFileChange,
  uploadDocument,
  deleteDocument,
  resetForm,
  canUpload
} = useIndex()

// Local state for UI visibility
const isDocumentListVisible = ref(false)
const isUploadFormVisible = ref(false)

interface DeleteDialogState {
  isOpen: boolean
  document: DocumentDetails | null
  confirmTitle: string
}

interface ViewerDialogState {
  isOpen: boolean
  document: DocumentDetails | null
  content: string
  loading: boolean
  error: string | null
}

interface IndexStats {
  documents: number;
  webpages: number;
}

const props = defineProps<{
  indexStats: IndexStats;
}>()

// Delete dialog state
const deleteDialog = ref<DeleteDialogState>({
  isOpen: false,
  document: null,
  confirmTitle: ''
})

// Viewer dialog state
const viewerDialog = ref<ViewerDialogState>({
  isOpen: false,
  document: null,
  content: '',
  loading: false,
  error: null
})

// Computed property to check if delete can be performed
const canDelete = computed(() => {
  return deleteDialog.value.document?.title === deleteDialog.value.confirmTitle
})

// Methods for handling UI state
const toggleDocumentList = () => {
  isDocumentListVisible.value = !isDocumentListVisible.value
  if (isUploadFormVisible.value) {
    isUploadFormVisible.value = false
  }
}

const toggleUploadForm = () => {
  isUploadFormVisible.value = !isUploadFormVisible.value
  if (isDocumentListVisible.value) {
    isDocumentListVisible.value = false
  }
}

const closeUploadForm = () => {
  isUploadFormVisible.value = false
  resetForm()
}

const handleUpload = async () => {
  const success = await uploadDocument()
  if (success) {
    closeUploadForm()
  }
}

// Delete dialog methods
const confirmDelete = (doc: DocumentDetails) => {
  deleteDialog.value = {
    isOpen: true,
    document: doc,
    confirmTitle: ''
  }
}

const closeDeleteDialog = () => {
  deleteDialog.value = {
    isOpen: false,
    document: null,
    confirmTitle: ''
  }
}

const handleDelete = async () => {
  if (!deleteDialog.value.document || !canDelete.value) return
  
  const success = await deleteDocument(deleteDialog.value.document.id)
  if (success) {
    closeDeleteDialog()
  }
}

// Viewer dialog methods
const viewDocument = async (doc: DocumentDetails) => {
  viewerDialog.value = {
    isOpen: true,
    document: doc,
    content: '',
    loading: true,
    error: null
  }

  try {
    const config = useRuntimeConfig()
    const response = await $fetch<{ content: string }>(`${config.public.workerUrl}/api/documents/${doc.id}/content`)
    viewerDialog.value.content = response.content
  } catch (err) {
    viewerDialog.value.error = 'Failed to load document content'
    console.error('View error:', err)
  } finally {
    viewerDialog.value.loading = false
  }
}

const closeViewerDialog = () => {
  viewerDialog.value = {
    isOpen: false,
    document: null,
    content: '',
    loading: false,
    error: null
  }
}

defineEmits<{
  (e: 'view-document', id: string): void
}>()
</script>

<style>
.prose {
  @apply text-gray-900 dark:text-gray-100;
}

.prose pre {
  @apply bg-gray-100 dark:bg-gray-900 p-4 rounded;
}

.prose code {
  @apply text-sm bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded;
}
</style> 