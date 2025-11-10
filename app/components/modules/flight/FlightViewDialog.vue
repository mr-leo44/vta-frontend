<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <PlaneTakeoff class="h-5 w-5" />
          Vol {{ flight?.flight_number }}
        </DialogTitle>
        <DialogDescription>
          Informations détaillées et statistiques du vol
        </DialogDescription>
      </DialogHeader>

      <div v-if="flight" class="space-y-6">
        <!-- Informations principales -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Informations du vol</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Numéro de vol</label>
                <p class="text-base font-semibold">{{ flight.flight_number }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Statut</label>
                <div class="mt-1">
                  <Badge :variant="getStatusVariant(flight.status)">
                    {{ formatStatus(flight.status) }}
                  </Badge>
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Exploitant</label>
                <p class="text-base flex items-center gap-2">
                  <Building2 class="h-4 w-4" />
                  {{ flight.operator?.name || 'N/A' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Aéronef</label>
                <p class="text-base flex items-center gap-2">
                  <Plane class="h-4 w-4" />
                  {{ flight.aircraft || 'N/A' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Régime</label>
                <Badge variant="outline">
                  {{ flight.flight_regime === 'domestic' ? 'Domestique' : 'International' }}
                </Badge>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Type</label>
                <Badge variant="outline">
                  {{ flight.flight_type === 'regular' ? 'Régulier' : 'Non régulier' }}
                </Badge>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Nature</label>
                <Badge variant="outline">
                  {{ flight.flight_nature === 'commercial' ? 'Commercial' : 'Non commercial' }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Route et horaires -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Itinéraire</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="text-2xl font-bold">{{ formatLocation(flight.departure) }}</div>
                <div class="text-sm text-muted-foreground mt-1">Départ</div>
                <div class="text-sm font-medium mt-2">
                  {{ formatDateTime(flight.departure_time) }}
                </div>
              </div>
              
              <div class="px-8">
                <ArrowRight class="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div class="flex-1 text-right">
                <div class="text-2xl font-bold">{{ formatLocation(flight.arrival) }}</div>
                <div class="text-sm text-muted-foreground mt-1">Arrivée</div>
                <div class="text-sm font-medium mt-2">
                  {{ formatDateTime(flight.arrival_time) }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Statistiques passagers -->
        <Card v-if="flight.statistics">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Users class="h-4 w-4" />
              Statistiques passagers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 md:grid-cols-3">
              <div class="p-4 border rounded-lg">
                <div class="text-sm text-muted-foreground">Total passagers</div>
                <div class="text-2xl font-bold">{{ flight.statistics.passengers_count }}</div>
              </div>
              <div class="p-4 border rounded-lg">
                <div class="text-sm text-muted-foreground">Passagers business</div>
                <div class="text-2xl font-bold">{{ flight.statistics.pax_bus }}</div>
              </div>
              <div class="p-4 border rounded-lg">
                <div class="text-sm text-muted-foreground">Go pass</div>
                <div class="text-2xl font-bold">{{ flight.statistics.go_pass_count }}</div>
              </div>
              <div class="p-4 border rounded-lg" :class="getEcartClass(flight.statistics.passengers_ecart)">
                <div class="text-sm text-muted-foreground">Écart passagers</div>
                <div class="text-2xl font-bold">
                  {{ flight.statistics.passengers_ecart > 0 ? '+' : '' }}{{ flight.statistics.passengers_ecart }}
                </div>
              </div>
            </div>

            <!-- Fret -->
            <div v-if="flight.statistics.fret_count" class="mt-4 pt-4 border-t">
              <div class="text-sm font-medium mb-2">Fret</div>
              <div class="text-muted-foreground">
                {{ JSON.stringify(flight.statistics.fret_count) }}
              </div>
            </div>

            <!-- Excédents -->
            <div v-if="flight.statistics.excedents" class="mt-4 pt-4 border-t">
              <div class="text-sm font-medium mb-2">Excédents</div>
              <div class="text-muted-foreground">
                {{ JSON.stringify(flight.statistics.excedents) }}
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
            <div v-if="flight.statistics.justification">
              <Alert>
                <AlertCircle class="h-4 w-4" />
                <AlertDescription>
                  {{ JSON.stringify(flight.statistics.justification) }}
                </AlertDescription>
              </Alert>
            </div>
            <div v-else class="text-sm text-muted-foreground">
              Justification requise mais non fournie
            </div>
          </CardContent>
        </Card>

        <!-- Remarques -->
        <Card v-if="flight.remarks">
          <CardHeader>
            <CardTitle class="text-base">Remarques</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm">{{ flight.remarks }}</p>
          </CardContent>
        </Card>

        <Separator />

        <!-- Métadonnées -->
        <div class="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
          <div>
            <label class="font-medium">ID du vol</label>
            <p class="mt-1">{{ flight.id }}</p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">
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
  AlertCircle
} from 'lucide-vue-next'
import type { Flight, FlightStatus } from '~/types/api'
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
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

const formatLocation = (location: any[]) => {
  return location?.[0] || '???'
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
  if (ecart > 0) return 'bg-red-50 border-red-200'
  if (ecart < 0) return 'bg-green-50 border-green-200'
  return ''
}

const handleEdit = () => {
  if (props.flight) {
    emit('edit', props.flight)
    isOpen.value = false
  }
}
</script>