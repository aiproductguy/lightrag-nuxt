<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <AppNavbar />
    <NuxtPage @open-index-tab="openIndexTab" @open-chat-tab="openChatTab" />
    <AppFooter ref="footerRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppFooter from '~/components/AppFooter.vue'
import AppNavbar from '~/components/AppNavbar.vue'

const footerRef = ref()
const activeTab = ref('index')

const openIndexTab = () => {
  activeTab.value = 'index'
  if (footerRef.value) {
    footerRef.value.openTab('index')
  }
}

const openChatTab = () => {
  activeTab.value = 'chat'
  if (footerRef.value) {
    footerRef.value.openTab('chat')
  }
}
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light dark;
}

body {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style> 