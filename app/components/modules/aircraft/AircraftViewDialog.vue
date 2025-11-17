<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl md:max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 font-mono">
          <Plane class="h-5 w-5" />
          {{ aircraft?.immatriculation }}
        </DialogTitle>
        <DialogDescription>
          Informations détaillées et statistiques de l'aéronef
        </DialogDescription>
      </DialogHeader>

      <div v-if="aircraft" class="space-y-6">
        <!-- Informations principales -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Informations générales</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Immatriculation</label>
                <p class="text-base font-mono font-semibold">{{ aircraft.immatriculation }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Statut</label>
                <div class="mt-1">
                  <Badge :variant="aircraft.in_activity ? 'default' : 'secondary'">
                    {{ aircraft.in_activity ? 'En activité' : 'Inactif' }}
                  </Badge>
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Type d'aéronef</label>
                <p class="text-base flex items-center gap-2">
                  <Layers class="h-4 w-4" />
                  {{ aircraft.type?.name || 'Type inconnu' }}
                  <Badge v-if="aircraft.type?.sigle" variant="outline">{{ aircraft.type.sigle }}</Badge>
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Exploitant</label>
                <p class="text-base flex items-center gap-2">
                  <Building2 class="h-4 w-4" />
                  {{ aircraft.operator?.name || 'Exploitant inconnu' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">PMAD</label>
                <p class="text-base">
                  {{ aircraft.pmad ? `${aircraft.pmad.toLocaleString()} kg` : '—' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- KPIs Vols -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <TrendingUp class="h-4 w-4" />
              Statistiques des vols ({{ currentYear }})
            </CardTitle>
            <CardDescription class="text-xs text-amber-600">
              Ces données proviennent des livres de trafic et enregistré par les VTA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="loadingKPIs" class="space-y-3">
              <Skeleton class="h-20 w-full" />
              <Skeleton class="h-20 w-full" />
            </div>
            <div v-else-if="kpis" class="grid gap-4 md:grid-cols-3">
              <div class="p-4 border rounded-lg">
                <div class="text-sm text-muted-foreground">Vols cette année</div>
                <div class="text-2xl font-bold">{{ kpis.total_flights_current_year }}</div>
                <div class="text-xs text-muted-foreground mt-1">
                  {{ kpis.average_flights_per_month }} vols/mois en moyenne
                </div>
              </div>
              <div class="p-4 border rounded-lg">
                <div class="text-sm text-muted-foreground">Ce mois-ci</div>
                <div class="text-2xl font-bold">{{ kpis.total_flights_current_month }}</div>
                <div class="text-xs text-muted-foreground mt-1">
                  {{ currentMonth }}
                </div>
              </div>
              <div class="p-4 border rounded-lg">
                <div class="text-sm text-muted-foreground">Dernier vol</div>
                <div class="text-lg font-bold">
                  {{ kpis.last_flight_date ? formatDate(kpis.last_flight_date) : 'Aucun vol' }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Graphiques -->
        <AircraftKPIsCharts v-if="kpis && !loadingKPIs" :kpis="kpis" :flights="aircraft.flights" />

        <!-- Vols récents -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <PlaneTakeoff class="h-4 w-4" />
              Vols récents ({{ aircraft.flights?.length || 0 }})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="!aircraft.flights || aircraft.flights.length === 0" class="text-center py-8 text-muted-foreground">
              Aucun vol enregistré
            </div>
            <div v-else class="space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="flight in aircraft.flights.slice(0, 10)"
                :key="flight.id"
                class="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <PlaneTakeoff class="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div class="font-medium">{{ flight.flight_number }}</div>
                    <div class="text-sm text-muted-foreground">
                      {{ formatFlightRoute(flight.departure, flight.arrival) }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <Badge :variant="getStatusVariant(flight.status)">
                    {{ formatStatus(flight.status) }}
                  </Badge>
                  <div class="text-xs text-muted-foreground mt-1">
                    {{ formatDate(flight.departure_time) }}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <!-- Dates -->
        <div class="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
          <div>
            <label class="font-medium">Créé le</label>
            <p class="mt-1">{{ formatDate(aircraft.created_at) }}</p>
          </div>
          <div>
            <label class="font-medium">Modifié le</label>
            <p class="mt-1">{{ formatDate(aircraft.updated_at) }}</p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">
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
  Plane, 
  Building2, 
  Layers,
  TrendingUp,
  PlaneTakeoff
} from 'lucide-vue-next'
import type { Aircraft, AircraftKPIs, FlightStatus } from '~/types/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import AircraftKPIsCharts from '~/components/modules/aircraft/AircraftKPIsCharts.vue'

const props = defineProps<{
  aircraft: Aircraft | null
  open: boolean
}>()

const aircraftsStore = useAircraftsStore()


const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [aircraft: Aircraft]
}>()


const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const currentYear = new Date().getFullYear()
const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long' })
const kpis = ref<AircraftKPIs | null>(null)
const loadingKPIs = ref(false)

// Charger les KPIs quand le dialog s'ouvre
watch(() => props.open, async (open) => {
  if (open && props.aircraft) {
    loadingKPIs.value = true
    kpis.value = await aircraftsStore.fetchAircraftKPIs(props.aircraft.id)
    loadingKPIs.value = false
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

const formatFlightRoute = (departure: any[], arrival: any[]) => {
  const dep = departure?.name + ' (' + departure.iata + ')' || '???'
  const arr = arrival?.name + ' (' + arrival.iata + ')' || '???'
  return `${dep} → ${arr}`
}

const formatStatus = (status: FlightStatus) => {
  const statusMap: Record<FlightStatus, string> = {
    qrf: 'QRF',
    prevu: 'Prévu',
    atteri: 'Atterri',
    annule: 'Annulé',
    detourne: 'Détourné'
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: FlightStatus) => {
  if (status === 'atteri') return 'default'
  if (status === 'annule') return 'destructive'
  if (status === 'detourne') return 'secondary'
  return 'outline'
}

const handleEdit = () => {
  if (props.aircraft) {
    emit('edit', props.aircraft)
    isOpen.value = false
  }
}
</script>