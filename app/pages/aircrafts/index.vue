<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Aéronefs</h1>
        <p class="text-muted-foreground">
          {{ total ?? 0 }} aéronef{{ total > 1 ? 's' : '' }} enregistré{{ total > 1 ? 's' : '' }}
        </p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="mr-2 h-4 w-4" />
        Nouvel aéronef
      </Button>
    </div>

    <!-- Search and View Toggle -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-center gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              v-model="searchTerm" 
              placeholder="Rechercher par immatriculation, opérateur ou type..." 
              class="pl-10"
              @input="debouncedSearch" 
            />
          </div>
          <Button variant="outline" @click="clearSearch" :disabled="!searchTerm">
            <X class="h-4 w-4" />
          </Button>

          <!-- View Toggle -->
          <div class="flex items-center border rounded-lg">
            <Button 
              variant="ghost" 
              size="sm" 
              :class="{ 'bg-muted': viewMode === 'cards' }" 
              @click="viewMode = 'cards'"
            >
              <LayoutGrid class="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              :class="{ 'bg-muted': viewMode === 'table' }" 
              @click="viewMode = 'table'"
            >
              <List class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Filters Sidebar (Desktop) -->
    <div class="grid gap-6 md:grid-cols-[280px_1fr]">
      <div class="hidden md:block">
        <AircraftFilters 
          :filters="filters" 
          :available-operators="availableOperators"
          :available-types="availableTypes"
          @update:filters="filters = $event"
          @apply="applyFilters" 
        />
      </div>

      <!-- Main Content -->
      <div class="space-y-4">
        <!-- Loading Initial -->
        <div v-if="loading && aircrafts.length === 0">
          <AircraftTableSkeleton v-if="viewMode === 'table'" :count="6" />
          <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AircraftSkeleton v-for="i in 6" :key="i" />
          </div>
        </div>

        <!-- Aircrafts List -->
        <div v-else-if="aircrafts.length > 0" class="space-y-4">
          <!-- Cards View -->
          <div v-if="viewMode === 'cards'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AircraftCard 
              v-for="aircraft in aircrafts" 
              :key="aircraft.id" 
              :aircraft="aircraft" 
              @view="openViewDialog"
              @edit="openEditDialog" 
              @delete="confirmDelete" 
            />
          </div>

          <!-- Table View -->
          <div v-else class="space-y-3">
            <AircraftTableRow 
              v-for="aircraft in aircrafts" 
              :key="aircraft.id" 
              :aircraft="aircraft"
              @view="openViewDialog"
              @edit="openEditDialog" 
              @delete="confirmDelete" 
            />
          </div>

          <!-- Load More Trigger -->
          <div v-if="hasMorePages && !loading" ref="loadMoreTrigger" class="flex justify-center py-8">
            <Button variant="outline" @click="loadMore" :disabled="loading">
              Charger plus d'aéronefs
            </Button>
          </div>

          <!-- Loading More -->
          <div v-if="loading && aircrafts.length > 0" class="py-4">
            <AircraftTableSkeleton v-if="viewMode === 'table'" :count="3" />
            <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AircraftSkeleton v-for="i in 3" :key="i" />
            </div>
          </div>

          <!-- End of list -->
          <div v-if="!hasMorePages && aircrafts.length > 0" class="text-center py-4 text-muted-foreground text-sm">
            Tous les aéronefs ont été chargés
          </div>
        </div>

        <!-- Empty State -->
        <Card v-else>
          <CardContent class="flex flex-col items-center justify-center py-12">
            <Plane class="h-12 w-12 text-muted-foreground mb-4" />
            <p class="text-lg font-medium mb-2">
              {{ searchTerm ? 'Aucun résultat trouvé' : 'Aucun aéronef enregistré' }}
            </p>
            <p class="text-muted-foreground mb-4">
              {{ searchTerm ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par créer votre premier aéronef' }}
            </p>
            <Button v-if="!searchTerm" @click="openCreateDialog">
              <Plus class="mr-2 h-4 w-4" />
              Créer le premier aéronef
            </Button>
            <Button v-else variant="outline" @click="clearSearch">
              Effacer la recherche
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- View Dialog -->
    <AircraftViewDialog 
      v-model:open="viewDialogOpen" 
      :aircraft="selectedAircraft" 
      @edit="openEditDialog" 
    />

    <!-- Form Dialog (Create/Edit) -->
    <AircraftFormDialog 
      v-model:open="formDialogOpen" 
      :aircraft="aircraftToEdit" 
      @success="handleFormSuccess" 
    />

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'aéronef <strong class="font-mono">"{{ aircraftToDelete?.immatriculation }}"</strong> ?
            Cette action est irréversible et supprimera également toutes les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            @click="deleteAircraft"
            class="bg-destructive text-white hover:bg-destructive/90"
          >
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
  Plus,
  Search,
  X,
  LayoutGrid,
  List,
  Plane
} from 'lucide-vue-next'
import type { Aircraft, AircraftType, Operator } from '~/types/api'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import AircraftCard from '~/components/modules/aircraft/AircraftCard.vue'
import AircraftTableRow from '~/components/modules/aircraft/AircraftTableRow.vue'
import AircraftSkeleton from '~/components/modules/aircraft/AircraftSkeleton.vue'
import AircraftTableSkeleton from '~/components/modules/aircraft/AircraftTableSkeleton.vue'
import AircraftViewDialog from '~/components/modules/aircraft/AircraftViewDialog.vue'
import AircraftFormDialog from '@/components/modules/aircraft/AircraftFormDialog.vue'
import AircraftFilters, { type AircraftFilters as FilterType } from '~/components/modules/aircraft/AircraftFilters.vue'

definePageMeta({
  middleware: 'auth'
})

const aircraftsStore = useAircraftsStore()
const { success: showSuccess, error: showError } = useToast()
const { apiFetch } = useApi()

// State
const aircrafts = computed(() => aircraftsStore.aircrafts)
const loading = computed(() => aircraftsStore.loading)
const hasMorePages = computed(() => aircraftsStore.hasMorePages)
const total = computed(() => aircraftsStore.total)

const searchTerm = ref('')
const viewMode = ref<'cards' | 'table'>('cards')
const isSearching = ref(false)

// Dialog states
const viewDialogOpen = ref(false)
const formDialogOpen = ref(false)
const deleteDialogOpen = ref(false)

// Selected items
const selectedAircraft = ref<Aircraft | null>(null)
const aircraftToEdit = ref<Aircraft | null>(null)
const aircraftToDelete = ref<Aircraft | null>(null)

// Filter data
const availableOperators = ref<Operator[]>([])
const availableTypes = ref<AircraftType[]>([])

// Intersection Observer
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let searchTimeout: NodeJS.Timeout

// State pour les filtres
const filters = ref<FilterType>({
  operator_id: '',
  aircraft_type_id: '',
  in_activity: '',
  pmad_min: null,
  pmad_max: null,
  sort_by: '',
  has_flights: false
})

// Charger les données de référence pour les filtres
const loadFilterData = async () => {
  try {
    const [typesRes, operatorsRes] = await Promise.all([
      apiFetch<{ data: AircraftType[] }>('/aircraft-types'),
      apiFetch<{ data: Operator[] }>('/operators')
    ])
    availableTypes.value = typesRes.data || []
    availableOperators.value = operatorsRes.data || []
  } catch (error) {
    console.error('Error loading filter data:', error)
  }
}

// Fetch initial aircrafts
const fetchAircrafts = async () => {
  aircraftsStore.resetPagination()
  const result = await aircraftsStore.fetchAircrafts(1)

  if (!result.success) {
    showError(result.message || 'Erreur lors du chargement des aéronefs')
  }
}

// Load more for infinite scroll
const loadMore = async () => {
  if (!hasMorePages.value || loading.value) return
  await aircraftsStore.loadNextPage()
}

// Search with debounce
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (searchTerm.value.trim()) {
      isSearching.value = true
      aircraftsStore.resetPagination()

      const result = await aircraftsStore.searchAircrafts(searchTerm.value)

      if (result.success && result.data) {
        aircraftsStore.aircrafts = result.data
        aircraftsStore.total = result.data.length
      } else {
        aircraftsStore.aircrafts = []
        aircraftsStore.total = 0
        if (result.message) {
          showError(result.message)
        }
      }

      isSearching.value = false
    } else {
      isSearching.value = false
      await fetchAircrafts()
    }
  }, 300)
}

const clearSearch = () => {
  searchTerm.value = ''
  fetchAircrafts()
}

// Fonction pour appliquer les filtres
const applyFilters = () => {
  let filtered = [...aircraftsStore.aircrafts]

  // Filtre par opérateur
  if (filters.value.operator_id && filters.value.operator_id !== 'all') {
    const operatorId = parseInt(filters.value.operator_id)
    filtered = filtered.filter(a => a.operator_id === operatorId)
  }

  // Filtre par type d'aéronef
  if (filters.value.aircraft_type_id && filters.value.aircraft_type_id !== 'all') {
    const typeId = parseInt(filters.value.aircraft_type_id)
    filtered = filtered.filter(a => a.aircraft_type_id === typeId)
  }

  // Filtre par statut
  if (filters.value.in_activity && filters.value.in_activity !== 'all') {
    const isActive = filters.value.in_activity === 'true'
    filtered = filtered.filter(a => a.in_activity === isActive)
  }

  // Filtre par PMAD
  if (filters.value.pmad_min !== null) {
    filtered = filtered.filter(a => a.pmad && a.pmad >= filters.value.pmad_min!)
  }
  if (filters.value.pmad_max !== null) {
    filtered = filtered.filter(a => a.pmad && a.pmad <= filters.value.pmad_max!)
  }

  // Filtre par vols
  if (filters.value.has_flights) {
    filtered = filtered.filter(a => a.flights && a.flights.length > 0)
  }

  // Tri
  switch (filters.value.sort_by) {
    case 'immatriculation_asc':
      filtered.sort((a, b) => a.immatriculation.localeCompare(b.immatriculation))
      break
    case 'immatriculation_desc':
      filtered.sort((a, b) => b.immatriculation.localeCompare(a.immatriculation))
      break
    case 'created_desc':
      filtered.sort((a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )
      break
    case 'created_asc':
      filtered.sort((a, b) =>
        new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      )
      break
    case 'pmad_desc':
      filtered.sort((a, b) => (b.pmad || 0) - (a.pmad || 0))
      break
    case 'pmad_asc':
      filtered.sort((a, b) => (a.pmad || 0) - (b.pmad || 0))
      break
  }

  aircraftsStore.aircrafts = filtered
}

// Dialog handlers
const openViewDialog = async (aircraft: Aircraft) => {
  const result = await aircraftsStore.fetchAircraft(aircraft.id)
  if (result.success && result.data) {
    selectedAircraft.value = result.data
    viewDialogOpen.value = true
  }
}

const openCreateDialog = () => {
  aircraftToEdit.value = null
  formDialogOpen.value = true
}

const openEditDialog = (aircraft: Aircraft) => {
  aircraftToEdit.value = aircraft
  viewDialogOpen.value = false
  formDialogOpen.value = true
}

const confirmDelete = (aircraft: Aircraft) => {
  aircraftToDelete.value = aircraft
  deleteDialogOpen.value = true
}

const deleteAircraft = async () => {
  if (!aircraftToDelete.value) return

  const result = await aircraftsStore.deleteAircraft(aircraftToDelete.value.id)

  if (result.success) {
    showSuccess('Aéronef supprimé avec succès')
    deleteDialogOpen.value = false
    aircraftToDelete.value = null
  } else {
    showError(result.message || 'Erreur lors de la suppression')
  }
}

const handleFormSuccess = async () => {
  if (searchTerm.value) {
    clearSearch()
  } else {
    await fetchAircrafts()
  }
}

// Setup Intersection Observer for infinite scroll
const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMorePages.value && !loading.value) {
        loadMore()
      }
    },
    { threshold: 0.5, rootMargin: '100px' }
  )

  observer.observe(loadMoreTrigger.value)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchAircrafts(),
    loadFilterData()
  ])

  setTimeout(() => {
    setupIntersectionObserver()
  }, 100)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  clearTimeout(searchTimeout)
})

// Save view mode preference
watch(viewMode, (mode) => {
  if (import.meta.client) {
    localStorage.setItem('aircrafts-view-mode', mode)
  }
})

// Restore view mode preference
onMounted(() => {
  if (import.meta.client) {
    const savedMode = localStorage.getItem('aircrafts-view-mode')
    if (savedMode === 'table' || savedMode === 'cards') {
      viewMode.value = savedMode
    }
  }
})
</script>