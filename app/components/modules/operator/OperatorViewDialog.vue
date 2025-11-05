<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl md:max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Building2 class="h-5 w-5" />
          {{ operator?.name }}
        </DialogTitle>
        <DialogDescription>
          Informations détaillées et statistiques de l'exploitant
        </DialogDescription>
      </DialogHeader>

      <div v-if="operator" class="space-y-6">
        <!-- Informations principales -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Informations générales</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Nom</label>
                <p class="text-base font-semibold">{{ operator.name }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Sigle</label>
                <p class="text-base font-semibold">{{ operator.sigle }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Code IATA</label>
                <p class="text-base">{{ operator.iata_code || '—' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Code OACI</label>
                <p class="text-base">{{ operator.icao_code || '—' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Pays</label>
                <p class="text-base flex items-center gap-2">
                  <MapPin class="h-4 w-4" />
                  {{ operator.country || '—' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Type et nature</label>
                <div class="flex gap-2 mt-1">
                  <Badge :variant="operator.flight_type.value === 'regular' ? 'default' : 'secondary'">
                    {{ operator.flight_type.label }}
                  </Badge>
                  <Badge :variant="operator.flight_nature.value === 'commercial' ? 'default' : 'secondary'">
                    {{ operator.flight_nature.label }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- KPIs Vols -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <TrendingUp class="h-4 w-4" />
              Statistiques des vols ({{ currentYear }})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="loadingKPIs" class="space-y-3">
              <Skeleton class="h-20 w-full" />
              <Skeleton class="h-20 w-full" />
            </div>
            <div v-else-if="kpis" class="grid gap-4 md:grid-cols-3">
              <div class="p-4 border rounded-lg">
                <div class="text-sm text-muted-foreground">Vols cette année</div>
                <div class="text-2xl font-bold">{{ kpis.total_flights_current_year }}</div>
                <div class="text-xs text-muted-foreground mt-1">
                  {{ kpis.total_flights_previous_year }} en {{ currentYear - 1 }}
                </div>
              </div>
              <div class="p-4 border rounded-lg">
                <div class="text-sm text-muted-foreground">Croissance</div>
                <div class="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp v-if="kpis.growth_percentage > 0" class="h-5 w-5 text-green-600" />
                  <TrendingDown v-else-if="kpis.growth_percentage < 0" class="h-5 w-5 text-red-600" />
                  <span :class="kpis.growth_percentage > 0 ? 'text-green-600' : kpis.growth_percentage < 0 ? 'text-red-600' : ''">
                    {{ kpis.growth_percentage > 0 ? '+' : '' }}{{ kpis.growth_percentage }}%
                  </span>
                </div>
                <div class="text-xs text-muted-foreground mt-1">vs année précédente</div>
              </div>
              <div class="p-4 border rounded-lg">
                <div class="text-sm text-muted-foreground">Total aéronefs</div>
                <div class="text-2xl font-bold">{{ kpis.total_aircrafts }}</div>
                <div class="text-xs text-muted-foreground mt-1">
                  {{ kpis.active_aircrafts_count }} actifs, {{ kpis.inactive_aircrafts_count }} inactifs
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
         <!-- Graphiques -->
        <OperatorKPIsCharts v-if="kpis && !loadingKPIs" :kpis="kpis" />

        <!-- Flotte -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Plane class="h-4 w-4" />
              Flotte ({{ operator.aircrafts?.length || 0 }} aéronefs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="!operator.aircrafts || operator.aircrafts.length === 0" class="text-center py-8 text-muted-foreground">
              Aucun aéronef enregistré
            </div>
            <div v-else class="space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="aircraft in operator.aircrafts"
                :key="aircraft.id"
                class="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div :class="[
                    'h-8 w-8 rounded-full flex items-center justify-center',
                    aircraft.in_activity ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  ]">
                    <Plane class="h-4 w-4" />
                  </div>
                  <div>
                    <div class="font-medium">{{ aircraft.immatriculation }}</div>
                    <div class="text-sm text-muted-foreground">
                      {{ aircraft.aircraft_type?.name || 'Type inconnu' }}
                      <span v-if="aircraft.aircraft_type?.sigle"> ({{ aircraft.aircraft_type.sigle }})</span>
                    </div>
                  </div>
                </div>
                <Badge :variant="aircraft.in_activity ? 'default' : 'secondary'">
                  {{ aircraft.in_activity ? 'En activité' : 'Inactif' }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <!-- Dates -->
        <div class="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
          <div>
            <label class="font-medium">Créé le</label>
            <p class="mt-1">{{ formatDate(operator.created_at) }}</p>
          </div>
          <div>
            <label class="font-medium">Modifié le</label>
            <p class="mt-1">{{ formatDate(operator.updated_at) }}</p>
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
import { ref, computed, watch } from 'vue'
import { 
  Pencil, 
  MapPin, 
  Building2, 
  Plane, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-vue-next'
import type { Operator, OperatorKPIs } from '~/types/api'
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
import { Skeleton } from '@/components/ui/skeleton'
import OperatorKPIsCharts from '~/components/modules/operator/OperatorKPIsCharts.vue'

const props = defineProps<{
  operator: Operator | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [operator: Operator]
}>()

const operatorsStore = useOperatorsStore()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const currentYear = new Date().getFullYear()
const kpis = ref<OperatorKPIs | null>(null)
const loadingKPIs = ref(false)

// Charger les KPIs quand le dialog s'ouvre
watch(() => props.open, async (open) => {
  if (open && props.operator) {
    loadingKPIs.value = true
    kpis.value = await operatorsStore.fetchOperatorKPIs(props.operator.id)
    loadingKPIs.value = false
  }
}, { immediate: true })

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleEdit = () => {
  if (props.operator) {
    emit('edit', props.operator)
    isOpen.value = false
  }
}
</script>