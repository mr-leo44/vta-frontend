import { ref } from 'vue'
import type { Operator, Aircraft, FlightJustification } from '~/types/api'


/**
 * Composable pour charger les listes partagées (dropdowns) :
 * - exploitants (operators)
 * - aéronefs (aircrafts)
 * - justifications
 */
export function useSharedDropdownData() {
  const loading = ref(false)

  const operators = ref<Operator[]>([])
  const aircrafts = ref<Aircraft[]>([])
  const justifications = ref<FlightJustification[]>([])

  const baseUrl = useRuntimeConfig().public.apiBase || '' // ex: 'https://api.monsite.com'

  /**
   * Charge la liste des exploitants
   */
  const loadOperators = async () => {
    loading.value = true
    try {
      const res = await $fetch<Operator[]>(`${baseUrl}/operators/all`)
      operators.value = res
    } catch (e) {
      console.error('Erreur lors du chargement des exploitants :', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Charge la liste des aéronefs
   */
  const loadAircrafts = async () => {
    loading.value = true
    try {
      const res = await $fetch<Aircraft[]>(`${baseUrl}/aircrafts/all`)
      aircrafts.value = res
    } catch (e) {
      console.error('Erreur lors du chargement des aéronefs :', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Charge la liste des justifications de vol
   */
  const loadJustifications = async () => {
    loading.value = true
    try {
      const res = await $fetch<FlightJustification[]>(`${baseUrl}/flight-justifications`)
      justifications.value = res
    } catch (e) {
      console.error('Erreur lors du chargement des justifications :', e)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    operators,
    aircrafts,
    justifications,
    loadOperators,
    loadAircrafts,
    loadJustifications
  }
}
