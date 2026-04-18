<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl md:max-w-5xl max-h-[90vh] overflow-y-auto">

      <!-- Header -->
      <DialogHeader>
        <DialogTitle class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
            <Layers class="h-[18px] w-[18px] text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span>{{ aircraftType?.name }}</span>
              <span class="inline-flex items-center font-mono text-[11px] font-medium px-1.5 py-0.5 rounded
                           bg-muted border border-border text-muted-foreground">
                {{ aircraftType?.sigle }}
              </span>
            </div>
          </div>
        </DialogTitle>
        <DialogDescription>
          Informations détaillées et statistiques du type d'aéronef
        </DialogDescription>
      </DialogHeader>

      <div v-if="aircraftType" class="space-y-5 mt-2">

        <!-- KPIs principaux -->
        <div>
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <BarChart3 class="h-3.5 w-3.5" />
            Indicateurs clés ({{ currentYear }})
          </p>

          <div v-if="loadingKPIs" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton v-for="i in 4" :key="i" class="h-24 w-full rounded-xl" />
          </div>

          <div v-else-if="kpis" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Flotte -->
            <div class="bg-card border border-border rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Flotte</span>
                <div class="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <Plane class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
                </div>
              </div>
              <p class="text-2xl font-bold text-foreground">{{ kpis.total_aircrafts }}</p>
              <div class="flex items-center gap-2 mt-1.5">
                <span class="inline-flex items-center gap-1 text-[11px] text-green-700 dark:text-green-300">
                  <span class="h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span>
                  {{ kpis.active_aircrafts }}
                </span>
                <span class="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span class="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 inline-block"></span>
                  {{ kpis.inactive_aircrafts }}
                </span>
              </div>
            </div>

            <!-- Exploitants -->
            <div class="bg-card border border-border rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exploitants</span>
                <div class="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <Building2 class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
                </div>
              </div>
              <p class="text-2xl font-bold text-foreground">{{ kpis.total_operators }}</p>
              <p class="text-[11px] text-muted-foreground mt-1.5">compagnies</p>
            </div>

            <!-- Vols -->
            <div class="bg-card border border-border rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vols {{ currentYear }}</span>
                <div class="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <PlaneTakeoff class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
                </div>
              </div>
              <p class="text-2xl font-bold text-foreground">{{ kpis.total_flights_current_year.toLocaleString() }}</p>
              <p class="text-[11px] text-muted-foreground mt-1.5">{{ kpis.total_flights.toLocaleString() }} au total</p>
            </div>

            <!-- Utilisation -->
            <div class="bg-card border border-border rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Utilisation</span>
                <div class="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <Activity class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
                </div>
              </div>
              <p class="text-2xl font-bold text-foreground">{{ kpis.utilization_rate }}%</p>
              <p class="text-[11px] text-muted-foreground mt-1.5">{{ kpis.active_aircrafts }}/{{ kpis.total_aircrafts }} actifs</p>
            </div>
          </div>
        </div>

        <!-- Métriques secondaires -->
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
            <div class="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Weight class="h-4 w-4 text-muted-foreground" :stroke-width="1.5" />
            </div>
            <div class="min-w-0">
              <p class="text-[11px] text-muted-foreground font-medium">PMAD moyen</p>
              <p class="font-semibold text-sm">{{ formatWeight(kpis?.average_pmad) }} ({{ kgToTons(kpis?.average_pmad) }})</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
            <div class="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Target class="h-4 w-4 text-muted-foreground" :stroke-width="1.5" />
            </div>
            <div class="min-w-0">
              <p class="text-[11px] text-muted-foreground font-medium">Vols / aéronef</p>
              <p class="font-semibold text-sm">{{ kpis?.flights_per_aircraft || 0 }}<span class="text-xs font-normal text-muted-foreground ml-1">moy. annuelle</span></p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
            <div class="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <TrendingUp class="h-4 w-4 text-muted-foreground" :stroke-width="1.5" />
            </div>
            <div class="min-w-0">
              <p class="text-[11px] text-muted-foreground font-medium">Performance</p>
              <p class="font-semibold text-sm">{{ getPerformanceLabel(kpis?.flights_per_aircraft || 0) }}</p>
            </div>
          </div>
        </div>

        <!-- Exploitants -->
        <div>
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Building2 class="h-3.5 w-3.5" />
            Exploitants utilisant ce type ({{ operators.length }})
          </p>

          <div v-if="loadingOperators" class="space-y-1.5">
            <Skeleton v-for="i in 4" :key="i" class="h-16 w-full rounded-lg" />
          </div>
          <div v-else-if="operators.length === 0" class="text-center py-10 text-sm text-muted-foreground">
            Aucun exploitant n'utilise ce type
          </div>
          <div v-else class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="operator in operators"
              :key="operator.id"
              class="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-blue-400/60 transition-colors"
            >
              <div class="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                <Building2 class="h-4 w-4 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ operator.name }}</p>
                <p class="text-xs text-muted-foreground font-mono mt-0.5">
                  {{ operator.sigle }}<span v-if="operator.country"> · {{ operator.country }}</span>
                </p>
              </div>
              <div class="flex flex-col gap-1 shrink-0 items-end">
                <span class="text-[11px] font-medium text-foreground">{{ operator.aircrafts_count }} ap.</span>
                <span class="inline-flex items-center gap-1 text-[11px] text-green-700 dark:text-green-300">
                  <span class="h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span>
                  {{ operator.active_aircrafts_count }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Flotte -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Plane class="h-3.5 w-3.5" />
              Flotte complète ({{ aircrafts.length }})
            </p>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 text-[11px] text-green-700 dark:text-green-300">
                <span class="h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span>
                {{ activeAircraftsCount }} actifs
              </span>
              <span class="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <span class="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 inline-block"></span>
                {{ inactiveAircraftsCount }} inactifs
              </span>
            </div>
          </div>

          <div v-if="loadingAircrafts" class="space-y-1.5">
            <Skeleton v-for="i in 4" :key="i" class="h-14 w-full rounded-lg" />
          </div>
          <div v-else-if="aircrafts.length === 0" class="text-center py-10 text-sm text-muted-foreground">
            Aucun aéronef enregistré
          </div>
          <div v-else class="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            <div
              v-for="aircraft in aircrafts"
              :key="aircraft.id"
              class="flex items-center gap-3 px-3 py-2.5 bg-card border border-border rounded-lg"
              :class="aircraft.in_activity ? 'border-green-200/60 dark:border-green-900/60' : ''"
            >
              <div
                class="h-7 w-7 rounded-md flex items-center justify-center shrink-0"
                :class="aircraft.in_activity ? 'bg-green-50 dark:bg-green-950' : 'bg-muted'"
              >
                <Plane
                  class="h-3.5 w-3.5"
                  :class="aircraft.in_activity ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'"
                  :stroke-width="1.5"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-mono font-semibold text-sm">{{ aircraft.immatriculation }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ aircraft.operator?.name || 'Opérateur inconnu' }}
                  <span v-if="aircraft.pmad"> · PMAD {{ formatWeight(aircraft.pmad) }}</span>
                </p>
              </div>
              <span
                class="text-[11px] font-medium px-1.5 py-0.5 rounded border"
                :class="aircraft.in_activity
                  ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                  : 'bg-muted text-muted-foreground border-border'"
              >
                {{ aircraft.in_activity ? 'Actif' : 'Inactif' }}
              </span>
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
              <p class="font-semibold text-sm">{{ formatDate(aircraftType.created_at) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
            <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <CalendarClock class="h-4 w-4 text-muted-foreground" :stroke-width="1.5" />
            </div>
            <div>
              <p class="text-[11px] text-muted-foreground font-medium">Dernière modification</p>
              <p class="font-semibold text-sm">{{ formatDate(aircraftType.updated_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <!--
        Layout responsive :
        - Mobile  : colonne, Supprimer en dernier (bas), pleine largeur, séparé par un trait
        - Desktop : ligne,   Supprimer à gauche (mr-auto), Fermer + Modifier à droite
        On n'utilise pas <DialogFooter> dont le flex-col-reverse casse le mr-auto mobile.
      -->
      <div class="mt-4 pt-4 border-t border-border">

        <!-- Zone actions principales : Fermer + Modifier -->
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
            <div
              v-if="deleting"
              class="h-3.5 w-3.5 rounded-full border-2 border-destructive/30 border-t-destructive animate-spin"
            />
            <Trash2 v-else class="h-3.5 w-3.5" />
            Supprimer
          </Button>

          <!-- Spacer quand pas de bouton Supprimer (garde l'alignement droite) -->
          <div v-else class="hidden sm:block" />

          <!-- Droite desktop / haut mobile : Fermer + Modifier -->
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button variant="outline" size="sm" class="w-full sm:w-auto gap-1.5" @click="isOpen = false">
              <X class="h-3.5 w-3.5" />
              Fermer
            </Button>
            <Button
              v-if="canEdit"
              size="sm"
              class="w-full sm:w-auto gap-1.5"
              @click="handleEdit"
            >
              <Pencil class="h-3.5 w-3.5" />
              Modifier
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- Dialog confirmation suppression intégré dans ce composant -->
  <AlertDialog v-model:open="deleteConfirmOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle class="flex items-center gap-2">
          <AlertTriangle class="h-5 w-5 text-destructive" />
          Confirmer la suppression
        </AlertDialogTitle>
        <AlertDialogDescription class="space-y-2">
          <p>
            Êtes-vous sûr de vouloir supprimer le type
            <strong class="text-foreground">{{ aircraftType?.name }}</strong> ?
          </p>
          <p
            v-if="hasLinkedAircrafts"
            class="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm font-medium"
          >
            <AlertTriangle class="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Ce type est utilisé par {{ kpis?.total_aircrafts }} aéronef(s).
              Cette action est irréversible.
            </span>
          </p>
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
  Pencil, Trash2, Layers, Plane, Building2, PlaneTakeoff,
  CalendarPlus, CalendarClock, X, BarChart3, Activity,
  Weight, Target, TrendingUp, AlertTriangle
} from 'lucide-vue-next'
import type { AircraftType, AircraftTypeKPIs, OperatorWithAircraftCount } from '~/types/api'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  aircraftType: AircraftType | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [aircraftType: AircraftType]
  delete: [aircraftType: AircraftType]
}>()

const aircraftTypesStore = useAircraftTypesStore()
const { kgToTons, formatWeight } = useAircraftUtils()
const { success: showSuccess, error: showError } = useToast()
const { can } = usePermission()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const canEdit   = computed(() => can('aircraftType.update'))
const canDelete = computed(() => can('aircraftType.delete'))

const currentYear     = new Date().getFullYear()
const kpis            = ref<AircraftTypeKPIs | null>(null)
const operators       = ref<OperatorWithAircraftCount[]>([])
const aircrafts       = ref<any[]>([])
const loadingKPIs     = ref(false)
const loadingOperators = ref(false)
const loadingAircrafts = ref(false)
const deleting        = ref(false)
const deleteConfirmOpen = ref(false)

const activeAircraftsCount   = computed(() => aircrafts.value.filter(a => a.in_activity).length)
const inactiveAircraftsCount = computed(() => aircrafts.value.filter(a => !a.in_activity).length)
const hasLinkedAircrafts     = computed(() => (kpis.value?.total_aircrafts ?? 0) > 0)

// Charger les données à l'ouverture
watch(() => props.open, async (open) => {
  if (open && props.aircraftType) {
    loadingKPIs.value = true
    kpis.value = await aircraftTypesStore.fetchAircraftTypeKPIs(props.aircraftType.id)
    loadingKPIs.value = false

    loadingOperators.value = true
    operators.value = await aircraftTypesStore.fetchOperatorsByType(props.aircraftType.id)
    loadingOperators.value = false

    loadingAircrafts.value = true
    aircrafts.value = await aircraftTypesStore.fetchAircraftsByType(props.aircraftType.id)
    loadingAircrafts.value = false
  }
}, { immediate: true })

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const getPerformanceLabel = (v: number) => {
  if (v > 200) return 'Excellent'
  if (v > 100) return 'Très bon'
  if (v > 50)  return 'Bon'
  if (v > 20)  return 'Moyen'
  return 'Faible'
}

const handleEdit = () => {
  if (props.aircraftType) {
    emit('edit', props.aircraftType)
    isOpen.value = false
  }
}

// Ouvre le dialog de confirmation (bouton footer)
const handleDelete = () => {
  deleteConfirmOpen.value = true
}

// Confirme et exécute la suppression via l'API
const confirmDeleteAction = async () => {
  if (!props.aircraftType) return
  deleting.value = true
  try {
    const result = await aircraftTypesStore.deleteAircraftType(props.aircraftType.id)
    if (result.success) {
      showSuccess('Type supprimé avec succès')
      deleteConfirmOpen.value = false
      isOpen.value            = false
      // On notifie le parent pour qu'il recharge si besoin
      emit('delete', props.aircraftType)
    } else {
      throw new Error(result.message)
    }
  } catch (err: any) {
    showError(err?.message || 'Impossible de supprimer ce type.')
  } finally {
    deleting.value = false
  }
}
</script>