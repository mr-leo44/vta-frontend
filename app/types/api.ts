export type FlightStatus = 'qrf' | 'prevu' | 'atteri' | 'annule' | 'detourne'
export type FlightRegime = 'domestic' | 'international'
export type FlightType = 'regular' | 'non_regular'
export type FlightNature = 'commercial' | 'non_commercial'

export interface Operator {
  id: number
  name: string
  sigle: string
  iata_code: string | null
  icao_code: string | null
  country: string | null
  flight_type: {
    value: string
    label: string
  }
  flight_nature: {
    value: string
    label: string
  }
  created_at: string | null
  updated_at: string | null
}

export interface AircraftType {
  id: number
  name: string
  sigle: string
  created_at: string | null
  updated_at: string | null
}

export interface Aircraft {
  id: number
  immatriculation: string
  pmad: number | null
  in_activity: boolean
  aircraft_type: AircraftType
  operator: Operator
  created_at: string | null
  updated_at: string | null
}

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

export interface FlightJustification {
  id: number
  name: string
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

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}