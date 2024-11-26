import { ref } from '#imports'
import { format } from 'date-fns'
import type { Activity, ActivityDetails, StatsResponse } from '~/types'

export function useActivityLog() {
  const config = useRuntimeConfig()
  const activities = ref<Activity[]>([])
  const selectedActivity = ref<ActivityDetails | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch activity logs
  const fetchActivities = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${config.public.workerUrl}/api/stats`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const text = await response.text()
      let data: StatsResponse
      try {
        data = JSON.parse(text) as StatsResponse
      } catch (parseError) {
        console.error('Failed to parse response:', text)
        throw new Error('Invalid response format')
      }
      
      activities.value = data.recentActivity
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch activities'
    } finally {
      isLoading.value = false
    }
  }

  // Show activity details
  const showActivityDetails = async (activity: Activity) => {
    selectedActivity.value = activity as ActivityDetails
    
    // If this is an upload activity, fetch the document content
    if (activity.action === 'upload' && activity.metadata?.documentId) {
      try {
        const response = await fetch(`${config.public.workerUrl}/api/documents/${activity.metadata.documentId}/content`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const text = await response.text()
        let data: { content: string }
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.error('Failed to parse document content:', text)
          throw new Error('Invalid document content format')
        }
        
        selectedActivity.value = {
          ...activity,
          documentContent: data.content
        }
      } catch (err) {
        console.error('Error fetching document content:', err)
        // Keep the dialog open but show error state
        if (selectedActivity.value) {
          selectedActivity.value = {
            ...activity,
            documentContent: 'Failed to load document content'
          }
        }
      }
    }
  }

  // Close activity details
  const closeActivityDetails = () => {
    selectedActivity.value = null
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy HH:mm:ss')
  }

  // Get emoji for action type
  const getActionEmoji = (action: Activity['action']) => {
    switch (action) {
      case 'upload':
        return '📤'
      case 'delete':
        return '🗑️'
      case 'search':
        return '🔍'
      default:
        return '❓'
    }
  }

  return {
    // State
    activities,
    selectedActivity,
    isLoading,
    error,

    // Methods
    fetchActivities,
    showActivityDetails,
    closeActivityDetails,
    formatTimestamp,
    getActionEmoji
  }
}
