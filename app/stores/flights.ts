import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Flight, FlightJustification, ApiResponse, PaginatedResponse } from '~/types/api'

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

export const useFlightsStore = defineStore('flights', () => {
  const flights = ref<Flight[]>([])
  const currentFlight = ref<Flight | null>(null)
  const justifications = ref<FlightJustification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const currentPage = ref(1)
  const lastPage = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const hasMorePages = computed(() => currentPage.value < lastPage.value)

  const flightsList = computed(() => flights.value)

  /**
   * Récupère les vols avec pagination
   */
  const fetchFlights = async (page: number = 1, append: boolean = false) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<PaginatedResponse<Flight>>(`/flights?page=${page}`)
      
      if (append) {
        flights.value = [...flights.value, ...response.data]
      } else {
        flights.value = response.data
      }
      
      currentPage.value = response.meta.current_page
      lastPage.value = response.meta.last_page
      perPage.value = response.meta.per_page
      total.value = response.meta.total

      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Charge la page suivante
   */
  const loadNextPage = async () => {
    if (!hasMorePages.value || loading.value) return
    await fetchFlights(currentPage.value + 1, true)
  }

  /**
   * Récupère un vol par ID
   */
  const fetchFlight = async (id: number) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Flight>>(`/flights/${id}`)
      currentFlight.value = response.data
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère les vols d'une date spécifique
   */
  const fetchFlightsByDate = async (date: string) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      // Format: YYYY-MM-DD
      const response = await apiFetch<ApiResponse<Flight[]>>(`/flights?date=${date}`)
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value, data: [] }
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère toutes les justifications
   */
  const fetchJustifications = async () => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<FlightJustification[]>>('/flight-justifications')
      justifications.value = response.data
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée un nouveau vol
   */
  const createFlight = async (data: any) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Flight>>('/flights', {
        method: 'POST',
        body: data
      })
      
      flights.value.unshift(response.data)
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
   * Met à jour un vol
   */
  const updateFlight = async (id: number, data: any) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Flight>>(`/flights/${id}`, {
        method: 'PUT',
        body: data
      })
      
      const index = flights.value.findIndex(f => f.id === id)
      if (index !== -1) {
        flights.value[index] = response.data
      }
      
      if (currentFlight.value?.id === id) {
        currentFlight.value = response.data
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
   * Supprime un vol
   */
  const deleteFlight = async (id: number) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      await apiFetch(`/flights/${id}`, { method: 'DELETE' })
      
      flights.value = flights.value.filter(f => f.id !== id)
      total.value -= 1
      
      if (currentFlight.value?.id === id) {
        currentFlight.value = null
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

  const clearCurrentFlight = () => {
    currentFlight.value = null
  }

  const resetPagination = () => {
    flights.value = []
    currentPage.value = 1
    lastPage.value = 1
    total.value = 0
  }

  return {
    flights,
    currentFlight,
    justifications,
    loading,
    error,
    currentPage,
    lastPage,
    perPage,
    total,
    hasMorePages,
    flightsList,
    fetchFlights,
    loadNextPage,
    fetchFlight,
    fetchFlightsByDate,
    fetchJustifications,
    createFlight,
    updateFlight,
    deleteFlight,
    clearError,
    clearCurrentFlight,
    resetPagination
  }
})