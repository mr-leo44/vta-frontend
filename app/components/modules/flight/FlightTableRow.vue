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
          <div class="font-mono font-semibold">{{ departureFrom(flight) }}</div>
          <div class="text-xs text-muted-foreground truncate max-w-20">{{ departureFromName(flight) }}</div>
          <div class="text-xs text-muted-foreground">{{ formatTime(flight.departure_time) }}</div>
        </div>
        <ArrowRight class="h-4 w-4 text-muted-foreground shrink-0" />
        <div>
          <div class="font-mono font-semibold">{{ departureTo(flight) }}</div>
          <div class="text-xs text-muted-foreground truncate max-w-20">{{ departureToName(flight) }}</div>
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
      <DropdownMenuContent align="end" class="w-52">
        <DropdownMenuItem @click="$emit('view', flight)">
          <Eye class="mr-2 h-4 w-4" />
          Voir les détails
        </DropdownMenuItem>

        <!-- Saisie rapide — visible selon la fonction de l'utilisateur -->
        <DropdownMenuItem
          v-if="quickEditMode"
          @click="$emit('quickEdit', flight)"
          class="cursor-pointer text-sky-600 dark:text-sky-400 focus:text-sky-700 focus:bg-sky-50 dark:focus:bg-sky-950/30"
        >
          <component :is="quickEditIcon" class="mr-2 h-4 w-4" />
          {{ quickEditLabel }}
        </DropdownMenuItem>

        <DropdownMenuItem v-if="canEdit !== false" @click="$emit('edit', flight)">
          <Pencil class="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator v-if="canDelete !== false" />
        <DropdownMenuItem v-if="canDelete !== false" @click="$emit('delete', flight)" class="text-destructive">
          <Trash2 class="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  PlaneTakeoff, Eye, Pencil, Trash2, MoreVertical, ArrowRight,
  Bus, TrendingUp, BarChart3, ClipboardEdit,
} from 'lucide-vue-next'
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
  canEdit?: boolean
  canDelete?: boolean
}>()

defineEmits<{
  view: [flight: Flight]
  edit: [flight: Flight]
  delete: [flight: Flight]
  quickEdit: [flight: Flight]
}>()

// ── Quick-edit mode selon la fonction de l'utilisateur ──────────────────────

const { userFunction } = usePermission()

const quickEditMode = computed<'paxbus' | 'idef' | 'trafic' | null>(() => {
  const fn = (userFunction.value ?? '').toLowerCase()
  if (fn.includes('paxbus') || fn === 'vta-paxbus') return 'paxbus'
  if (fn.includes('idef') || fn === 'vta-idef') return 'idef'
  if (fn.includes('trafic') || fn === 'vta-trafic') return 'trafic'
  return null
})

const quickEditLabel = computed(() => {
  if (quickEditMode.value === 'paxbus') return 'Saisie Pax Bus'
  if (quickEditMode.value === 'idef') return 'Saisie IDEF'
  if (quickEditMode.value === 'trafic') return 'Saisie Trafic'
  return ''
})

const quickEditIcon = computed(() => {
  if (quickEditMode.value === 'paxbus') return Bus
  if (quickEditMode.value === 'idef') return TrendingUp
  if (quickEditMode.value === 'trafic') return BarChart3
  return ClipboardEdit
})

// ── Helpers ──────────────────────────────────────────────────────────────────

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

const departureFrom = (flight: any): string => flight.departure?.from?.iata || '???'
const departureFromName = (flight: any): string => flight.departure?.from?.name || ''
const departureTo = (flight: any): string => flight.departure?.to?.iata || '???'
const departureToName = (flight: any): string => flight.departure?.to?.name || ''

const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>