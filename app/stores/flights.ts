import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Flight, 
  ApiResponse, 
  PaginatedResponse,
  FlightStatus,
  FlightRegime,
  FlightType,
  FlightNature
} from '~/types/api'

export interface FlightFormData {
  flight_number: string
  operator_id: number
  aircraft_id: number
  departure: string[]
  arrival: string[]
  departure_time: string
  arrival_time: string
  flight_regime?: FlightRegime
  flight_type?: FlightType
  flight_nature?: FlightNature
  status?: FlightStatus
  remarks?: string | null
  statistics?: {
    passengers_count: number
    pax_bus: number
    go_pass_count: number
    fret_count?: any[]
    excedents?: any[]
    has_justification: boolean
    justification?: any[]
  }
}

export interface FlightFilters {
  operator_id?: number | null
  aircraft_id?: number | null
  status?: FlightStatus | null
  regime?: FlightRegime | null
  type?: FlightType | null
  nature?: FlightNature | null
  date_from?: string | null
  date_to?: string | null
  search?: string | null
}

export interface FlightKPIs {
  total_flights: number
  total_today: number
  total_this_week: number
  total_this_month: number
  by_status: Record<FlightStatus, number>
  by_regime: Record<FlightRegime, number>
  by_type: Record<FlightType, number>
  by_nature: Record<FlightNature, number>
  total_passengers: number
  average_passengers: number
  top_operators: Array<{ id: number; name: string; count: number }>
  top_routes: Array<{ route: string; count: number }>
}

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
  // State
  const flights = ref<Flight[]>([])
  const currentFlight = ref<Flight | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const currentPage = ref(1)
  const lastPage = ref(1)
  const perPage = ref(20)
  const total = ref(0)
  const hasMorePages = computed(() => currentPage.value < lastPage.value)
  
  // Filters
  const filters = ref<FlightFilters>({})

  // Computed
  const flightsList = computed(() => flights.value)

  /**
   * Récupère les vols avec pagination
   */
  const fetchFlights = async (page: number = 1, append: boolean = false) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      // Construire les query params
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      
      if (filters.value.operator_id) {
        queryParams.append('operator_id', filters.value.operator_id.toString())
      }
      if (filters.value.aircraft_id) {
        queryParams.append('aircraft_id', filters.value.aircraft_id.toString())
      }
      if (filters.value.status) {
        queryParams.append('status', filters.value.status)
      }
      if (filters.value.regime) {
        queryParams.append('regime', filters.value.regime)
      }
      if (filters.value.type) {
        queryParams.append('type', filters.value.type)
      }
      if (filters.value.nature) {
        queryParams.append('nature', filters.value.nature)
      }
      if (filters.value.date_from) {
        queryParams.append('date_from', filters.value.date_from)
      }
      if (filters.value.date_to) {
        queryParams.append('date_to', filters.value.date_to)
      }
      if (filters.value.search) {
        queryParams.append('search', filters.value.search)
      }
      
      const response = await apiFetch<PaginatedResponse<Flight>>(
        `/flights?${queryParams.toString()}`
      )
      
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
   * Charge la page suivante (infinite scroll)
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
   * Récupère les vols d'aujourd'hui
   */
  const fetchTodayFlights = async () => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await apiFetch<ApiResponse<Flight[]>>(
        `/flights?date_from=${today}&date_to=${today}`
      )
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value, data: [] }
    } finally {
      loading.value = false
    }
  }

  /**
   * Calcule les KPIs des vols
   */
  const fetchFlightKPIs = async (): Promise<FlightKPIs> => {
    try {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      
      // Compter par statut
      const byStatus: Record<FlightStatus, number> = {
        qrf: 0,
        prevu: 0,
        atteri: 0,
        annule: 0,
        detourne: 0
      }
      
      // Compter par régime
      const byRegime: Record<FlightRegime, number> = {
        domestic: 0,
        international: 0
      }
      
      // Compter par type
      const byType: Record<FlightType, number> = {
        regular: 0,
        non_regular: 0
      }
      
      // Compter par nature
      const byNature: Record<FlightNature, number> = {
        commercial: 0,
        non_commercial: 0
      }
      
      let totalToday = 0
      let totalThisWeek = 0
      let totalThisMonth = 0
      let totalPassengers = 0
      let flightsWithPassengers = 0
      
      const operatorCounts = new Map<number, { name: string; count: number }>()
      const routeCounts = new Map<string, number>()
      
      flights.value.forEach(flight => {
        const flightDate = new Date(flight.departure_time)
        
        // Statistiques temporelles
        if (flightDate.toDateString() === today.toDateString()) {
          totalToday++
        }
        if (flightDate >= startOfWeek) {
          totalThisWeek++
        }
        if (flightDate >= startOfMonth) {
          totalThisMonth++
        }
        
        // Compter par catégorie
        byStatus[flight.status]++
        byRegime[flight.flight_regime]++
        byType[flight.flight_type]++
        byNature[flight.flight_nature]++
        
        // Passagers
        if (flight.statistics?.passengers_count) {
          totalPassengers += flight.statistics.passengers_count
          flightsWithPassengers++
        }
        
        // Opérateurs
        if (flight.operator) {
          const current = operatorCounts.get(flight.operator.id) || { 
            name: flight.operator.name, 
            count: 0 
          }
          operatorCounts.set(flight.operator.id, {
            ...current,
            count: current.count + 1
          })
        }
        
        // Routes
        if (flight.departure.length > 0 && flight.arrival.length > 0) {
          const route = `${flight.departure[0]} → ${flight.arrival[0]}`
          routeCounts.set(route, (routeCounts.get(route) || 0) + 1)
        }
      })
      
      // Top opérateurs
      const topOperators = Array.from(operatorCounts.entries())
        .map(([id, data]) => ({ id, name: data.name, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      // Top routes
      const topRoutes = Array.from(routeCounts.entries())
        .map(([route, count]) => ({ route, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      return {
        total_flights: flights.value.length,
        total_today: totalToday,
        total_this_week: totalThisWeek,
        total_this_month: totalThisMonth,
        by_status: byStatus,
        by_regime: byRegime,
        by_type: byType,
        by_nature: byNature,
        total_passengers: totalPassengers,
        average_passengers: flightsWithPassengers > 0 
          ? Math.round(totalPassengers / flightsWithPassengers) 
          : 0,
        top_operators: topOperators,
        top_routes: topRoutes
      }
    } catch (err) {
      console.error('Failed to fetch flight KPIs:', err)
      return {
        total_flights: 0,
        total_today: 0,
        total_this_week: 0,
        total_this_month: 0,
        by_status: { qrf: 0, prevu: 0, atteri: 0, annule: 0, detourne: 0 },
        by_regime: { domestic: 0, international: 0 },
        by_type: { regular: 0, non_regular: 0 },
        by_nature: { commercial: 0, non_commercial: 0 },
        total_passengers: 0,
        average_passengers: 0,
        top_operators: [],
        top_routes: []
      }
    }
  }

  /**
   * Crée un nouveau vol
   */
  const createFlight = async (data: FlightFormData) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<any>('/flights', {
        method: 'POST',
        body: data
      })
      
      // Gérer différents formats de réponse
      let flight: Flight
      if ('data' in response && response.data) {
        flight = response.data
      } else if ('id' in response) {
        flight = response as Flight
      } else {
        throw new Error('Format de réponse invalide')
      }
      
      flights.value.unshift(flight)
      total.value += 1
      
      return { success: true, data: flight }
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
  const updateFlight = async (id: number, data: Partial<FlightFormData>) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<any>(`/flights/${id}`, {
        method: 'PUT',
        body: data
      })
      
      let flight: Flight
      if ('data' in response && response.data) {
        flight = response.data
      } else if ('id' in response) {
        flight = response as Flight
      } else {
        throw new Error('Format de réponse invalide')
      }
      
      const index = flights.value.findIndex(f => f.id === id)
      if (index !== -1) {
        flights.value[index] = flight
      }
      
      if (currentFlight.value?.id === id) {
        currentFlight.value = flight
      }
      
      return { success: true, data: flight }
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

  /**
   * Applique les filtres
   */
  const applyFilters = async (newFilters: FlightFilters) => {
    filters.value = { ...newFilters }
    currentPage.value = 1
    await fetchFlights(1, false)
  }

  /**
   * Réinitialise les filtres
   */
  const clearFilters = async () => {
    filters.value = {}
    currentPage.value = 1
    await fetchFlights(1, false)
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
    // State
    flights,
    currentFlight,
    loading,
    error,
    currentPage,
    lastPage,
    perPage,
    total,
    hasMorePages,
    filters,
    
    // Computed
    flightsList,
    
    // Actions
    fetchFlights,
    loadNextPage,
    fetchFlight,
    fetchTodayFlights,
    fetchFlightKPIs,
    createFlight,
    updateFlight,
    deleteFlight,
    applyFilters,
    clearFilters,
    clearError,
    clearCurrentFlight,
    resetPagination
  }
})