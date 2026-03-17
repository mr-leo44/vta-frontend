<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-5xl md:max-w-6xl max-h-[90vh] flex flex-col gap-0 p-4">

      <!-- Header -->
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
              <TrendingUp class="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <DialogTitle class="text-base font-semibold leading-tight">Évolution du trafic</DialogTitle>
              <p class="text-xs text-muted-foreground mt-0.5">PAX · Fret · Excédents</p>
            </div>
          </div>
          <!-- Period selector + Export -->
          <div class="flex items-center gap-2">
            <Tabs v-model="periodType" class="h-8">
              <TabsList class="h-8">
                <TabsTrigger value="monthly" class="h-7 text-xs px-3">Mensuel</TabsTrigger>
                <TabsTrigger value="yearly"  class="h-7 text-xs px-3">Annuel</TabsTrigger>
              </TabsList>
            </Tabs>

            <!-- Period pickers -->
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
      {{ regimeTab }}

      <!-- Content -->
      <div class="flex-1 overflow-hidden flex flex-col min-h-0">
        <!-- Regime tabs -->
        <Tabs v-model="regimeTab" class="flex flex-col flex-1 min-h-0">
          <div class="px-6 pt-3 shrink-0">
            <TabsList class="h-8">
              <TabsTrigger value="domestic"      class="text-xs h-7">National</TabsTrigger>
              <TabsTrigger value="international" class="text-xs h-7">International</TabsTrigger>
            </TabsList>
          </div>

          <!-- Loading / Empty -->
          <div v-if="loading" class="flex-1 flex items-center justify-center">
            <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          <div v-else-if="!hasData" class="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <TrendingUp class="h-10 w-10 opacity-20" />
            <p class="text-sm">Sélectionnez une période et cliquez sur Charger</p>
          </div>

          <!-- Tables -->
          <template v-else>
            <!-- DOMESTIC -->
            <TabsContent value="domestic" class="flex-1 overflow-auto mt-0 px-4 pb-4">
              <table class="w-full text-xs border-collapse">
                <thead class="sticky top-0 z-10">
                  <tr class="bg-blue-600 text-white">
                    <th rowspan="2" class="border border-blue-500 px-3 py-2 text-left font-semibold min-w-24">
                      {{ periodType === 'monthly' ? 'Date' : 'Mois' }}
                    </th>
                    <th colspan="2" class="border border-blue-500 px-3 py-1.5 text-center font-semibold">PAX</th>
                    <th colspan="2" class="border border-blue-500 px-3 py-1.5 text-center font-semibold">FRET</th>
                    <th colspan="2" class="border border-blue-500 px-3 py-1.5 text-center font-semibold">EXCÉDENTS</th>
                  </tr>
                  <tr class="bg-blue-500 text-white">
                    <th class="border border-blue-400 px-2 py-1 text-center font-medium">Trafic</th>
                    <th class="border border-blue-400 px-2 py-1 text-center font-medium">Go-Pass</th>
                    <th class="border border-blue-400 px-2 py-1 text-center font-medium">Trafic</th>
                    <th class="border border-blue-400 px-2 py-1 text-center font-medium">IDEF</th>
                    <th class="border border-blue-400 px-2 py-1 text-center font-medium">Trafic</th>
                    <th class="border border-blue-400 px-2 py-1 text-center font-medium">IDEF</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in domesticRows" :key="i"
                    :class="i % 2 === 0 ? 'bg-background' : 'bg-muted/30'"
                    class="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                    <td class="border border-border px-3 py-1.5 font-medium text-left">{{ row.label }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono">{{ fmt(row.pax_traffic) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono">{{ fmt(row.pax_gopass) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono">{{ fmt(row.fret_traffic) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono text-emerald-700">{{ fmt(row.fret_idef) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono">{{ fmt(row.exced_traffic) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono text-emerald-700">{{ fmt(row.exced_idef) }}</td>
                  </tr>
                  <!-- Total row -->
                  <tr class="bg-blue-600/10 font-semibold border-t-2 border-blue-500">
                    <td class="border border-border px-3 py-2 font-bold">TOTAL</td>
                    <td class="border border-border px-2 py-2 text-right font-mono font-bold">{{ fmt(domesticTotals.pax_traffic) }}</td>
                    <td class="border border-border px-2 py-2 text-right font-mono font-bold">{{ fmt(domesticTotals.pax_gopass) }}</td>
                    <td class="border border-border px-2 py-2 text-right font-mono font-bold">{{ fmt(domesticTotals.fret_traffic) }}</td>
                    <td class="border border-border px-2 py-2 text-right font-mono font-bold text-emerald-700">{{ fmt(domesticTotals.fret_idef) }}</td>
                    <td class="border border-border px-2 py-2 text-right font-mono font-bold">{{ fmt(domesticTotals.exced_traffic) }}</td>
                    <td class="border border-border px-2 py-2 text-right font-mono font-bold text-emerald-700">{{ fmt(domesticTotals.exced_idef) }}</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>

            <!-- INTERNATIONAL -->
            <TabsContent value="international" class="flex-1 overflow-auto mt-0 px-4 pb-4">
              <table class="w-full text-xs border-collapse">
                <thead class="sticky top-0 z-10">
                  <tr class="bg-indigo-600 text-white">
                    <th rowspan="2" class="border border-indigo-500 px-3 py-2 text-left font-semibold min-w-24">
                      {{ periodType === 'monthly' ? 'Date' : 'Mois' }}
                    </th>
                    <th colspan="3" class="border border-indigo-500 px-3 py-1.5 text-center font-semibold">PAX</th>
                    <th colspan="2" class="border border-indigo-500 px-3 py-1.5 text-center font-semibold">FRET DÉPART</th>
                    <th colspan="2" class="border border-indigo-500 px-3 py-1.5 text-center font-semibold">FRET ARRIVÉE</th>
                    <th colspan="2" class="border border-indigo-500 px-3 py-1.5 text-center font-semibold">EXCÉD. DÉPART</th>
                    <th colspan="2" class="border border-indigo-500 px-3 py-1.5 text-center font-semibold">EXCÉD. ARRIVÉE</th>
                  </tr>
                  <tr class="bg-indigo-500 text-white">
                    <th v-for="h in ['Trafic','Go-Pass','PAX Bus','Trafic','IDEF','Trafic','IDEF','Trafic','IDEF','Trafic','IDEF']"
                      :key="h + Math.random()" class="border border-indigo-400 px-2 py-1 text-center font-medium whitespace-nowrap">
                      {{ h }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in internationalRows" :key="i"
                    :class="i % 2 === 0 ? 'bg-background' : 'bg-muted/30'"
                    class="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors">
                    <td class="border border-border px-3 py-1.5 font-medium text-left">{{ row.label }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono">{{ fmt(row.pax_traffic) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono">{{ fmt(row.pax_gopass) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono">{{ fmt(row.pax_paxbus) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono">{{ fmt(row.fret_dep_traffic) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono text-emerald-700">{{ fmt(row.fret_dep_idef) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono">{{ fmt(row.fret_arr_traffic) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono text-emerald-700">{{ fmt(row.fret_arr_idef) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono">{{ fmt(row.exced_dep_traffic) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono text-emerald-700">{{ fmt(row.exced_dep_idef) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono">{{ fmt(row.exced_arr_traffic) }}</td>
                    <td class="border border-border px-2 py-1.5 text-right font-mono text-emerald-700">{{ fmt(row.exced_arr_idef) }}</td>
                  </tr>
                  <!-- Total row -->
                  <tr class="bg-indigo-600/10 font-semibold border-t-2 border-indigo-500">
                    <td class="border border-border px-3 py-2 font-bold">TOTAL</td>
                    <td v-for="v in intlTotalsArr" :key="v + Math.random()"
                      class="border border-border px-2 py-2 text-right font-mono font-bold">{{ fmt(v) }}</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>
          </template>
        </Tabs>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  TrendingUp, Loader2, Search, Download,
  ChevronsUpDown, Check,
} from 'lucide-vue-next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { useReportStore } from '~/stores/reports'

const props = defineProps<{ open: boolean }>()
const emit  = defineEmits<{ 'update:open': [boolean] }>()

const store    = useReportStore()
const { apiFetch } = useApi()
const { success, error } = useToast()

// ── Period state ──────────────────────────────────────────────────────────────
const periodType   = ref<'monthly' | 'yearly'>('monthly')
const regimeTab    = ref<'domestic' | 'international'>('domestic')
const selectedMonth = ref(String(new Date().getMonth() + 1).padStart(2, '0'))
const selectedYear  = ref(String(new Date().getFullYear()))
const monthOpen    = ref(false)
const yearOpen     = ref(false)
const exporting    = ref(false)

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
  const years = []
  for (let i = 2025; i <= now.getFullYear() + 1; i++) years.push(i)
  return years.reverse()
})

const selectedMonthLabel = computed(
  () => MONTHS.find(m => m.value === selectedMonth.value)?.label ?? ''
)

// ── Data ──────────────────────────────────────────────────────────────────────
const loading = computed(() =>
  periodType.value === 'monthly' ? store.loadingMonthly : store.loadingYearly
)

const data = computed(() =>
  periodType.value === 'monthly' ? store.monthlyData : store.yearlyData
)

const hasData = computed(() => !!data.value)

async function load() {
  if (periodType.value === 'monthly') {
    await store.fetchMonthly(selectedMonth.value, selectedYear.value)
  } else {
    await store.fetchYearly(selectedYear.value)
  }
}

// ── Computed rows ─────────────────────────────────────────────────────────────
const domesticRows = computed(() => {
  if (!data.value) return []
  const d = data.value.domestic
  const len = d.pax.length
  return Array.from({ length: len }, (_, i) => ({
    label:        d.pax[i]?.DATE ?? d.pax[i]?.MOIS ?? '',
    pax_traffic:  d.pax[i]?.traffic  ?? 0,
    pax_gopass:   d.pax[i]?.gopass   ?? 0,
    fret_traffic: d.fret[i]?.traffic ?? 0,
    fret_idef:    d.fret[i]?.idef    ?? 0,
    exced_traffic:d.excedents[i]?.traffic ?? 0,
    exced_idef:   d.excedents[i]?.idef    ?? 0,
  }))
})

const domesticTotals = computed(() => ({
  pax_traffic:  sum(domesticRows.value, 'pax_traffic'),
  pax_gopass:   sum(domesticRows.value, 'pax_gopass'),
  fret_traffic: sum(domesticRows.value, 'fret_traffic'),
  fret_idef:    sum(domesticRows.value, 'fret_idef'),
  exced_traffic:sum(domesticRows.value, 'exced_traffic'),
  exced_idef:   sum(domesticRows.value, 'exced_idef'),
}))

const internationalRows = computed(() => {
  if (!data.value) return []
  const d = data.value.international
  const len = d.pax.length
  return Array.from({ length: len }, (_, i) => ({
    label:           d.pax[i]?.DATE ?? d.pax[i]?.MOIS ?? '',
    pax_traffic:     d.pax[i]?.traffic       ?? 0,
    pax_gopass:      d.pax[i]?.gopass        ?? 0,
    pax_paxbus:      d.pax[i]?.paxbus        ?? 0,
    fret_dep_traffic:d.fret_depart[i]?.traffic  ?? 0,
    fret_dep_idef:   d.fret_depart[i]?.idef     ?? 0,
    fret_arr_traffic:d.fret_arrivee[i]?.traffic ?? 0,
    fret_arr_idef:   d.fret_arrivee[i]?.idef    ?? 0,
    exced_dep_traffic:d.exced_depart[i]?.traffic  ?? 0,
    exced_dep_idef:   d.exced_depart[i]?.idef     ?? 0,
    exced_arr_traffic:d.exced_arrivee[i]?.traffic ?? 0,
    exced_arr_idef:   d.exced_arrivee[i]?.idef    ?? 0,
  }))
})

const intlTotalsArr = computed(() => {
  const r = internationalRows.value
  return [
    sum(r, 'pax_traffic'), sum(r, 'pax_gopass'), sum(r, 'pax_paxbus'),
    sum(r, 'fret_dep_traffic'), sum(r, 'fret_dep_idef'),
    sum(r, 'fret_arr_traffic'), sum(r, 'fret_arr_idef'),
    sum(r, 'exced_dep_traffic'), sum(r, 'exced_dep_idef'),
    sum(r, 'exced_arr_traffic'), sum(r, 'exced_arr_idef'),
  ]
})

// ── Export ────────────────────────────────────────────────────────────────────
async function exportData() {
  exporting.value = true
  try {
    let url = periodType.value === 'monthly'
      ? `/report/monthly/${selectedMonth.value}/${selectedYear.value}/export`
      : `/report/yearly/${selectedYear.value}/export`

    const response = await apiFetch(url, { method: 'GET', responseType: 'blob' })
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = periodType.value === 'monthly'
      ? `TRAFIC_${MONTHS.find(m => m.value === selectedMonth.value)?.label.toUpperCase()}_${selectedYear.value}.xlsx`
      : `TRAFIC_ANNUEL_${selectedYear.value}.xlsx`
    link.click()
    success('Export réussi', 'Le fichier Excel a été téléchargé')
  } catch (err: any) {
    error('Erreur export', err?.message ?? 'Impossible de générer le fichier')
  } finally {
    exporting.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sum(arr: any[], key: string) {
  return arr.reduce((s, r) => s + (r[key] ?? 0), 0)
}
function fmt(n: number) {
  return n.toLocaleString('fr-FR')
}

// Reset data when dialog closes
watch(() => props.open, (v) => { if (!v) store.$reset() })
</script>