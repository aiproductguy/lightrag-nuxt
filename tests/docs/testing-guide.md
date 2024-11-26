# Testing KV+Vector Store via Nuxt App

## Setup

1. Start the Nuxt development server:
```bash
cd kv-vector-store
pnpm install
pnpm dev
```

2. Open your browser to `http://localhost:3000`

## Testing Cloud Path

1. Navigate to the Upload page
2. Upload a document with the following settings:
   - Title: "Cloud Processing Test"
   - File: Select `upsert-diagram-v2.md`
   - Path: "cloud"
   - Click "Upload"
   - Expected: Document is processed using cloud services (tiktoken, OpenAI, etc.)

3. Navigate to the Search page
4. Test cloud path queries:
   ```
   What is the cloud processing pipeline?
   How does the cloud storage work?
   Explain the premium storage options
   ```
   - Expected: Results should show chunks from cloud-processed documents

## Testing Local Path

1. Navigate to the Upload page
2. Upload a document with the following settings:
   - Title: "Local Processing Test"
   - File: Select `upsert-diagram-v2.md`
   - Path: "local"
   - Click "Upload"
   - Expected: Document is processed using local services (NLTK, Nano, etc.)

3. Navigate to the Search page
4. Test local path queries:
   ```
   How does local processing work?
   What are the local storage options?
   Explain the local chunking process
   ```
   - Expected: Results should show chunks from locally-processed documents

## Testing Stats

1. Navigate to the Stats page
2. Verify the following metrics:
   - Document counts by path (cloud vs local)
   - Processing details for each document
   - Cache hit rates
   - Recent activity log

## Example Vue Component Tests

### Upload Component
```vue
<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">Upload Document</h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-300">
          <p>Upload a document to be processed through cloud or local path.</p>
        </div>
        <form @submit.prevent="handleUpload" class="mt-5">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Document Title</label>
              <input v-model="title" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Processing Path</label>
              <select v-model="path" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
                <option value="cloud">Cloud Processing</option>
                <option value="local">Local Processing</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Document File</label>
              <input ref="fileInput" type="file" accept=".txt,.md,.pdf" required @change="handleFileChange" class="mt-1 block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300" />
            </div>
            <div class="flex justify-end">
              <button type="submit" :disabled="isUploading" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {{ isUploading ? 'Uploading...' : 'Upload' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const title = ref('')
const path = ref('cloud')
const isUploading = ref(false)
const config = useRuntimeConfig()

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file && !title.value) {
    title.value = file.name.replace(/\.[^/.]+$/, '')
  }
}

const handleUpload = async (event) => {
  try {
    isUploading.value = true
    const formData = new FormData()
    formData.append('title', title.value)
    formData.append('path', path.value)
    formData.append('file', event.target.querySelector('input[type="file"]').files[0])

    const response = await fetch(`${config.public.workerUrl}/documents`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('Upload failed')

    const result = await response.json()
    console.log('Upload result:', result)
    title.value = ''
    path.value = 'cloud'
    event.target.reset()
  } catch (error) {
    console.error('Upload error:', error)
    alert('Failed to upload document')
  } finally {
    isUploading.value = false
  }
}
</script>
```

### Search Component
```vue
<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">Search Documents</h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-300">
          <p>Search through your documents using natural language queries.</p>
        </div>
        <form @submit.prevent="handleSearch" class="mt-5">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Query</label>
              <input v-model="query" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm" placeholder="Enter your search query..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Search Path</label>
              <select v-model="searchPath" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
                <option value="all">All Documents</option>
                <option value="cloud">Cloud Documents</option>
                <option value="local">Local Documents</option>
              </select>
            </div>
            <div class="flex justify-end">
              <button type="submit" :disabled="isSearching" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {{ isSearching ? 'Searching...' : 'Search' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-if="results.length > 0" class="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">Search Results</h3>
        <div class="mt-4 space-y-6">
          <div v-for="(result, index) in results" :key="index" class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ result.document.title }}</h4>
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-500 dark:text-gray-400">Score: {{ result.score.toFixed(2) }}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">Path: {{ result.document.path }}</span>
              </div>
            </div>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ result.chunk }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const query = ref('')
const searchPath = ref('all')
const isSearching = ref(false)
const results = ref([])
const config = useRuntimeConfig()

const handleSearch = async () => {
  try {
    isSearching.value = true
    const response = await fetch(`${config.public.workerUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: query.value,
        path: searchPath.value
      })
    })

    if (!response.ok) throw new Error('Search failed')

    const data = await response.json()
    results.value = data.results
  } catch (error) {
    console.error('Search error:', error)
    alert('Failed to perform search')
  } finally {
    isSearching.value = false
  }
}
</script>
```

## Testing Flow

1. Start both the worker and Nuxt app:
```bash
# Terminal 1 - Start worker
cd worker
pnpm dev

# Terminal 2 - Start Nuxt app
cd kv-vector-store
pnpm dev
```

2. Test Upload Flow:
   - Upload same document with different paths
   - Verify processing details in response
   - Check stats page for document counts

3. Test Search Flow:
   - Search across all documents
   - Search only cloud documents
   - Search only local documents
   - Verify results match expected path

4. Test Error Handling:
   - Try uploading invalid files
   - Try searching with empty queries
   - Check error messages in UI

5. Test Performance:
   - Monitor cache hit rates
   - Compare cloud vs local processing times
   - Check embedding generation times 