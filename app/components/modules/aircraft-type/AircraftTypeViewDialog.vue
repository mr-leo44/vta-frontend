<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl md:max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Layers class="h-5 w-5" />
          {{ aircraftType?.name }}
          <Badge variant="secondary" class="font-mono">{{ aircraftType?.sigle }}</Badge>
        </DialogTitle>
        <DialogDescription>
          Informations détaillées et statistiques du type d'aéronef
        </DialogDescription>
      </DialogHeader>

      <div v-if="aircraftType" class="space-y-6">
        <!-- Informations principales -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Info class="h-4 w-4" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 md:grid-cols-3">
              <div class="space-y-1">
                <label class="text-xs font-medium text-muted-foreground">Nom complet</label>
                <p class="text-sm font-semibold">{{ aircraftType.name }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-muted-foreground">Code ICAO</label>
                <p class="text-sm font-mono font-semibold">{{ aircraftType.sigle }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-muted-foreground">Enregistré le</label>
                <p class="text-sm">{{ formatDate(aircraftType.created_at) }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- KPIs -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <BarChart3 class="h-4 w-4" />
              Statistiques ({{ currentYear }})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="loadingKPIs" class="space-y-3">
              <div class="grid gap-4 md:grid-cols-4">
                <Skeleton class="h-24 w-full" />
                <Skeleton class="h-24 w-full" />
                <Skeleton class="h-24 w-full" />
                <Skeleton class="h-24 w-full" />
              </div>
            </div>
            <div v-else-if="kpis" class="space-y-4">
              <!-- KPIs principaux -->
              <div class="grid gap-4 md:grid-cols-4">
                <div class="p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-xs font-medium text-muted-foreground">Aéronefs</div>
                    <Plane class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div class="text-2xl font-bold">{{ kpis.total_aircrafts }}</div>
                  <div class="text-xs mt-1 flex items-center gap-2">
                    <span class="inline-flex items-center gap-1">
                      <div class="h-2 w-2 rounded-full bg-green-500"></div>
                      {{ kpis.active_aircrafts }}
                    </span>
                    <span class="text-muted-foreground">•</span>
                    <span class="inline-flex items-center gap-1 text-muted-foreground">
                      <div class="h-2 w-2 rounded-full bg-gray-400"></div>
                      {{ kpis.inactive_aircrafts }}
                    </span>
                  </div>
                </div>

                <div class="p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-xs font-medium text-muted-foreground">Exploitants</div>
                    <Building2 class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div class="text-2xl font-bold">{{ kpis.total_operators }}</div>
                  <div class="text-xs text-muted-foreground mt-1">compagnies</div>
                </div>

                <div class="p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-xs font-medium text-muted-foreground">Vols {{ currentYear }}</div>
                    <PlaneTakeoff class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div class="text-2xl font-bold">{{ kpis.total_flights_current_year }}</div>
                  <div class="text-xs text-muted-foreground mt-1">
                    {{ kpis.total_flights }} total
                  </div>
                </div>

                <div class="p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-xs font-medium text-muted-foreground">Taux d'activité</div>
                    <Activity class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div class="text-2xl font-bold">{{ kpis.utilization_rate }}%</div>
                  <div class="text-xs text-muted-foreground mt-1">
                    {{ kpis.active_aircrafts }}/{{ kpis.total_aircrafts }} actifs
                  </div>
                </div>
              </div>

              <!-- Métriques secondaires -->
              <div class="grid gap-4 md:grid-cols-3">
                <div class="p-3 border rounded-lg bg-muted/30">
                  <div class="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Weight class="h-3 w-3" />
                    PMAD moyen
                  </div>
                  <div class="text-lg font-semibold">
                    {{ formatWeight(kpis.average_pmad) }}
                  </div>
                </div>
                <div class="p-3 border rounded-lg bg-muted/30">
                  <div class="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Target class="h-3 w-3" />
                    Vols/aéronef
                  </div>
                  <div class="text-lg font-semibold">
                    {{ kpis.flights_per_aircraft }}
                  </div>
                  <div class="text-xs text-muted-foreground">par aéronef actif</div>
                </div>
                <div class="p-3 border rounded-lg bg-muted/30">
                  <div class="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <TrendingUp class="h-3 w-3" />
                    Performance
                  </div>
                  <div class="text-lg font-semibold">
                    {{ getPerformanceLabel(kpis.flights_per_aircraft) }}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Exploitants utilisant ce type -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="text-base flex items-center gap-2">
                <Building2 class="h-4 w-4" />
                Exploitants ({{ operators.length }})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="loadingOperators" class="space-y-2">
              <Skeleton v-for="i in 5" :key="i" class="h-16 w-full" />
            </div>
            <div v-else-if="operators.length === 0" class="text-center py-8 text-muted-foreground">
              <Building2 class="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p class="text-sm">Aucun exploitant n'utilise ce type</p>
            </div>
            <div v-else class="space-y-2 max-h-80 overflow-y-auto">
              <div
                v-for="operator in operators"
                :key="operator.id"
                class="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div class="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Building2 class="h-5 w-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm">{{ operator.name }}</div>
                  <div class="text-xs text-muted-foreground flex items-center gap-1">
                    <span class="font-mono">{{ operator.sigle }}</span>
                    <span v-if="operator.country">• {{ operator.country }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" class="gap-1">
                    <Plane class="h-3 w-3" />
                    {{ operator.aircrafts_count }}
                  </Badge>
                  <Badge variant="default" class="gap-1">
                    <div class="h-2 w-2 rounded-full bg-green-500"></div>
                    {{ operator.active_aircrafts_count }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Liste des aéronefs -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="text-base flex items-center gap-2">
                <Plane class="h-4 w-4" />
                Flotte ({{ aircrafts.length }})
              </CardTitle>
              <div class="flex gap-1">
                <Badge variant="outline" class="gap-1 text-xs">
                  <div class="h-2 w-2 rounded-full bg-green-500"></div>
                  {{ activeAircraftsCount }}
                </Badge>
                <Badge variant="outline" class="gap-1 text-xs">
                  <div class="h-2 w-2 rounded-full bg-gray-400"></div>
                  {{ inactiveAircraftsCount }}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="loadingAircrafts" class="space-y-2">
              <Skeleton v-for="i in 5" :key="i" class="h-16 w-full" />
            </div>
            <div v-else-if="aircrafts.length === 0" class="text-center py-8 text-muted-foreground">
              <Plane class="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p class="text-sm">Aucun aéronef enregistré</p>
            </div>
            <div v-else class="space-y-2 max-h-80 overflow-y-auto">
              <div
                v-for="aircraft in aircrafts"
                :key="aircraft.id"
                class="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div :class="[
                  'h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all',
                  aircraft.in_activity 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                ]">
                  <Plane class="h-5 w-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm font-mono">{{ aircraft.immatriculation }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ aircraft.operator?.name || 'Opérateur inconnu' }}
                    <span v-if="aircraft.pmad"> • PMAD: {{ formatWeight(aircraft.pmad) }}</span>
                  </div>
                </div>
                <Badge 
                  :variant="aircraft.in_activity ? 'default' : 'secondary'"
                  class="shrink-0 text-xs"
                >
                  {{ aircraft.in_activity ? 'Actif' : 'Inactif' }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <!-- Métadonnées -->
        <div class="grid gap-4 md:grid-cols-2 text-xs">
          <div class="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
            <CalendarPlus class="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <label class="font-medium text-muted-foreground">Créé le</label>
              <p class="mt-1 text-foreground">{{ formatDate(aircraftType.created_at) }}</p>
            </div>
          </div>
          <div class="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
            <CalendarClock class="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <label class="font-medium text-muted-foreground">Modifié le</label>
              <p class="mt-1 text-foreground">{{ formatDate(aircraftType.updated_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
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
  Info,
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
    day: 'numeric'
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