<template>
  <div class="flex flex-col h-full relative">
    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 mb-[76px]">
      <!-- Clear Chat Button - Moved to top right -->
      <div class="absolute top-2 right-2">
        <button
          @click="clearChat"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/50 dark:bg-gray-800/50 rounded-full backdrop-blur-sm"
          title="Clear chat history"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <template v-if="chatState.messages.length > 0">
        <div 
          v-for="(message, index) in chatState.messages" 
          :key="index"
          :class="[
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          ]"
        >
          <div 
            :class="[
              'max-w-[80%] rounded-lg px-4 py-2',
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            ]"
          >
            <div class="text-sm">
              <!-- Model info line for assistant messages -->
              <div v-if="message.role === 'assistant'" class="flex items-center gap-2 text-xs mb-2">
                <!-- Info Icon with Tooltip -->
                <button 
                  class="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 group relative"
                  title="View message details"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  
                  <!-- Tooltip/Popup -->
                  <div 
                    class="hidden group-hover:block absolute z-50 w-96 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 left-0 top-6"
                  >
                    <div class="space-y-3 text-sm">
                      <div>
                        <div class="font-medium text-gray-700 dark:text-gray-300">System Prompt</div>
                        <div class="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded mt-1">
                          {{ settings.systemPrompt }}
                        </div>
                      </div>
                      <div>
                        <div class="font-medium text-gray-700 dark:text-gray-300">User Message</div>
                        <div class="text-gray-600 dark:text-gray-400">{{ message.content }}</div>
                      </div>
                      <div v-if="message.role === 'assistant'">
                        <div class="font-medium text-gray-700 dark:text-gray-300">Assistant Response</div>
                        <div class="text-gray-600 dark:text-gray-400">{{ message.content }}</div>
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        {{ formatFullDateTime(message.timestamp) }}
                      </div>
                    </div>
                  </div>
                </button>
                <span class="text-blue-400 dark:text-blue-300">{{ message.model || 'Llama 3.1' }}</span>
                <span class="text-gray-400">·</span>
                <span class="text-gray-500 dark:text-gray-400">{{ Math.round((message.latency || 0.5) * 1000) }}ms</span>
                <span class="text-gray-400">·</span>
                <span 
                  class="text-gray-500 dark:text-gray-400"
                  :title="formatFullDateTime(message.timestamp)"
                >
                  {{ formatRelativeTime(message.timestamp) }}
                </span>
              </div>
              <!-- Message content -->
              <div 
                :class="[
                  message.role === 'assistant' ? 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg' : ''
                ]"
              >
                {{ message.content }}
              </div>
            </div>
            <!-- Timestamp for user messages -->
            <div v-if="message.role === 'user'" class="text-xs mt-1 opacity-70">
              <span 
                :title="formatFullDateTime(message.timestamp)"
              >
                {{ formatRelativeTime(message.timestamp) }}
              </span>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        No messages yet
      </div>

      <!-- Error Message -->
      <div v-if="chatState.error" class="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-4 text-red-700 dark:text-red-400">
        {{ chatState.error }}
      </div>

      <!-- Loading Indicator -->
      <div v-if="chatState.pending" class="flex justify-start">
        <div class="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area - Fixed to bottom -->
    <div class="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div class="flex items-center space-x-2">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage(inputMessage)"
          type="text"
          placeholder="Type a message..."
          :disabled="chatState.pending"
          :title="chatState.pending ? 'Please wait for the response' : 'Type your message here'"
          class="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-0 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800"
        />
        <button
          @click="sendMessage(inputMessage)"
          :disabled="!canSendMessage"
          class="p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="!canSendMessage ? 'Please enter a message' : 'Send message'"
        >
          <svg class="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'
import { useSettings } from '~/composables/useSettings'
import { format, formatDistanceToNow } from 'date-fns'

const { chatState, inputMessage, sendMessage, clearChat, canSendMessage } = useChat()
const { settings } = useSettings()

const formatTime = (timestamp: string) => {
  return format(new Date(timestamp), 'HH:mm:ss')
}

const formatDate = (timestamp: string) => {
  return format(new Date(timestamp), 'yyyy-MM-dd')
}

const formatRelativeTime = (timestamp: string) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true, includeSeconds: true })
}

const formatFullDateTime = (timestamp: string) => {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`
}
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
}

.group:hover .group-hover\:block {
  display: block;
}
</style> 