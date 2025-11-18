<template>
  <div class="space-y-6">
    <!-- VOLS COMMERCIAUX -->
    <div v-if="commercialFlights.length > 0">
      <div class="mb-3 flex items-center gap-2">
        <Badge variant="default">Commercial ({{ commercialFlights.length }})</Badge>
      </div>
      
      <div class="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/50">
              <TableHead class="w-[100px]">N° Vol</TableHead>
              <TableHead>Exploitant</TableHead>
              <TableHead>Immatriculation</TableHead>
              <TableHead class="text-center">Passagers</TableHead>
              <TableHead class="text-center">Fret</TableHead>
              <TableHead class="text-center">Excédent</TableHead>
              <TableHead class="w-[100px]">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="flight in commercialFlights" :key="flight.id" class="hover:bg-muted/30">
              <TableCell class="font-medium">{{ flight.flight_number }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Building2 class="h-4 w-4 text-muted-foreground" />
                  <span>{{ flight.operator?.name || 'N/A' }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Plane class="h-4 w-4 text-muted-foreground" />
                  <span class="font-mono text-sm">{{ flight.aircraft || 'N/A' }}</span>
                </div>
              </TableCell>
              <TableCell class="text-center">
                <div v-if="flight.statistics">
                  <div class="font-semibold">{{ flight.statistics.passengers_count }}</div>
                  <div v-if="flight.statistics.passengers_ecart !== 0" class="text-xs mt-1">
                    <Badge 
                      :variant="flight.statistics.passengers_ecart > 0 ? 'destructive' : 'default'" 
                      class="text-xs"
                    >
                      {{ flight.statistics.passengers_ecart > 0 ? '+' : '' }}{{ flight.statistics.passengers_ecart }}
                    </Badge>
                  </div>
                </div>
                <span v-else class="text-muted-foreground">—</span>
              </TableCell>
              <TableCell class="text-center">
                <div v-if="hasFret(flight)">
                  <Badge variant="outline" class="text-xs">
                    {{ formatFret(flight.statistics?.fret_count) }}
                  </Badge>
                </div>
                <span v-else class="text-muted-foreground">—</span>
              </TableCell>
              <TableCell class="text-center">
                <div v-if="hasExcedent(flight)">
                  <Badge variant="secondary" class="text-xs">
                    {{ formatExcedent(flight.statistics?.excedents) }}
                  </Badge>
                </div>
                <span v-else class="text-muted-foreground">—</span>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(flight.status)">
                  {{ formatStatus(flight.status) }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- VOLS NON-COMMERCIAUX -->
    <div v-if="nonCommercialFlights.length > 0">
      <div class="mb-3 flex items-center gap-2">
        <Badge variant="secondary">Non-Commercial ({{ nonCommercialFlights.length }})</Badge>
      </div>
      
      <div class="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/50">
              <TableHead class="w-[100px]">N° Vol</TableHead>
              <TableHead>Exploitant</TableHead>
              <TableHead>Immatriculation</TableHead>
              <TableHead class="text-center">Passagers</TableHead>
              <TableHead class="text-center">Fret</TableHead>
              <TableHead class="text-center">Excédent</TableHead>
              <TableHead class="w-[100px]">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="flight in nonCommercialFlights" :key="flight.id" class="hover:bg-muted/30">
              <TableCell class="font-medium">{{ flight.flight_number }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Building2 class="h-4 w-4 text-muted-foreground" />
                  <span>{{ flight.operator?.name || 'N/A' }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Plane class="h-4 w-4 text-muted-foreground" />
                  <span class="font-mono text-sm">{{ flight.aircraft || 'N/A' }}</span>
                </div>
              </TableCell>
              <TableCell class="text-center">
                <div v-if="flight.statistics">
                  <div class="font-semibold">{{ flight.statistics.passengers_count }}</div>
                  <div v-if="flight.statistics.passengers_ecart !== 0" class="text-xs mt-1">
                    <Badge 
                      :variant="flight.statistics.passengers_ecart > 0 ? 'destructive' : 'default'" 
                      class="text-xs"
                    >
                      {{ flight.statistics.passengers_ecart > 0 ? '+' : '' }}{{ flight.statistics.passengers_ecart }}
                    </Badge>
                  </div>
                </div>
                <span v-else class="text-muted-foreground">—</span>
              </TableCell>
              <TableCell class="text-center">
                <div v-if="hasFret(flight)">
                  <Badge variant="outline" class="text-xs">
                    {{ formatFret(flight.statistics?.fret_count) }}
                  </Badge>
                </div>
                <span v-else class="text-muted-foreground">—</span>
              </TableCell>
              <TableCell class="text-center">
                <div v-if="hasExcedent(flight)">
                  <Badge variant="secondary" class="text-xs">
                    {{ formatExcedent(flight.statistics?.excedents) }}
                  </Badge>
                </div>
                <span v-else class="text-muted-foreground">—</span>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(flight.status)">
                  {{ formatStatus(flight.status) }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Message si aucun vol -->
    <div v-if="commercialFlights.length === 0 && nonCommercialFlights.length === 0" class="text-center py-8 text-muted-foreground">
      Aucun vol {{ regime === 'domestic' ? 'domestique' : 'international' }} ce jour
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Building2, Plane } from 'lucide-vue-next'
import type { Flight, FlightStatus } from '~/types/api'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps<{
  flights: Flight[]
  regime: 'domestic' | 'international'
}>()

// Séparer par type (Commercial en premier, Non-Commercial en second)
const commercialFlights = computed(() => {
  return props.flights
    .filter(f => f.flight_nature === 'commercial')
    .sort((a, b) => a.flight_number.localeCompare(b.flight_number))
})

const nonCommercialFlights = computed(() => {
  return props.flights
    .filter(f => f.flight_nature === 'non_commercial')
    .sort((a, b) => a.flight_number.localeCompare(b.flight_number))
})

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

const hasFret = (flight: Flight) => {
  return flight.statistics?.fret_count && 
         Array.isArray(flight.statistics.fret_count) && 
         flight.statistics.fret_count.length > 0
}

const hasExcedent = (flight: Flight) => {
  return flight.statistics?.excedents && 
         Array.isArray(flight.statistics.excedents) && 
         flight.statistics.excedents.length > 0
}

const formatFret = (fret: any[] | null | undefined) => {
  if (!fret || !Array.isArray(fret) || fret.length === 0) return '—'
  
  // Si c'est un tableau d'objets avec des valeurs
  if (typeof fret[0] === 'object') {
    const total = fret.reduce((sum, item) => {
      return sum + (item.weight || item.value || 0)
    }, 0)
    return `${total} kg`
  }
  
  // Si c'est juste des nombres
  const total = fret.reduce((sum, val) => sum + (Number(val) || 0), 0)
  return `${total} kg`
}

const formatExcedent = (excedents: any[] | null | undefined) => {
  if (!excedents || !Array.isArray(excedents) || excedents.length === 0) return '—'
  
  // Même logique que pour le fret
  if (typeof excedents[0] === 'object') {
    const total = excedents.reduce((sum, item) => {
      return sum + (item.weight || item.value || 0)
    }, 0)
    return `${total} kg`
  }
  
  const total = excedents.reduce((sum, val) => sum + (Number(val) || 0), 0)
  return `${total} kg`
}
</script>