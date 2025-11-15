import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Aircraft, ApiResponse, PaginatedResponse, AircraftFormData, AircraftKPIs } from '~/types/api'

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

export const useAircraftsStore = defineStore('aircrafts', () => {
  // Liste paginée (pour les pages avec pagination)
  const aircrafts = ref<Aircraft[]>([])
  
  // Liste complète (pour les selects, autocomplete, etc.)
  const allAircrafts = ref<Aircraft[]>([])
  
  const currentAircraft = ref<Aircraft | null>(null)
  const loading = ref(false)
  const loadingAll = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const currentPage = ref(1)
  const lastPage = ref(1)
  const perPage = ref(10)
  const total = ref(0)
  const hasMorePages = computed(() => currentPage.value < lastPage.value)

  const aircraftsList = computed(() => aircrafts.value)
  const allAircraftsList = computed(() => allAircrafts.value)

  /**
   * Récupère TOUS les aéronefs (sans pagination)
   * Utilise GET /aircrafts/all
   * Utile pour: selects, autocomplete, dropdowns
   */
  const fetchAllAircrafts = async () => {
    loadingAll.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Aircraft[]>>('/aircrafts/all')
      allAircrafts.value = response.data
      
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loadingAll.value = false
    }
  }

  /**
   * Récupère les aéronefs avec pagination
   * Utilise GET /aircrafts?page=X
   */
  const fetchAircrafts = async (page: number = 1, append: boolean = false) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<PaginatedResponse<Aircraft>>(`/aircrafts?page=${page}`)
      
      if (append) {
        aircrafts.value = [...aircrafts.value, ...response.data]
      } else {
        aircrafts.value = response.data
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
   * Charge la page suivante (infinite scroll)
   */
  const loadNextPage = async () => {
    if (!hasMorePages.value || loading.value) return
    
    await fetchAircrafts(currentPage.value + 1, true)
  }

  /**
   * Récupère un aéronef par ID avec détails
   */
  const fetchAircraft = async (id: number) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Aircraft>>(`/aircrafts/${id}`)
      currentAircraft.value = response.data
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Recherche des aéronefs par immatriculation, opérateur ou type
   */
  const searchAircrafts = async (term: string) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Aircraft[]>>(`/aircrafts/search?term=${encodeURIComponent(term)}`)
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value, data: [] }
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère les KPIs d'un aéronef
   */
  const fetchAircraftKPIs = async (id: number): Promise<AircraftKPIs> => {
    const { apiFetch } = useApi()
    
    try {
      const aircraft = await fetchAircraft(id)
      if (!aircraft.success || !aircraft.data) {
        throw new Error('Aircraft not found')
      }
      
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      
      const currentYearFlights = aircraft.data.flights?.filter(f => 
        new Date(f.departure_time).getFullYear() === currentYear
      ) || []
      
      const currentMonthFlights = currentYearFlights.filter(f => 
        new Date(f.departure_time).getMonth() + 1 === currentMonth
      )
      
      return {
        total_flights_current_year: currentYearFlights.length,
        total_flights_current_month: currentMonthFlights.length,
        average_flights_per_month: Math.round(currentYearFlights.length / currentMonth),
        is_active: aircraft.data.in_activity,
        pmad: aircraft.data.pmad,
        total_flight_hours: 0,
        average_flight_duration: 0,
        utilization_rate: 0,
        last_flight_date: currentYearFlights[0]?.departure_time || null
      }
    } catch (err) {
      console.error('Failed to fetch KPIs:', err)
      return {
        total_flights_current_year: 0,
        total_flights_current_month: 0,
        average_flights_per_month: 0,
        is_active: false,
        pmad: null,
        total_flight_hours: 0,
        average_flight_duration: 0,
        utilization_rate: 0,
        last_flight_date: null
      }
    }
  }

  /**
   * Crée un nouvel aéronef
   */
  const createAircraft = async (data: AircraftFormData) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Aircraft>>('/aircrafts', {
        method: 'POST',
        body: data
      })
      
      // Ajoute aux deux listes
      aircrafts.value.unshift(response.data)
      allAircrafts.value.unshift(response.data)
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
   * Met à jour un aéronef
   */
  const updateAircraft = async (id: number, data: Partial<AircraftFormData>) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<Aircraft>>(`/aircrafts/${id}`, {
        method: 'PUT',
        body: data
      })
      
      // Met à jour dans la liste paginée
      const index = aircrafts.value.findIndex(a => a.id === id)
      if (index !== -1) {
        aircrafts.value[index] = response.data
      }
      
      // Met à jour dans la liste complète
      const allIndex = allAircrafts.value.findIndex(a => a.id === id)
      if (allIndex !== -1) {
        allAircrafts.value[allIndex] = response.data
      }
      
      if (currentAircraft.value?.id === id) {
        currentAircraft.value = response.data
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
   * Supprime un aéronef
   */
  const deleteAircraft = async (id: number) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      await apiFetch(`/aircrafts/${id}`, { method: 'DELETE' })
      
      // Supprime des deux listes
      aircrafts.value = aircrafts.value.filter(a => a.id !== id)
      allAircrafts.value = allAircrafts.value.filter(a => a.id !== id)
      total.value -= 1
      
      if (currentAircraft.value?.id === id) {
        currentAircraft.value = null
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

  const clearCurrentAircraft = () => {
    currentAircraft.value = null
  }

  const resetPagination = () => {
    aircrafts.value = []
    currentPage.value = 1
    lastPage.value = 1
    total.value = 0
  }

  const clearAll = () => {
    allAircrafts.value = []
  }

  return {
    // States
    aircrafts,
    allAircrafts,
    currentAircraft,
    loading,
    loadingAll,
    error,
    currentPage,
    lastPage,
    perPage,
    total,
    hasMorePages,
    
    // Computed
    aircraftsList,
    allAircraftsList,
    
    // Actions
    fetchAllAircrafts,      // Nouveau: charge tout
    fetchAircrafts,
    loadNextPage,
    fetchAircraft,
    searchAircrafts,
    fetchAircraftKPIs,
    createAircraft,
    updateAircraft,
    deleteAircraft,
    clearError,
    clearCurrentAircraft,
    resetPagination,
    clearAll                // Nouveau: nettoie allAircrafts
  }
})