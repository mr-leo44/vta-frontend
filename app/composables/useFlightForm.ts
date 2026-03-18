import { ref, computed } from 'vue'
import type { FlightFormData, Flight, LocationData } from '~/types/api'
import { parseLocationData, parseLocationPoint } from '~/types/api'

const emptyLocation = (): LocationData => ({
  from: { iata: '', name: '' },
  to: { iata: '', name: '' }
})

export const useFlightForm = () => {
  const formData = ref<FlightFormData>({
    flight_number: '',
    operator_id: 0,
    aircraft_id: 0,
    departure: emptyLocation(),
    arrival: emptyLocation(),
    departure_time: '',
    arrival_time: '',
    flight_regime: 'domestic',
    flight_type: 'regular',
    flight_nature: 'commercial',
    status: 'prevu',
    remarks: '',
    statistics: {
      passengers_count: 0,
      pax_bus: 0,
      go_pass_count: 0,
      fret_count: { departure: 0, arrival: 0 },
      excedents: { departure: 0, arrival: 0 },
      passengers_ecart: 0,
      has_justification: false,
      justification: {}
    }
  })

  const errors = ref<Record<string, string>>({})

  const formData_passengers_ecart = computed(() => {
    if (!formData.value.statistics) return 0
    return formData.value.statistics.passengers_count - formData.value.statistics.go_pass_count
  })

  const validateForm = (): boolean => {
    errors.value = {}

    if (!formData.value.flight_number.trim()) {
      errors.value.flight_number = 'Le numéro de vol est requis'
    }
    if (!formData.value.operator_id) {
      errors.value.operator_id = "L'exploitant est requis"
    }
    if (!formData.value.aircraft_id) {
      errors.value.aircraft_id = "L'aéronef est requis"
    }
    if (!formData.value.flight_regime) {
      errors.value.flight_regime = 'Le régime du vol est requis'
    }
    if (!formData.value.departure.from?.iata) {
      errors.value['departure.from.iata'] = 'Code IATA de départ (from) requis'
    }
    if (!formData.value.departure.from?.name) {
      errors.value['departure.from.name'] = "Nom de l'aéroport de départ (from) requis"
    }
    if (!formData.value.departure.to?.iata) {
      errors.value['departure.to.iata'] = 'Code IATA de départ (to) requis'
    }
    if (!formData.value.departure.to?.name) {
      errors.value['departure.to.name'] = "Nom de l'aéroport de départ (to) requis"
    }
    if (!formData.value.arrival.from?.iata) {
      errors.value['arrival.from.iata'] = "Code IATA d'arrivée (from) requis"
    }
    if (!formData.value.arrival.from?.name) {
      errors.value['arrival.from.name'] = "Nom de l'aéroport d'arrivée (from) requis"
    }
    if (!formData.value.arrival.to?.iata) {
      errors.value['arrival.to.iata'] = "Code IATA d'arrivée (to) requis"
    }
    if (!formData.value.arrival.to?.name) {
      errors.value['arrival.to.name'] = "Nom de l'aéroport d'arrivée (to) requis"
    }

    // Contrainte métier: departure.from ne peut pas être identique à arrival.from
    if (
      formData.value.departure.from?.iata &&
      formData.value.arrival.from?.iata &&
      formData.value.departure.from.iata === formData.value.arrival.from.iata
    ) {
      errors.value['arrival.from.iata'] = "L'aéroport de départ (from) ne peut pas être identique à l'aéroport d'arrivée (from)"
    }
    if (!formData.value.departure_time) {
      errors.value.departure_time = 'Heure de départ requise'
    }
    if (!formData.value.arrival_time) {
      errors.value.arrival_time = "Heure d'arrivée requise"
    }

    // Validation: l'heure d'arrivée doit être postérieure à l'heure de départ
    if (formData.value.departure_time && formData.value.arrival_time) {
      const departureDate = new Date(formData.value.departure_time)
      const arrivalDate = new Date(formData.value.arrival_time)
      
      if (departureDate <= arrivalDate) {
        errors.value.arrival_time = "L'heure de départ doit être postérieure à l'heure de d'arrivée"
      }
    }

    if (formData.value.statistics.passengers_count < formData.value.statistics.go_pass_count) {
      errors.value.go_pass_count = "Le nombre de passagers doit être supérieur ou égal au nombre de go pass récoltés"
    }

    if (formData.value.statistics.passengers_count < formData.value.statistics.pax_bus) {
      errors.value.pax_bus = "Le nombre de passagers doit être supérieur ou égal au nombre de passagers en bus"
    }

    return Object.keys(errors.value).length === 0
  }

  const resetForm = () => {
    formData.value = {
      flight_number: '',
      operator_id: 0,
      aircraft_id: 0,
      departure: emptyLocation(),
      arrival: emptyLocation(),
      departure_time: '',
      arrival_time: '',
      flight_regime: 'domestic',
      flight_type: 'regular',
      flight_nature: 'commercial',
      status: 'prevu',
      remarks: '',
      statistics: {
        passengers_count: 0,
        pax_bus: 0,
        go_pass_count: 0,
        fret_count: { departure: 0, arrival: 0 },
        excedents: { departure: 0, arrival: 0 },
        passengers_ecart: 0,
        has_justification: false,
        justification: {}
      }
    }
    errors.value = {}
  }

  const formatDateTimeForInput = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toISOString().slice(0, 16)
  }

  const loadFlightData = (flight: Flight) => {
    formData.value = {
      flight_number: flight.flight_number,
      operator_id: flight.operator?.id || 0,
      aircraft_id: flight.aircraft?.id || 0,
      departure: parseLocationData(flight.departure) ?? emptyLocation(),
      arrival: parseLocationData(flight.arrival) ?? emptyLocation(),
      departure_time: formatDateTimeForInput(flight.departure_time),
      arrival_time: formatDateTimeForInput(flight.arrival_time),
      flight_regime: flight.flight_regime,
      flight_type: typeof flight.flight_type === 'string' 
        ? flight.flight_type 
        : (flight.flight_type as any)?.value ?? 'regular',
      flight_nature: typeof flight.flight_nature === 'string' 
        ? flight.flight_nature 
        : (flight.flight_nature as any)?.value ?? 'commercial',
      status: flight.status,
      remarks: flight.remarks,
      statistics: flight.statistics ? {
        passengers_count: flight.statistics.passengers_count,
        pax_bus: flight.statistics.pax_bus,
        go_pass_count: flight.statistics.go_pass_count,
        fret_count: flight.statistics.fret_count || { departure: 0, arrival: 0 },
        excedents: flight.statistics.excedents || { departure: 0, arrival: 0 },
        passengers_ecart: flight.statistics.passengers_ecart,
        has_justification: flight.statistics.has_justification,
        justification: flight.statistics.justification || {}
      } : {
        passengers_count: 0,
        pax_bus: 0,
        go_pass_count: 0,
        fret_count: { departure: 0, arrival: 0 },
        excedents: { departure: 0, arrival: 0 },
        passengers_ecart: 0,
        has_justification: false,
        justification: {}
      }
    }
  }

  return {
    formData,
    errors,
    formData_passengers_ecart,
    validateForm,
    resetForm,
    loadFlightData,
    formatDateTimeForInput
  }
}