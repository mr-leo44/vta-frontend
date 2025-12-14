<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="md:max-w-5xl max-h-[90vh]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <CalendarDays class="h-5 w-5" />
          Vols du jour - {{ formattedDate }}
        </DialogTitle>
        <DialogDescription>
          Liste des vols programmés et effectués aujourd'hui
        </DialogDescription>
      </DialogHeader>

      <!-- Stats du jour -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card class="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
          <CardContent class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-blue-700 dark:text-blue-300 font-medium">Total vols</div>
                <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ stats.total }}</div>
              </div>
              <PlaneTakeoff class="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card class="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
          <CardContent class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-green-700 dark:text-green-300 font-medium">Atterris</div>
                <div class="text-2xl font-bold text-green-900 dark:text-green-100">{{ stats.embarque }}</div>
              </div>
              <CheckCircle class="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card class="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-yellow-700 dark:text-yellow-300 font-medium">Prévus</div>
                <div class="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{{ stats.prevu }}</div>
              </div>
              <Clock class="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card class="border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
          <CardContent class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-purple-700 dark:text-purple-300 font-medium">Passagers</div>
                <div class="text-2xl font-bold text-purple-900 dark:text-purple-100">{{ stats.passengers }}</div>
              </div>
              <Users class="h-8 w-8 text-purple-500 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Liste des vols -->
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div v-if="loading" class="space-y-2">
          <Skeleton v-for="i in 5" :key="i" class="h-16 w-full" />
        </div>

        <div v-else-if="flights.length === 0" class="text-center py-12">
          <PlaneTakeoff class="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p class="text-muted-foreground">Aucun vol programmé aujourd'hui</p>
        </div>

        <Card
          v-else
          v-for="flight in sortedFlights"
          :key="flight.id"
          class="hover:bg-muted/50 transition-colors cursor-pointer border-l-4"
          :class="getStatusBorderColor(flight.status)"
          @click="$emit('view', flight)"
        >
          <CardContent class="px-4">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div 
                  class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  :class="getStatusBackground(flight.status)"
                >
                  <PlaneTakeoff class="h-5 w-5 text-white" />
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold truncate">{{ flight.flight_number }}</h4>
                    <Badge :class="FLIGHT_STATUS_COLORS[flight.status]" class="text-xs shrink-0">
                      {{ FLIGHT_STATUS_LABELS[flight.status] }}
                    </Badge>
                  </div>
                  <div class="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <span class="truncate">{{ flight.operator?.name }}</span>
                    <span>•</span>
                    <span class="font-mono">{{ formatLocation(flight.departure) }} → {{ formatLocation(flight.arrival) }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-4 shrink-0">
                <div class="text-right">
                  <div class="text-xs text-muted-foreground">Départ</div>
                  <div class="font-semibold text-sm">{{ formatTime(flight.departure_time) }}</div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-muted-foreground">Arrivée</div>
                  <div class="font-semibold text-sm">{{ formatTime(flight.arrival_time) }}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">
          <X class="mr-2 h-4 w-4" />
          Fermer
        </Button>
        <Button @click="handleRefresh" :disabled="loading">
          <RefreshCw class="mr-2 h-4 w-4" :class="loading ? 'animate-spin' : ''" />
          Actualiser
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  CalendarDays,
  PlaneTakeoff,
  CheckCircle,
  Clock,
  Users,
  X,
  RefreshCw
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Flight } from '~/types/api'
import { 
  FLIGHT_STATUS_LABELS, 
  FLIGHT_STATUS_COLORS 
} from '~/types/api'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  view: [flight: Flight]
}>()

const flightsStore = useFlightsStore()

const loading = ref(false)
const flights = ref<Flight[]>([])

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const stats = computed(() => {
  const total = flights.value.length
  const embarque = flights.value.filter(f => f.status === 'embarque').length
  const prevu = flights.value.filter(f => f.status === 'prevu' || f.status === 'qrf').length
  const passengers = flights.value.reduce((sum, f) => sum + (f.statistics?.passengers_count || 0), 0)
  
  return { total, embarque, prevu, passengers }
})

const sortedFlights = computed(() => {
  return [...flights.value].sort((a, b) => {
    return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
  })
})

const loadTodayFlights = async () => {
  loading.value = true
  try {
    const result = await flightsStore.fetchTodayFlights()
    if (result.success && result.data) {
      flights.value = result.data
    }
  } finally {
    loading.value = false
  }
}

watch(() => props.open, async (open) => {
  if (open) {
    await loadTodayFlights()
  }
})

const handleRefresh = async () => {
  await loadTodayFlights()
}

const getStatusBorderColor = (status: string) => {
  const colors: Record<string, string> = {
    qrf: 'border-l-blue-500',
    prevu: 'border-l-yellow-500',
    embarque: 'border-l-green-500',
    annule: 'border-l-red-500',
    detourne: 'border-l-orange-500'
  }
  return colors[status] || 'border-l-gray-500'
}

const getStatusBackground = (status: string) => {
  const colors: Record<string, string> = {
    qrf: 'bg-gradient-to-br from-blue-500 to-blue-600',
    prevu: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    embarque: 'bg-gradient-to-br from-green-500 to-green-600',
    annule: 'bg-gradient-to-br from-red-500 to-red-600',
    detourne: 'bg-gradient-to-br from-orange-500 to-orange-600'
  }
  return colors[status] || 'bg-gradient-to-br from-gray-500 to-gray-600'
}

const formatLocation = (location: any): string => {
  if (!location) return 'N/A'
  
  // Si c'est un objet avec iata et name
  if (typeof location === 'object' && location.iata && location.name) {
    return `${location.iata} (${location.name})`
  }
  
  // Si c'est un array
  if (Array.isArray(location) && location.length > 0) {
    const loc = location[0]
    if (typeof loc === 'object' && loc.iata && loc.name) {
      return `${loc.iata} (${loc.name})`
    }
    return loc
  }
  
  return location
}

const formatTime = (datetime: string) => {
  return new Date(datetime).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>