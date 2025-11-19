<template>
  <div class="space-y-6">
    <!-- Header avec actions -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div class="h-10 w-10 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Layers class="h-6 w-6 text-white" />
          </div>
          Types d'aéronefs
        </h1>
        <p class="text-muted-foreground mt-2">
          Gérer les types d'aéronefs et analyser leur utilisation dans la flotte
        </p>
      </div>
      <Button @click="openCreateDialog" size="lg" class="gap-2">
        <Plus class="h-4 w-4" />
        Nouveau type
      </Button>
    </div>

    <!-- KPI Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-if="loading" v-for="i in 4" :key="i">
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
        <!-- Total types -->
        <Card class="border-2 hover:shadow-lg transition-shadow bg-linear-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-semibold text-blue-900 dark:text-blue-100">Total types</CardTitle>
            <div class="h-10 w-10 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center shadow-md">
              <Layers class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold text-blue-900 dark:text-blue-100">{{ kpis.totalTypes }}</div>
            <p class="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
              <Database class="h-3 w-3" />
              Types enregistrés
            </p>
          </CardContent>
        </Card>

        <!-- Aéronefs associés -->
        <Card class="border-2 hover:shadow-lg transition-shadow bg-linear-to-br from-green-50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-semibold text-green-900 dark:text-green-100">Flotte totale</CardTitle>
            <div class="h-10 w-10 rounded-lg bg-green-500 dark:bg-green-600 flex items-center justify-center shadow-md">
              <Plane class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold text-green-900 dark:text-green-100">{{ kpis.totalAircrafts }}</div>
            <div class="flex items-center gap-2 mt-1 text-xs">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-600/20 text-green-700 dark:text-green-300">
                <div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                {{ kpis.activeAircrafts }}
              </span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-600 dark:text-gray-400">
                <div class="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                {{ kpis.inactiveAircrafts }}
              </span>
            </div>
          </CardContent>
        </Card>

        <!-- Type le plus utilisé -->
        <Card class="border-2 hover:shadow-lg transition-shadow bg-linear-to-br from-purple-50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-semibold text-purple-900 dark:text-purple-100">Type populaire</CardTitle>
            <div class="h-10 w-10 rounded-lg bg-purple-500 dark:bg-purple-600 flex items-center justify-center shadow-md">
              <TrendingUp class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-lg font-bold text-purple-900 dark:text-purple-100 truncate" :title="kpis.mostUsedType?.name">
              {{ kpis.mostUsedType?.name || '—' }}
            </div>
            <p class="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
              <Plane class="h-3 w-3" />
              {{ kpis.mostUsedType?.count || 0 }} aéronefs
            </p>
          </CardContent>
        </Card>

        <!-- Exploitants -->
        <Card class="border-2 hover:shadow-lg transition-shadow bg-linear-to-br from-orange-50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-semibold text-orange-900 dark:text-orange-100">Exploitants</CardTitle>
            <div class="h-10 w-10 rounded-lg bg-orange-500 dark:bg-orange-600 flex items-center justify-center shadow-md">
              <Building2 class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold text-orange-900 dark:text-orange-100">{{ kpis.totalOperators }}</div>
            <p class="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
              <Building2 class="h-3 w-3" />
              Compagnies actives
            </p>
          </CardContent>
        </Card>
      </template>
    </div>

    <!-- Filtres et recherche -->
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
            @click="clearSearch"
            class="gap-2"
          >
            <X class="h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Rechercher par nom ou code ICAO..."
                class="pl-10"
                @input="debouncedSearch"
              />
            </div>
          </div>
          <Select v-model="sortBy">
            <SelectTrigger class="w-full sm:w-60">
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Par défaut</SelectItem>
              <SelectItem value="name_asc">Nom (A → Z)</SelectItem>
              <SelectItem value="name_desc">Nom (Z → A)</SelectItem>
              <SelectItem value="sigle_asc">Code ICAO (A → Z)</SelectItem>
              <SelectItem value="sigle_desc">Code ICAO (Z → A)</SelectItem>
              <SelectItem value="created_desc">Plus récents</SelectItem>
              <SelectItem value="created_asc">Plus anciens</SelectItem>
              <SelectItem value="usage_desc">Plus utilisés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Liste des types -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <Layers class="h-5 w-5" />
              Types d'aéronefs ({{ displayedTypes.length }})
            </CardTitle>
            <CardDescription class="mt-1">
              Liste complète des types disponibles
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
        <!-- Loading -->
        <div v-if="loading" class="space-y-3">
          <div v-if="viewMode === 'grid'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AircraftTypeCardSkeleton v-for="i in 6" :key="i" />
          </div>
          <div v-else class="space-y-2">
            <AircraftTypeRowSkeleton v-for="i in 6" :key="i" />
          </div>
        </div>

        <!-- Empty State -->
        <div 
          v-else-if="displayedTypes.length === 0" 
          class="text-center py-16"
        >
          <div class="h-20 w-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Layers class="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h3 class="text-lg font-semibold mb-2">Aucun type trouvé</h3>
          <p class="text-muted-foreground mb-6">
            {{ searchQuery ? 'Aucun résultat pour cette recherche' : 'Commencez par créer un type d\'aéronef' }}
          </p>
          <Button v-if="!searchQuery" @click="openCreateDialog" size="lg">
            <Plus class="mr-2 h-4 w-4" />
            Créer un type
          </Button>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            v-for="type in displayedTypes"
            :key="type.id"
            class="hover:shadow-lg transition-all cursor-pointer group border-2"
            @click="openViewDialog(type)"
          >
            <CardHeader class="pb-3">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Plane class="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <CardTitle class="text-base group-hover:text-primary transition-colors leading-tight">
                    {{ type.name }}
                  </CardTitle>
                  <Badge variant="secondary" class="font-mono mt-2 text-xs">
                    {{ type.sigle }}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child @click.stop>
                    <Button variant="ghost" size="icon" class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click.stop="openViewDialog(type)">
                      <Eye class="mr-2 h-4 w-4" />
                      Voir les détails
                    </DropdownMenuItem>
                    <DropdownMenuItem @click.stop="openEditDialog(type)">
                      <Pencil class="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      @click.stop="confirmDelete(type)"
                      class="text-destructive focus:text-destructive"
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span class="text-muted-foreground flex items-center gap-2">
                    <Plane class="h-3.5 w-3.5" />
                    Aéronefs
                  </span>
                  <Badge variant="outline" class="font-semibold">
                    {{ getAircraftCount(type.id) }}
                  </Badge>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-muted-foreground flex items-center gap-1">
                    <Calendar class="h-3 w-3" />
                    Créé le
                  </span>
                  <span class="font-medium">{{ formatDate(type.created_at) }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- List View -->
        <div v-else class="space-y-2">
          <Card
            v-for="type in displayedTypes"
            :key="type.id"
            class="hover:bg-muted/50 transition-all cursor-pointer border-2"
            @click="openViewDialog(type)"
          >
            <CardContent class="p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 flex-1">
                  <div class="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                    <Layers class="h-6 w-6 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-bold text-base">{{ type.name }}</div>
                    <div class="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Badge variant="secondary" class="font-mono text-xs">
                        {{ type.sigle }}
                      </Badge>
                      <span>•</span>
                      <span class="flex items-center gap-1">
                        <Plane class="h-3 w-3" />
                        {{ getAircraftCount(type.id) }} aéronefs
                      </span>
                      <span>•</span>
                      <span>{{ formatDate(type.created_at) }}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child @click.stop>
                    <Button variant="ghost" size="icon" class="h-8 w-8">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click.stop="openViewDialog(type)">
                      <Eye class="mr-2 h-4 w-4" />
                      Voir les détails
                    </DropdownMenuItem>
                    <DropdownMenuItem @click.stop="openEditDialog(type)">
                      <Pencil class="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      @click.stop="confirmDelete(type)"
                      class="text-destructive focus:text-destructive"
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Load More Trigger -->
    <div v-if="hasMorePages && !aircraftTypesStore.loading" ref="loadMoreTrigger" class="flex justify-center py-8">
      <Button variant="outline" @click="loadMore" :disabled="aircraftTypesStore.loading">
        Charger plus de types
      </Button>
    </div>

    <!-- Loading More -->
    <div v-if="aircraftTypesStore.loading && displayedTypes.length > 0" class="py-4">
      <div v-if="viewMode === 'grid'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AircraftTypeCardSkeleton v-for="i in 3" :key="i" />
      </div>
      <div v-else class="space-y-2">
        <AircraftTypeRowSkeleton v-for="i in 3" :key="i" />
      </div>
    </div>

    <!-- Dialogs -->
    <AircraftTypeFormDialog
      v-model:open="dialogOpen"
      :aircraft-type="selectedType"
      @success="handleSuccess"
    />

    <AircraftTypeViewDialog
      v-model:open="viewDialogOpen"
      :aircraft-type="selectedType"
      @edit="handleEditFromView"
    />

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-destructive" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription class="space-y-2">
            <p>Êtes-vous sûr de vouloir supprimer le type <strong class="text-foreground">{{ typeToDelete?.name }}</strong> ?</p>
            <p v-if="getAircraftCount(typeToDelete?.id || 0) > 0" class="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-medium">
              <AlertTriangle class="h-4 w-4 shrink-0 mt-0.5" />
              <span>Ce type est utilisé par {{ getAircraftCount(typeToDelete?.id || 0) }} aéronef(s). Cette action est irréversible.</span>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            @click="handleDelete"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 class="mr-2 h-4 w-4" />
            Supprimer définitivement
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
  Pencil, 
  Trash2, 
  MoreVertical,
  Layers,
  Plane,
  Calendar,
  TrendingUp,
  Building2,
  X,
  Eye,
  LayoutGrid,
  List,
  Filter,
  Database,
  AlertTriangle
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
import AircraftTypeFormDialog from '~/components/modules/aircraft-type/AircraftTypeFormDialog.vue'
import AircraftTypeViewDialog from '~/components/modules/aircraft-type/AircraftTypeViewDialog.vue'
import AircraftTypeCardSkeleton from '@/components/modules/aircraft-type/AircraftTypeCardSkeleton.vue'
import AircraftTypeRowSkeleton from '@/components/modules/aircraft-type/AircraftTypeRowSkeleton.vue'
import type { AircraftType } from '~/types/api'

definePageMeta({
  middleware: 'auth'
})

const aircraftsStore = useAircraftsStore()
const aircraftTypesStore = useAircraftTypesStore()
const operatorsStore = useOperatorsStore()
const { success: showSuccess, error: showError } = useToast()

const searchQuery = ref('')
const sortBy = ref('all')
const viewMode = ref<'grid' | 'list'>('grid')
const dialogOpen = ref(false)
const viewDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const selectedType = ref<AircraftType | null>(null)
const typeToDelete = ref<AircraftType | null>(null)

// KPIs calculés
const kpis = computed(() => {
  const types = aircraftTypesStore.aircraftTypes
  const aircrafts = aircraftsStore.allAircrafts
  
  const typeCounts = types.map(type => ({
    id: type.id,
    name: type.name,
    count: aircrafts.filter(a => a.type?.id === type.id).length
  }))
  
  const mostUsedType = typeCounts.sort((a, b) => b.count - a.count)[0]
  const activeAircrafts = aircrafts.filter(a => a.in_activity).length
  const inactiveAircrafts = aircrafts.length - activeAircrafts
  const uniqueOperators = new Set(aircrafts.map(a => a.operator?.id).filter(Boolean))
  
  return {
    totalTypes: aircraftTypesStore.total,
    totalAircrafts: aircrafts.length,
    activeAircrafts,
    inactiveAircrafts,
    mostUsedType,
    totalOperators: uniqueOperators.size
  }
})

const hasActiveFilters = computed(() => searchQuery.value || sortBy.value !== 'all')

// Computed
const loading = computed(() => aircraftTypesStore.loading)
const displayedTypes = computed(() => aircraftTypesStore.aircraftTypes)
const hasMorePages = computed(() => aircraftTypesStore.hasMorePages)
const total = computed(() => aircraftTypesStore.total)

// Intersection Observer
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let searchTimeout: NodeJS.Timeout

// Fetch initial types
const fetchAircraftTypes = async () => {
  aircraftTypesStore.resetPagination()
  const result = await aircraftTypesStore.fetchAircraftTypesPage(1)

  if (!result.success) {
    showError(result.message || 'Erreur lors du chargement des types')
  }
}

// Load more for infinite scroll
const loadMore = async () => {
  if (!hasMorePages.value || loading.value) return
  await aircraftTypesStore.loadNextPage()
}

// Search with debounce
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (searchQuery.value.trim()) {
      // TODO: implémenter la recherche via l'API si nécessaire
      // Pour l'instant on peut garder le filtrage côté client ou appeler une API
    } else {
      await fetchAircraftTypes()
    }
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  sortBy.value = 'all'
  fetchAircraftTypes()
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

const getAircraftCount = (typeId: number) => {
  return aircraftsStore.allAircrafts.filter(a => a.type?.id === typeId).length
}

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const openCreateDialog = () => {
  selectedType.value = null
  dialogOpen.value = true
}

const openEditDialog = (type: AircraftType) => {
  selectedType.value = type
  dialogOpen.value = true
}

const openViewDialog = (type: AircraftType) => {
  selectedType.value = type
  viewDialogOpen.value = true
}

const handleEditFromView = (type: AircraftType) => {
  selectedType.value = type
  viewDialogOpen.value = false
  dialogOpen.value = true
}

const confirmDelete = (type: AircraftType) => {
  typeToDelete.value = type
  deleteDialogOpen.value = true
}

const handleDelete = async () => {
  if (!typeToDelete.value) return
  
  try {
    const result = await aircraftTypesStore.deleteAircraftType(typeToDelete.value.id)
    
    if (result.success) {
      showSuccess('Type supprimé', `Le type ${typeToDelete.value.name} a été supprimé avec succès.`)
      await fetchAircraftTypes()
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    showError('Erreur', error?.message || 'Impossible de supprimer ce type.')
  } finally {
    deleteDialogOpen.value = false
    typeToDelete.value = null
  }
}

const handleSuccess = async () => {
  await fetchAircraftTypes()
  dialogOpen.value = false
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchAircraftTypes(),
    aircraftsStore.fetchAllAircrafts(),
    operatorsStore.fetchAllOperators()
  ])

  // Setup observer after a short delay to ensure DOM is ready
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
</script>