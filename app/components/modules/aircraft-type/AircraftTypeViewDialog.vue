<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl md:max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Layers class="h-5 w-5 text-white" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              {{ aircraftType?.name }}
              <Badge variant="secondary" class="font-mono">{{ aircraftType?.sigle }}</Badge>
            </div>
          </div>
        </DialogTitle>
        <DialogDescription>
          Informations détaillées et statistiques du type d'aéronef
        </DialogDescription>
      </DialogHeader>

      <div v-if="aircraftType" class="space-y-6">
        <!-- KPIs Principaux -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <BarChart3 class="h-4 w-4" />
              Indicateurs clés ({{ currentYear }})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="loadingKPIs" class="grid gap-4 md:grid-cols-4">
              <Skeleton v-for="i in 4" :key="i" class="h-28 w-full" />
            </div>
            <div v-else-if="kpis" class="grid gap-4 md:grid-cols-4">
              <!-- Total Aéronefs -->
              <div class="relative p-5 border rounded-xl hover:shadow-md transition-all group bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Flotte</div>
                  <div class="h-10 w-10 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center shadow-md">
                    <Plane class="h-5 w-5 text-white" />
                  </div>
                </div>
                <div class="text-3xl font-bold text-blue-900 dark:text-blue-100">{{ kpis.total_aircrafts }}</div>
                <div class="text-xs mt-2 flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    <div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    {{ kpis.active_aircrafts }}
                  </span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <div class="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                    {{ kpis.inactive_aircrafts }}
                  </span>
                </div>
              </div>

              <!-- Exploitants -->
              <div class="relative p-5 border rounded-xl hover:shadow-md transition-all group bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Exploitants</div>
                  <div class="h-10 w-10 rounded-lg bg-purple-500 dark:bg-purple-600 flex items-center justify-center shadow-md">
                    <Building2 class="h-5 w-5 text-white" />
                  </div>
                </div>
                <div class="text-3xl font-bold text-purple-900 dark:text-purple-100">{{ kpis.total_operators }}</div>
                <div class="text-xs text-purple-600 dark:text-purple-400 mt-2">compagnies</div>
              </div>

              <!-- Vols -->
              <div class="relative p-5 border rounded-xl hover:shadow-md transition-all group bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Vols {{ currentYear }}</div>
                  <div class="h-10 w-10 rounded-lg bg-green-500 dark:bg-green-600 flex items-center justify-center shadow-md">
                    <PlaneTakeoff class="h-5 w-5 text-white" />
                  </div>
                </div>
                <div class="text-3xl font-bold text-green-900 dark:text-green-100">{{ kpis.total_flights_current_year.toLocaleString() }}</div>
                <div class="text-xs text-green-600 dark:text-green-400 mt-2">
                  {{ kpis.total_flights.toLocaleString() }} au total
                </div>
              </div>

              <!-- Taux d'activité -->
              <div class="relative p-5 border rounded-xl hover:shadow-md transition-all group bg-linear-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Utilisation</div>
                  <div class="h-10 w-10 rounded-lg bg-orange-500 dark:bg-orange-600 flex items-center justify-center shadow-md">
                    <Activity class="h-5 w-5 text-white" />
                  </div>
                </div>
                <div class="text-3xl font-bold text-orange-900 dark:text-orange-100">{{ kpis.utilization_rate }}%</div>
                <div class="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  {{ kpis.active_aircrafts }}/{{ kpis.total_aircrafts }} actifs
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Métriques secondaires -->
        <div class="grid gap-4 md:grid-cols-3">
          <Card class="border-2">
            <CardContent class="p-5">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Weight class="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div class="flex-1">
                  <div class="text-xs text-muted-foreground font-medium">PMAD moyen</div>
                  <div class="text-xl font-bold">{{ formatWeight(kpis?.average_pmad || 0) }}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="border-2">
            <CardContent class="p-5">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Target class="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div class="flex-1">
                  <div class="text-xs text-muted-foreground font-medium">Vols par aéronef</div>
                  <div class="text-xl font-bold">{{ kpis?.flights_per_aircraft || 0 }}</div>
                  <div class="text-xs text-muted-foreground">moyenne annuelle</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="border-2">
            <CardContent class="p-5">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <TrendingUp class="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div class="flex-1">
                  <div class="text-xs text-muted-foreground font-medium">Performance</div>
                  <div class="text-xl font-bold">{{ getPerformanceLabel(kpis?.flights_per_aircraft || 0) }}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Exploitants -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="text-base flex items-center gap-2">
                <Building2 class="h-4 w-4" />
                Exploitants utilisant ce type ({{ operators.length }})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="loadingOperators" class="space-y-2">
              <Skeleton v-for="i in 5" :key="i" class="h-20 w-full" />
            </div>
            <div v-else-if="operators.length === 0" class="text-center py-12">
              <Building2 class="h-16 w-16 mx-auto mb-3 text-muted-foreground opacity-20" />
              <p class="text-sm text-muted-foreground">Aucun exploitant n'utilise ce type</p>
            </div>
            <div v-else class="grid gap-3 md:grid-cols-2">
              <div
                v-for="operator in operators"
                :key="operator.id"
                class="flex items-center gap-3 p-4 border-2 rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div class="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <Building2 class="h-6 w-6 text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm truncate">{{ operator.name }}</div>
                  <div class="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <span class="font-mono">{{ operator.sigle }}</span>
                    <span v-if="operator.country">• {{ operator.country }}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-1 shrink-0">
                  <Badge variant="outline" class="gap-1 justify-center">
                    <Plane class="h-3 w-3" />
                    {{ operator.aircrafts_count }}
                  </Badge>
                  <Badge variant="default" class="gap-1 justify-center text-xs">
                    <div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    {{ operator.active_aircrafts_count }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Flotte -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="text-base flex items-center gap-2">
                <Plane class="h-4 w-4" />
                Flotte complète ({{ aircrafts.length }})
              </CardTitle>
              <div class="flex gap-2">
                <Badge variant="outline" class="gap-1">
                  <div class="h-2 w-2 rounded-full bg-green-500"></div>
                  {{ activeAircraftsCount }} actifs
                </Badge>
                <Badge variant="outline" class="gap-1">
                  <div class="h-2 w-2 rounded-full bg-gray-400"></div>
                  {{ inactiveAircraftsCount }} inactifs
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="loadingAircrafts" class="space-y-2">
              <Skeleton v-for="i in 5" :key="i" class="h-20 w-full" />
            </div>
            <div v-else-if="aircrafts.length === 0" class="text-center py-12">
              <Plane class="h-16 w-16 mx-auto mb-3 text-muted-foreground opacity-20" />
              <p class="text-sm text-muted-foreground">Aucun aéronef enregistré</p>
            </div>
            <div v-else class="space-y-2 max-h-96 overflow-y-auto pr-2">
              <div
                v-for="aircraft in aircrafts"
                :key="aircraft.id"
                class="flex items-center gap-3 p-4 border-2 rounded-xl hover:bg-muted/50 transition-all"
                :class="aircraft.in_activity ? 'border-green-200 dark:border-green-900' : 'border-gray-200 dark:border-gray-800'"
              >
                <div 
                  :class="[
                    'h-12 w-12 rounded-full flex items-center justify-center shrink-0 shadow-md',
                    aircraft.in_activity 
                      ? 'bg-linear-to-br from-green-500 to-green-600' 
                      : 'bg-linear-to-br from-gray-400 to-gray-500'
                  ]"
                >
                  <Plane class="h-6 w-6 text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-base font-mono">{{ aircraft.immatriculation }}</div>
                  <div class="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{{ aircraft.operator?.name || 'Opérateur inconnu' }}</span>
                    <span v-if="aircraft.pmad">• PMAD: {{ formatWeight(aircraft.pmad) }}</span>
                  </div>
                </div>
                <Badge 
                  :variant="aircraft.in_activity ? 'default' : 'secondary'"
                  class="shrink-0"
                >
                  {{ aircraft.in_activity ? 'Actif' : 'Inactif' }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <!-- Métadonnées -->
        <div class="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent class="p-4 flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <CalendarPlus class="h-5 w-5 text-muted-foreground" />
              </div>
              <div class="flex-1">
                <div class="text-xs text-muted-foreground font-medium">Date de création</div>
                <div class="font-semibold">{{ formatDate(aircraftType.created_at) }}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="p-4 flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <CalendarClock class="h-5 w-5 text-muted-foreground" />
              </div>
              <div class="flex-1">
                <div class="text-xs text-muted-foreground font-medium">Dernière modification</div>
                <div class="font-semibold">{{ formatDate(aircraftType.updated_at) }}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="isOpen = false">
          <X class="mr-2 h-4 w-4" />
          Fermer
        </Button>
        <Button @click="handleEdit">
          <Pencil class="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  Pencil,
  Layers, 
  Plane, 
  Building2,
  PlaneTakeoff,
  CalendarPlus,
  CalendarClock,
  X,
  BarChart3,
  Activity,
  Weight,
  Target,
  TrendingUp
} from 'lucide-vue-next'
import type { AircraftType, AircraftTypeKPIs, OperatorWithAircraftCount } from '~/types/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  aircraftType: AircraftType | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [aircraftType: AircraftType]
}>()

const aircraftTypesStore = useAircraftTypesStore()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const currentYear = new Date().getFullYear()
const kpis = ref<AircraftTypeKPIs | null>(null)
const operators = ref<OperatorWithAircraftCount[]>([])
const aircrafts = ref<any[]>([])

const loadingKPIs = ref(false)
const loadingOperators = ref(false)
const loadingAircrafts = ref(false)

const activeAircraftsCount = computed(() => 
  aircrafts.value.filter(a => a.in_activity).length
)

const inactiveAircraftsCount = computed(() => 
  aircrafts.value.filter(a => !a.in_activity).length
)

// Charger toutes les données quand le dialog s'ouvre
watch(() => props.open, async (open) => {
  if (open && props.aircraftType) {
    // Charger les KPIs
    loadingKPIs.value = true
    kpis.value = await aircraftTypesStore.fetchAircraftTypeKPIs(props.aircraftType.id)
    loadingKPIs.value = false

    // Charger les opérateurs
    loadingOperators.value = true
    operators.value = await aircraftTypesStore.fetchOperatorsByType(props.aircraftType.id)
    loadingOperators.value = false

    // Charger les aéronefs
    loadingAircrafts.value = true
    aircrafts.value = await aircraftTypesStore.fetchAircraftsByType(props.aircraftType.id)
    loadingAircrafts.value = false
  }
}, { immediate: true })

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatWeight = (weight: number) => {
  if (!weight) return '—'
  return `${weight.toLocaleString('fr-FR')} kg`
}

const getPerformanceLabel = (flightsPerAircraft: number) => {
  if (flightsPerAircraft > 200) return 'Excellent'
  if (flightsPerAircraft > 100) return 'Très bon'
  if (flightsPerAircraft > 50) return 'Bon'
  if (flightsPerAircraft > 20) return 'Moyen'
  return 'Faible'
}

const handleEdit = () => {
  if (props.aircraftType) {
    emit('edit', props.aircraftType)
    isOpen.value = false
  }
}
</script>