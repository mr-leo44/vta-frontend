<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Vols</h1>
        <p class="text-muted-foreground">
          {{ total ?? 0 }} vol{{ total > 1 ? 's' : '' }} enregistré{{ total > 1 ? 's' : '' }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="toggleView">
          <Calendar class="mr-2 h-4 w-4" />
          {{ showDailyView ? 'Vue liste' : 'Vue par jour' }}
        </Button>
        <Button @click="openCreateDialog">
          <Plus class="mr-2 h-4 w-4" />
          Nouveau vol
        </Button>
      </div>
    </div>

    <!-- Vue par jour avec tableaux détaillés -->
    <FlightsDailyTableView 
      v-if="showDailyView" 
    />

    <!-- Vue liste (existante) -->
    <template v-else>
      <!-- ... (garder tout le code existant de la vue liste) ... -->
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col md:flex-row items-center gap-4">
            <div class="flex-1 w-full relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                v-model="searchTerm" 
                placeholder="Rechercher par numéro de vol..." 
                class="pl-10"
                @input="debouncedSearch" 
              />
            </div>
            <div class="flex items-center gap-2 w-full md:w-auto">
              <Select v-model="filterStatus" class="w-full md:w-[180px]">
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="prevu">Prévus</SelectItem>
                  <SelectItem value="atteri">Atterris</SelectItem>
                  <SelectItem value="qrf">QRF</SelectItem>
                  <SelectItem value="annule">Annulés</SelectItem>
                  <SelectItem value="detourne">Détournés</SelectItem>
                </SelectContent>
              </Select>
              <Select v-model="filterRegime" class="w-full md:w-[180px]">
                <SelectTrigger>
                  <SelectValue placeholder="Régime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les régimes</SelectItem>
                  <SelectItem value="domestic">Domestique</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" @click="clearFilters" :disabled="!hasFilters">
                <X class="h-4 w-4" />
              </Button>
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
          </div>
        </CardContent>
      </Card>

      <!-- Statistics Cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Total vols</CardTitle>
            <PlaneTakeoff class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.total }}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Atterris</CardTitle>
            <div class="h-2 w-2 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.landed }}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Prévus</CardTitle>
            <div class="h-2 w-2 rounded-full bg-blue-500"></div>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.scheduled }}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">QRF</CardTitle>
            <div class="h-2 w-2 rounded-full bg-gray-500"></div>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.qrf }}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Annulés</CardTitle>
            <div class="h-2 w-2 rounded-full bg-red-500"></div>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.cancelled }}</div>
          </CardContent>
        </Card>
      </div>

      <!-- Loading Initial -->
      <div v-if="loading && flights.length === 0">
        <FlightTableSkeleton v-if="viewMode === 'table'" :count="6" />
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FlightSkeleton v-for="i in 6" :key="i" />
        </div>
      </div>

      <!-- Flights List -->
      <div v-else-if="filteredFlights.length > 0" class="space-y-4">
        <div v-if="viewMode === 'cards'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FlightCard 
            v-for="flight in filteredFlights" 
            :key="flight.id" 
            :flight="flight" 
            @view="openViewDialog"
            @edit="openEditDialog" 
            @delete="confirmDelete" 
          />
        </div>

        <div v-else class="space-y-3">
          <FlightTableRow 
            v-for="flight in filteredFlights" 
            :key="flight.id" 
            :flight="flight"
            @view="openViewDialog"
            @edit="openEditDialog" 
            @delete="confirmDelete" 
          />
        </div>

        <div v-if="hasMorePages && !loading" ref="loadMoreTrigger" class="flex justify-center py-8">
          <Button variant="outline" @click="loadMore" :disabled="loading">
            Charger plus de vols
          </Button>
        </div>

        <div v-if="loading && flights.length > 0" class="py-4">
          <FlightTableSkeleton v-if="viewMode === 'table'" :count="3" />
          <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FlightSkeleton v-for="i in 3" :key="i" />
          </div>
        </div>

        <div v-if="!hasMorePages && flights.length > 0" class="text-center py-4 text-muted-foreground text-sm">
          Tous les vols ont été chargés
        </div>
      </div>

      <Card v-else>
        <CardContent class="flex flex-col items-center justify-center py-12">
          <PlaneTakeoff class="h-12 w-12 text-muted-foreground mb-4" />
          <p class="text-lg font-medium mb-2">
            {{ searchTerm || hasFilters ? 'Aucun résultat trouvé' : 'Aucun vol enregistré' }}
          </p>
          <p class="text-muted-foreground mb-4">
            {{ searchTerm || hasFilters ? 'Essayez de modifier vos critères de recherche' : 'Commencez par créer votre premier vol' }}
          </p>
          <Button v-if="!searchTerm && !hasFilters" @click="openCreateDialog">
            <Plus class="mr-2 h-4 w-4" />
            Créer le premier vol
          </Button>
          <Button v-else variant="outline" @click="clearFilters">
            Effacer les filtres
          </Button>
        </CardContent>
      </Card>
    </template>

    <!-- Dialogs -->
    <FlightViewDialog 
      v-model:open="viewDialogOpen" 
      :flight="selectedFlight" 
      @edit="openEditDialog" 
    />

    <FlightFormDialog 
      v-model:open="formDialogOpen" 
      :flight="flightToEdit" 
      @success="handleFormSuccess" 
    />

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le vol <strong>"{{ flightToDelete?.flight_number }}"</strong> ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            @click="deleteFlight"
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
  PlaneTakeoff,
  Calendar as CalendarIcon
} from 'lucide-vue-next'
import type { Flight } from '~/types/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
import FlightCard from '~/components/modules/flight/FlightCard.vue'
import FlightTableRow from '~/components/modules/flight/FlightTableRow.vue'
import FlightSkeleton from '~/components/modules/flight/FlightSkeleton.vue'
import FlightTableSkeleton from '~/components/modules/flight/FlightTableSkeleton.vue'
import FlightViewDialog from '@/components/modules/flight/FlightViewDialog.vue'
import FlightFormDialog from '@/components/modules/flight/FlightFormDialog.vue'
import FlightsDailyTableView from '~/components/modules/flight/FlightsDailyTableView.vue'

definePageMeta({
  middleware: 'auth'
})

const flightsStore = useFlightsStore()
const { success: showSuccess, error: showError } = useToast()

const flights = computed(() => flightsStore.flights)
const loading = computed(() => flightsStore.loading)
const hasMorePages = computed(() => flightsStore.hasMorePages)
const total = computed(() => flightsStore.total)

const searchTerm = ref('')
const viewMode = ref<'cards' | 'table'>('cards')
const showDailyView = ref(false)
const filterStatus = ref('all')
const filterRegime = ref('all')

const viewDialogOpen = ref(false)
const formDialogOpen = ref(false)
const deleteDialogOpen = ref(false)

const selectedFlight = ref<Flight | null>(null)
const flightToEdit = ref<Flight | null>(null)
const flightToDelete = ref<Flight | null>(null)

const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let searchTimeout: NodeJS.Timeout

const stats = computed(() => {
  const allFlights = flights.value
  return {
    total: allFlights.length,
    landed: allFlights.filter(f => f.status === 'atteri').length,
    scheduled: allFlights.filter(f => f.status === 'prevu').length,
    qrf: allFlights.filter(f => f.status === 'qrf').length,
    cancelled: allFlights.filter(f => f.status === 'annule').length
  }
})

const filteredFlights = computed(() => {
  let filtered = [...flights.value]
  
  if (filterStatus.value && filterStatus.value !== 'all') {
    filtered = filtered.filter(f => f.status === filterStatus.value)
  }
  
  if (filterRegime.value && filterRegime.value !== 'all') {
    filtered = filtered.filter(f => f.flight_regime === filterRegime.value)
  }
  
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(f => 
      f.flight_number.toLowerCase().includes(term)
    )
  }
  
  return filtered
})

const hasFilters = computed(() => {
  return filterStatus.value !== 'all' || 
         filterRegime.value !== 'all' || 
         searchTerm.value !== ''
})

const toggleView = () => {
  showDailyView.value = !showDailyView.value
}

const fetchFlights = async () => {
  flightsStore.resetPagination()
  const result = await flightsStore.fetchFlights(1)
  if (!result.success) {
    showError(result.message || 'Erreur lors du chargement des vols')
  }
}

const loadMore = async () => {
  if (!hasMorePages.value || loading.value) return
  await flightsStore.loadNextPage()
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {}, 300)
}

const clearFilters = () => {
  searchTerm.value = ''
  filterStatus.value = 'all'
  filterRegime.value = 'all'
}

const openViewDialog = async (flight: Flight) => {
  const result = await flightsStore.fetchFlight(flight.id)
  if (result.success && result.data) {
    selectedFlight.value = result.data
    viewDialogOpen.value = true
  }
}

const openCreateDialog = () => {
  flightToEdit.value = null
  formDialogOpen.value = true
}

const openEditDialog = (flight: Flight) => {
  flightToEdit.value = flight
  viewDialogOpen.value = false
  formDialogOpen.value = true
}

const confirmDelete = (flight: Flight) => {
  flightToDelete.value = flight
  deleteDialogOpen.value = true
}

const deleteFlight = async () => {
  if (!flightToDelete.value) return
  const result = await flightsStore.deleteFlight(flightToDelete.value.id)
  if (result.success) {
    showSuccess('Vol supprimé avec succès')
    deleteDialogOpen.value = false
    flightToDelete.value = null
  } else {
    showError(result.message || 'Erreur lors de la suppression')
  }
}

const handleFormSuccess = async () => {
  await fetchFlights()
}

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

onMounted(async () => {
  await fetchFlights()
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

watch(viewMode, (mode) => {
  if (import.meta.client) {
    localStorage.setItem('flights-view-mode', mode)
  }
})

onMounted(() => {
  if (import.meta.client) {
    const savedMode = localStorage.getItem('flights-view-mode')
    if (savedMode === 'table' || savedMode === 'cards') {
      viewMode.value = savedMode
    }
  }
})
</script>