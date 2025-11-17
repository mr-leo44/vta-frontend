import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AircraftType, ApiResponse, AircraftTypeKPIs } from '~/types/api'

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

export const useAircraftTypesStore = defineStore('aircraftTypes', () => {
  // Liste complète (pas de pagination pour les types d'aéronefs)
  const aircraftTypes = ref<AircraftType[]>([])
  
  const currentAircraftType = ref<AircraftType | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const aircraftTypesList = computed(() => aircraftTypes.value)
  const total = computed(() => aircraftTypes.value.length)

  /**
   * Récupère tous les types d'aéronefs
   * Utilise GET /aircraft-types
   */
  const fetchAircraftTypes = async () => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<AircraftType[]>>('/aircraft-types')
      aircraftTypes.value = response.data || []
      
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère un type d'aéronef par ID
   * Note: L'API n'a pas de route /aircraft-types/{id}
   * On récupère depuis la liste complète
   */
  const fetchAircraftType = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      // Si la liste est vide, on la charge
      if (aircraftTypes.value.length === 0) {
        await fetchAircraftTypes()
      }
      
      const aircraftType = aircraftTypes.value.find(t => t.id === id)
      
      if (!aircraftType) {
        throw new Error('Type d\'aéronef non trouvé')
      }
      
      currentAircraftType.value = aircraftType
      return { success: true, data: aircraftType }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Recherche des types d'aéronefs par nom ou sigle
   * Utilise GET /aircraft-types/find/{query}
   */
  const searchAircraftTypes = async (query: string) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<AircraftType>(`/aircraft-types/find/${encodeURIComponent(query)}`)
      
      // L'API retourne un seul type ou null, on le met dans un tableau
      const results = response ? [response] : []
      
      return { success: true, data: results }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value, data: [] }
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère les KPIs d'un type d'aéronef
   * Calcule à partir des aéronefs de ce type
   */
  const fetchAircraftTypeKPIs = async (id: number): Promise<AircraftTypeKPIs> => {
    try {
      // Charger tous les aéronefs pour calculer les KPIs
      const { apiFetch } = useApi()
      const aircraftsResponse = await apiFetch<ApiResponse<any[]>>('/aircrafts/all')
      const allAircrafts = aircraftsResponse.data || []
      
      // Filtrer les aéronefs de ce type
      const typeAircrafts = allAircrafts.filter(a => a.aircraft_type_id === id)
      
      // Calculer les opérateurs uniques utilisant ce type
      const uniqueOperators = new Set(typeAircrafts.map(a => a.operator_id))
      
      // Calculer les aéronefs actifs/inactifs
      const activeAircrafts = typeAircrafts.filter(a => a.in_activity)
      const inactiveAircrafts = typeAircrafts.filter(a => !a.in_activity)
      
      // Calculer les vols totaux
      const totalFlights = typeAircrafts.reduce((sum, a) => {
        return sum + (a.flights?.length || 0)
      }, 0)
      
      // Calculer les vols de l'année en cours
      const currentYear = new Date().getFullYear()
      const currentYearFlights = typeAircrafts.reduce((sum, a) => {
        const yearFlights = a.flights?.filter((f: any) => 
          new Date(f.departure_time).getFullYear() === currentYear
        ) || []
        return sum + yearFlights.length
      }, 0)
      
      // Calculer le PMAD moyen
      const aircraftsWithPmad = typeAircrafts.filter(a => a.pmad)
      const averagePmad = aircraftsWithPmad.length > 0
        ? Math.round(aircraftsWithPmad.reduce((sum, a) => sum + (a.pmad || 0), 0) / aircraftsWithPmad.length)
        : 0
      
      // Calculer les vols par aéronef actif
      const flightsPerAircraft = activeAircrafts.length > 0
        ? Math.round(currentYearFlights / activeAircrafts.length)
        : 0
      
      return {
        total_aircrafts: typeAircrafts.length,
        active_aircrafts: activeAircrafts.length,
        inactive_aircrafts: inactiveAircrafts.length,
        total_operators: uniqueOperators.size,
        total_flights: totalFlights,
        total_flights_current_year: currentYearFlights,
        average_pmad: averagePmad,
        flights_per_aircraft: flightsPerAircraft,
        utilization_rate: typeAircrafts.length > 0 
          ? Math.round((activeAircrafts.length / typeAircrafts.length) * 100) 
          : 0
      }
    } catch (err) {
      console.error('Failed to fetch KPIs:', err)
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
   * Récupère les opérateurs utilisant ce type d'aéronef
   */
  const fetchOperatorsByType = async (typeId: number) => {
    try {
      const { apiFetch } = useApi()
      
      // Charger tous les aéronefs
      const aircraftsResponse = await apiFetch<ApiResponse<any[]>>('/aircrafts/all')
      const allAircrafts = aircraftsResponse.data || []
      
      // Filtrer les aéronefs de ce type
      const typeAircrafts = allAircrafts.filter(a => a.aircraft_type_id === typeId)
      
      // Extraire les opérateurs uniques avec leurs infos complètes
      const operatorsMap = new Map()
      
      typeAircrafts.forEach(aircraft => {
        if (aircraft.operator && !operatorsMap.has(aircraft.operator.id)) {
          operatorsMap.set(aircraft.operator.id, {
            ...aircraft.operator,
            aircrafts_count: 0,
            active_aircrafts_count: 0
          })
        }
        
        if (aircraft.operator) {
          const op = operatorsMap.get(aircraft.operator.id)
          op.aircrafts_count++
          if (aircraft.in_activity) {
            op.active_aircrafts_count++
          }
        }
      })
      
      return Array.from(operatorsMap.values())
    } catch (err) {
      console.error('Failed to fetch operators by type:', err)
      return []
    }
  }

  /**
   * Récupère les aéronefs d'un type spécifique
   */
  const fetchAircraftsByType = async (typeId: number) => {
    try {
      const { apiFetch } = useApi()
      
      // Charger tous les aéronefs
      const aircraftsResponse = await apiFetch<ApiResponse<any[]>>('/aircrafts/all')
      const allAircrafts = aircraftsResponse.data || []
      
      // Filtrer et trier par statut puis immatriculation
      return allAircrafts
        .filter(a => a.aircraft_type_id === typeId)
        .sort((a, b) => {
          if (a.in_activity === b.in_activity) {
            return a.immatriculation.localeCompare(b.immatriculation)
          }
          return a.in_activity ? -1 : 1
        })
    } catch (err) {
      console.error('Failed to fetch aircrafts by type:', err)
      return []
    }
  }

  /**
   * Crée un nouveau type d'aéronef
   */
  const createAircraftType = async (data: { name: string; sigle: string }) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<AircraftType>('/aircraft-types', {
        method: 'POST',
        body: data
      })
      
      aircraftTypes.value.push(response)
      
      return { success: true, data: response }
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
   * Met à jour un type d'aéronef
   */
  const updateAircraftType = async (id: number, data: { name?: string; sigle?: string }) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<AircraftType>(`/aircraft-types/${id}`, {
        method: 'PUT',
        body: data
      })
      
      const index = aircraftTypes.value.findIndex(t => t.id === id)
      if (index !== -1) {
        aircraftTypes.value[index] = response
      }
      
      if (currentAircraftType.value?.id === id) {
        currentAircraftType.value = response
      }
      
      return { success: true, data: response }
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
   */
  const deleteAircraftType = async (id: number) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      await apiFetch(`/aircraft-types/${id}`, { method: 'DELETE' })
      
      aircraftTypes.value = aircraftTypes.value.filter(t => t.id !== id)
      
      if (currentAircraftType.value?.id === id) {
        currentAircraftType.value = null
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

  const clearCurrentAircraftType = () => {
    currentAircraftType.value = null
  }

  return {
    // States
    aircraftTypes,
    currentAircraftType,
    loading,
    error,
    total,
    
    // Computed
    aircraftTypesList,
    
    // Actions
    fetchAircraftTypes,
    fetchAircraftType,
    searchAircraftTypes,
    fetchAircraftTypeKPIs,
    fetchOperatorsByType,
    fetchAircraftsByType,
    createAircraftType,
    updateAircraftType,
    deleteAircraftType,
    clearError,
    clearCurrentAircraftType
  }
})