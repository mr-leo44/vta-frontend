<template>
  <Card 
    class="hover:shadow-lg transition-all cursor-pointer group border-l-4"
    :class="getStatusBorderColor(flight.status)"
    @click="$emit('view', flight)"
  >
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <div class="h-10 w-10 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <PlaneTakeoff class="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle class="text-lg group-hover:text-primary transition-colors">
                {{ flight.flight_number }}
              </CardTitle>
              <p class="text-xs text-muted-foreground">
                {{ flight.operator?.name || 'N/A' }}
              </p>
            </div>
          </div>
          
          <Badge :class="FLIGHT_STATUS_COLORS[flight.status]" class="text-xs">
            {{ FLIGHT_STATUS_LABELS[flight.status] }}
          </Badge>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger as-child @click.stop>
            <Button variant="ghost" size="icon" class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click.stop="$emit('view', flight)">
              <Eye class="mr-2 h-4 w-4" />
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuItem @click.stop="$emit('edit', flight)">
              <Pencil class="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              @click.stop="$emit('delete', flight)"
              class="text-destructive focus:text-destructive"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>

    <CardContent class="space-y-3">
      <!-- Route -->
      <div class="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
        <MapPin class="h-4 w-4 text-muted-foreground shrink-0" />
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <span class="font-mono font-semibold truncate">
            {{ formatLocation(flight.departure) }}
          </span>
          <ArrowRight class="h-4 w-4 text-muted-foreground shrink-0" />
          <span class="font-mono font-semibold truncate">
            {{ formatLocation(flight.arrival) }}
          </span>
        </div>
      </div>

      <!-- Horaires -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="flex items-center gap-2 p-2 border rounded">
          <Clock class="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <div class="text-muted-foreground">Départ</div>
            <div class="font-semibold">{{ formatTime(flight.departure_time) }}</div>
          </div>
        </div>
        <div class="flex items-center gap-2 p-2 border rounded">
          <Clock class="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <div class="text-muted-foreground">Arrivée</div>
            <div class="font-semibold">{{ formatTime(flight.arrival_time) }}</div>
          </div>
        </div>
      </div>

      <!-- Infos supplémentaires -->
      <div class="flex items-center gap-2 text-xs">
        <Badge variant="outline" class="gap-1">
          <Plane class="h-3 w-3" />
          {{ flight.aircraft.immatriculation + ` (${flight.aircraft.type})` }}
        </Badge>
        <Badge variant="outline">
          {{ FLIGHT_REGIME_LABELS[flight.flight_regime] }}
        </Badge>
        <Badge v-if="flight.statistics?.passengers_count" variant="outline" class="gap-1">
          <Users class="h-3 w-3" />
          {{ flight.statistics.passengers_count }}
        </Badge>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {
  PlaneTakeoff,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  ArrowRight,
  Clock,
  Plane,
  Users
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { Flight } from '~/types/api'
import { 
  FLIGHT_STATUS_LABELS, 
  FLIGHT_STATUS_COLORS,
  FLIGHT_REGIME_LABELS 
} from '~/types/api'

defineProps<{
  flight: Flight
}>()

defineEmits<{
  view: [flight: Flight]
  edit: [flight: Flight]
  delete: [flight: Flight]
}>()

const getStatusBorderColor = (status: string) => {
  const colors: Record<string, string> = {
    qrf: 'border-l-blue-500',
    prevu: 'border-l-yellow-500',
    atteri: 'border-l-green-500',
    annule: 'border-l-red-500',
    detourne: 'border-l-orange-500'
  }
  return colors[status] || 'border-l-gray-500'
}

const formatTime = (datetime: string) => {
  return new Date(datetime).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
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
</script>