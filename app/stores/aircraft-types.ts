import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  AircraftTypeFormData, 
  AircraftType, 
  ApiResponse, 
  AircraftTypeKPIs,
  OperatorWithAircraftCount 
} from '~/types/api'

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

export const useAircraftTypesStore = defineStore('aircraft-types', () => {
  const aircraftTypes = ref<AircraftType[]>([])
  const currentType = ref<AircraftType | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const currentPage = ref(1)
  const lastPage = ref(1)
  const perPage = ref(6)
  const total = ref(0)
  const hasMorePages = computed(() => currentPage.value < lastPage.value)

  const typesList = computed(() => aircraftTypes.value)

  /**
   * Réinitialise la pagination
   */
  const resetPagination = () => {
    currentPage.value = 1
    lastPage.value = 1
    aircraftTypes.value = []
  }

  /**
   * Récupère les types d'aéronefs avec pagination
   * Utilise GET /aircraft-types?page={page}&per_page={perPage}
   */
  const fetchAircraftTypesPage = async (page: number = 1, append: boolean = false) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<any>(`/aircraft-types?page=${page}&per_page=${perPage.value}`)
      
      // Gérer différents formats de réponse API
      let data: AircraftType[] = []
      let meta = { current_page: page, last_page: 1, per_page: perPage.value, total: 0 }
      
      if (response && typeof response === 'object') {
        // Format: { data: [...], meta: {...} }
        if ('data' in response && Array.isArray(response.data)) {
          data = response.data
          if ('meta' in response && response.meta) {
            meta = response.meta
          }
        }
        // Format: { current_page: ..., last_page: ..., data: [...] }
        else if ('current_page' in response && 'data' in response) {
          data = response.data
          meta = {
            current_page: response.current_page,
            last_page: response.last_page,
            per_page: response.per_page || perPage.value,
            total: response.total || 0
          }
        }
        // Format: direct array (fallback)
        else if (Array.isArray(response)) {
          data = response
        }
      }
      
      if (append) {
        aircraftTypes.value = [...aircraftTypes.value, ...data]
      } else {
        aircraftTypes.value = data
      }
      
      currentPage.value = meta.current_page
      lastPage.value = meta.last_page
      perPage.value = meta.per_page
      total.value = meta.total
      
      return { success: true, data }
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
    
    await fetchAircraftTypesPage(currentPage.value + 1, true)
  }

  /**
   * Récupère tous les types d'aéronefs (sans pagination)
   * Utilise GET /aircraft-types
   */
  const fetchAircraftTypes = async () => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<AircraftType[]>>('/aircraft-types')
      
      // Gérer le cas où l'API retourne directement un tableau
      const data = Array.isArray(response) ? response : (response.data || [])
      aircraftTypes.value = data
      total.value = data.length
      
      return { success: true, data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Recherche un type d'aéronef par nom ou sigle
   * Utilise GET /aircraft-types/find/{query}
   */
  const findAircraftType = async (query: string) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<AircraftType | null>(`/aircraft-types/find/${encodeURIComponent(query)}`)
      return { success: true, data: response }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value, data: null }
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère les KPIs d'un type d'aéronef
   */
  const fetchAircraftTypeKPIs = async (id: number): Promise<AircraftTypeKPIs> => {
    const aircraftsStore = useAircraftsStore()
    const operatorsStore = useOperatorsStore()
    
    try {
      // Récupérer tous les aéronefs de ce type
      const allAircrafts = aircraftsStore.allAircrafts.filter(a => a.type?.id === id)
      
      if (allAircrafts.length === 0) {
        return {
          total_aircrafts: 0,
          active_aircrafts: 0,
          inactive_aircrafts: 0,
          total_operators: 0,
          total_flights: 0,
          total_flights_current_year: 0,
          average_pmad: 0,
          flights_per_aircraft: 0,
          utilization_rate: 0
        }
      }
      
      const currentYear = new Date().getFullYear()
      
      // Statistiques de base
      const activeAircrafts = allAircrafts.filter(a => a.in_activity)
      const inactiveAircrafts = allAircrafts.filter(a => !a.in_activity)
      
      // Opérateurs uniques
      const uniqueOperators = new Set(allAircrafts.map(a => a.operator?.id).filter(Boolean))
      
      // PMAD moyen
      const pmadValues = allAircrafts.map(a => a.pmad).filter(Boolean) as number[]
      const averagePmad = pmadValues.length > 0 
        ? Math.round(pmadValues.reduce((sum, val) => sum + val, 0) / pmadValues.length)
        : 0
      
      // Vols
      let totalFlights = 0
      let currentYearFlights = 0
      
      allAircrafts.forEach(aircraft => {
        if (aircraft.flights) {
          totalFlights += aircraft.flights.length
          currentYearFlights += aircraft.flights.filter(f => 
            new Date(f.departure_time).getFullYear() === currentYear
          ).length
        }
      })
      
      // Vols par aéronef actif
      const flightsPerAircraft = activeAircrafts.length > 0
        ? Math.round(currentYearFlights / activeAircrafts.length)
        : 0
      
      // Taux d'utilisation
      const utilizationRate = allAircrafts.length > 0
        ? Math.round((activeAircrafts.length / allAircrafts.length) * 100)
        : 0
      
      return {
        total_aircrafts: allAircrafts.length,
        active_aircrafts: activeAircrafts.length,
        inactive_aircrafts: inactiveAircrafts.length,
        total_operators: uniqueOperators.size,
        total_flights: totalFlights,
        total_flights_current_year: currentYearFlights,
        average_pmad: averagePmad,
        flights_per_aircraft: flightsPerAircraft,
        utilization_rate: utilizationRate
      }
    } catch (err) {
      console.error('Failed to fetch aircraft type KPIs:', err)
      return {
        total_aircrafts: 0,
        active_aircrafts: 0,
        inactive_aircrafts: 0,
        total_operators: 0,
        total_flights: 0,
        total_flights_current_year: 0,
        average_pmad: 0,
        flights_per_aircraft: 0,
        utilization_rate: 0
      }
    }
  }

  /**
   * Récupère les opérateurs utilisant ce type
   */
  const fetchOperatorsByType = async (typeId: number): Promise<OperatorWithAircraftCount[]> => {
    const aircraftsStore = useAircraftsStore()
    const operatorsStore = useOperatorsStore()
    
    try {
      // Récupérer tous les aéronefs de ce type
      const typeAircrafts = aircraftsStore.allAircrafts.filter(a => a.type?.id === typeId)
      
      // Grouper par opérateur
      const operatorMap = new Map<number, OperatorWithAircraftCount>()
      
      typeAircrafts.forEach(aircraft => {
        if (!aircraft.operator) return
        
        const operatorId = aircraft.operator.id
        
        if (!operatorMap.has(operatorId)) {
          operatorMap.set(operatorId, {
            id: aircraft.operator.id,
            name: aircraft.operator.name,
            sigle: aircraft.operator.sigle,
            iata_code: aircraft.operator.iata_code,
            icao_code: aircraft.operator.icao_code,
            country: aircraft.operator.country,
            aircrafts_count: 0,
            active_aircrafts_count: 0
          })
        }
        
        const operator = operatorMap.get(operatorId)!
        operator.aircrafts_count++
        if (aircraft.in_activity) {
          operator.active_aircrafts_count++
        }
      })
      
      return Array.from(operatorMap.values())
        .sort((a, b) => b.aircrafts_count - a.aircrafts_count)
    } catch (err) {
      console.error('Failed to fetch operators by type:', err)
      return []
    }
  }

  /**
   * Récupère les aéronefs d'un type
   */
  const fetchAircraftsByType = async (typeId: number) => {
    const aircraftsStore = useAircraftsStore()
    
    try {
      return aircraftsStore.allAircrafts
        .filter(a => a.type?.id === typeId)
        .sort((a, b) => {
          // Trier par statut (actifs d'abord) puis par immatriculation
          if (a.in_activity !== b.in_activity) {
            return a.in_activity ? -1 : 1
          }
          return a.immatriculation.localeCompare(b.immatriculation)
        })
    } catch (err) {
      console.error('Failed to fetch aircrafts by type:', err)
      return []
    }
  }

  /**
   * Crée un nouveau type d'aéronef
   * Utilise POST /aircraft-types
   */
  const createAircraftType = async (data: AircraftTypeFormData) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<any>('/aircraft-types', {
        method: 'POST',
        body: data
      })
      
      console.log('API Response:', response) 
      
      // L'API peut retourner soit { data: {...} } soit directement {...}
      let aircraftType: AircraftType
      
      if (response && typeof response === 'object') {
        // Si la réponse a une propriété 'data', on l'utilise, sinon on utilise la réponse directement
        if ('data' in response && response.data) {
          aircraftType = response.data
        } else if ('id' in response && 'name' in response && 'sigle' in response) {
          // La réponse contient directement les propriétés de l'aircraft type
          aircraftType = response as AircraftType
        } else {
          console.error('Unexpected response format:', response)
          throw new Error('Format de réponse invalide')
        }
      } else {
        throw new Error('Format de réponse invalide')
      }
      
      aircraftTypes.value.unshift(aircraftType)
      
      return { success: true, data: aircraftType }
    } catch (err: any) {
      console.error('Create aircraft type error:', err)
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
   * Met à jour un type d'aéronef
   * Utilise PUT /aircraft-types/{aircraftType}
   */
  const updateAircraftType = async (id: number, data: AircraftTypeFormData) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<any>(`/aircraft-types/${id}`, {
        method: 'PUT',
        body: data
      })
      
      // L'API peut retourner soit { data: {...} } soit directement {...}
      let aircraftType: AircraftType
      
      if (response && typeof response === 'object') {
        aircraftType = response.data || response
      } else {
        throw new Error('Format de réponse invalide')
      }
      
      const index = aircraftTypes.value.findIndex(t => t.id === id)
      if (index !== -1) {
        aircraftTypes.value[index] = aircraftType
      }
      
      if (currentType.value?.id === id) {
        currentType.value = aircraftType
      }
      
      return { success: true, data: aircraftType }
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
   * Supprime un type d'aéronef
   * Utilise DELETE /aircraft-types/{aircraftType}
   */
  const deleteAircraftType = async (id: number) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      await apiFetch(`/aircraft-types/${id}`, { method: 'DELETE' })
      
      aircraftTypes.value = aircraftTypes.value.filter(t => t.id !== id)
      
      if (currentType.value?.id === id) {
        currentType.value = null
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

  const clearCurrentType = () => {
    currentType.value = null
  }

  return {
    // States
    aircraftTypes,
    currentType,
    loading,
    error,
    currentPage,
    lastPage,
    perPage,
    total,
    
    // Computed
    typesList,
    hasMorePages,
    
    // Actions
    resetPagination,
    fetchAircraftTypesPage,
    loadNextPage,
    fetchAircraftTypes,
    findAircraftType,
    fetchAircraftTypeKPIs,
    fetchOperatorsByType,
    fetchAircraftsByType,
    createAircraftType,
    updateAircraftType,
    deleteAircraftType,
    clearError,
    clearCurrentType
  }
})