<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl md:max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Building2 class="h-5 w-5" />
          {{ operator?.name }}
          <Badge 
            :variant="operator?.flight_type.value === 'regular' ? 'default' : 'secondary'"
            class="ml-2"
          >
            {{ operator?.flight_type.value === 'regular' ? 'Régulier' : 'VNR' }}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Informations détaillées et statistiques de l'exploitant
        </DialogDescription>
      </DialogHeader>

      <div v-if="operator" class="space-y-6">
        <!-- Informations principales -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Info class="h-4 w-4" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div class="space-y-1">
                <label class="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Building2 class="h-3 w-3" />
                  Nom complet
                </label>
                <p class="text-sm font-semibold">{{ operator.name }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Tag class="h-3 w-3" />
                  Sigle
                </label>
                <p class="text-sm font-semibold font-mono">{{ operator.sigle }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin class="h-3 w-3" />
                  Pays
                </label>
                <p class="text-sm flex items-center gap-2">
                  {{ operator.country || '—' }}
                </p>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Ticket class="h-3 w-3" />
                  Code IATA
                </label>
                <p class="text-sm font-mono">{{ operator.iata_code || '—' }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Radio class="h-3 w-3" />
                  Code OACI
                </label>
                <p class="text-sm font-mono">{{ operator.icao_code || '—' }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-muted-foreground">Classification</label>
                <div class="flex gap-2 flex-wrap">
                  <Badge :variant="operator.flight_type.value === 'regular' ? 'default' : 'secondary'">
                    {{ operator.flight_type.label }}
                  </Badge>
                  <Badge :variant="operator.flight_nature.value === 'commercial' ? 'default' : 'outline'">
                    {{ operator.flight_nature.label }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- KPIs Vols -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <BarChart3 class="h-4 w-4" />
              Statistiques des vols ({{ currentYear }})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="loadingKPIs" class="space-y-3">
              <div class="grid gap-4 md:grid-cols-3">
                <Skeleton class="h-24 w-full" />
                <Skeleton class="h-24 w-full" />
                <Skeleton class="h-24 w-full" />
              </div>
              <div class="grid gap-4 md:grid-cols-4">
                <Skeleton class="h-20 w-full" />
                <Skeleton class="h-20 w-full" />
                <Skeleton class="h-20 w-full" />
                <Skeleton class="h-20 w-full" />
              </div>
            </div>
            <div v-else-if="kpis" class="space-y-4">
              <!-- KPIs principaux -->
              <!-- {{ flightsOfTheYear }} -->
              <div class="grid gap-4 md:grid-cols-3">
                <div class="p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-xs font-medium text-muted-foreground">Vols {{ currentYear }}</div>
                    <PlaneTakeoff class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div class="text-2xl font-bold">{{ kpis.total_flights_current_year }}</div>
                  <div class="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span>{{ kpis.total_flights_previous_year }} en {{ currentYear - 1 }}</span>
                  </div>
                </div>
                
                <div class="p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-xs font-medium text-muted-foreground">Croissance</div>
                    <TrendingUp 
                      v-if="kpis.growth_percentage >= 0" 
                      class="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" 
                    />
                    <TrendingDown 
                      v-else 
                      class="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform" 
                    />
                  </div>
                  <div class="text-2xl font-bold flex items-center gap-2">
                    <span :class="getGrowthColor(kpis.growth_percentage)">
                      {{ kpis.growth_percentage > 0 ? '+' : '' }}{{ kpis.growth_percentage }}%
                    </span>
                  </div>
                  <div class="text-xs text-muted-foreground mt-1">
                    <Badge :variant="getTrendVariant(kpis.growth_percentage)" class="text-xs">
                      {{ getTrendLabel(kpis.growth_percentage) }}
                    </Badge>
                  </div>
                </div>
                
                <div class="p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-xs font-medium text-muted-foreground">Flotte totale</div>
                    <Plane class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div class="text-2xl font-bold">{{ kpis.total_aircrafts }}</div>
                  <div class="text-xs mt-1 flex items-center gap-2">
                    <span class="inline-flex items-center gap-1">
                      <div class="h-2 w-2 rounded-full bg-green-500"></div>
                      {{ kpis.active_aircrafts_count }}
                    </span>
                    <span class="text-muted-foreground">•</span>
                    <span class="inline-flex items-center gap-1 text-muted-foreground">
                      <div class="h-2 w-2 rounded-full bg-gray-400"></div>
                      {{ kpis.inactive_aircrafts_count }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Métriques secondaires -->
              <div class="grid gap-4 md:grid-cols-4">
                <div class="p-3 border rounded-lg bg-muted/30">
                  <div class="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar class="h-3 w-3" />
                    Moyenne mensuelle
                  </div>
                  <div class="text-lg font-semibold">
                    {{ averageMonthlyFlights }}
                  </div>
                  <div class="text-xs text-muted-foreground">vols/mois</div>
                </div>
                <div class="p-3 border rounded-lg bg-muted/30">
                  <div class="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Activity class="h-3 w-3" />
                    Taux d'activité
                  </div>
                  <div class="text-lg font-semibold">
                    {{ activityRate }}%
                  </div>
                  <div class="text-xs text-muted-foreground">flotte active</div>
                </div>
                <div class="p-3 border rounded-lg bg-muted/30">
                  <div class="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Target class="h-3 w-3" />
                    Vols/aéronef
                  </div>
                  <div class="text-lg font-semibold">
                    {{ flightsPerAircraft }}
                  </div>
                  <div class="text-xs text-muted-foreground">moyenne</div>
                </div>
                <div class="p-3 border rounded-lg bg-muted/30">
                  <div class="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Gauge class="h-3 w-3" />
                    Performance
                  </div>
                  <div class="text-lg font-semibold flex items-center gap-1">
                    <ArrowUp v-if="kpis.growth_percentage > 10" class="h-4 w-4 text-green-600" />
                    <Minus v-else-if="Math.abs(kpis.growth_percentage) <= 10" class="h-4 w-4 text-yellow-600" />
                    <ArrowDown v-else class="h-4 w-4 text-red-600" />
                    <span>{{ getPerformanceLabel(kpis.growth_percentage) }}</span>
                  </div>
                  <div class="text-xs text-muted-foreground">tendance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Graphiques -->
        <OperatorKPIsCharts v-if="kpis && !loadingKPIs" :kpis="kpis" />

        <!-- Flotte et Vols en 2 colonnes -->
        <div class="grid gap-4 md:grid-cols-2">
          <!-- Flotte -->
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="text-base flex items-center gap-2">
                  <Plane class="h-4 w-4" />
                  Flotte ({{ operator.aircrafts?.length || 0 }})
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
              <div v-if="!operator.aircrafts || operator.aircrafts.length === 0" class="text-center py-8 text-muted-foreground">
                <Plane class="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p class="text-sm">Aucun aéronef</p>
              </div>
              <div v-else class="space-y-2 max-h-80 overflow-y-auto pr-2">
                <div
                  v-for="aircraft in sortedAircrafts"
                  :key="aircraft.id"
                  class="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div :class="[
                    'h-10 w-10 rounded-full flex items-center justify-center transition-all shrink-0',
                    aircraft.in_activity 
                      ? 'bg-green-100 text-green-700 group-hover:bg-green-200 group-hover:scale-110' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  ]">
                    <Plane class="h-5 w-5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm truncate">{{ aircraft.immatriculation }}</div>
                    <div class="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                      <span class="truncate">{{ aircraft.type?.name || 'Type inconnu' }}</span>
                      <span v-if="aircraft.type?.sigle" class="font-mono bg-muted px-1 rounded">
                        {{ aircraft.type.sigle }}
                      </span>
                    </div>
                    <div v-if="aircraft.pmad" class="text-xs text-muted-foreground mt-0.5">
                      PMAD: {{ formatWeight(aircraft.pmad) }}
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

          <!-- Vols récents -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <PlaneTakeoff class="h-4 w-4" />
                Vols récents ({{ recentFlights.length }})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="recentFlights.length === 0" class="text-center py-8 text-muted-foreground">
                <PlaneTakeoff class="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p class="text-sm">Aucun vol enregistré</p>
              </div>
              <div v-else class="space-y-2 max-h-80 overflow-y-auto pr-2">
                <div
                  v-for="flight in recentFlights"
                  :key="flight.id"
                  class="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div class="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <PlaneTakeoff class="h-5 w-5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm">{{ flight.flight_number }}</div>
                    <div class="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{{ flight.departure?.name + " (" + flight.departure?.iata +")" || 'N/A' }}</span>
                      <ArrowRight class="h-3 w-3" />
                      <span>{{ flight.arrival?.name + " (" + flight.arrival?.iata +")" || 'N/A' }}</span>
                    </div>
                  </div>
                  <div class="text-xs text-muted-foreground text-right shrink-0">
                    {{ formatFlightDate(flight.departure_time) }}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <!-- Métadonnées -->
        <div class="grid gap-4 md:grid-cols-2 text-xs">
          <div class="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
            <CalendarPlus class="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <label class="font-medium text-muted-foreground">Créé le</label>
              <p class="mt-1 text-foreground">{{ formatDate(operator.created_at) }}</p>
            </div>
          </div>
          <div class="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
            <CalendarClock class="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <label class="font-medium text-muted-foreground">Modifié le</label>
              <p class="mt-1 text-foreground">{{ formatDate(operator.updated_at) }}</p>
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
  MapPin, 
  Building2, 
  Plane, 
  TrendingUp, 
  TrendingDown,
  PlaneTakeoff,
  Calendar,
  CalendarPlus,
  CalendarClock,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Minus,
  X,
  Info,
  Tag,
  Ticket,
  Radio,
  BarChart3,
  Activity,
  Target,
  Gauge
} from 'lucide-vue-next'
import type { Operator, OperatorKPIs } from '~/types/api'
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
import OperatorKPIsCharts from '~/components/modules/operator/OperatorKPIsCharts.vue'

const props = defineProps<{
  operator: Operator | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [operator: Operator]
}>()

const operatorsStore = useOperatorsStore()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const kpis = ref<OperatorKPIs | null>(null)
const loadingKPIs = ref(false)

// Aéronefs triés (actifs en premier)
const sortedAircrafts = computed(() => {
  if (!props.operator?.aircrafts) return []
  return [...props.operator.aircrafts].sort((a, b) => {
    if (a.in_activity === b.in_activity) {
      return a.immatriculation.localeCompare(b.immatriculation)
    }
    return a.in_activity ? -1 : 1
  })
})

const activeAircraftsCount = computed(() => 
  props.operator?.aircrafts?.filter(a => a.in_activity).length || 0
)

const inactiveAircraftsCount = computed(() => 
  props.operator?.aircrafts?.filter(a => !a.in_activity).length || 0
)

// Vols récents (10 derniers)
const recentFlights = computed(() => {
  if (!props.operator?.flights) return []
  return [...props.operator.flights]
    .sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime())
    .slice(0, 10)
})

// Métriques calculées
const averageMonthlyFlights = computed(() => {
  if (!kpis.value) return 0
  return Math.round(kpis.value.total_flights_current_year / currentMonth)  
})

const activityRate = computed(() => {
  if (!kpis.value || kpis.value.total_aircrafts === 0) return 0
  return Math.round((kpis.value.active_aircrafts_count / kpis.value.total_aircrafts) * 100)
})

const flightsPerAircraft = computed(() => {
  if (!kpis.value || kpis.value.active_aircrafts_count === 0) return 0
  return Math.round(kpis.value.total_flights_current_year / kpis.value.active_aircrafts_count)
})

// Charger les KPIs
watch(() => props.open, async (open) => {
  if (open && props.operator) {
    loadingKPIs.value = true
    kpis.value = await operatorsStore.fetchOperatorKPIs(props.operator.id)
    loadingKPIs.value = false
  }
}, { immediate: true })

const getGrowthColor = (percentage: number) => {
  if (percentage > 10) return 'text-green-600'
  if (percentage < -10) return 'text-red-600'
  return 'text-yellow-600'
}

const getTrendLabel = (percentage: number) => {
  if (percentage > 20) return 'Forte hausse'
  if (percentage > 10) return 'Hausse'
  if (percentage > 0) return 'Légère hausse'
  if (percentage === 0) return 'Stable'
  if (percentage > -10) return 'Légère baisse'
  if (percentage > -20) return 'Baisse'
  return 'Forte baisse'
}

const getTrendVariant = (percentage: number): 'default' | 'secondary' | 'destructive' => {
  if (percentage > 10) return 'default'
  if (percentage < -10) return 'destructive'
  return 'secondary'
}

const getPerformanceLabel = (percentage: number) => {
  if (percentage > 10) return 'Excellent'
  if (percentage > 0) return 'Bon'
  if (percentage === 0) return 'Stable'
  if (percentage > -10) return 'Moyen'
  return 'Faible'
}

const formatWeight = (weight: number) => {
  return `${weight.toLocaleString('fr-FR')} kg`
}

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

const formatFlightDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays}j`
  
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short'
  })
}

const handleEdit = () => {
  if (props.operator) {
    emit('edit', props.operator)
    isOpen.value = false
  }
}
</script>