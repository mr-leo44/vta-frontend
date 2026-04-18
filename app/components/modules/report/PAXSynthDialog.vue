<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-5xl md:max-w-6xl max-h-[90vh] flex flex-col gap-0 p-4">

      <!-- Header -->
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Users class="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <DialogTitle class="text-base font-semibold leading-tight">Synthèse PAX</DialogTitle>
              <p class="text-xs text-muted-foreground mt-0.5">Trafic passagers par compagnie · Quantités & %</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Tabs v-model="periodType" class="h-8">
              <TabsList class="h-8">
                <TabsTrigger value="monthly" class="h-7 text-xs px-3">Mensuel</TabsTrigger>
                <TabsTrigger value="yearly"  class="h-7 text-xs px-3">Annuel</TabsTrigger>
              </TabsList>
            </Tabs>

            <template v-if="periodType === 'monthly'">
              <Popover v-model:open="monthOpen">
                <PopoverTrigger as-child>
                  <Button variant="outline" size="sm" class="h-8 text-xs w-28 justify-between">
                    {{ selectedMonthLabel || 'Mois' }}
                    <ChevronsUpDown class="h-3 w-3 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-36 p-0" align="end">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        <CommandItem v-for="m in MONTHS" :key="m.value" :value="m.value"
                          @select="() => { selectedMonth = m.value; monthOpen = false }">
                          <Check :class="cn('mr-2 h-3.5 w-3.5', selectedMonth === m.value ? 'opacity-100' : 'opacity-0')" />
                          {{ m.label }}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </template>

            <Popover v-model:open="yearOpen">
              <PopoverTrigger as-child>
                <Button variant="outline" size="sm" class="h-8 text-xs w-24 justify-between">
                  {{ selectedYear || 'Année' }}
                  <ChevronsUpDown class="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-32 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Année…" />
                  <CommandEmpty>Aucune année.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem v-for="y in availableYears" :key="y" :value="String(y)"
                        @select="() => { selectedYear = String(y); yearOpen = false }">
                        <Check :class="cn('mr-2 h-3.5 w-3.5', selectedYear === String(y) ? 'opacity-100' : 'opacity-0')" />
                        {{ y }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button size="sm" class="h-8 text-xs" :disabled="loading" @click="load">
              <Loader2 v-if="loading" class="h-3.5 w-3.5 mr-1.5 animate-spin" />
              <Search v-else class="h-3.5 w-3.5 mr-1.5" />
              Charger
            </Button>

            <Button variant="outline" size="sm" class="h-8 text-xs" :disabled="!hasData || exporting"
              @click="exportData">
              <Loader2 v-if="exporting" class="h-3.5 w-3.5 mr-1.5 animate-spin" />
              <Download v-else class="h-3.5 w-3.5 mr-1.5" />
              Excel
            </Button>
          </div>
        </div>
      </DialogHeader>

      <!-- Content -->
      <div class="flex-1 overflow-hidden flex flex-col min-h-0">
        <Tabs v-model="regimeTab" class="flex flex-col flex-1 min-h-0">
          <div class="px-6 pt-3 shrink-0">
            <TabsList class="h-8">
              <TabsTrigger value="domestic"      class="text-xs h-7">National</TabsTrigger>
              <TabsTrigger value="international" class="text-xs h-7">International</TabsTrigger>
            </TabsList>
          </div>

          <div v-if="loading" class="flex-1 flex items-center justify-center">
            <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          <div v-else-if="!hasData" class="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Users class="h-10 w-10 opacity-20" />
            <p class="text-sm">Sélectionnez une période et cliquez sur Charger</p>
          </div>

          <template v-else>
            <!-- DOMESTIC -->
            <TabsContent value="domestic" class="flex-1 overflow-auto mt-0 px-4 pb-4 space-y-6">
              <PaxOperatorTable
                title="Commerciaux"
                color="blue"
                :operators="domesticCommercial"
                :is-international="false"
              />
              <PaxOperatorTable
                title="Non Commerciaux"
                color="violet"
                :operators="domesticNonCommercial"
                :is-international="false"
              />
            </TabsContent>

            <!-- INTERNATIONAL -->
            <TabsContent value="international" class="flex-1 overflow-auto mt-0 px-4 pb-4 space-y-6">
              <PaxOperatorTable
                title="Commerciaux"
                color="blue"
                :operators="internationalCommercial"
                :is-international="true"
              />
              <PaxOperatorTable
                title="Non Commerciaux"
                color="violet"
                :operators="internationalNonCommercial"
                :is-international="true"
              />
            </TabsContent>
          </template>
        </Tabs>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineComponent, h } from 'vue'
import {
  Users, Loader2, Search, Download,
  ChevronsUpDown, Check,
} from 'lucide-vue-next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { useReportStore } from '~/stores/reports'
import type { OperatorPax } from '~/types/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaxRow {
  sigle:   string
  traffic: number
  total:   number // always = traffic (paxbus excluded per spec)
}

// ─── Inline sub-component ─────────────────────────────────────────────────────

const PaxOperatorTable = defineComponent({
  props: {
    title:          { type: String,  required: true },
    color:          { type: String,  default: 'blue' },
    operators:      { type: Array as () => PaxRow[], required: true },
    isInternational:{ type: Boolean, default: false },
  },
  setup(props) {
    const totalTraffic = computed(() => props.operators.reduce((s, r) => s + r.traffic, 0))
    const totalGrand   = computed(() => props.operators.reduce((s, r) => s + r.total,   0))

    function pct(val: number, total: number) {
      if (!total) return '0,00%'
      return (val / total * 100).toFixed(2).replace('.', ',') + '%'
    }
    function fmt(n: number) { return n.toLocaleString('fr-FR') }

    const headerBg: Record<string, string> = {
      blue:   'bg-blue-600',
      violet: 'bg-violet-600',
    }

    return () => {
      if (!props.operators.length) return null
      const hc = headerBg[props.color] ?? 'bg-slate-600'

      const tdNum  = (v: number) =>
        h('td', { class: 'border border-border px-2 py-1.5 text-right font-mono' }, fmt(v))
      const tdPct  = (v: number, tot: number) =>
        h('td', { class: 'border border-border px-2 py-1.5 text-right font-mono text-muted-foreground text-[11px]' }, pct(v, tot))
      const tdTot  = (v: number) =>
        h('td', { class: 'border border-border px-2 py-1.5 text-right font-mono font-semibold bg-blue-50/60 dark:bg-blue-950/20' }, fmt(v))
      const tdTotP = (v: number, tot: number) =>
        h('td', { class: 'border border-border px-2 py-1.5 text-right font-mono text-[11px] bg-blue-50/60 dark:bg-blue-950/20' }, pct(v, tot))

      return h('div', { class: 'space-y-1' }, [
        h('p', { class: `text-xs font-semibold uppercase tracking-wider text-${props.color}-700 mb-2` }, props.title),
        h('div', { class: 'overflow-x-auto rounded-lg border' }, [
          h('table', { class: 'w-full text-xs border-collapse' }, [
            // ── THEAD ─────────────────────────────────────────────────────
            h('thead', [
              h('tr', { class: `${hc} text-white` }, [
                h('th', { rowspan: 2, class: 'border border-white/20 px-3 py-2 text-left font-semibold min-w-[2rem]' }, 'N°'),
                h('th', { rowspan: 2, class: 'border border-white/20 px-3 py-2 text-left font-semibold min-w-[3.5rem]' }, 'CIE'),
                h('th', { colspan: 2, class: 'border border-white/20 px-3 py-1.5 text-center font-semibold' }, 'Trafic'),
                h('th', { colspan: 2, class: 'border border-white/20 px-3 py-1.5 text-center font-semibold bg-indigo-700' }, 'TOTAL'),
              ]),
              h('tr', { class: `bg-${props.color}-500 text-white` }, [
                'Qté', '%', 'Qté', '%',
              ].map(lbl => h('th', { class: 'border border-white/20 px-2 py-1 text-center font-medium' }, lbl))),
            ]),
            // ── TBODY ─────────────────────────────────────────────────────
            h('tbody', [
              ...props.operators.map((row, i) =>
                h('tr', {
                  class: [i % 2 === 0 ? 'bg-background' : 'bg-muted/30', `hover:bg-${props.color}-50/30 transition-colors`],
                }, [
                  h('td', { class: 'border border-border px-3 py-1.5 text-center font-mono text-muted-foreground' }, i + 1),
                  h('td', { class: 'border border-border px-3 py-1.5 font-semibold' }, row.sigle),
                  tdNum(row.traffic),
                  tdPct(row.traffic, totalTraffic.value),
                  tdTot(row.total),
                  tdTotP(row.total, totalGrand.value),
                ])
              ),
              // ── TOTAL row ─────────────────────────────────────────────
              h('tr', { class: `bg-${props.color}-600/10 font-bold border-t-2 border-${props.color}-500` }, [
                h('td', { colspan: 2, class: 'border border-border px-3 py-2 font-bold' }, 'TOTAL'),
                h('td', { class: 'border border-border px-2 py-2 text-right font-mono font-bold' }, fmt(totalTraffic.value)),
                h('td', { class: 'border border-border px-2 py-2 text-right font-mono' }, '100%'),
                h('td', { class: 'border border-border px-2 py-2 text-right font-mono font-bold bg-blue-100/60 dark:bg-blue-900/20' }, fmt(totalGrand.value)),
                h('td', { class: 'border border-border px-2 py-2 text-right font-mono bg-blue-100/60 dark:bg-blue-900/20' }, '100%'),
              ]),
            ]),
          ]),
        ]),
      ])
    }
  },
})

// ─── Page logic ───────────────────────────────────────────────────────────────

const props = defineProps<{ open: boolean }>()
const emit  = defineEmits<{ 'update:open': [boolean] }>()

const store = useReportStore()
const { apiFetch } = useApi()
const { success, error } = useToast()

const periodType    = ref<'monthly' | 'yearly'>('monthly')
const regimeTab     = ref<'domestic' | 'international'>('domestic')
const selectedMonth = ref(String(new Date().getMonth() + 1).padStart(2, '0'))
const selectedYear  = ref(String(new Date().getFullYear()))
const monthOpen     = ref(false)
const yearOpen      = ref(false)
const exporting     = ref(false)

const MONTHS = [
  { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },    { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },     { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre'},{ value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },{ value: '12', label: 'Décembre' },
]

const now = new Date()
const availableYears = computed(() => {
  const years: number[] = []
  for (let i = 2025; i <= now.getFullYear() + 1; i++) years.push(i)
  return years.reverse()
})
const selectedMonthLabel = computed(() => MONTHS.find(m => m.value === selectedMonth.value)?.label ?? '')

// PAX uses the same by-operators endpoint as freight
const loading = computed(() =>
  periodType.value === 'monthly' ? store.loadingMonthlyOps : store.loadingYearlyOps
)
const data = computed(() =>
  periodType.value === 'monthly' ? store.monthlyByOps : store.yearlyByOps
)
const hasData = computed(() => !!data.value)

async function load() {
  if (periodType.value === 'monthly') {
    await store.fetchMonthlyByOperators(selectedMonth.value, selectedYear.value)
  } else {
    await store.fetchYearlyByOperators(selectedYear.value)
  }
}

// Map OperatorPax records → PaxRow[], filter zero-traffic, sort by total desc
function toPaxRows(
  paxGroup: Record<string, OperatorPax> | undefined,
  _isInternational: boolean
): PaxRow[] {
  if (!paxGroup) return []
  return Object.entries(paxGroup)
    .map(([sigle, d]) => {
      const traffic = d.traffic ?? 0
      return { sigle, traffic, total: traffic }
    })
    .filter(r => r.traffic > 0)
    .sort((a, b) => b.total - a.total)
}

const domesticCommercial = computed(() =>
  toPaxRows(data.value?.domestic.commercial?.pax, false)
)
const domesticNonCommercial = computed(() =>
  toPaxRows(data.value?.domestic.non_commercial?.pax, false)
)
const internationalCommercial = computed(() =>
  toPaxRows(data.value?.international.commercial?.pax, true)
)
const internationalNonCommercial = computed(() =>
  toPaxRows(data.value?.international.non_commercial?.pax, true)
)

async function exportData() {
  exporting.value = true
  try {
    const url = periodType.value === 'monthly'
      ? `/report/monthly/${selectedMonth.value}/${selectedYear.value}/pax-by-operators/export`
      : `/report/yearly/${selectedYear.value}/pax-by-operators/export`

    const response = await apiFetch(url, { method: 'GET', responseType: 'blob' })
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = periodType.value === 'monthly'
      ? `SYNTHESE PAX ${MONTHS.find(m => m.value === selectedMonth.value)?.label.toUpperCase()} ${selectedYear.value}.xlsx`
      : `SYNTHESE PAX ${selectedYear.value}.xlsx`
    link.click()
    success('Export réussi', 'Le fichier Excel a été téléchargé')
  } catch (err: any) {
    error('Erreur export', err?.message ?? 'Impossible de générer le fichier')
  } finally {
    exporting.value = false
  }
}

watch(() => props.open, (v) => { if (!v) store.$reset() })
</script>