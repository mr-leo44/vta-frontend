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
  created_at: string | null
  updated_at: string | null
}

// ==================== API RESPONSES ====================
export interface ApiResponse<T> {
  data: T
}

export interface ValidationError {
  message: string
  errors: Record<string, string[]>
}