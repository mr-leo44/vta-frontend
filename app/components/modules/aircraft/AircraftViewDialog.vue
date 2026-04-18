<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl md:max-w-5xl max-h-[90vh] overflow-y-auto">

      <!-- Header -->
      <DialogHeader>
        <DialogTitle class="flex items-center gap-3">
          <div
            class="h-9 w-9 rounded-lg flex items-center justify-center"
            :class="aircraft?.in_activity ? 'bg-green-50 dark:bg-green-950' : 'bg-muted'"
          >
            <Plane
              class="h-[18px] w-[18px]"
              :class="aircraft?.in_activity ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'"
              :stroke-width="1.5"
            />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono">{{ aircraft?.immatriculation }}</span>
              <span
                class="text-[11px] font-medium px-1.5 py-0.5 rounded border"
                :class="aircraft?.in_activity
                  ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                  : 'bg-muted text-muted-foreground border-border'"
              >
                {{ aircraft?.in_activity ? 'En activité' : 'Inactif' }}
              </span>
            </div>
          </div>
        </DialogTitle>
        <DialogDescription>
          Informations détaillées et statistiques de l'aéronef
        </DialogDescription>
      </DialogHeader>

      <div v-if="aircraft" class="space-y-5 mt-2">

        <!-- Informations générales -->
        <div>
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Informations générales
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
              <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Layers class="h-4 w-4 text-muted-foreground" :stroke-width="1.5" />
              </div>
              <div class="min-w-0">
                <p class="text-[11px] text-muted-foreground font-medium">Type d'aéronef</p>
                <p class="font-semibold text-sm truncate">
                  {{ aircraft.type?.name || 'Type inconnu' }}
                  <span v-if="aircraft.type?.sigle" class="font-mono font-normal text-muted-foreground ml-1">
                    ({{ aircraft.type.sigle }})
                  </span>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
              <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Building2 class="h-4 w-4 text-muted-foreground" :stroke-width="1.5" />
              </div>
              <div class="min-w-0">
                <p class="text-[11px] text-muted-foreground font-medium">Exploitant</p>
                <p class="font-semibold text-sm truncate">{{ aircraft.operator?.name || 'Inconnu' }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
              <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Weight class="h-4 w-4 text-muted-foreground" :stroke-width="1.5" />
              </div>
              <div class="min-w-0">
                <p class="text-[11px] text-muted-foreground font-medium">PMAD</p>
                <p class="font-semibold text-sm font-mono">
                  {{ aircraft.pmad ? `${kgToTons(aircraft.pmad)} (${formatWeight(aircraft.pmad)})` : '—' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
              <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Hash class="h-4 w-4 text-muted-foreground" :stroke-width="1.5" />
              </div>
              <div class="min-w-0">
                <p class="text-[11px] text-muted-foreground font-medium">Immatriculation</p>
                <p class="font-semibold text-sm font-mono">{{ aircraft.immatriculation }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- KPIs vols -->
        <div>
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <TrendingUp class="h-3.5 w-3.5" />
            Statistiques des vols ({{ currentYear }})
          </p>
          <p class="text-[11px] text-amber-600 dark:text-amber-400 mb-3">
            Ces données proviennent des livres de trafic enregistrés par les VTA.
          </p>

          <div v-if="loadingKPIs" class="grid gap-3 sm:grid-cols-3">
            <Skeleton v-for="i in 3" :key="i" class="h-24 rounded-xl" />
          </div>

          <div v-else-if="kpis" class="grid gap-3 sm:grid-cols-3">
            <div class="bg-card border border-border rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cette année</span>
                <div class="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <PlaneTakeoff class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
                </div>
              </div>
              <p class="text-2xl font-bold text-foreground">{{ kpis.total_flights_current_year }}</p>
              <p class="text-[11px] text-muted-foreground mt-1.5">
                {{ kpis.average_flights_per_month }} vols/mois en moyenne
              </p>
            </div>

            <div class="bg-card border border-border rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ce mois</span>
                <div class="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <Calendar class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
                </div>
              </div>
              <p class="text-2xl font-bold text-foreground">{{ kpis.total_flights_current_month }}</p>
              <p class="text-[11px] text-muted-foreground mt-1.5 capitalize">{{ currentMonth }}</p>
            </div>

            <div class="bg-card border border-border rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dernier vol</span>
                <div class="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <Clock class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
                </div>
              </div>
              <p class="text-sm font-bold text-foreground">
                {{ kpis.last_flight_date ? formatDate(kpis.last_flight_date) : '—' }}
              </p>
              <p class="text-[11px] text-muted-foreground mt-1.5">date du dernier vol</p>
            </div>
          </div>
        </div>

        <!-- Graphiques -->
        <AircraftKPIsCharts v-if="kpis && !loadingKPIs" :kpis="kpis" :flights="aircraft.flights" />

        <!-- Vols récents -->
        <div>
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <PlaneTakeoff class="h-3.5 w-3.5" />
            Vols récents ({{ aircraft.flights?.length || 0 }})
          </p>

          <div v-if="!aircraft.flights || aircraft.flights.length === 0"
            class="text-center py-10 text-sm text-muted-foreground"
          >
            Aucun vol enregistré
          </div>

          <div v-else class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            <div
              v-for="flight in aircraft.flights.slice(0, 10)"
              :key="flight.id"
              class="flex items-center justify-between px-3 py-2.5 bg-card border border-border rounded-lg"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                  <PlaneTakeoff class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-sm">{{ flight.flight_number }}</p>
                  <p class="text-xs text-muted-foreground truncate">{{ formatFlightRoute(flight.departure) }}</p>
                </div>
              </div>
              <div class="text-right shrink-0 ml-3">
                <span
                  class="text-[11px] font-medium px-1.5 py-0.5 rounded border"
                  :class="getStatusClass(flight.status)"
                >
                  {{ formatStatus(flight.status) }}
                </span>
                <p class="text-[10px] text-muted-foreground mt-0.5">{{ formatDate(flight.departure_time) }}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Métadonnées -->
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
            <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <CalendarPlus class="h-4 w-4 text-muted-foreground" :stroke-width="1.5" />
            </div>
            <div>
              <p class="text-[11px] text-muted-foreground font-medium">Date de création</p>
              <p class="font-semibold text-sm">{{ formatDate(aircraft.created_at) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
            <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <CalendarClock class="h-4 w-4 text-muted-foreground" :stroke-width="1.5" />
            </div>
            <div>
              <p class="text-[11px] text-muted-foreground font-medium">Dernière modification</p>
              <p class="font-semibold text-sm">{{ formatDate(aircraft.updated_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer responsive — même pattern que AircraftTypeViewDialog -->
      <div class="mt-4 pt-4 border-t border-border">
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">

          <!-- Gauche desktop / bas mobile : Supprimer -->
          <Button
            v-if="canDelete"
            variant="outline"
            size="sm"
            class="w-full sm:w-auto gap-1.5
                   text-destructive border-destructive/30
                   hover:bg-destructive/10 hover:border-destructive/50
                   focus-visible:ring-destructive/30
                   disabled:opacity-50"
            @click="handleDelete"
            :disabled="deleting"
          >
            <div v-if="deleting" class="h-3.5 w-3.5 rounded-full border-2 border-destructive/30 border-t-destructive animate-spin" />
            <Trash2 v-else class="h-3.5 w-3.5" />
            Supprimer
          </Button>
          <div v-else class="hidden sm:block" />

          <!-- Droite desktop / haut mobile : Fermer + Modifier -->
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button variant="outline" size="sm" class="w-full sm:w-auto gap-1.5" @click="isOpen = false">
              <X class="h-3.5 w-3.5" />
              Fermer
            </Button>
            <Button v-if="canEdit" size="sm" class="w-full sm:w-auto gap-1.5" @click="handleEdit">
              <Pencil class="h-3.5 w-3.5" />
              Modifier
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- Confirm delete -->
  <AlertDialog v-model:open="deleteConfirmOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle class="flex items-center gap-2">
          <AlertTriangle class="h-5 w-5 text-destructive" />
          Confirmer la suppression
        </AlertDialogTitle>
        <AlertDialogDescription>
          Êtes-vous sûr de vouloir supprimer l'aéronef
          <strong class="text-foreground font-mono">{{ aircraft?.immatriculation }}</strong> ?
          Cette action est irréversible et supprimera toutes les données associées.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
        <AlertDialogAction
          @click="confirmDeleteAction"
          class="bg-destructive text-white hover:bg-destructive/90 gap-2"
          :disabled="deleting"
        >
          <div v-if="deleting" class="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <Trash2 v-else class="h-4 w-4" />
          Supprimer définitivement
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Pencil, Trash2, Plane, Building2, Layers, TrendingUp,
  PlaneTakeoff, X, Weight, Hash, Calendar, Clock,
  CalendarPlus, CalendarClock, AlertTriangle
} from 'lucide-vue-next'
import type { Aircraft, AircraftKPIs, FlightStatus } from '~/types/api'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import AircraftKPIsCharts from '~/components/modules/aircraft/AircraftKPIsCharts.vue'

const props = defineProps<{
  aircraft: Aircraft | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [aircraft: Aircraft]
  delete: [aircraft: Aircraft]
}>()

const aircraftsStore = useAircraftsStore()
const { kgToTons, formatWeight } = useAircraftUtils()
const { success: showSuccess, error: showError } = useToast()
const { can } = usePermission()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const canEdit   = computed(() => can('aircraft.update'))
const canDelete = computed(() => can('aircraft.delete'))

const currentYear  = new Date().getFullYear()
const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long' })
const kpis         = ref<AircraftKPIs | null>(null)
const loadingKPIs  = ref(false)
const deleting     = ref(false)
const deleteConfirmOpen = ref(false)

watch(() => props.open, async (open) => {
  if (open && props.aircraft) {
    loadingKPIs.value = true
    kpis.value = await aircraftsStore.fetchAircraftKPIs(props.aircraft.id)
    loadingKPIs.value = false
  }
}, { immediate: true })

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

const formatFlightRoute = (departure: any) => {
  const from = departure?.from
  const to   = departure?.to
  if (from?.iata && to?.iata) return `${from.iata} (${from.name || '?'}) → ${to.iata} (${to.name || '?'})`
  if (from?.iata) return `${from.iata} (${from.name || '?'})`
  return 'Lieu introuvable'
}

const formatStatus = (status: FlightStatus) => {
  const map: Record<FlightStatus, string> = {
    qrf: 'QRF', prevu: 'Prévu', embarque: 'Embarqué', annule: 'Annulé', detourne: 'Détourné'
  }
  return map[status] ?? status
}

const getStatusClass = (status: FlightStatus) => {
  const map: Record<FlightStatus, string> = {
    qrf:      'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    prevu:    'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    embarque: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    annule:   'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    detourne: 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  }
  return map[status] ?? 'bg-muted text-muted-foreground border-border'
}

const handleEdit = () => {
  if (props.aircraft) { emit('edit', props.aircraft); isOpen.value = false }
}

const handleDelete = () => { deleteConfirmOpen.value = true }

const confirmDeleteAction = async () => {
  if (!props.aircraft) return
  deleting.value = true
  try {
    const result = await aircraftsStore.deleteAircraft(props.aircraft.id)
    if (result.success) {
      showSuccess('Aéronef supprimé avec succès')
      deleteConfirmOpen.value = false
      isOpen.value            = false
      emit('delete', props.aircraft)
    } else {
      throw new Error(result.message)
    }
  } catch (err: any) {
    showError(err?.message || 'Impossible de supprimer cet aéronef.')
  } finally {
    deleting.value = false
  }
}
</script>