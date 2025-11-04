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
  aircraft_type?: AircraftType
  operator?: Operator
  created_at: string | null
  updated_at: string | null
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
  total_flights_current_year: number
  total_flights_previous_year: number
  growth_percentage: number
  active_aircrafts_count: number
  inactive_aircrafts_count: number
  total_aircrafts: number
  fleet_average_age?: number
  most_used_aircraft_type?: string
  avg_passengers_per_flight?: number
  on_time_performance?: number
}