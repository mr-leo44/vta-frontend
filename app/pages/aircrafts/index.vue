<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Aéronefs</h1>
        <p class="text-sm text-muted-foreground mt-0.5">
          {{ total ?? 0 }} aéronef{{ (total ?? 0) > 1 ? 's' : '' }} enregistré{{ (total ?? 0) > 1 ? 's' : '' }}
        </p>
      </div>
      <Button v-if="can('aircraft.create')" @click="openCreateDialog" size="sm" class="gap-1.5">
        <Plus class="h-4 w-4" />
        Nouvel aéronef
      </Button>
    </div>

    <!-- KPI Cards — masquées sur mobile, visibles tablette et desktop -->
    <div class="hidden sm:grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <template v-if="loading && aircrafts.length === 0">
        <div v-for="i in 4" :key="i" class="bg-card border border-border rounded-xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <Skeleton class="h-3.5 w-20" />
            <Skeleton class="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton class="h-7 w-12" />
          <Skeleton class="h-3 w-28" />
        </div>
      </template>

      <template v-else>
        <!-- Total aéronefs -->
        <div class="bg-card border border-border rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</span>
            <div class="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Plane class="h-4 w-4 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
            </div>
          </div>
          <p class="text-2xl font-bold text-foreground">{{ kpis.totalAircrafts }}</p>
          <p class="text-xs text-muted-foreground mt-1">Aéronefs enregistrés</p>
        </div>

        <!-- En activité -->
        <div class="bg-card border border-border rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Actifs</span>
            <div class="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center">
              <Activity class="h-4 w-4 text-green-600 dark:text-green-400" :stroke-width="1.5" />
            </div>
          </div>
          <p class="text-2xl font-bold text-foreground">{{ kpis.activeAircrafts }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-muted-foreground">
              {{ kpis.totalAircrafts > 0 ? Math.round(kpis.activeAircrafts / kpis.totalAircrafts * 100) : 0 }}% de la flotte
            </span>
          </div>
        </div>

        <!-- Types différents -->
        <div class="bg-card border border-border rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Types</span>
            <div class="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Layers class="h-4 w-4 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
            </div>
          </div>
          <p class="text-2xl font-bold text-foreground">{{ kpis.uniqueTypes }}</p>
          <p class="text-xs text-muted-foreground mt-1">Types distincts</p>
        </div>

        <!-- Exploitants -->
        <div class="bg-card border border-border rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exploitants</span>
            <div class="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Building2 class="h-4 w-4 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
            </div>
          </div>
          <p class="text-2xl font-bold text-foreground">{{ kpis.uniqueOperators }}</p>
          <p class="text-xs text-muted-foreground mt-1">Compagnies</p>
        </div>
      </template>
    </div>

    <!-- Barre recherche + toggle vue -->
    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          v-model="searchTerm"
          placeholder="Rechercher par immatriculation, opérateur ou type..."
          class="pl-9 h-9 text-sm"
          @input="debouncedRefreshAircrafts"
        />
      </div>
      <Button v-if="searchTerm" variant="ghost" size="icon" class="h-9 w-9 shrink-0" @click="clearSearch">
        <X class="h-4 w-4" />
      </Button>
      <!-- Toggle vue -->
      <div class="flex items-center bg-muted rounded-md p-0.5 shrink-0">
        <button
          @click="viewMode = 'cards'"
          class="h-7 w-7 flex items-center justify-center rounded transition-all"
          :class="viewMode === 'cards' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
        >
          <LayoutGrid class="h-3.5 w-3.5" />
        </button>
        <button
          @click="viewMode = 'table'"
          class="h-7 w-7 flex items-center justify-center rounded transition-all"
          :class="viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
        >
          <List class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <!-- Layout filtres + contenu -->
    <div class="grid gap-5 md:grid-cols-[240px_1fr]">

      <!-- Sidebar filtres -->
      <div class="hidden md:block">
        <AircraftFilters
          :filters="filters"
          :available-operators="availableOperators"
          :available-types="availableTypes"
          @update:filters="updateFilters"
        />
      </div>

      <!-- Contenu -->
      <div class="space-y-3 min-w-0">

        <!-- Skeleton initial -->
        <template v-if="loading && paginatedAircrafts.length === 0">
          <AircraftTableSkeleton v-if="viewMode === 'table'" :count="6" />
          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AircraftSkeleton v-for="i in 6" :key="i" />
          </div>
        </template>

        <!-- Liste -->
        <template v-else-if="aircrafts.length > 0">
          <!-- Cartes -->
          <div v-if="viewMode === 'cards'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AircraftCard
              v-for="aircraft in aircrafts"
              :key="aircraft.id"
              :aircraft="aircraft"
              :can-edit="can('aircraft.update')"
              :can-delete="can('aircraft.delete')"
              @view="openViewDialog"
              @edit="openEditDialog"
              @delete="confirmDelete"
            />
          </div>

          <!-- Tableau -->
          <div v-else class="space-y-1.5">
            <AircraftTableRow
              v-for="aircraft in aircrafts"
              :key="aircraft.id"
              :aircraft="aircraft"
              :can-edit="can('aircraft.update')"
              :can-delete="can('aircraft.delete')"
              @view="openViewDialog"
              @edit="openEditDialog"
              @delete="confirmDelete"
            />
          </div>

          <!-- Infinite scroll trigger -->
          <div
            v-if="!isUsingFullDataset && hasMorePages && !loading"
            ref="loadMoreTrigger"
            class="flex justify-center pt-4 pb-2"
          >
            <Button variant="outline" size="sm" @click="loadMore" :disabled="loading" class="gap-1.5 text-xs">
              <ChevronDown class="h-3.5 w-3.5" />
              Charger plus
            </Button>
          </div>

          <!-- Skeleton page suivante -->
          <template v-if="loading && paginatedAircrafts.length > 0">
            <AircraftTableSkeleton v-if="viewMode === 'table'" :count="3" />
            <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AircraftSkeleton v-for="i in 3" :key="i" />
            </div>
          </template>

          <!-- Fin de liste -->
          <div v-if="!isUsingFullDataset && !hasMorePages && aircrafts.length > 0" class="flex justify-center pt-4 pb-2">
            <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check class="h-3.5 w-3.5 text-green-500" />
              Tous les aéronefs sont affichés
            </span>
          </div>
        </template>

        <!-- État vide -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <div class="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mb-4">
            <Plane class="h-7 w-7 text-muted-foreground" :stroke-width="1.5" />
          </div>
          <p class="font-medium text-sm mb-1">
            {{ searchTerm || hasActiveFilters ? 'Aucun résultat trouvé' : 'Aucun aéronef enregistré' }}
          </p>
          <p class="text-xs text-muted-foreground mb-5 max-w-xs">
            {{ searchTerm || hasActiveFilters ? 'Essayez avec d\'autres termes ou ajustez les filtres.' : 'Commencez par créer votre premier aéronef.' }}
          </p>
          <Button v-if="!searchTerm && !hasActiveFilters && can('aircraft.create')" @click="openCreateDialog" size="sm" class="gap-1.5">
            <Plus class="h-4 w-4" />
            Créer le premier aéronef
          </Button>
          <Button v-else variant="outline" size="sm" @click="resetSearchAndFilters" class="gap-1.5">
            <X class="h-4 w-4" />
            {{ searchTerm && hasActiveFilters ? 'Effacer la recherche et les filtres' : searchTerm ? 'Effacer la recherche' : 'Réinitialiser les filtres' }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <AircraftViewDialog
      v-model:open="viewDialogOpen"
      :aircraft="selectedAircraft"
      @edit="openEditDialog"
      @delete="handleDeleteFromView"
    />

    <AircraftFormDialog
      v-model:open="formDialogOpen"
      :aircraft="aircraftToEdit"
      @success="handleFormSuccess"
    />

    <!-- Delete confirmation (depuis la liste) -->
    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-destructive" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'aéronef
            <strong class="text-foreground font-mono">{{ aircraftToDelete?.immatriculation }}</strong> ?
            Cette action est irréversible et supprimera toutes les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            @click="deleteAircraft"
            class="bg-destructive text-white hover:bg-destructive/90 gap-2"
          >
            <Trash2 class="h-4 w-4" />
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Plus, Search, X, LayoutGrid, List, Plane, Layers, Building2,
  Activity, ChevronDown, Check, Trash2, AlertTriangle
} from 'lucide-vue-next'
import type {
  Aircraft,
  AircraftFilterQuery,
  AircraftFilters as AircraftFiltersState,
  AircraftType,
  Operator
} from '~/types/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import AircraftCard from '~/components/modules/aircraft/AircraftCard.vue'
import AircraftTableRow from '~/components/modules/aircraft/AircraftTableRow.vue'
import AircraftSkeleton from '~/components/modules/aircraft/AircraftSkeleton.vue'
import AircraftTableSkeleton from '~/components/modules/aircraft/AircraftTableSkeleton.vue'
import AircraftViewDialog from '~/components/modules/aircraft/AircraftViewDialog.vue'
import AircraftFormDialog from '@/components/modules/aircraft/AircraftFormDialog.vue'
import AircraftFilters from '~/components/modules/aircraft/AircraftFilters.vue'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'Aéronefs | VTA',
  meta: [{ name: 'description', content: 'Gestion complète des aéronefs de la flotte VTA.' }]
})

const aircraftsStore = useAircraftsStore()
const { success: showSuccess, error: showError } = useToast()
const { apiFetch } = useApi()
const { can } = usePermission()

// ─── State store ──────────────────────────────────────────────────────────────
const paginatedAircrafts = computed(() => aircraftsStore.aircrafts)
const loading = computed(() => aircraftsStore.loading)
const hasMorePages = computed(() => aircraftsStore.hasMorePages)

const searchTerm = ref('')
const viewMode   = ref<'cards' | 'table'>('cards')

// Dialogs
const viewDialogOpen   = ref(false)
const formDialogOpen   = ref(false)
const deleteDialogOpen = ref(false)
const selectedAircraft  = ref<Aircraft | null>(null)
const aircraftToEdit    = ref<Aircraft | null>(null)
const aircraftToDelete  = ref<Aircraft | null>(null)

// Données pour les filtres
const availableOperators = ref<Operator[]>([])
const availableTypes     = ref<AircraftType[]>([])

// Infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let searchTimeout: ReturnType<typeof setTimeout>

const createDefaultFilters = (): AircraftFiltersState => ({
  operator_id: '',
  aircraft_type_id: '',
  in_activity: '',
  pmad_min: null,
  pmad_max: null,
  sort_by: '',
  has_flights: false
})

// Filtres — valeurs vides '' = pas de filtre (pas de valeur "all" en v-model interne)
const filters = ref<AircraftFiltersState>(createDefaultFilters())

const updateFilters = (nextFilters: AircraftFiltersState) => {
  filters.value = nextFilters
}

const normalizeNumericFilter = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const normalizedSearchTerm = computed(() => searchTerm.value.trim())

const hasServerFilters = computed(() =>
  !!normalizedSearchTerm.value ||
  !!filters.value.operator_id ||
  !!filters.value.aircraft_type_id ||
  !!filters.value.in_activity ||
  normalizeNumericFilter(filters.value.pmad_min) !== null ||
  normalizeNumericFilter(filters.value.pmad_max) !== null ||
  filters.value.has_flights
)

const hasActiveFilters = computed(() =>
  hasServerFilters.value || !!filters.value.sort_by
)

const isUsingFullDataset = computed(() =>
  hasServerFilters.value || !!filters.value.sort_by
)

const aircrafts = computed(() => {
  const filtered = [...paginatedAircrafts.value]

  switch (filters.value.sort_by) {
    case 'immatriculation_asc':
      filtered.sort((a, b) => a.immatriculation.localeCompare(b.immatriculation))
      break
    case 'immatriculation_desc':
      filtered.sort((a, b) => b.immatriculation.localeCompare(a.immatriculation))
      break
    case 'created_desc':
      filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      break
    case 'created_asc':
      filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
      break
    case 'pmad_desc':
      filtered.sort((a, b) => (b.pmad || 0) - (a.pmad || 0))
      break
    case 'pmad_asc':
      filtered.sort((a, b) => (a.pmad || 0) - (b.pmad || 0))
      break
  }

  return filtered
})

const total = computed(() =>
  isUsingFullDataset.value ? aircrafts.value.length : aircraftsStore.total
)

// ─── KPIs calculés depuis le store ───────────────────────────────────────────
const kpis = computed(() => {
  // Toujours utiliser le dataset complet (allAircrafts) pour les KPI,
  // indépendamment des filtres affichés dans la vue.
  const list = aircraftsStore.allAircrafts

  const activeAircrafts  = list.filter(a => a.in_activity).length
  const uniqueTypes      = new Set(list.map(a => a.type?.id).filter(Boolean)).size
  const uniqueOperators  = new Set(list.map(a => a.operator?.id).filter(Boolean)).size

  return {
    totalAircrafts: list.length,
    activeAircrafts,
    uniqueTypes,
    uniqueOperators
  }
})

// ─── Données filtres ──────────────────────────────────────────────────────────
const loadFilterData = async () => {
  try {
    const [typesRes, operatorsRes] = await Promise.all([
      apiFetch<{ data: AircraftType[] }>('/aircraft-types/all'),
      apiFetch<{ data: Operator[] }>('/operators/all')
    ])
    availableTypes.value     = typesRes.data || []
    availableOperators.value = operatorsRes.data || []
  } catch {
    console.error('Erreur chargement données filtres')
  }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
const buildAircraftFilterQuery = (): AircraftFilterQuery => ({
  search: normalizedSearchTerm.value || null,
  operator_id: filters.value.operator_id ? parseInt(filters.value.operator_id, 10) : null,
  aircraft_type_id: filters.value.aircraft_type_id ? parseInt(filters.value.aircraft_type_id, 10) : null,
  pmad_from: normalizeNumericFilter(filters.value.pmad_min),
  pmad_to: normalizeNumericFilter(filters.value.pmad_max),
  in_activity: filters.value.in_activity === '' ? null : filters.value.in_activity === 'true',
  with_flights: filters.value.has_flights ? true : null
})

const fetchAircrafts = async () => {
  aircraftsStore.resetPagination()
  const result = await aircraftsStore.fetchAircrafts(1)
  if (!result.success) showError(result.message || 'Erreur lors du chargement des aéronefs')
}

const fetchFilteredAircrafts = async () => {
  const result = await aircraftsStore.fetchAllFilteredAircrafts(buildAircraftFilterQuery())
  if (!result.success) showError(result.message || 'Erreur lors du chargement des aéronefs')
}

const refreshAircrafts = async () => {
  if (isUsingFullDataset.value) {
    await fetchFilteredAircrafts()
    return
  }

  await fetchAircrafts()
}

const loadMore = async () => {
  if (isUsingFullDataset.value || !hasMorePages.value || loading.value) return
  await aircraftsStore.loadNextPage()
}

// ─── Recherche / filtres réactifs ─────────────────────────────────────────────
const debouncedRefreshAircrafts = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    await refreshAircrafts()
  }, 300)
}

const clearSearch = async () => {
  clearTimeout(searchTimeout)
  searchTerm.value = ''
  await refreshAircrafts()
}

const resetSearchAndFilters = async () => {
  clearTimeout(searchTimeout)
  filters.value = createDefaultFilters()
  searchTerm.value = ''
  await refreshAircrafts()
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────
const openViewDialog = async (aircraft: Aircraft) => {
  const result = await aircraftsStore.fetchAircraft(aircraft.id)
  if (result.success && result.data) {
    selectedAircraft.value = result.data
    viewDialogOpen.value   = true
  }
}

const openCreateDialog = () => { aircraftToEdit.value = null; formDialogOpen.value = true }
const openEditDialog = (aircraft: Aircraft) => {
  aircraftToEdit.value  = aircraft
  viewDialogOpen.value  = false
  formDialogOpen.value  = true
}

const confirmDelete = (aircraft: Aircraft) => {
  aircraftToDelete.value  = aircraft
  deleteDialogOpen.value  = true
}

const deleteAircraft = async () => {
  if (!aircraftToDelete.value) return
  const result = await aircraftsStore.deleteAircraft(aircraftToDelete.value.id)
  if (result.success) {
    showSuccess('Aéronef supprimé avec succès')
    deleteDialogOpen.value  = false
    aircraftToDelete.value  = null
  } else {
    showError(result.message || 'Erreur lors de la suppression')
  }
}

// Suppression depuis le ViewDialog (emit 'delete')
const handleDeleteFromView = async (_aircraft: Aircraft) => {
  await refreshAircrafts()
}

const handleFormSuccess = async () => {
  await refreshAircrafts()
}

// ─── Infinite scroll ──────────────────────────────────────────────────────────
const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMorePages.value && !loading.value) loadMore()
    },
    { threshold: 0.5, rootMargin: '100px' }
  )
  observer.observe(loadMoreTrigger.value)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (import.meta.client) {
    const saved = localStorage.getItem('aircrafts-view-mode')
    if (saved === 'table' || saved === 'cards') viewMode.value = saved
  }
  await Promise.all([refreshAircrafts(), loadFilterData()])
  setTimeout(setupIntersectionObserver, 100)
})

onUnmounted(() => {
  observer?.disconnect()
  clearTimeout(searchTimeout)
})

watch(viewMode, (mode) => {
  if (import.meta.client) localStorage.setItem('aircrafts-view-mode', mode)
})

watch(
  () => [
    filters.value.operator_id,
    filters.value.aircraft_type_id,
    filters.value.in_activity,
    filters.value.pmad_min,
    filters.value.pmad_max,
    filters.value.has_flights
  ],
  debouncedRefreshAircrafts
)

watch(
  () => filters.value.sort_by,
  async (nextSort, previousSort) => {
    if (!hasServerFilters.value && Boolean(nextSort) !== Boolean(previousSort)) {
      await refreshAircrafts()
    }
  }
)
</script>