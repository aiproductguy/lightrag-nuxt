<template>
  <div>
    <!-- Splash Screen -->
    <div 
      v-if="showSplash" 
      @click="hideSplash"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 cursor-pointer transition-opacity duration-[3000ms]"
      :class="[splashOpacity ? 'opacity-100' : 'opacity-0']"
    >
      <img 
        src="/LightRAG Logo 24.jpeg" 
        alt="LightRAG" 
        class="max-w-2xl w-full h-auto object-contain p-4 transition-all duration-[3000ms]"
        :class="[
          splashOpacity ? 'scale-100 rotate-0' : 'scale-75 rotate-12',
          'hover:scale-110 hover:rotate-0'
        ]"
      />
    </div>

    <!-- Main Content -->
    <div :class="[showSplash ? 'invisible' : 'visible']">
      <div class="max-w-3xl mx-auto">
        <div class="text-center">
          <p class="mt-6 text-lg md:text-xl leading-8 font-medium">
            <span class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              The lightweight RAG solution of 2024
            </span>
            <span class="block mt-2 text-sm text-gray-600 dark:text-gray-300 tracking-wide">
              powered by <span class="text-[#F6821F]">Cloudflare</span> at the edge ⚡️
            </span>
          </p>
        </div>

        <div class="mt-10 space-y-8">
          <!-- Quick Start Guide -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Index -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative group">
              <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                Step 1
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Index Documents</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                <a href="#" @click.prevent="$emit('open-index-tab')" class="text-blue-500 hover:text-blue-600">
                  Add your documents
                </a> to start using LightRAG
              </p>
              <div class="hidden group-hover:block absolute z-10 bg-gray-900 text-white text-sm rounded p-2 -bottom-12 left-1/2 transform -translate-x-1/2 w-48">
                Powered by BGE embeddings
              </div>
            </div>

            <!-- Query -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative group">
              <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                Step 2
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Chat with them</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                <a href="#" @click.prevent="$emit('open-chat-tab')" class="text-blue-500 hover:text-blue-600">
                  Use natural language to query your documents
                </a>
              </p>
              <div class="hidden group-hover:block absolute z-10 bg-gray-900 text-white text-sm rounded p-2 -bottom-12 left-1/2 transform -translate-x-1/2 w-48">
                Powered by Llama 3.1 and BGE embeddings
              </div>
            </div>

            <!-- Chat -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative group">
              <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                Step 3
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Query them</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                <a href="#" @click.prevent="$emit('open-query-tab')" class="text-blue-500 hover:text-blue-600">
                  Have conversations about your documents
                </a>
              </p>
              <div class="hidden group-hover:block absolute z-10 bg-gray-900 text-white text-sm rounded p-2 -bottom-12 left-1/2 transform -translate-x-1/2 w-48">
                Context-aware chat with memory
              </div>
            </div>
          </div>

          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Key Features -->
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Features</h3>
              <ul class="grid grid-cols-1 gap-4 text-sm">
                <li class="flex items-center text-gray-600 dark:text-gray-300">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Edge Computing
                </li>
                <li class="flex items-center text-gray-600 dark:text-gray-300">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Vector Search
                </li>
                <li class="flex items-center text-gray-600 dark:text-gray-300">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Multiple LLMs
                </li>
                <li class="flex items-center text-gray-600 dark:text-gray-300">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Document Processing
                </li>
              </ul>
            </div>

            <!-- Example Queries -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Example Queries</h3>
              <div class="grid grid-cols-2 gap-3">
                <div v-for="(query, index) in exampleQueries" :key="index" 
                     class="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <p class="text-sm text-gray-600 dark:text-gray-300 truncate mr-2">{{ query }}</p>
                  <button 
                    @click="copyToClipboard(query)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    :title="'Copy query'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Note -->
          <p class="text-center text-sm text-gray-500 dark:text-gray-400">
            Click the arrow at the bottom rightof the page to access all features
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showSplash = ref(true)
const splashOpacity = ref(false)
const exampleQueries = [
  "What are the main topics covered in this document?",
  "Can you summarize the key findings?",
  "Find sections related to performance metrics",
  "What are the recommendations?"
]

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}

// Hide splash after 5 seconds or on click
const hideSplash = () => {
  showSplash.value = false
}

// Handle splash screen animation
onMounted(() => {
  // Start fade in after a brief delay
  setTimeout(() => {
    splashOpacity.value = true
  }, 100)

  // Hide splash after 5 seconds
  setTimeout(() => {
    hideSplash()
  }, 5000)
})

const emit = defineEmits(['open-index-tab', 'open-chat-tab', 'open-query-tab'])

const openIndexTab = () => {
  emit('open-index-tab')
}

const openChatTab = () => {
  emit('open-chat-tab')
}

const openQueryTab = () => {
  emit('open-query-tab')
}
</script> 