import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Operator, ApiResponse, OperatorFormData } from '~/types/api'

// Helper local pour gérer les erreurs
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

export const useOperatorsStore = defineStore('operators', () => {
  const operators = ref<Operator[]>([])
  const currentOperator = ref<Operator | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const operatorsList = computed(() => operators.value)

  /**
   * Récupère tous les opérateurs
   */
  const fetchOperators = async () => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Operator[]>>('/operators')
      operators.value = response.data
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère un opérateur par ID
   */
  const fetchOperator = async (id: number) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Operator>>(`/operators/${id}`)
      currentOperator.value = response.data
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Recherche un opérateur
   */
  const searchOperator = async (term: string) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Operator>>(`/operators/search?term=${encodeURIComponent(term)}`)
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée un nouvel opérateur
   */
  const createOperator = async (data: OperatorFormData) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Operator>>('/operators', {
        method: 'POST',
        body: data
      })
      
      operators.value.push(response.data)
      
      return { success: true, data: response.data }
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
   * Met à jour un opérateur
   */
  const updateOperator = async (id: number, data: Partial<OperatorFormData>) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Operator>>(`/operators/${id}`, {
        method: 'PUT',
        body: data
      })
      
      const index = operators.value.findIndex(o => o.id === id)
      if (index !== -1) {
        operators.value[index] = response.data
      }
      
      if (currentOperator.value?.id === id) {
        currentOperator.value = response.data
      }
      
      return { success: true, data: response.data }
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
   * Supprime un opérateur
   */
  const deleteOperator = async (id: number) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      await apiFetch(`/operators/${id}`, { method: 'DELETE' })
      
      operators.value = operators.value.filter(o => o.id !== id)
      
      if (currentOperator.value?.id === id) {
        currentOperator.value = null
      }
      
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

  const clearCurrentOperator = () => {
    currentOperator.value = null
  }

  return {
    operators,
    currentOperator,
    loading,
    error,
    operatorsList,
    fetchOperators,
    fetchOperator,
    searchOperator,
    createOperator,
    updateOperator,
    deleteOperator,
    clearError,
    clearCurrentOperator
  }
})