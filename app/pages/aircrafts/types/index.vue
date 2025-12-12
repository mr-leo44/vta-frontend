<template>
  <div class="space-y-6">
    <!-- Header avec linear moderne -->
    <div class="relative overflow-hidden rounded-2xl p-2">
      <div class="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="h-16 w-16 rounded-lg bg-linear-to-br from-green-600 via-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
              <Layers class="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 class="text-4xl font-bold tracking-tight">Types d'aéronefs</h1>
              <p class="text-muted-foreground text-sm mt-1">
                Gérer les types d'aéronefs et analyser leur utilisation dans la flotte
              </p>
            </div>
          </div>
        </div>
        <Button 
          @click="openCreateDialog" 
          size="lg"
          class="bg-linear-to-br from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 shadow-xl gap-2"
        >
          <Plus class="h-5 w-5" />
          Nouveau type
        </Button>
      </div>
      <!-- Decorative circles -->
      <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      <div class="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
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
        <Card class="group border-2 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
          <div class="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle class="text-sm font-semibold">Total types</CardTitle>
            <div class="h-12 w-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Layers class="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent class="relative">
            <div class="text-4xl font-bold bg-linear-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {{ kpis.totalTypes }}
            </div>
            <p class="text-xs flex items-center gap-1 mt-2">
              <Database class="h-3 w-3 text-muted-foreground" />
              <span class="text-muted-foreground">Types enregistrés</span>
            </p>
          </CardContent>
        </Card>

        <!-- Flotte totale -->
        <Card class="group border-2 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
          <div class="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle class="text-sm font-semibold">Flotte totale</CardTitle>
            <div class="h-12 w-12 rounded-xl bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Plane class="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent class="relative">
            <div class="text-4xl font-bold bg-linear-to-br from-green-600 to-green-800 bg-clip-text text-transparent">
              {{ kpis.totalAircrafts }}
            </div>
            <div class="flex items-center gap-2 mt-2">
              <Badge variant="default" class="gap-1 text-xs">
                <div class="h-1.5 w-1.5 rounded-full bg-green-200"></div>
                {{ kpis.activeAircrafts }}
              </Badge>
              <Badge variant="secondary" class="gap-1 text-xs">
                <div class="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                {{ kpis.inactiveAircrafts }}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <!-- Type le plus utilisé -->
        <Card class="group border-2 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
          <div class="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle class="text-sm font-semibold">Type populaire</CardTitle>
            <div class="h-12 w-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp class="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent class="relative">
            <div class="text-lg font-bold truncate bg-linear-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent" :title="kpis.mostUsedType?.name">
              {{ kpis.mostUsedType?.name || '—' }}
            </div>
            <p class="text-xs flex items-center gap-1 mt-2 text-muted-foreground">
              <Plane class="h-3 w-3" />
              {{ kpis.mostUsedType?.count || 0 }} aéronefs
            </p>
          </CardContent>
        </Card>

        <!-- Exploitants -->
        <Card class="group border-2 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
          <div class="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle class="text-sm font-semibold">Exploitants</CardTitle>
            <div class="h-12 w-12 rounded-xl bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Building2 class="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent class="relative">
            <div class="text-4xl font-bold bg-linear-to-br from-orange-600 to-orange-800 bg-clip-text text-transparent">
              {{ kpis.totalOperators }}
            </div>
            <p class="text-xs flex items-center gap-1 mt-2 text-muted-foreground">
              <Building2 class="h-3 w-3" />
              Compagnies actives
            </p>
          </CardContent>
        </Card>
      </template>
    </div>

    <!-- Filtres et recherche -->
    <Card class="border-2 shadow-lg">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Filter class="h-5 w-5 text-muted-foreground" />
            <CardTitle>Recherche et filtres</CardTitle>
            <Badge v-if="hasActiveFilters" variant="secondary">
              Active
            </Badge>
          </div>
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
              <Search class="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Rechercher par nom ou code ICAO..."
                class="pl-10 h-12 border-2"
                @input="debouncedSearch"
              />
            </div>
          </div>
          <Select v-model="sortBy">
            <SelectTrigger class="w-full sm:w-60 h-12">
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
    <Card class="border-2 shadow-lg">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2 text-xl">
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
              :class="viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''"
            >
              <LayoutGrid class="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="viewMode = 'list'"
              :class="viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''"
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
          <div class="h-24 w-24 rounded-2xl bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 mx-auto mb-6 flex items-center justify-center">
            <Layers class="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Aucun type trouvé</h3>
          <p class="text-muted-foreground mb-6">
            {{ searchQuery ? 'Aucun résultat pour cette recherche' : 'Commencez par créer un type d\'aéronef' }}
          </p>
          <Button v-if="!searchQuery" @click="openCreateDialog" size="lg" class="gap-2">
            <Plus class="h-4 w-4" />
            Créer un type
          </Button>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            v-for="type in displayedTypes"
            :key="type.id"
            class="group hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden"
            @click="openViewDialog(type)"
          >
            <div class="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader class="pb-3 relative">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="h-12 w-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Plane class="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle class="text-lg group-hover:text-primary transition-colors leading-tight">
                    {{ type.name }}
                  </CardTitle>
                  <div class="flex gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" class="font-mono mt-2 text-xs">
                      {{ type.sigle }}
                    </Badge>
                    <Badge variant="default" class="font-mono mt-2 text-xs">
                      {{ kgToTons(type.default_pmad) }}
                    </Badge>
                  </div>
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
            <CardContent class="relative">
              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span class="text-muted-foreground flex items-center gap-2">
                    <Plane class="h-3.5 w-3.5" />
                    Aéronefs
                  </span>
                  <Badge variant="default" class="font-semibold">
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
                  <div class="h-14 w-14 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg">
                    <Layers class="h-7 w-7 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-bold text-lg">{{ type.name }}</div>
                    <div class="text-sm text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                      <div class="flex gap-2">
                        <Badge variant="secondary" class="font-mono text-xs">
                          {{ type.sigle }}
                        </Badge>
                        <Badge variant="default" class="font-mono text-xs">
                          {{ kgToTons(type.default_pmad) }}
                        </Badge>
                      </div>
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
      <Button variant="outline" @click="loadMore" :disabled="aircraftTypesStore.loading" size="lg" class="gap-2">
        <ChevronDown class="h-4 w-4" />
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
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            <Trash2 class="h-4 w-4" />
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
  AlertTriangle,
  ChevronDown
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

const { kgToTons } = useAircraftUtils()
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

// État pour stocker tous les types chargés initialement
const allTypesCache = ref<AircraftType[]>([])

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
    totalTypes: total.value,
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

  if (result.success) {
    // Mettre en cache tous les types chargés
    allTypesCache.value = [...aircraftTypesStore.aircraftTypes]
  } else {
    showError(result.message || 'Erreur lors du chargement des types')
  }
}

// Load more for infinite scroll
const loadMore = async () => {
  if (!hasMorePages.value || loading.value) return
  await aircraftTypesStore.loadNextPage()
  // Mettre à jour le cache après avoir chargé plus de types
  allTypesCache.value = [...aircraftTypesStore.aircraftTypes]
}

// Search with debounce
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    const query = searchQuery.value.trim()
    
    if (query) {
      // Recherche locale dans le cache
      const filtered = allTypesCache.value.filter(type => 
        type.name.toLowerCase().includes(query.toLowerCase()) ||
        type.sigle.toLowerCase().includes(query.toLowerCase())
      )
      
      // Si on a des résultats dans le cache, les afficher
      if (filtered.length > 0) {
        aircraftTypesStore.aircraftTypes = filtered
      } else {
        // Sinon, chercher via l'API
        const result = await aircraftTypesStore.findAircraftType(query)
        if (result.success && result.data) {
          aircraftTypesStore.aircraftTypes = [result.data]
        } else {
          aircraftTypesStore.aircraftTypes = []
        }
      }
    } else {
      // Restaurer tous les types depuis le cache
      aircraftTypesStore.aircraftTypes = [...allTypesCache.value]
    }
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  sortBy.value = 'all'
  // Restaurer depuis le cache au lieu de recharger
  aircraftTypesStore.aircraftTypes = [...allTypesCache.value]
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
      showSuccess('Type supprimé avec succès')
      await fetchAircraftTypes()
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    showError(error?.message || 'Impossible de supprimer ce type.')
  } finally {
    deleteDialogOpen.value = false
    typeToDelete.value = null
  }
}

const handleSuccess = async () => {
  await fetchAircraftTypes()
  // Mettre à jour le cache
  allTypesCache.value = [...aircraftTypesStore.aircraftTypes]
  dialogOpen.value = false
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchAircraftTypes(),
    aircraftsStore.fetchAllAircrafts(),
    operatorsStore.fetchAllOperators()
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
</script>