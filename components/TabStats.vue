<template>
  <div class="space-y-4">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3" title="Total number of documents in the system">Documents</h3>
        <div class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totalDocuments }}</div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3" title="Total number of text chunks across all documents">Chunks</h3>
        <div class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totalChunks }}</div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3" title="Cache hit rate percentage">Cache Hit Rate</h3>
        <div class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.cacheStats?.hitRate || '0.00' }}%</div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <!-- Document Types Chart -->
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Document Types Distribution</h3>
        <div class="relative h-64">
          <Doughnut
            :data="documentTypesChartData"
            :options="chartOptions"
          />
        </div>
      </div>

      <!-- Path Distribution Chart -->
      <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Path Distribution</h3>
        <div class="relative h-64">
          <Doughnut
            :data="pathDistributionChartData"
            :options="chartOptions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { useColorMode } from '#imports'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

interface Stats {
  totalDocuments: number
  totalChunks: number
  pathDistribution: Record<string, number>
  documentTypes: Record<string, number>
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

const props = defineProps<{
  stats: Stats
}>()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: isDark.value ? '#e5e7eb' : '#1f2937',
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: isDark.value ? '#374151' : '#ffffff',
      titleColor: isDark.value ? '#e5e7eb' : '#111827',
      bodyColor: isDark.value ? '#e5e7eb' : '#374151',
      borderColor: isDark.value ? '#4b5563' : '#e5e7eb',
      borderWidth: 1
    }
  }
}))

const documentTypesChartData = computed(() => ({
  labels: Object.keys(props.stats.documentTypes || {}).map(type => type.toUpperCase()),
  datasets: [{
    label: 'Documents by Type',
    data: Object.values(props.stats.documentTypes || {}),
    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
    borderWidth: 1
  }]
}))

const pathDistributionChartData = computed(() => ({
  labels: Object.keys(props.stats.pathDistribution || {}).map(path => path.charAt(0).toUpperCase() + path.slice(1)),
  datasets: [{
    label: 'Documents by Path',
    data: Object.values(props.stats.pathDistribution || {}),
    backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B'],
    borderWidth: 1
  }]
}))
</script> 