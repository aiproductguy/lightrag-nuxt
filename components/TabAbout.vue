<template>
  <div class="space-y-4">
    <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">About LightRAG</h3>
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">Version</span>
          <span class="text-gray-900 dark:text-white">{{ version }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">Build Date</span>
          <span class="text-gray-900 dark:text-white">{{ buildDate }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">Commit Hash</span>
          <span class="text-gray-900 dark:text-white font-mono">{{ commitHash }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  version: string
  buildDate: string
  commitHash: string
}>()
</script> 