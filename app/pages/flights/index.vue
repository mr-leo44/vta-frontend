<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div class="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <PlaneTakeoff class="h-6 w-6 text-white" />
          </div>
          Vols
        </h1>
        <p class="text-muted-foreground mt-2">
          Gérer et suivre tous les vols en temps réel
        </p>
      </div>
      <div class="flex gap-2">
        <Button @click="openTodayDialog" variant="outline" size="lg" class="gap-2">
          <CalendarDays class="h-4 w-4" />
          Vols du jour
        </Button>
        <Button @click="openCreateDialog" size="lg" class="gap-2">
          <Plus class="h-4 w-4" />
          Nouveau vol
        </Button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-if="loadingKPIs" v-for="i in 4" :key="i">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-10 w-10 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-8 w-16 mb-2" />
          <Skeleton class="h-3 w-32" />
        </CardContent>
      </Card>

      <template v-else>
        <!-- Total vols -->
        <Card class="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-semibold text-blue-900 dark:text-blue-100">Total vols</CardTitle>
            <div class="h-10 w-10 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center shadow-md">
              <PlaneTakeoff class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold text-blue-900 dark:text-blue-100">{{ kpis.total_flights }}</div>
            <p class="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
              <TrendingUp class="h-3 w-3" />
              {{ kpis.total_this_month }} ce mois
            </p>
          </CardContent>
        </Card>

        <!-- Aujourd'hui -->
        <Card class="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-semibold text-green-900 dark:text-green-100">Aujourd'hui</CardTitle>
            <div class="h-10 w-10 rounded-lg bg-green-500 dark:bg-green-600 flex items-center justify-center shadow-md">
              <CalendarDays class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold text-green-900 dark:text-green-100">{{ kpis.total_today }}</div>
            <p class="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <Activity class="h-3 w-3" />
              {{ kpis.total_this_week }} cette semaine
            </p>
          </CardContent>
        </Card>

        <!-- Passagers -->
        <Card class="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-semibold text-purple-900 dark:text-purple-100">Passagers</CardTitle>
            <div class="h-10 w-10 rounded-lg bg-purple-500 dark:bg-purple-600 flex items-center justify-center shadow-md">
              <Users class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold text-purple-900 dark:text-purple-100">{{ kpis.total_passengers.toLocaleString() }}</div>
            <p class="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
              <Users class="h-3 w-3" />
              {{ kpis.average_passengers }} en moyenne
            </p>
          </CardContent>
        </Card>

        <!-- Status -->
        <Card class="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-semibold text-orange-900 dark:text-orange-100">Atterris</CardTitle>
            <div class="h-10 w-10 rounded-lg bg-orange-500 dark:bg-orange-600 flex items-center justify-center shadow-md">
              <CheckCircle class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold text-orange-900 dark:text-orange-100">{{ kpis.by_status.atteri }}</div>
            <p class="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {{ kpis.by_status.prevu }} prévus
            </p>
          </CardContent>
        </Card>
      </template>
    </div>

    <!-- Filtres -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <Filter class="h-4 w-4" />
            Recherche et filtres
          </CardTitle>
          <Button 
            v-if="hasActiveFilters" 
            variant="ghost" 
            size="sm" 
            @click="clearAllFilters"
            class="gap-2"
          >
            <X class="h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Recherche -->
          <div class="relative">
            <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Rechercher par numéro de vol, opérateur ou aéroport..."
              class="pl-10"
              @input="debouncedSearch"
            />
          </div>

          <!-- Filtres avancés -->
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <!-- Opérateur -->
            <Select v-model="filters.operator_id" @update:model-value="applyFilters">
              <SelectTrigger>
                <SelectValue placeholder="Opérateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">Tous les opérateurs</SelectItem>
                <SelectItem 
                  v-for="op in operatorsStore.allOperators" 
                  :key="op.id" 
                  :value="op.id"
                >
                  {{ op.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Statut -->
            <Select v-model="filters.status" @update:model-value="applyFilters">
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">Tous les statuts</SelectItem>
                <SelectItem value="qrf">QRF</SelectItem>
                <SelectItem value="prevu">Prévu</SelectItem>
                <SelectItem value="atteri">Atterri</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
                <SelectItem value="detourne">Détourné</SelectItem>
              </SelectContent>
            </Select>

            <!-- Régime -->
            <Select v-model="filters.regime" @update:model-value="applyFilters">
              <SelectTrigger>
                <SelectValue placeholder="Régime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">Tous les régimes</SelectItem>
                <SelectItem value="domestic">Domestique</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>

            <!-- Type -->
            <Select v-model="filters.type" @update:model-value="applyFilters">
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">Tous les types</SelectItem>
                <SelectItem value="regular">Régulier</SelectItem>
                <SelectItem value="non_regular">Non régulier</SelectItem>
              </SelectContent>
            </Select>

            <!-- Date de début -->
            <Input
              type="date"
              v-model="filters.date_from"
              @change="applyFilters"
              placeholder="Date début"
            />

            <!-- Date de fin -->
            <Input
              type="date"
              v-model="filters.date_to"
              @change="applyFilters"
              placeholder="Date fin"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Liste des vols -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <PlaneTakeoff class="h-5 w-5" />
              Vols ({{ flightsStore.total }})
            </CardTitle>
            <CardDescription class="mt-1">
              Liste complète des vols enregistrés
            </CardDescription>
          </div>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-muted' : ''"
            >
              <LayoutGrid class="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="viewMode = 'list'"
              :class="viewMode === 'list' ? 'bg-muted' : ''"
            >
              <List class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <!-- Loading initial -->
        <div v-if="flightsStore.loading && flightsStore.flights.length === 0" class="space-y-3">
          <div v-if="viewMode === 'grid'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton v-for="i in 6" :key="i" class="h-48" />
          </div>
          <div v-else class="space-y-2">
            <Skeleton v-for="i in 6" :key="i" class="h-20" />
          </div>
        </div>

        <!-- Empty State -->
        <div 
          v-else-if="flightsStore.flights.length === 0" 
          class="text-center py-16"
        >
          <div class="h-20 w-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <PlaneTakeoff class="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h3 class="text-lg font-semibold mb-2">Aucun vol trouvé</h3>
          <p class="text-muted-foreground mb-6">
            {{ searchQuery || hasActiveFilters ? 'Aucun résultat pour cette recherche' : 'Commencez par enregistrer un vol' }}
          </p>
          <Button v-if="!searchQuery && !hasActiveFilters" @click="openCreateDialog" size="lg">
            <Plus class="mr-2 h-4 w-4" />
            Créer un vol
          </Button>
        </div>

        <!-- Grid View -->
        <div 
          v-else-if="viewMode === 'grid'" 
          v-infinite-scroll="loadMore"
          :infinite-scroll-disabled="!flightsStore.hasMorePages || flightsStore.loading"
          :infinite-scroll-distance="200"
          class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <FlightCard
            v-for="flight in flightsStore.flights"
            :key="flight.id"
            :flight="flight"
            @view="openViewDialog"
            @edit="openEditDialog"
            @delete="confirmDelete"
          />
        </div>

        <!-- List View -->
        <div 
          v-else
          v-infinite-scroll="loadMore"
          :infinite-scroll-disabled="!flightsStore.hasMorePages || flightsStore.loading"
          :infinite-scroll-distance="200"
          class="space-y-2"
        >
          <FlightRow
            v-for="flight in flightsStore.flights"
            :key="flight.id"
            :flight="flight"
            @view="openViewDialog"
            @edit="openEditDialog"
            @delete="confirmDelete"
          />
        </div>

        <!-- Loading more indicator -->
        <div v-if="flightsStore.loading && flightsStore.flights.length > 0" class="flex justify-center py-8">
          <div class="flex items-center gap-2 text-muted-foreground">
            <Loader2 class="h-5 w-5 animate-spin" />
            <span>Chargement...</span>
          </div>
        </div>

        <!-- End message -->
        <div v-if="!flightsStore.hasMorePages && flightsStore.flights.length > 0" class="text-center py-8 text-muted-foreground text-sm">
          Tous les vols ont été chargés
        </div>
      </CardContent>
    </Card>

    <!-- Dialogs -->
    <FlightFormDialog
      v-model:open="formDialogOpen"
      :flight="selectedFlight"
      @success="handleSuccess"
    />

    <TodayFlightsDialog
      v-model:open="todayDialogOpen"
      @view="openViewDialog"
    />

    <!-- TODO: Add FlightViewDialog -->

    <!-- Delete Confirmation -->
    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-destructive" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le vol <strong class="text-foreground">{{ flightToDelete?.flight_number }}</strong> ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            @click="handleDelete"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 class="mr-2 h-4 w-4" />
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { vInfiniteScroll } from '@vueuse/components'
import {
  Plus,
  Search,
  PlaneTakeoff,
  CalendarDays,
  Users,
  CheckCircle,
  TrendingUp,
  Activity,
  Filter,
  X,
  LayoutGrid,
  List,
  Loader2,
  AlertTriangle,
  Trash2
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
import FlightRow from '~/components/modules/flight/FlightRow.vue'
import FlightFormDialog from '~/components/modules/flight/FlightFormDialog.vue'
import TodayFlightsDialog from '~/components/modules/flight/TodayFlightsDialog.vue'
import type { Flight, FlightFilters } from '~/types/api'

definePageMeta({
  middleware: 'auth'
})

const flightsStore = useFlightsStore()
const operatorsStore = useOperatorsStore()
const { success: showSuccess, error: showError } = useToast()

const loadingKPIs = ref(false)
const kpis = ref<any>({
  total_flights: 0,
  total_today: 0,
  total_this_week: 0,
  total_this_month: 0,
  by_status: { qrf: 0, prevu: 0, atteri: 0, annule: 0, detourne: 0 },
  total_passengers: 0,
  average_passengers: 0
})

const searchQuery = ref('')
const filters = ref<FlightFilters>({})
const viewMode = ref<'grid' | 'list'>('grid')

const formDialogOpen = ref(false)
const todayDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const selectedFlight = ref<Flight | null>(null)
const flightToDelete = ref<Flight | null>(null)

const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    filters.value.operator_id ||
    filters.value.status ||
    filters.value.regime ||
    filters.value.type ||
    filters.value.date_from ||
    filters.value.date_to
  )
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.search = searchQuery.value
    applyFilters()
  }, 300)
}

const applyFilters = async () => {
  await flightsStore.applyFilters(filters.value)
  await loadKPIs()
}

const clearAllFilters = async () => {
  searchQuery.value = ''
  filters.value = {}
  await flightsStore.clearFilters()
  await loadKPIs()
}

const loadMore = async () => {
  if (!flightsStore.hasMorePages || flightsStore.loading) return
  await flightsStore.loadNextPage()
}

const loadKPIs = async () => {
  loadingKPIs.value = true
  try {
    kpis.value = await flightsStore.fetchFlightKPIs()
  } finally {
    loadingKPIs.value = false
  }
}

const openCreateDialog = () => {
  selectedFlight.value = null
  formDialogOpen.value = true
}

const openEditDialog = (flight: Flight) => {
  selectedFlight.value = flight
  formDialogOpen.value = true
}

const openViewDialog = (flight: Flight) => {
  selectedFlight.value = flight
  // TODO: Open view dialog
}

const openTodayDialog = () => {
  todayDialogOpen.value = true
}

const confirmDelete = (flight: Flight) => {
  flightToDelete.value = flight
  deleteDialogOpen.value = true
}

const handleDelete = async () => {
  if (!flightToDelete.value) return
  
  try {
    const result = await flightsStore.deleteFlight(flightToDelete.value.id)
    
    if (result.success) {
      showSuccess('Vol supprimé', `Le vol ${flightToDelete.value.flight_number} a été supprimé avec succès.`)
      await loadKPIs()
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    showError('Erreur', error?.message || 'Impossible de supprimer ce vol.')
  } finally {
    deleteDialogOpen.value = false
    flightToDelete.value = null
  }
}

const handleSuccess = async () => {
  await flightsStore.fetchFlights(1, false)
  await loadKPIs()
  formDialogOpen.value = false
}

onMounted(async () => {
  try {
    await Promise.all([
      operatorsStore.fetchAllOperators(),
      flightsStore.fetchFlights(1, false)
    ])
    await loadKPIs()
  } catch (error: any) {
    showError('Erreur', error?.message || 'Impossible de charger les données.')
  }
})
</script>