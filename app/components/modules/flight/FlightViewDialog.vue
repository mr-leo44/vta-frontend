<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-5xl md:max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-linear-to-br from-sky-500 to-sky-600 flex items-center justify-center">
            <PlaneTakeoff class="h-5 w-5 text-white" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              {{ flight?.flight_number }}
              <Badge variant="secondary" class="font-mono">{{ flight?.status }}</Badge>
              <Badge variant="default" class="font-mono">{{ getFlightNature(flight) }}</Badge>
            </div>
            <div class="text-xs text-muted-foreground mt-1">
              {{ formatDateTime(flight?.departure_time) }}
            </div>
          </div>
        </DialogTitle>
        <DialogDescription>
          Informations détaillées et statistiques du vol
        </DialogDescription>
      </DialogHeader>

      <div v-if="flight" class="space-y-4">
        <!-- Itinéraire Principal -->
        <Card class="border-2 bg-linear-to-r from-sky-50/50 to-blue-50/50 dark:from-sky-950/20 dark:to-blue-950/20">
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="text-sm text-muted-foreground mb-1">Aéroport de départ</div>
                <div class="text-3xl font-bold text-sky-900 dark:text-sky-100">{{ formatLocationIata(flight.departure) }}</div>
                <div class="text-sm text-muted-foreground mt-2">{{ formatLocationName(flight.departure) }}</div>
                <div class="text-xs font-medium text-sky-700 dark:text-sky-400 mt-3">
                  {{ formatTime(flight.departure_time) }}
                </div>
              </div>
              
              <div class="px-6">
                <div class="flex flex-col items-center gap-2">
                  <ArrowRight class="h-6 w-6 text-sky-600 dark:text-sky-400" />
                  <div class="text-xs text-muted-foreground">Vol</div>
                </div>
              </div>
              
              <div class="flex-1 text-right">
                <div class="text-sm text-muted-foreground mb-1">Aéroport d'arrivée</div>
                <div class="text-3xl font-bold text-sky-900 dark:text-sky-100">{{ formatLocationIata(flight.arrival) }}</div>
                <div class="text-sm text-muted-foreground mt-2">{{ formatLocationName(flight.arrival) }}</div>
                <div class="text-xs font-medium text-sky-700 dark:text-sky-400 mt-3">
                  {{ formatTime(flight.arrival_time) }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Informations principales -->
        <div class="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Card class="border-2 hover:shadow-md transition-all col-span-2">
            <CardContent class="p-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Building2 class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-muted-foreground truncate">Exploitant</div>
                  <div class="font-semibold truncate">{{ flight.operator?.name || 'N/A' }}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="border-2 hover:shadow-md transition-all">
            <CardContent class="p-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Plane class="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-muted-foreground truncate">Aéronef</div>
                  <div class="font-semibold truncate">{{ flight.aircraft?.immatriculation || 'N/A' }}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="border-2 hover:shadow-md transition-all">
            <CardContent class="p-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Globe class="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-muted-foreground truncate">Régime</div>
                  <div class="font-semibold truncate">
                    {{ flight.flight_regime === 'domestic' ? 'Domestique' : 'International' }}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="border-2 hover:shadow-md transition-all">
            <CardContent class="p-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-muted-foreground truncate">Type</div>
                  <div class="font-semibold truncate">
                    {{ flight.flight_type === 'regular' ? 'Régulier' : 'Non Régulier' }}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Statistiques passagers -->
        <Card v-if="flight.statistics">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Users class="h-4 w-4" />
              Statistiques passagers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 md:grid-cols-4">
              <!-- Total passagers -->
              <div class="relative p-4 border-2 rounded-xl bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
                <div class="text-sm text-blue-600 dark:text-blue-400 font-medium">Total passagers</div>
                <div class="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{{ flight.statistics.passengers_count }}</div>
              </div>

              <!-- pax bus -->
              <div class="relative p-4 border-2 rounded-xl bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-md transition-all">
                <div class="text-sm text-purple-600 dark:text-purple-400 font-medium">Pax Bus</div>
                <div class="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">{{ flight.statistics.pax_bus }}</div>
              </div>

              <!-- Go pass -->
              <div class="relative p-4 border-2 rounded-xl bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800 hover:shadow-md transition-all">
                <div class="text-sm text-green-600 dark:text-green-400 font-medium">Go pass</div>
                <div class="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{{ flight.statistics.go_pass_count }}</div>
              </div>

              <!-- Écart passagers -->
              <div class="relative p-4 border-2 rounded-xl hover:shadow-md transition-all" :class="getEcartClass(flight.statistics.passengers_ecart)">
                <div class="text-sm font-medium">Écart passagers</div>
                <div class="text-3xl font-bold mt-2">
                  {{ flight.statistics.passengers_ecart > 0 ? '+' : '' }}{{ flight.statistics.passengers_ecart }}
                </div>
              </div>
            </div>

            <!-- Fret et Excédents -->
            <div class="grid gap-4 md:grid-cols-2 mt-4">
              <div v-if="flight.statistics.fret_count" class="p-4 border-2 rounded-xl border-orange-200 dark:border-orange-800 bg-linear-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20">
                <div class="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">Fret</div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <div class="text-xs text-muted-foreground">Départ</div>
                    <div class="text-lg font-bold">{{ flight.statistics.fret_count.departure > 0 ? `+${flight.statistics.fret_count.departure}` : '0' }} kg</div>
                  </div>
                  <div>
                    <div class="text-xs text-muted-foreground">Arrivée</div>
                    <div class="text-lg font-bold">{{ flight.statistics.fret_count.arrival > 0 ? `+${flight.statistics.fret_count.arrival}` : '0' }} kg</div>
                  </div>
                </div>
              </div>

              <div v-if="flight.statistics.excedents" class="p-4 border-2 rounded-xl border-pink-200 dark:border-pink-800 bg-linear-to-br from-pink-50 to-pink-100/50 dark:from-pink-950/30 dark:to-pink-900/20">
                <div class="text-sm font-medium text-pink-600 dark:text-pink-400 mb-2">Excédents</div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <div class="text-xs text-muted-foreground">Départ</div>
                    <div class="text-lg font-bold">{{ flight.statistics.excedents.departure > 0 ? `+${flight.statistics.excedents.departure}` : '0' }} kg</div>
                  </div>
                  <div>
                    <div class="text-xs text-muted-foreground">Arrivée</div>
                    <div class="text-lg font-bold">{{ flight.statistics.excedents.arrival > 0 ? `+${flight.statistics.excedents.arrival}` : '0' }} kg</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Justification -->
        <Card v-if="flight.statistics?.has_justification">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <AlertCircle class="h-4 w-4" />
              Justification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="flight.statistics.justification && Object.keys(flight.statistics.justification).length > 0">
              <div class="space-y-2">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div v-for="(value, key) in flight.statistics.justification" :key="key" class="p-3 border-2 rounded-lg bg-muted/50">
                    <div class="text-sm font-semibold">{{ key }}</div>
                    <div class="text-sm text-muted-foreground mt-1">
                      {{ formatJustificationValue(value) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-muted-foreground text-center py-4">
              Justification requise mais non fournie
            </div>
          </CardContent>
        </Card>

        <!-- Remarques -->
        <Card v-if="flight.remarks" class="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <AlertCircle class="h-4 w-4" />
              Remarques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm leading-relaxed">{{ flight.remarks }}</p>
          </CardContent>
        </Card>
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
import { computed } from 'vue'
import { 
  Pencil, 
  PlaneTakeoff,
  Building2, 
  Plane,
  ArrowRight,
  Users,
  AlertCircle,
  Globe,
  CheckCircle,
  Hash,
  X
} from 'lucide-vue-next'
import { FLIGHT_NATURE_LABELS, type Flight } from '~/types/api'
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

const props = defineProps<{
  flight: Flight | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [flight: Flight]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const formatLocationIata = (location: any) => {
  return location?.iata || location?.[0] || '???'
}

const formatLocationName = (location: any) => {
  return location?.name || 'Aéroport inconnu'
}

const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEcartClass = (ecart: number) => {
  if (ecart > 0) return 'bg-linear-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800'
  if (ecart < 0) return 'bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800'
  return 'bg-linear-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20 border-gray-200 dark:border-gray-800'
}

const formatJustificationValue = (value: any): string => {
  // Si c'est un objet avec une clé 'sfr', formater spécialement
  if (typeof value === 'object' && value !== null && 'sfr' in value) {
    const sfrValue = value.sfr
    const otherValue = value.value || 0
    return sfrValue > 0 ? `${otherValue} dont ${sfrValue} sans feuille de route` : `${otherValue}`
  }
  
  // Sinon, retourner la valeur normale
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

const getFlightNature = (flight: Flight) => {
  switch (flight.flight_nature) {
    case "commercial":
      return FLIGHT_NATURE_LABELS.commercial
    case "state":
      return FLIGHT_NATURE_LABELS.state
    case "humanitare":
      return FLIGHT_NATURE_LABELS.humanitare
    case "afreightment":
      return FLIGHT_NATURE_LABELS.afreightment
    case "requisition":
      return FLIGHT_NATURE_LABELS.requisition
    case "test":
      return FLIGHT_NATURE_LABELS.test  
      break;
  
    default:
      return FLIGHT_NATURE_LABELS.commercial
      break;
  }
}

const handleEdit = () => {
  if (props.flight) {
    emit('edit', props.flight)
    isOpen.value = false
  }
}
</script>