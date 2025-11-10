<template>
  <div 
    class="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
    @click="$emit('view', flight)"
  >
    <!-- Heure -->
    <div class="text-center min-w-[60px]">
      <div class="text-lg font-semibold">{{ departureTime }}</div>
      <div class="text-xs text-muted-foreground">{{ arrivalTime }}</div>
    </div>

    <Separator orientation="vertical" class="h-12" />

    <!-- Informations vol -->
    <div class="flex-1 grid grid-cols-3 gap-4">
      <!-- Numéro & Route -->
      <div>
        <div class="font-medium">{{ flight.flight_number }}</div>
        <div class="text-sm text-muted-foreground">
          {{ formatLocation(flight.departure) }} → {{ formatLocation(flight.arrival) }}
        </div>
      </div>

      <!-- Opérateur & Aéronef -->
      <div class="text-sm">
        <div class="font-medium">{{ flight.operator?.name || 'N/A' }}</div>
        <div class="text-muted-foreground">{{ flight.aircraft || 'N/A' }}</div>
      </div>

      <!-- Passagers -->
      <div v-if="flight.statistics" class="text-sm">
        <div class="font-medium">{{ flight.statistics.passengers_count }} pax</div>
        <div v-if="flight.statistics.passengers_ecart !== 0" class="flex items-center gap-1">
          <span class="text-xs text-muted-foreground">Écart:</span>
          <Badge 
            :variant="flight.statistics.passengers_ecart > 0 ? 'destructive' : 'default'" 
            class="text-xs h-5"
          >
            {{ flight.statistics.passengers_ecart > 0 ? '+' : '' }}{{ flight.statistics.passengers_ecart }}
          </Badge>
        </div>
      </div>
    </div>

    <!-- Badge statut -->
    <Badge :variant="getStatusVariant(flight.status)">
      {{ formatStatus(flight.status) }}
    </Badge>

    <ChevronRight class="h-4 w-4 text-muted-foreground" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import type { Flight, FlightStatus } from '~/types/api'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const props = defineProps<{
  flight: Flight
}>()

defineEmits<{
  view: [flight: Flight]
}>()

const departureTime = computed(() => {
  return new Date(props.flight.departure_time).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const arrivalTime = computed(() => {
  return new Date(props.flight.arrival_time).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const formatLocation = (location: any[]) => {
  return location?.[0] || '???'
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
</script>