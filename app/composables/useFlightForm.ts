import { ref, computed } from 'vue'
import type { FlightFormData, Flight } from '~/types/api'

export const useFlightForm = () => {
  const formData = ref<FlightFormData>({
    flight_number: '',
    operator_id: 0,
    aircraft_id: 0,
    departure: { iata: '', name: '' },
    arrival: { iata: '', name: '' },
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
    if (!formData.value.departure.iata) {
      errors.value['departure.iata'] = 'Code IATA de départ requis'
    }
    if (!formData.value.departure.name) {
      errors.value['departure.name'] = "Nom de l'aéroport de départ requis"
    }
    if (!formData.value.arrival.iata) {
      errors.value['arrival.iata'] = "Code IATA d'arrivée requis"
    }
    if (!formData.value.arrival.name) {
      errors.value['arrival.name'] = "Nom de l'aéroport d'arrivée requis"
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
        errors.value.arrival_time = "L'heure de départ doit être postérieure à l'heure d'arrivée"
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
      departure: { iata: '', name: '' },
      arrival: { iata: '', name: '' },
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
      departure: flight.departure || { iata: '', name: '' },
      arrival: flight.arrival || { iata: '', name: '' },
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