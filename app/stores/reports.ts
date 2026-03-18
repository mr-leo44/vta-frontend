import { defineStore } from 'pinia'
import { ref } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaxRow {
  DATE?: string
  MOIS?: string
  traffic: number
  gopass: number
  paxbus: number
}

export interface MetricRow {
  DATE?: string
  MOIS?: string
  traffic: number
  idef: number
}

export interface DomesticRegime {
  pax: PaxRow[]
  fret: MetricRow[]
  excedents: MetricRow[]
}

export interface InternationalRegime {
  pax: PaxRow[]
  fret_depart: MetricRow[]
  fret_arrivee: MetricRow[]
  exced_depart: MetricRow[]
  exced_arrivee: MetricRow[]
}

export interface IdefFretRow {
  DATE?: string
  MOIS?: string
  usd: number
  cdf: number
  rate?: number
}

export interface ReportData {
  domestic: DomesticRegime
  international: InternationalRegime
  idef_fret: IdefFretRow[]
  monthly_rate?: number | null
}

export interface OperatorMetric { traffic: number; idef: number }
export interface OperatorPax    { traffic: number; gopass: number; paxbus: number }

export interface OperatorGroup {
  pax:           Record<string, OperatorPax>
  fret?:         Record<string, OperatorMetric>
  excedents?:    Record<string, OperatorMetric>
  fret_depart?:  Record<string, OperatorMetric>
  fret_arrivee?: Record<string, OperatorMetric>
  exced_depart?: Record<string, OperatorMetric>
  exced_arrivee?:Record<string, OperatorMetric>
}

export interface ByOperatorsRegime {
  commercial:     OperatorGroup
  non_commercial: OperatorGroup
}

export interface ReportByOperatorsData {
  domestic:      ByOperatorsRegime
  international: ByOperatorsRegime
  idef_fret:     IdefFretRow[]
  monthly_rate?: number | null
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useReportStore = defineStore('report', () => {
  const { apiFetch } = useApi()
  const { error: toastError } = useToast()

  const monthlyData    = ref<ReportData | null>(null)
  const yearlyData     = ref<ReportData | null>(null)
  const monthlyByOps   = ref<ReportByOperatorsData | null>(null)
  const yearlyByOps    = ref<ReportByOperatorsData | null>(null)

  const loadingMonthly    = ref(false)
  const loadingYearly     = ref(false)
  const loadingMonthlyOps = ref(false)
  const loadingYearlyOps  = ref(false)

  async function fetchMonthly(month: string | number, year: string | number) {
    loadingMonthly.value = true
    try {
      monthlyData.value = await apiFetch<ReportData>(`/report/monthly/${month}/${year}`)
    } catch (err: any) {
      toastError('Erreur', err?.message ?? 'Impossible de charger les données mensuelles')
    } finally {
      loadingMonthly.value = false
    }
  }

  async function fetchYearly(year: string | number) {
    loadingYearly.value = true
    try {
      yearlyData.value = await apiFetch<ReportData>(`/report/yearly/${year}`)
    } catch (err: any) {
      toastError('Erreur', err?.message ?? 'Impossible de charger les données annuelles')
    } finally {
      loadingYearly.value = false
    }
  }

  async function fetchMonthlyByOperators(month: string | number, year: string | number) {
    loadingMonthlyOps.value = true
    try {
      monthlyByOps.value = await apiFetch<ReportByOperatorsData>(`/report/monthly/${month}/${year}/by-operators`)
    } catch (err: any) {
      toastError('Erreur', err?.message ?? 'Impossible de charger les données par opérateur')
    } finally {
      loadingMonthlyOps.value = false
    }
  }

  async function fetchYearlyByOperators(year: string | number) {
    loadingYearlyOps.value = true
    try {
      yearlyByOps.value = await apiFetch<ReportByOperatorsData>(`/report/yearly/${year}/by-operators`)
    } catch (err: any) {
      toastError('Erreur', err?.message ?? 'Impossible de charger les données annuelles par opérateur')
    } finally {
      loadingYearlyOps.value = false
    }
  }

  function $reset() {
    monthlyData.value = null; yearlyData.value = null
    monthlyByOps.value = null; yearlyByOps.value = null
  }

  return {
    monthlyData, yearlyData, monthlyByOps, yearlyByOps,
    loadingMonthly, loadingYearly, loadingMonthlyOps, loadingYearlyOps,
    fetchMonthly, fetchYearly, fetchMonthlyByOperators, fetchYearlyByOperators,
    $reset,
  }
})