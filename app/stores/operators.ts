import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Operator, ApiResponse, OperatorFormData, PaginatedResponse, OperatorKPIs } from '~/types/api'

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
  
  // Pagination
  const currentPage = ref(1)
  const lastPage = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const hasMorePages = computed(() => currentPage.value < lastPage.value)

  const operatorsList = computed(() => operators.value)

  /**
   * Récupère les opérateurs avec pagination
   */
  const fetchOperators = async (page: number = 1, append: boolean = false) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<PaginatedResponse<Operator>>(`/operators?page=${page}`)
      
      if (append) {
        operators.value = [...operators.value, ...response.data]
      } else {
        operators.value = response.data
      }
      
      currentPage.value = response.current_page
      lastPage.value = response.last_page
      perPage.value = response.per_page
      total.value = response.total
      
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Charge la page suivante (infinite scroll)
   */
  const loadNextPage = async () => {
    if (!hasMorePages.value || loading.value) return
    
    await fetchOperators(currentPage.value + 1, true)
  }

  /**
   * Récupère un opérateur par ID avec détails
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
   * Recherche des opérateurs (retourne un tableau)
   */
  const searchOperators = async (term: string) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Operator[]>>(`/operators/search?term=${encodeURIComponent(term)}`)
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value, data: [] }
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère les KPIs d'un opérateur
   */
  const fetchOperatorKPIs = async (id: number): Promise<OperatorKPIs> => {
    const { apiFetch } = useApi()
    
    try {
      // Si l'API a un endpoint dédié pour les KPIs
      // const response = await apiFetch<OperatorKPIs>(`/operators/${id}/kpis`)
      // return response
      
      // Sinon, calculer à partir des données de l'opérateur
      const operator = await fetchOperator(id)
      if (!operator.success || !operator.data) {
        throw new Error('Operator not found')
      }
      
      const currentYear = new Date().getFullYear()
      const previousYear = currentYear - 1
      
      const currentYearFlights = operator.data.flights?.filter(f => 
        new Date(f.departure_time).getFullYear() === currentYear
      ) || []
      
      const previousYearFlights = operator.data.flights?.filter(f => 
        new Date(f.departure_time).getFullYear() === previousYear
      ) || []
      
      const activeAircrafts = operator.data.aircrafts?.filter(a => a.in_activity) || []
      const inactiveAircrafts = operator.data.aircrafts?.filter(a => !a.in_activity) || []
      
      const growthPercentage = previousYearFlights.length > 0
        ? ((currentYearFlights.length - previousYearFlights.length) / previousYearFlights.length) * 100
        : 0
      
      return {
        total_flights_current_year: currentYearFlights.length,
        total_flights_previous_year: previousYearFlights.length,
        growth_percentage: Math.round(growthPercentage * 10) / 10,
        active_aircrafts_count: activeAircrafts.length,
        inactive_aircrafts_count: inactiveAircrafts.length,
        total_aircrafts: operator.data.aircrafts?.length || 0
      }
    } catch (err) {
      console.error('Failed to fetch KPIs:', err)
      return {
        total_flights_current_year: 0,
        total_flights_previous_year: 0,
        growth_percentage: 0,
        active_aircrafts_count: 0,
        inactive_aircrafts_count: 0,
        total_aircrafts: 0
      }
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
      
      operators.value.unshift(response.data)
      total.value += 1
      
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
      total.value -= 1
      
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

  const resetPagination = () => {
    operators.value = []
    currentPage.value = 1
    lastPage.value = 1
    total.value = 0
  }

  return {
    operators,
    currentOperator,
    loading,
    error,
    currentPage,
    lastPage,
    perPage,
    total,
    hasMorePages,
    operatorsList,
    fetchOperators,
    loadNextPage,
    fetchOperator,
    searchOperators,
    fetchOperatorKPIs,
    createOperator,
    updateOperator,
    deleteOperator,
    clearError,
    clearCurrentOperator,
    resetPagination
  }
})