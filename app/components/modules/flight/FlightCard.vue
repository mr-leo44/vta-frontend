<template>
  <Card class="hover:shadow-lg transition-shadow cursor-pointer">
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <CardTitle class="text-lg font-semibold">{{ flight.flight_number }}</CardTitle>
          <CardDescription class="mt-1">
            <div class="flex items-center gap-2">
              <Badge :variant="getStatusVariant(flight.status)">
                {{ formatStatus(flight.status) }}
              </Badge>
              <Badge variant="outline">{{ formatRegime(flight.flight_regime) }}</Badge>
            </div>
          </CardDescription>
        </div>
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
    </CardHeader>
    <CardContent>
      <div class="space-y-3">
        <!-- Route -->
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2">
            <div class="font-medium">{{ formatLocation(flight.departure) }}</div>
            <ArrowRight class="h-4 w-4 text-muted-foreground" />
            <div class="font-medium">{{ formatLocation(flight.arrival) }}</div>
          </div>
        </div>

        <!-- Horaires -->
        <div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <div class="font-medium">Départ</div>
            <div>{{ formatDateTime(flight.departure_time) }}</div>
          </div>
          <div>
            <div class="font-medium">Arrivée</div>
            <div>{{ formatDateTime(flight.arrival_time) }}</div>
          </div>
        </div>

        <!-- Opérateur & Aéronef -->
        <div class="pt-2 border-t space-y-1 text-xs">
          <div class="flex items-center gap-2 text-muted-foreground">
            <Building2 class="h-3 w-3" />
            <span>{{ flight.operator?.name || 'Opérateur inconnu' }}</span>
          </div>
          <div class="flex items-center gap-2 text-muted-foreground">
            <Plane class="h-3 w-3" />
            <span>{{ flight.aircraft || 'Aéronef inconnu' }}</span>
          </div>
        </div>

        <!-- Statistiques si disponibles -->
        <div v-if="flight.statistics" class="pt-2 border-t">
          <div class="flex items-center justify-between text-xs">
            <span class="text-muted-foreground">Passagers</span>
            <span class="font-medium">{{ flight.statistics.passengers_count }}</span>
          </div>
          <div v-if="flight.statistics.passengers_ecart !== 0" class="flex items-center justify-between text-xs mt-1">
            <span class="text-muted-foreground">Écart</span>
            <Badge :variant="flight.statistics.passengers_ecart > 0 ? 'destructive' : 'default'" class="text-xs">
              {{ flight.statistics.passengers_ecart > 0 ? '+' : '' }}{{ flight.statistics.passengers_ecart }}
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Eye, Pencil, Trash2, MoreVertical, ArrowRight, Building2, Plane } from 'lucide-vue-next'
import type { Flight, FlightStatus, FlightRegime } from '~/types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

const formatRegime = (regime: FlightRegime) => {
  return regime === 'domestic' ? 'Domestique' : 'International'
}

const formatLocation = (location: any[]) => {
  return location?.name + ' (' + location?.iata + ')' || '???'
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>