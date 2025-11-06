// ==================== AUTH ====================
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface User {
  id: number
  username: string
  email?: string
  name?: string
}

// ==================== OPERATORS ====================
export interface Operator {
  id: number
  name: string
  sigle: string
  iata_code: string | null
  icao_code: string | null
  country: string | null
  flight_type: {
    value: 'regular' | 'non_regular'
    label: string
  }
  flight_nature: {
    value: 'commercial' | 'non_commercial'
    label: string
  }
  flights?: Flight[]
  aircrafts?: Aircraft[]
  created_at: string | null
  updated_at: string | null
}

export interface OperatorFormData {
  name: string
  sigle: string
  iata_code?: string | null
  icao_code?: string | null
  country?: string | null
  flight_type: 'regular' | 'non_regular'
  flight_nature: 'commercial' | 'non_commercial'
}

// ==================== AIRCRAFT TYPES ====================
export interface AircraftType {
  id: number
  name: string
  sigle: string
  created_at: string | null
  updated_at: string | null
}
// ==================== AIRCRAFTS ====================
export interface Aircraft {
  id: number
  immatriculation: string
  pmad: number | null
  in_activity: boolean
  aircraft_type_id: number
  operator_id: number
  type?: AircraftType
  operator?: Operator
  flights?: Flight[]
  created_at: string | null
  updated_at: string | null
}

export interface AircraftResource {
  id: number
  immatriculation: string
  pmad: number | null
  in_activity: number
  type: {
    id: number
    name: string
    sigle: string
  }
  operator: {
    id: number
    name: string
    sigle: string
    iata_code: string
    icao_code: string
  }
  flights: Flight[]
  created_at: string | null
  updated_at: string | null
}

export interface AircraftFormData {
  immatriculation: string
  pmad?: number | null
  in_activity: boolean
  aircraft_type_id: number
  operator_id: number
}

// ==================== AIRCRAFTS - KPIs ====================
export interface AircraftKPIs {
  // Vols
  total_flights_current_year: number
  total_flights_current_month: number
  average_flights_per_month: number

  // Statut
  is_active: boolean
  pmad: number | null

  // Performance (données génériques - à implémenter côté API)
  total_flight_hours: number          // Total heures de vol
  average_flight_duration: number     // Durée moyenne d'un vol (minutes)
  utilization_rate: number            // Taux d'utilisation (%)
  last_flight_date: string | null     // Date du dernier vol

  // Suggestions pour l'API:
  // - GET /aircrafts/{id}/kpis pour obtenir ces données
  // - Ajouter dans la réponse:
  //   * maintenance_hours?: number
  //   * next_maintenance_date?: string
  //   * fuel_consumption?: number
  //   * destinations_count?: number
  //   * most_frequent_route?: string
  //   * flight_status_breakdown?: {
  //       completed: number
  //       scheduled: number
  //       cancelled: number
  //       diverted: number
  //     }
}

// ==================== AIRCRAFTS - FILTERS ====================
export interface AircraftFilters {
  operator_id?: number | null
  aircraft_type_id?: number | null
  in_activity?: boolean | null
  pmad_min?: number | null
  pmad_max?: number | null
  has_flights?: boolean
  sort_by?: 'immatriculation' | 'created_at' | 'pmad' | 'operator' | 'type'
  sort_order?: 'asc' | 'desc'
}

// ==================== AIRCRAFTS - MONTHLY STATS ====================
// Suggestion pour endpoint: GET /aircrafts/{id}/monthly-stats?year=2025
export interface AircraftMonthlyStats {
  year: number
  months: Array<{
    month: number
    flights_count: number
    flight_hours: number
    destinations_count: number
    average_passengers?: number
    cancelled_count?: number
  }>
}

// ==================== AIRCRAFTS - MAINTENANCE ====================
// Suggestion pour tracking de maintenance
export interface AircraftMaintenance {
  id: number
  aircraft_id: number
  maintenance_type: 'routine' | 'repair' | 'inspection' | 'overhaul'
  scheduled_date: string
  completed_date: string | null
  duration_hours: number
  cost?: number
  description?: string
  next_maintenance_date?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

// ==================== AIRCRAFTS - UTILIZATION ====================
// Suggestion pour suivi d'utilisation détaillé
export interface AircraftUtilization {
  aircraft_id: number
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
  total_flights: number
  total_hours: number
  available_hours: number
  utilization_rate: number // Pourcentage
  revenue_hours?: number
  non_revenue_hours?: number
}
// ==================== FLIGHTS ====================
export type FlightStatus = 'qrf' | 'prevu' | 'atteri' | 'annule' | 'detourne'
export type FlightRegime = 'domestic' | 'international'
export type FlightType = 'regular' | 'non_regular'
export type FlightNature = 'commercial' | 'non_commercial'

export interface FlightStatistic {
  id: number
  flight_id: number
  passengers_count: number
  pax_bus: number
  go_pass_count: number
  fret_count: any[] | null
  excedents: any[] | null
  passengers_ecart: number
  has_justification: boolean
  justification: any[] | null
  created_at: string | null
  updated_at: string | null
}

export interface Flight {
  id: number
  flight_number: string
  operator: {
    name: string
    sigle: string
  } | null
  aircraft: string
  flight_regime: FlightRegime
  flight_type: FlightType
  flight_nature: FlightNature
  status: FlightStatus
  departure: any[]
  arrival: any[]
  departure_time: string
  arrival_time: string
  remarks: string | null
  statistics?: FlightStatistic
}

// ==================== FLIGHT JUSTIFICATIONS ====================
export interface FlightJustification {
  id: number
  name: string
}

// ==================== API RESPONSES ====================
export interface ApiResponse<T> {
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    path: string | null
    per_page: number
    to: number | null
    total: number
  }
}

export interface ValidationError {
  message: string
  errors: Record<string, string[]>
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// ==================== KPIs ====================
export interface OperatorKPIs {
  // Vols
  total_flights_current_year: number
  total_flights_previous_year: number
  growth_percentage: number

  // Flotte
  active_aircrafts_count: number
  inactive_aircrafts_count: number
  total_aircrafts: number
  fleet_average_age?: number

  // Performance
  on_time_performance?: number  // % de vols à l'heure
  cancellation_rate?: number     // % de vols annulés
  avg_delay_minutes?: number     // Délai moyen en minutes

  // Passagers
  avg_passengers_per_flight?: number
  total_passengers_current_year?: number
  load_factor?: number  // Taux de remplissage en %

  // Réseau
  total_destinations?: number
  domestic_routes_count?: number
  international_routes_count?: number
  most_frequent_destination?: string

  // Types d'appareils
  most_used_aircraft_type?: string
  aircraft_types_count?: number

  // Comparaison
  market_share?: number  // Part de marché en %
  ranking?: number       // Classement parmi les opérateurs
}