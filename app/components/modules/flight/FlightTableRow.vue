<template>
  <div class="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
    <!-- Status indicator -->
    <div :class="[
      'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
      getStatusColor(flight.status)
    ]">
      <PlaneTakeoff class="h-5 w-5" />
    </div>
    
    <!-- Informations principales -->
    <div class="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2">
      <!-- Vol -->
      <div>
        <div class="flex items-center gap-2">
          <h3 class="font-semibold">{{ flight.flight_number }}</h3>
          <Badge :variant="getStatusVariant(flight.status)" class="text-xs">
            {{ formatStatus(flight.status) }}
          </Badge>
        </div>
        <div class="text-sm text-muted-foreground">
          {{ flight.operator?.name || 'N/A' }}
        </div>
      </div>

      <!-- Route & Horaires -->
      <div class="flex items-center gap-2 text-sm">
        <div>
          <div class="font-medium">{{ formatLocation(flight.departure) }}</div>
          <div class="text-xs text-muted-foreground">{{ formatTime(flight.departure_time) }}</div>
        </div>
        <ArrowRight class="h-4 w-4 text-muted-foreground" />
        <div>
          <div class="font-medium">{{ formatLocation(flight.arrival) }}</div>
          <div class="text-xs text-muted-foreground">{{ formatTime(flight.arrival_time) }}</div>
        </div>
      </div>

      <!-- Statistiques -->
      <div v-if="flight.statistics" class="flex items-center gap-4 text-sm">
        <div>
          <div class="text-muted-foreground text-xs">Passagers</div>
          <div class="font-medium">{{ flight.statistics.passengers_count }}</div>
        </div>
        <div v-if="flight.statistics.passengers_ecart !== 0">
          <div class="text-muted-foreground text-xs">Écart</div>
          <Badge :variant="flight.statistics.passengers_ecart > 0 ? 'destructive' : 'default'" class="text-xs">
            {{ flight.statistics.passengers_ecart > 0 ? '+' : '' }}{{ flight.statistics.passengers_ecart }}
          </Badge>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon">
          <MoreVertical class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="$emit('view', flight)">
          <Eye class="mr-2 h-4 w-4" />
          Voir les détails
        </DropdownMenuItem>
        <DropdownMenuItem @click="$emit('edit', flight)">
          <Pencil class="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="$emit('delete', flight)" class="text-destructive">
          <Trash2 class="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { PlaneTakeoff, Eye, Pencil, Trash2, MoreVertical, ArrowRight } from 'lucide-vue-next'
import type { Flight, FlightStatus } from '~/types/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

defineProps<{
  flight: Flight
}>()

defineEmits<{
  view: [flight: Flight]
  edit: [flight: Flight]
  delete: [flight: Flight]
}>()

const formatStatus = (status: FlightStatus) => {
  const statusMap: Record<FlightStatus, string> = {
    qrf: 'QRF',
    prevu: 'Prévu',
    embarque: 'Embarqué',
    annule: 'Annulé',
    detourne: 'Détourné'
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: FlightStatus) => {
  if (status === 'embarque') return 'default'
  if (status === 'annule') return 'destructive'
  if (status === 'detourne') return 'secondary'
  return 'outline'
}

const getStatusColor = (status: FlightStatus) => {
  if (status === 'embarque') return 'bg-green-100 text-green-600'
  if (status === 'annule') return 'bg-red-100 text-red-600'
  if (status === 'detourne') return 'bg-orange-100 text-orange-600'
  if (status === 'prevu') return 'bg-blue-100 text-blue-600'
  return 'bg-gray-100 text-gray-600'
}

const formatLocation = (location: any): string => {
  if (!location) return 'N/A'
  
  // Si c'est un objet avec iata et name
  if (typeof location === 'object' && !Array.isArray(location) && location.iata && location.name) {
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

const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>