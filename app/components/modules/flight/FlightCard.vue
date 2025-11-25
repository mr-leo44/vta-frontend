<template>
  <Card 
    class="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden"
    :class="getStatusBorderColor(flight.status)"
  >
    <!-- Status linear overlay -->
    <div class="absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity"
      :class="getStatuslinear(flight.status)"></div>
    
    <!-- Main clickable area for view -->
    <div @click="$emit('view', flight)" class="relative">
      <CardHeader class="pb-3">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <!-- Flight icon with status color -->
              <div :class="[
                'h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform',
                getStatusIconClass(flight.status)
              ]">
                <PlaneTakeoff class="h-7 w-7 text-white" />
              </div>
              
              <div class="flex-1">
                <CardTitle class="text-xl font-bold group-hover:text-primary transition-colors">
                  {{ flight.flight_number }}
                </CardTitle>
                <p class="text-sm text-muted-foreground flex items-center gap-1">
                  <Building2 class="h-3 w-3" />
                  {{ flight.operator?.name || 'N/A' }}
                </p>
              </div>
            </div>
            
            <Badge :class="FLIGHT_STATUS_COLORS[flight.status]" class="text-xs font-semibold">
              {{ FLIGHT_STATUS_LABELS[flight.status] }}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger as-child @click.stop>
              <Button 
                variant="ghost" 
                size="icon"
                class="h-9 w-9 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10"
              >
                <MoreVertical class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuItem @click.stop="$emit('view', flight)" class="cursor-pointer">
                <Eye class="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem @click.stop="$emit('edit', flight)" class="cursor-pointer">
                <Pencil class="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                @click.stop="$emit('delete', flight)"
                class="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 class="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent class="space-y-3">
        <!-- Route avec style moderne -->
        <div class="relative p-4 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border-2 border-blue-200/50 dark:border-blue-800/30">
          <div class="flex items-center gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <MapPin class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span class="text-xs text-muted-foreground">Départ</span>
              </div>
              <span class="font-mono font-bold text-lg">
                {{ formatLocation(flight.departure) }}
              </span>
            </div>
            
            <div class="flex flex-col items-center">
              <ArrowRight class="h-6 w-6 text-primary animate-pulse" />
            </div>
            
            <div class="flex-1 text-right">
              <div class="flex items-center justify-end gap-2 mb-1">
                <span class="text-xs text-muted-foreground">Arrivée</span>
                <MapPin class="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span class="font-mono font-bold text-lg">
                {{ formatLocation(flight.arrival) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Horaires -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex items-center gap-3 p-3 border-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div class="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Clock class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div class="text-xs text-muted-foreground">Départ</div>
              <div class="font-semibold text-sm">{{ formatTime(flight.departure_time) }}</div>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 border-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div class="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
              <Clock class="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div class="text-xs text-muted-foreground">Arrivée</div>
              <div class="font-semibold text-sm">{{ formatTime(flight.arrival_time) }}</div>
            </div>
          </div>
        </div>

        <!-- Infos supplémentaires -->
        <div class="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" class="gap-1">
            <Plane class="h-3 w-3" />
            {{ flight.aircraft.immatriculation }}
          </Badge>
          <Badge variant="outline" class="gap-1">
            <Layers class="h-3 w-3" />
            {{ flight.aircraft.type }}
          </Badge>
          <Badge variant="secondary">
            {{ FLIGHT_REGIME_LABELS[flight.flight_regime] }}
          </Badge>
          <Badge v-if="flight.statistics?.passengers_count" variant="default" class="gap-1">
            <Users class="h-3 w-3" />
            {{ flight.statistics.passengers_count }}
          </Badge>
        </div>
      </CardContent>
    </div>

    <!-- Quick action buttons at bottom -->
    <div class="px-6 pb-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button 
        variant="outline" 
        size="sm" 
        class="flex-1 gap-2"
        @click.stop="$emit('edit', flight)"
      >
        <Pencil class="h-3 w-3" />
        Modifier
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        class="gap-2"
        @click.stop="$emit('view', flight)"
      >
        <Eye class="h-3 w-3" />
        Détails
      </Button>
    </div>
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
  Users,
  Building2,
  Layers
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
    qrf: 'border-l-4 border-l-blue-500',
    prevu: 'border-l-4 border-l-yellow-500',
    atteri: 'border-l-4 border-l-green-500',
    annule: 'border-l-4 border-l-red-500',
    detourne: 'border-l-4 border-l-orange-500'
  }
  return colors[status] || 'border-l-4 border-l-gray-500'
}

const getStatuslinear = (status: string) => {
  const linears: Record<string, string> = {
    qrf: 'from-blue-500/5 to-transparent',
    prevu: 'from-yellow-500/5 to-transparent',
    atteri: 'from-green-500/5 to-transparent',
    annule: 'from-red-500/5 to-transparent',
    detourne: 'from-orange-500/5 to-transparent'
  }
  return linears[status] || 'from-gray-500/5 to-transparent'
}

const getStatusIconClass = (status: string) => {
  const classes: Record<string, string> = {
    qrf: 'bg-linear-to-br from-blue-500 to-blue-600',
    prevu: 'bg-linear-to-br from-yellow-500 to-yellow-600',
    atteri: 'bg-linear-to-br from-green-500 to-green-600',
    annule: 'bg-linear-to-br from-red-500 to-red-600',
    detourne: 'bg-linear-to-br from-orange-500 to-orange-600'
  }
  return classes[status] || 'bg-linear-to-br from-gray-500 to-gray-600'
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
  
  if (typeof location === 'object' && location.iata && location.name) {
    return location.iata
  }
  
  if (Array.isArray(location) && location.length > 0) {
    const loc = location[0]
    if (typeof loc === 'object' && loc.iata && loc.name) {
      return loc.iata
    }
    return loc
  }
  
  return location
}
</script>