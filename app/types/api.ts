// ==================== AUTH ====================
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expires_at: string
  user: AuthUser
}

export interface AuthUser {
  id: number
  name: string
  username: string
  function: string | null
  role: 'admin' | 'manager' | 'agent' | null
  permissions: string[]
  overrides?: PermissionOverride[]
}

// ==================== PERMISSION OVERRIDES ====================
export interface PermissionOverride {
  permission: string
  type: 'grant' | 'revoke'
  reason: string | null
  granted_by: string | null
  created_at: string
}

export interface UserPermissionsDetail {
  user: {
    id: number
    name: string
    role: string | null
    function: string | null
  }
  role_permissions: string[]
  effective_permissions: string[]
  overrides: PermissionOverride[]
}

// ==================== USERS (admin) ====================
export interface UserListItem {
  id: number
  name: string
  username: string
  role: string | null
  function: {
    value: string
    label: string | null
    start_date: string
  } | null
  created_at: string | null
}

// ==================== AUDIT ====================
export type AuditEvent =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'restored'
  | 'function_assigned'
  | 'permission_granted'
  | 'permission_revoked'

export interface AuditLogEntry {
  id: number
  event: AuditEvent
  event_label: string
  model: string
  model_id: number
  actor: {
    id: number
    name: string
    username: string
  } | null
  actor_ip: string | null
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  created_at: string
}

export interface AuditStats {
  total: number
  today: number
  this_week: number
  this_month: number
  by_event: Record<string, number>
  by_model: Record<string, number>
  top_actors: Array<{ actor: string; total: number }>
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
}

// ==================== AIRCRAFT TYPES ====================
export interface AircraftType {
  id: number
  name: string
  sigle: string
  default_pmad: number | 0
  created_at: string | null
  updated_at: string | null
}

export interface AircraftTypeFormData {
  name: string
  sigle: string
  default_pmad?: number | 0
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
  type: { id: number; name: string; sigle: string }
  operator: { id: number; name: string; sigle: string; iata_code: string; icao_code: string }
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

// ==================== FLIGHTS ====================
export type FlightStatus = 'qrf' | 'prevu' | 'embarque' | 'annule' | 'detourne'
export type FlightRegime = 'domestic' | 'international'
export type FlightType = 'regular' | 'non_regular'
export type FlightNature = 'commercial' | 'state' | 'test' | 'humanitare' | 'afreightment' | 'requisition'

export interface LocationPoint {
  iata: string
  name: string
}

export interface LocationData {
  from: LocationPoint
  to: LocationPoint
}

export const parseLocationPoint = (pt: any): LocationPoint | null => {
  if (pt && typeof pt === 'object' && typeof pt.iata === 'string' && typeof pt.name === 'string') {
    return { iata: pt.iata, name: pt.name }
  }
  return null
}

export const parseLocationData = (raw: any): LocationData | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const from = parseLocationPoint(raw.from)
  const to = parseLocationPoint(raw.to)
  if (!from || !to) return null
  return { from, to }
}

export const formatLocationPoint = (pt: any): string => {
  const parsed = parseLocationPoint(pt)
  if (!parsed) return 'Lieu introuvable'
  return `${parsed.iata} — ${parsed.name}`
}

export interface FreightData { departure: number; arrival: number }

export interface FlightStatistic {
  id?: number
  flight_id?: number
  passengers_count: number
  pax_bus: number
  go_pass_count: number
  fret_count: FreightData
  excedents: FreightData
  passengers_ecart?: number
  has_justification: boolean
  justification: Record<string, any>
  created_at?: string | null
  updated_at?: string | null
}

export interface Flight {
  id: number
  flight_number: string
  operator: { name: string; sigle: string; id?: number } | null
  aircraft: { immatriculation: String; type: String; id?: number }
  aircraft_id?: number
  flight_regime: FlightRegime
  flight_type: FlightType
  flight_nature: FlightNature
  status: FlightStatus
  departure: LocationData
  arrival: LocationData
  departure_time: string
  arrival_time: string
  remarks: string | null
  statistics?: FlightStatistic
}

export interface FlightFormData {
  flight_number: string
  operator_id: number
  aircraft_id: number
  departure: LocationData
  arrival: LocationData
  departure_time: string
  arrival_time: string
  flight_regime?: FlightRegime
  flight_type?: FlightType
  flight_nature?: FlightNature
  status?: FlightStatus
  remarks?: string | null
  statistics?: FlightStatisticsFormData
}

export interface FlightStatisticsFormData {
  passengers_count: number
  pax_bus: number
  go_pass_count: number
  fret_count: FreightData
  excedents: FreightData
  passengers_ecart?: number
  has_justification: boolean
  justification: Record<string, any>
}

export interface FlightJustification { id: number; name: string }

// ==================== API RESPONSES ====================
export interface ApiResponse<T> { data: T }

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
    links: Array<{ url: string | null; label: string; active: boolean }>
    path: string | null
    per_page: number
    to: number | null
    total: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// ==================== FLIGHT LABELS ====================
export const FLIGHT_STATUS_LABELS: Record<FlightStatus, string> = {
  qrf: 'QRF', prevu: 'Prévu', embarque: 'Embarqué', annule: 'Annulé', detourne: 'Détourné',
}

export const FLIGHT_STATUS_COLORS: Record<FlightStatus, string> = {
  qrf: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  prevu: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  embarque: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  annule: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  detourne: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

export const FLIGHT_REGIME_LABELS: Record<FlightRegime, string> = {
  domestic: 'Domestique', international: 'International',
}

export const FLIGHT_TYPE_LABELS: Record<FlightType, string> = {
  regular: 'Régulier', non_regular: 'Non régulier',
}

export const FLIGHT_NATURE_LABELS: Record<FlightNature, string> = {
  commercial: 'Vol Commercial', humanitare: 'Vol Humanitaire', state: "Vol d'Etat",
  test: 'Vol de Test', afreightment: "Vol d'Affrètement", requisition: 'Vol de Requisition',
}

// ==================== REPORTS (inchangé) ====================
export interface PaxRow { DATE?: string; MOIS?: string; traffic: number; gopass: number; paxbus: number }
export interface MetricRow { DATE?: string; MOIS?: string; traffic: number; idef: number }
export interface DomesticRegime { pax: PaxRow[]; fret: MetricRow[]; excedents: MetricRow[] }
export interface InternationalRegime {
  pax: PaxRow[]; fret_depart: MetricRow[]; fret_arrivee: MetricRow[]
  exced_depart: MetricRow[]; exced_arrivee: MetricRow[]
}
export interface ReportData {
  domestic: DomesticRegime; international: InternationalRegime
  idef_fret: any[]; monthly_rate?: number | null
}
