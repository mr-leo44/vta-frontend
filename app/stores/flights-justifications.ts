import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FlightJustification, ApiResponse } from '~/types/api'

const handleApiError = (error: any): string => {
  console.error('API Error:', error)
  
  if (error?.data?.message) {
    return error.data.message
  }
  
  if (error?.data?.errors) {
    const firstError = Object.values(error.data.errors)[0]
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0] as string
    }
  }
  
  return 'Une erreur est survenue'
}

export const useFlightJustificationsStore = defineStore('flight-justifications', () => {
  const justifications = ref<FlightJustification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasLoaded = ref(false)

  const justificationsList = computed(() => justifications.value)

  /**
   * Récupère toutes les justifications
   */
  const fetchJustifications = async () => {
    // Ne pas recharger si déjà chargées
    if (hasLoaded.value) {
      return { success: true, data: justifications.value }
    }

    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<FlightJustification[]>>('/flight-justifications')
      justifications.value = response.data || []
      hasLoaded.value = true
      
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée une nouvelle justification
   */
  const createJustification = async (name: string) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<any>('/flight-justifications', {
        method: 'POST',
        body: { name }
      })
      
      let justification: FlightJustification
      if ('data' in response && response.data) {
        justification = response.data
      } else if ('id' in response) {
        justification = response as FlightJustification
      } else {
        throw new Error('Format de réponse invalide')
      }
      
      justifications.value.push(justification)
      
      return { success: true, data: justification }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { 
        success: false, 
        message: error.value, 
        errors: err?.data?.errors 
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour une justification
   */
  const updateJustification = async (id: number, name: string) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<any>(`/flight-justifications/${id}`, {
        method: 'PUT',
        body: { name }
      })
      
      let justification: FlightJustification
      if ('data' in response && response.data) {
        justification = response.data
      } else if ('id' in response) {
        justification = response as FlightJustification
      } else {
        throw new Error('Format de réponse invalide')
      }
      
      const index = justifications.value.findIndex(j => j.id === id)
      if (index !== -1) {
        justifications.value[index] = justification
      }
      
      return { success: true, data: justification }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { 
        success: false, 
        message: error.value, 
        errors: err?.data?.errors 
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime une justification
   */
  const deleteJustification = async (id: number) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      await apiFetch(`/flight-justifications/${id}`, { method: 'DELETE' })
      
      justifications.value = justifications.value.filter(j => j.id !== id)
      
      return { success: true }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    justifications,
    loading,
    error,
    hasLoaded,
    
    // Computed
    justificationsList,
    
    // Actions
    fetchJustifications,
    createJustification,
    updateJustification,
    deleteJustification,
    clearError
  }
})