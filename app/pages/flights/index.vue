<template>
  <div class="space-y-6 pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex-1 min-w-[250px]">
        <div class="flex items-center gap-3 mb-2">
          <div
            class="h-16 w-16 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Plane class="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 class="text-4xl font-bold tracking-tight">Vols</h1>
            <p class="text-sm text-muted-foreground">Gestion complète des vols</p>
          </div>
        </div>
      </div>
      <div class="flex gap-3">
        <Button @click="openTodayFlightsDialog" size="lg">Vols d'aujourd'hui</Button>
        <Button variant="outline" size="lg" @click="toggleViewMode" class="gap-2">
          <component :is="viewMode === 'grid' ? List : LayoutGrid" class="h-4 w-4" />
          {{ viewMode === 'grid' ? 'Liste' : 'Grille' }}
        </Button>
        <Button @click="openCreateDialog" size="lg"
          class="gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus class="h-4 w-4" />
          Nouveau vol
        </Button>
      </div>
    </div>

    <!-- KPIs - Compact & Professional -->
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="kpi in kpiCards" :key="kpi.id" class="hover:shadow-md transition-all cursor-default">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">
            {{ kpi.title }}
          </CardTitle>
          <component :is="kpi.icon" class="h-5 w-5" :style="{ color: kpi.color }" />
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold">{{ kpi.value }}</div>
          <p class="text-xs text-muted-foreground mt-2">{{ kpi.subtitle }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- Search & Filters - Improved -->
    <Card class="border-2">
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Filter class="h-4 w-4 text-muted-foreground" />
            <CardTitle>Recherche & Filtres</CardTitle>
            <Badge v-if="activeFiltersCount > 0" variant="secondary">
              {{ activeFiltersCount }}
            </Badge>
          </div>
          <Button v-if="hasActiveFilters" variant="ghost" size="sm" @click="clearAllFilters"
            class="gap-2 text-destructive hover:text-destructive">
            <X class="h-3 w-3" />
            Réinitialiser
          </Button>
        </div>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <!-- Search -->
          <div class="relative col-span-3">
            <Search class="absolute left-3 top-6 h-4 w-4 text-muted-foreground" />
            <Input v-model="searchQuery" placeholder="Numéro de vol, opérateur, aéroport..." class="pl-10 h-16"
              @input="applyFilters" />
          </div>
          <div>
            <Label class="text-xs text-muted-foreground mb-1 block">Date précise</Label>
            <Input v-model="filters.date_precise" type="date" class="h-10" @change="applyFilters" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Filter Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
            <!-- Status -->
            <Select v-model="filters.status" @update:model-value="applyFilters">
              <SelectTrigger class="h-16">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="prevu">Prévu</SelectItem>
                <SelectItem value="atteri">Atterri</SelectItem>
                <SelectItem value="qrf">QRF</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
                <SelectItem value="detourne">Détourné</SelectItem>
              </SelectContent>
            </Select>

            <!-- Regime -->
            <Select v-model="filters.regime" @update:model-value="applyFilters">
              <SelectTrigger class="h-16">
                <SelectValue placeholder="Régime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les régimes</SelectItem>
                <SelectItem value="domestic">Domestique</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>

            <!-- Type -->
            <Select v-model="filters.type" @update:model-value="applyFilters">
              <SelectTrigger class="h-16">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="regular">Régulier</SelectItem>
                <SelectItem value="non_regular">Non régulier</SelectItem>
              </SelectContent>
            </Select>

            <!-- Operator -->
            <Select v-model="filters.operator_id" @update:model-value="applyFilters">
              <SelectTrigger class="h-16">
                <SelectValue placeholder="Opérateur" />
              </SelectTrigger>
              <SelectContent class="max-h-48">
                <SelectItem value="all">Tous les opérateurs</SelectItem>
                <SelectItem v-for="op in operators" :key="op.id" :value="String(op.id)">
                  {{ op.name }} ({{ op.sigle }})
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Aircraft -->
            <Select v-model="filters.aircraft_id" @update:model-value="applyFilters">
              <SelectTrigger class="h-16">
                <SelectValue placeholder="Aéronef" />
              </SelectTrigger>
              <SelectContent class="max-h-48">
                <SelectItem value="all">Tous les aéronefs</SelectItem>
                <SelectItem v-for="aircraft in aircrafts" :key="aircraft.id" :value="String(aircraft.id)">
                  {{ aircraft.immatriculation }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label class="text-xs text-muted-foreground mb-1 block">Depuis</Label>
              <Input v-model="filters.date_from" type="date" class="h-10" @change="applyFilters" />
            </div>
            <div>
              <Label class="text-xs text-muted-foreground mb-1 block">Jusqu'au</Label>
              <Input v-model="filters.date_to" type="date" class="h-10" @change="applyFilters" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Results Summary -->
    <div class="flex items-center justify-between text-sm">
      <div class="text-muted-foreground">
        <span class="font-semibold text-foreground">{{ filteredFlights.length }}</span>
        vol{{ filteredFlights.length !== 1 ? 's' : '' }} trouvé{{ filteredFlights.length !== 1 ? 's' : '' }}
        <span v-if="totalFlights > 0" class="text-xs">
          ({{ Math.round((filteredFlights.length / totalFlights) * 100) }}% du total)
        </span>
      </div>
      <div class="flex items-center gap-2">
        <Button v-if="filteredFlights.length > 0" variant="outline" size="sm" @click="exportFlights" class="gap-2">
          <Download class="h-3.5 w-3.5" />
          Exporter
        </Button>
      </div>
    </div>

    <!-- Flights List -->
    <div v-if="loading && flights.length === 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="i in 6" :key="i" class="animate-pulse">
        <CardHeader class="pb-3">
          <Skeleton class="h-6 w-24" />
        </CardHeader>
        <CardContent class="space-y-2">
          <Skeleton class="h-4 w-32" />
          <Skeleton class="h-4 w-48" />
          <Skeleton class="h-4 w-40" />
        </CardContent>
      </Card>
    </div>

    <!-- No Results -->
    <div v-else-if="filteredFlights.length === 0" class="col-span-full">
      <Card class="border-dashed">
        <CardContent class="flex flex-col items-center justify-center py-12">
          <Plane class="h-12 w-12 text-muted-foreground mb-4" />
          <p class="text-lg font-semibold mb-2">Aucun vol trouvé</p>
          <p class="text-sm text-muted-foreground text-center mb-4">
            {{ hasActiveFilters ? 'Modifiez vos critères de recherche' : 'Commencez par créer votre premier vol' }}
          </p>
          <Button v-if="hasActiveFilters" @click="clearAllFilters" variant="outline" size="sm">
            Réinitialiser les filtres
          </Button>
          <Button v-else @click="openCreateDialog" class="gap-2">
            <Plus class="h-4 w-4" />
            Créer un vol
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Flights Grid -->
    <div v-else-if="viewMode === 'grid'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <FlightCard v-for="flight in filteredFlights" :key="flight.id" :flight="flight" @view="openViewDialog"
        @edit="openEditDialog" @delete="confirmDelete" />
    </div>

    <!-- Flights List (Table) -->
    <div v-else class="space-y-2">
      <FlightTableRow v-for="flight in filteredFlights" :key="flight.id" :flight="flight" @view="openViewDialog"
        @edit="openEditDialog" @delete="confirmDelete" />
    </div>

    <!-- Load More / Pagination -->
    <div v-if="hasMorePages && !loading" class="flex justify-center pt-8">
      <Button @click="loadMore" variant="outline" size="lg" class="gap-2 px-8">
        <ChevronDown class="h-4 w-4" />
        Charger plus de vols
      </Button>
    </div>

    <!-- Dialogs -->
    <MultiStepFlightForm v-model:open="formDialogOpen" :flight="selectedFlight" @submit="handleFormSubmit" />

    <FlightViewDialog v-model:open="viewDialogOpen" :flight="selectedFlight" @edit="openEditDialog" />

    <TodayFlightsDialog v-model:open="todayFlightsDialogOpen" />

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le vol
            <span class="font-semibold">{{ flightToDelete?.flight_number }}</span>?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction @click="deleteFlight" class="bg-destructive hover:bg-destructive/90">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Plane,
  Plus,
  Filter,
  X,
  Search,
  Download,
  ChevronDown,
  List,
  LayoutGrid,
  Users,
  CheckCircle,
  Clock,
} from 'lucide-vue-next'
import type { Flight } from '~/types/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Skeleton } from '@/components/ui/skeleton'
import FlightCard from '@/components/modules/flight/FlightCard.vue'
import FlightTableRow from '@/components/modules/flight/FlightTableRow.vue'
import MultiStepFlightForm from '@/components/modules/flight/MultiStepFlightForm.vue'
import FlightViewDialog from '@/components/modules/flight/FlightViewDialog.vue'
import TodayFlightsDialog from '~/components/modules/flight/TodayFlightsDialog.vue'

definePageMeta({
  middleware: 'auth'
})

const flightsStore = useFlightsStore()
const aircraftsStore = useAircraftsStore()
const operatorsStore = useOperatorsStore()
const { success: showSuccess, error: showError } = useToast()

// State
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')
const loading = ref(false)

const filters = ref({
  status: '',
  regime: '',
  type: '',
  operator_id: '',
  aircraft_id: '',
  date_precise: '',
  date_from: '',
  date_to: ''
})

const formDialogOpen = ref(false)
const viewDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const todayFlightsDialogOpen = ref(false)

const selectedFlight = ref<Flight | null>(null)
const flightToDelete = ref<Flight | null>(null)

// Computed
const flights = computed(() => flightsStore.flights)
const totalFlights = computed(() => flights.value.length)
const hasMorePages = computed(() => flightsStore.hasMorePages)
const operators = computed(() => operatorsStore.operators)
const aircrafts = computed(() => aircraftsStore.aircrafts)

const paxOfMonth = computed(() => {
  const totalFlights = flights.value.filter(f => isThisMonth(f.departure_time))
  let paxCount = 0
  totalFlights.forEach(flight => {
    paxCount += flight.statistics?.passengers_count || 0
  });
  return paxCount
})

// KPIs Computed
const kpis = computed(() => ({
  total_flights: flights.value.length,
  total_today: flights.value.filter(f => isToday(f.departure_time)).length,
  total_this_week: flights.value.filter(f => isThisWeek(f.departure_time)).length,
  total_this_month: flights.value.filter(f => isThisMonth(f.departure_time)).length,
  total_passengers: paxOfMonth.value,
  average_passengers: Math.round(
    paxOfMonth.value / flights.value.filter(f => isThisMonth(f.departure_time)).length
  ),
  by_status: {
    prevu: flights.value.filter(f => f.status === 'prevu').length,
    atteri: flights.value.filter(f => f.status === 'atteri').length,
    qrf: flights.value.filter(f => f.status === 'qrf').length,
    annule: flights.value.filter(f => f.status === 'annule').length,
    detourne: flights.value.filter(f => f.status === 'detourne').length
  }
}))

const kpiCards = computed(() => [
  {
    id: 'total',
    title: 'Total vols',
    value: kpis.value.total_flights,
    subtitle: `${kpis.value.total_this_month} ce mois`,
    icon: Plane,
    color: '#3b82f6'
  },
  {
    id: 'today',
    title: "Aujourd'hui",
    value: kpis.value.total_today,
    subtitle: `${kpis.value.total_this_week} cette semaine`,
    icon: Clock,
    color: '#10b981'
  },
  {
    id: 'passengers',
    title: 'Passagers ce mois',
    value: kpis.value.total_passengers.toLocaleString('fr-FR'),
    subtitle: `${kpis.value.average_passengers} en moyenne`,
    icon: Users,
    color: '#a855f7'
  },
  {
    id: 'landed',
    title: 'Atterris',
    value: kpis.value.by_status.atteri,
    subtitle: `${kpis.value.by_status.prevu} prévus`,
    icon: CheckCircle,
    color: '#f97316'
  }
])

// Filtering
const filteredFlights = computed(() => {
  let result = flights.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(f =>
      f.flight_number.toLowerCase().includes(q) ||
      f.operator?.name.toLowerCase().includes(q) ||
      f.operator?.sigle.toLowerCase().includes(q)
    )
  }

  if (filters.value.status) {
    result = result.filter(f => f.status === filters.value.status)
  }

  if (filters.value.regime) {
    result = result.filter(f => f.flight_regime === filters.value.regime)
  }

  if (filters.value.type) {
    result = result.filter(f => f.flight_type === filters.value.type)
  }

  if (filters.value.operator_id) {
    result = result.filter(f => String(f.operator?.id) === filters.value.operator_id)
  }

  if (filters.value.aircraft_id) {
    result = result.filter(f => String(f.aircraft_id) === filters.value.aircraft_id)
  }

  if (filters.value.date_precise) {
    const precise = new Date(filters.value.date_precise).toDateString()
    result = result.filter(f => new Date(f.departure_time).toDateString() === precise)
  }

  if (filters.value.date_from) {
    const from = new Date(filters.value.date_from).getTime()
    result = result.filter(f => new Date(f.departure_time).getTime() >= from)
  }

  if (filters.value.date_to) {
    const to = new Date(filters.value.date_to).getTime()
    result = result.filter(f => new Date(f.departure_time).getTime() <= to)
  }

  return result
})

const hasActiveFilters = computed(() =>
  Object.values(filters.value).some(v => v) || searchQuery.value
)

const activeFiltersCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (filters.value.status) count++
  if (filters.value.regime) count++
  if (filters.value.type) count++
  if (filters.value.operator_id) count++
  if (filters.value.aircraft_id) count++
  if (filters.value.date_precise) count++
  if (filters.value.date_from) count++
  if (filters.value.date_to) count++
  return count
})

// Utilities
const isToday = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isThisWeek = (dateStr: string) => {
  const date = new Date(new Date(dateStr).getFullYear(), new Date(dateStr).getMonth(), new Date(dateStr).getDate())
  const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  const dayOfWeek = today.getDay() // 0 (Dim) à 6 (Sam)
  const firstDayOfWeek = new Date(today)
  firstDayOfWeek.setDate((today.getDate() - dayOfWeek) + 1) // mis à Lundi
  const lastDayOfWeek = new Date(firstDayOfWeek)
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6) // mis à Dimanche

  if (date >= firstDayOfWeek && date <= lastDayOfWeek) {
    return true
  }
  return false
}

const isThisMonth = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
  localStorage.setItem('flights-view-mode', viewMode.value)
}

const applyFilters = () => {
  // Filters are reactive, computed property handles filtering
}

const clearAllFilters = () => {
  searchQuery.value = ''
  filters.value = {
    status: '',
    regime: '',
    type: '',
    operator_id: '',
    aircraft_id: '',
    date_precise: '',
    date_from: '',
    date_to: ''
  }
}

const openTodayFlightsDialog = async () => {
  const result = await flightsStore.fetchTodayFlights()
  if (result.success && result.data) {
    todayFlightsDialogOpen.value = true
  }
}

const openCreateDialog = () => {
  selectedFlight.value = null
  formDialogOpen.value = true
}

const openEditDialog = async (flight: Flight) => {
  const result = await flightsStore.fetchFlight(flight.id)

  if (result.success && result.data) {
    selectedFlight.value = result.data   // <-- le bon state !
    formDialogOpen.value = true
  }
}

const openViewDialog = async (flight: Flight) => {
  const result = await flightsStore.fetchFlight(flight.id)
  if (result.success && result.data) {
    selectedFlight.value = result.data
    viewDialogOpen.value = true
  }
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
    await fetchFlights()
  } else {
    showError(result.message || 'Erreur lors de la suppression')
  }
  deleteDialogOpen.value = false
}

const handleFormSubmit = async () => {
  await fetchFlights()
  showSuccess('Opération effectuée avec succès')
}

const loadMore = async () => {
  if (!hasMorePages.value) return
  await flightsStore.loadNextPage()
}

const fetchFlights = async () => {
  loading.value = true
  await flightsStore.fetchFlights(1)
  loading.value = false
}

const exportFlights = () => {
  const getDeparture = (departure: any) =>
    typeof departure === 'object' && departure?.iata ? departure.iata : ''
  const getArrival = (arrival: any) =>
    typeof arrival === 'object' && arrival?.iata ? arrival.iata : ''

  const csv = [
    ['Numéro', 'Opérateur', 'Aéronef', 'Départ', 'Arrivée', 'Statut', 'Passagers'].join(','),
    ...filteredFlights.value.map(f =>
      [
        f.flight_number,
        f.operator?.name || '',
        f.aircraft?.immatriculation || '',
        getDeparture(f.departure),
        getArrival(f.arrival),
        f.status,
        f.statistics?.passengers_count || 0
      ].join(',')
    )
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `flights-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Lifecycle
onMounted(async () => {
  await fetchFlights()
  await aircraftsStore.fetchAircrafts()
  await operatorsStore.fetchOperators()

  const savedMode = localStorage.getItem('flights-view-mode')
  if (savedMode === 'list') {
    viewMode.value = 'list'
  }
})

watch(() => flightsStore.flights.length, () => {
  // Recompute KPIs when flights change
})
</script>
