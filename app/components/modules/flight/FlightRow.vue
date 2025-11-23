<template>
  <Card 
    class="hover:bg-muted/50 transition-all cursor-pointer border-l-4"
    :class="getStatusBorderColor(flight.status)"
    @click="$emit('view', flight)"
  >
    <CardContent class="p-4">
      <div class="flex items-center gap-4">
        <!-- Icône et numéro -->
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shrink-0">
            <PlaneTakeoff class="h-6 w-6 text-white" />
          </div>
          
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-base truncate">{{ flight.flight_number }}</h3>
              <Badge :class="FLIGHT_STATUS_COLORS[flight.status]" class="text-xs shrink-0">
                {{ FLIGHT_STATUS_LABELS[flight.status] }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground truncate">
              {{ flight.operator?.name || 'N/A' }} • {{ flight.aircraft }}
            </p>
          </div>
        </div>

        <!-- Route -->
        <div class="hidden md:flex items-center gap-2 min-w-0">
          <div class="text-sm font-mono font-semibold truncate">
            {{ flight.departure[0] || 'N/A' }}
          </div>
          <ArrowRight class="h-4 w-4 text-muted-foreground shrink-0" />
          <div class="text-sm font-mono font-semibold truncate">
            {{ flight.arrival[0] || 'N/A' }}
          </div>
        </div>

        <!-- Horaires -->
        <div class="hidden lg:flex items-center gap-4">
          <div class="text-sm">
            <div class="text-xs text-muted-foreground">Départ</div>
            <div class="font-semibold">{{ formatTime(flight.departure_time) }}</div>
          </div>
          <div class="text-sm">
            <div class="text-xs text-muted-foreground">Arrivée</div>
            <div class="font-semibold">{{ formatTime(flight.arrival_time) }}</div>
          </div>
        </div>

        <!-- Infos -->
        <div class="hidden xl:flex items-center gap-2 shrink-0">
          <Badge variant="outline" class="text-xs">
            {{ FLIGHT_REGIME_LABELS[flight.flight_regime] }}
          </Badge>
          <Badge variant="outline" class="text-xs">
            {{ FLIGHT_TYPE_LABELS[flight.flight_type] }}
          </Badge>
          <Badge v-if="flight.statistics?.passengers_count" variant="outline" class="gap-1 text-xs">
            <Users class="h-3 w-3" />
            {{ flight.statistics.passengers_count }}
          </Badge>
        </div>

        <!-- Actions -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child @click.stop>
            <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0">
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
  ArrowRight,
  Users
} from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
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
  FLIGHT_REGIME_LABELS,
  FLIGHT_TYPE_LABELS 
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
</script>