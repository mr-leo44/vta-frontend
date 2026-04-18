<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Types d'aéronefs</h1>
        <p class="text-sm text-muted-foreground mt-0.5">
          {{ total ?? 0 }} type{{ (total ?? 0) > 1 ? 's' : '' }} enregistré{{ (total ?? 0) > 1 ? 's' : '' }}
        </p>
      </div>
      <Button v-if="can('aircraftType.create')" @click="openCreateDialog" size="sm" class="gap-1.5">
        <Plus class="h-4 w-4" />
        Nouveau type
      </Button>
    </div>

    <!-- KPI Cards -->
    <div class="hidden md:grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Skeletons -->
      <template v-if="loading && aircraftTypesStore.aircraftTypes.length === 0">
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
        <!-- Total types -->
        <div class="bg-card border border-border rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total types</span>
            <div class="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Layers class="h-4 w-4 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
            </div>
          </div>
          <p class="text-2xl font-bold text-foreground">{{ kpis.totalTypes }}</p>
          <p class="text-xs text-muted-foreground mt-1">Types enregistrés</p>
        </div>

        <!-- Flotte totale -->
        <div class="bg-card border border-border rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Flotte</span>
            <div class="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Plane class="h-4 w-4 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
            </div>
          </div>
          <p class="text-2xl font-bold text-foreground">{{ kpis.totalAircrafts }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-300">
              <span class="h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span>
              {{ kpis.activeAircrafts }} actifs
            </span>
            <span class="text-xs text-muted-foreground">·</span>
            <span class="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <span class="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 inline-block"></span>
              {{ kpis.inactiveAircrafts }} inactifs
            </span>
          </div>
        </div>

        <!-- Type le plus utilisé -->
        <div class="bg-card border border-border rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type populaire</span>
            <div class="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <TrendingUp class="h-4 w-4 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
            </div>
          </div>
          <p class="text-base font-bold text-foreground truncate" :title="kpis.mostUsedType?.name">
            {{ kpis.mostUsedType?.name || '—' }}
          </p>
          <p class="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Plane class="h-3 w-3" :stroke-width="1.5" />
            {{ kpis.mostUsedType?.count || 0 }} aéronefs
          </p>
        </div>

        <!-- Exploitants -->
        <div class="bg-card border border-border rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exploitants</span>
            <div class="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Building2 class="h-4 w-4 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
            </div>
          </div>
          <p class="text-2xl font-bold text-foreground">{{ kpis.totalOperators }}</p>
          <p class="text-xs text-muted-foreground mt-1">Compagnies actives</p>
        </div>
      </template>
    </div>

    <!-- Barre recherche + tri + toggle vue -->
    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          v-model="searchQuery"
          placeholder="Rechercher par nom ou code ICAO..."
          class="pl-9 h-9 text-sm"
          @input="debouncedSearch"
        />
      </div>

      <!-- Clear recherche -->
      <Button v-if="searchQuery" variant="ghost" size="icon" class="h-9 w-9 shrink-0" @click="clearSearch">
        <X class="h-4 w-4" />
      </Button>

      <!-- Select tri — valeur sentinelle "default" pour éviter l'erreur shadcn value="" -->
      <Select v-model="sortBy">
        <SelectTrigger class="h-9 w-44 text-sm shrink-0">
          <SelectValue placeholder="Trier par..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Par défaut</SelectItem>
          <SelectItem value="name_asc">Nom (A → Z)</SelectItem>
          <SelectItem value="name_desc">Nom (Z → A)</SelectItem>
          <SelectItem value="sigle_asc">Code ICAO (A → Z)</SelectItem>
          <SelectItem value="sigle_desc">Code ICAO (Z → A)</SelectItem>
          <SelectItem value="created_desc">Plus récents</SelectItem>
          <SelectItem value="created_asc">Plus anciens</SelectItem>
          <SelectItem value="usage_desc">Plus utilisés</SelectItem>
        </SelectContent>
      </Select>

      <!-- Toggle vue grid / list -->
      <div class="flex items-center bg-muted rounded-md p-0.5 shrink-0">
        <button
          @click="viewMode = 'grid'"
          class="h-7 w-7 flex items-center justify-center rounded transition-all"
          :class="viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
        >
          <LayoutGrid class="h-3.5 w-3.5" />
        </button>
        <button
          @click="viewMode = 'list'"
          class="h-7 w-7 flex items-center justify-center rounded transition-all"
          :class="viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
        >
          <List class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <!-- Contenu : liste des types -->
    <div class="space-y-3">

      <!-- Skeleton chargement initial -->
      <template v-if="loading && displayedTypes.length === 0">
        <div v-if="viewMode === 'grid'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AircraftTypeCardSkeleton v-for="i in 6" :key="i" />
        </div>
        <div v-else class="space-y-1.5">
          <AircraftTypeRowSkeleton v-for="i in 6" :key="i" />
        </div>
      </template>

      <!-- État vide -->
      <div v-else-if="displayedTypes.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mb-4">
          <Layers class="h-7 w-7 text-muted-foreground" :stroke-width="1.5" />
        </div>
        <p class="font-medium text-sm mb-1">
          {{ searchQuery ? 'Aucun résultat trouvé' : 'Aucun type enregistré' }}
        </p>
        <p class="text-xs text-muted-foreground mb-5 max-w-xs">
          {{ searchQuery ? 'Essayez avec d\'autres termes.' : 'Commencez par créer un type d\'aéronef.' }}
        </p>
        <Button v-if="!searchQuery && can('aircraftType.create')" @click="openCreateDialog" size="sm" class="gap-1.5">
          <Plus class="h-4 w-4" />
          Créer un type
        </Button>
        <Button v-else-if="searchQuery" variant="outline" size="sm" @click="clearSearch" class="gap-1.5">
          <X class="h-4 w-4" />
          Effacer la recherche
        </Button>
      </div>

      <!-- Vue grille -->
      <div v-else-if="viewMode === 'grid'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="type in displayedTypes"
          :key="type.id"
          class="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all duration-150
                 hover:border-blue-400/60 dark:hover:border-blue-500/40 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(24,95,165,0.08)]"
          @click="openViewDialog(type)"
        >
          <!-- Barre latérale bleue -->
          <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-600" />

          <div class="pl-5 pr-4 pt-4 pb-4">
            <!-- En-tête -->
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                  <Layers class="h-[18px] w-[18px] text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
                </div>
                <div class="min-w-0">
                  <p class="text-[13.5px] font-semibold leading-tight truncate text-foreground
                             group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {{ type.name }}
                  </p>
                  <p class="text-[11px] font-mono text-muted-foreground mt-0.5">{{ type.sigle }}</p>
                </div>
              </div>

              <!-- Menu -->
              <DropdownMenu>
                <DropdownMenuTrigger as-child @click.stop>
                  <Button
                    variant="ghost" size="icon"
                    class="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity border border-border rounded-md"
                  >
                    <MoreVertical class="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-44">
                  <DropdownMenuItem @click.stop="openViewDialog(type)" class="cursor-pointer text-sm">
                    <Eye class="mr-2 h-3.5 w-3.5" />Voir les détails
                  </DropdownMenuItem>
                  <DropdownMenuItem v-if="can('aircraftType.update')" @click.stop="openEditDialog(type)" class="cursor-pointer text-sm">
                    <Pencil class="mr-2 h-3.5 w-3.5" />Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator v-if="can('aircraftType.delete')" />
                  <DropdownMenuItem v-if="can('aircraftType.delete')" @click.stop="confirmDelete(type)"
                    class="text-destructive focus:text-destructive cursor-pointer text-sm">
                    <Trash2 class="mr-2 h-3.5 w-3.5" />Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div class="h-px bg-border mb-3" />

            <!-- PMAD -->
            <div class="flex items-center gap-1.5 mb-3">
              <span class="inline-flex items-center font-mono text-[11px] font-medium px-1.5 py-0.5 rounded
                           bg-muted border border-border text-muted-foreground leading-relaxed">
                <span class="opacity-60 mr-1 font-normal">PMAD</span>{{ kgToTons(type.default_pmad) }}
              </span>
            </div>

            <!-- Footer : nb aéronefs + hint -->
            <div class="flex items-center justify-between pt-2.5 border-t border-border">
              <span class="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Plane class="h-3 w-3 shrink-0" :stroke-width="1.5" />
                {{ getAircraftCount(type.id) }} aéronef{{ getAircraftCount(type.id) > 1 ? 's' : '' }}
              </span>
              <span class="text-[11px] font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Voir →
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue liste -->
      <div v-else class="space-y-1.5">
        <div
          v-for="type in displayedTypes"
          :key="type.id"
          class="group flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg
                 hover:border-blue-400/60 dark:hover:border-blue-500/40 hover:bg-muted/30 transition-all duration-150 cursor-pointer"
          @click="openViewDialog(type)"
        >
          <!-- Indicateur -->
          <div class="w-0.5 self-stretch rounded-full bg-blue-600 shrink-0" />

          <!-- Icône -->
          <div class="h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
            <Layers class="h-4 w-4 text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {{ type.name }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span class="font-mono">{{ type.sigle }}</span>
              <span>·</span>
              <span>PMAD {{ kgToTons(type.default_pmad) }}</span>
              <span>·</span>
              <span class="flex items-center gap-1">
                <Plane class="h-3 w-3" :stroke-width="1.5" />
                {{ getAircraftCount(type.id) }} aéronefs
              </span>
            </div>
          </div>

          <!-- Menu -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child @click.stop>
              <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-44">
              <DropdownMenuItem @click.stop="openViewDialog(type)" class="cursor-pointer text-sm">
                <Eye class="mr-2 h-3.5 w-3.5" />Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem v-if="can('aircraftType.update')" @click.stop="openEditDialog(type)" class="cursor-pointer text-sm">
                <Pencil class="mr-2 h-3.5 w-3.5" />Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator v-if="can('aircraftType.delete')" />
              <DropdownMenuItem v-if="can('aircraftType.delete')" @click.stop="confirmDelete(type)"
                class="text-destructive focus:text-destructive cursor-pointer text-sm">
                <Trash2 class="mr-2 h-3.5 w-3.5" />Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Charger plus (infinite scroll trigger) -->
      <div v-if="hasMorePages && !loading && !searchQuery" ref="loadMoreTrigger" class="flex justify-center pt-4 pb-2">
        <Button variant="outline" size="sm" @click="loadMore" :disabled="loading" class="gap-1.5 text-xs">
          <ChevronDown class="h-3.5 w-3.5" />
          Charger plus
        </Button>
      </div>

      <!-- Skeleton chargement page suivante -->
      <template v-if="loading && displayedTypes.length > 0">
        <div v-if="viewMode === 'grid'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AircraftTypeCardSkeleton v-for="i in 3" :key="i" />
        </div>
        <div v-else class="space-y-1.5">
          <AircraftTypeRowSkeleton v-for="i in 3" :key="i" />
        </div>
      </template>

      <!-- Fin de liste -->
      <div v-if="!hasMorePages && displayedTypes.length > 0 && !searchQuery" class="flex justify-center pt-4 pb-2">
        <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check class="h-3.5 w-3.5 text-green-500" />
          Tous les types sont affichés
        </span>
      </div>
    </div>

    <!-- Dialog formulaire -->
    <AircraftTypeFormDialog
      v-model:open="dialogOpen"
      :aircraft-type="selectedType"
      @success="handleSuccess"
    />

    <!-- Dialog vue détail -->
    <AircraftTypeViewDialog
      v-model:open="viewDialogOpen"
      :aircraft-type="selectedType"
      @edit="handleEditFromView"
      @delete="confirmDelete"
    />

    <!-- Dialog confirmation suppression -->
    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-destructive" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription class="space-y-2">
            <p>
              Êtes-vous sûr de vouloir supprimer le type
              <strong class="text-foreground">{{ typeToDelete?.name }}</strong> ?
            </p>
            <p
              v-if="getAircraftCount(typeToDelete?.id ?? 0) > 0"
              class="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm font-medium"
            >
              <AlertTriangle class="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Ce type est utilisé par {{ getAircraftCount(typeToDelete?.id ?? 0) }} aéronef(s).
                Cette action est irréversible.
              </span>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            @click="handleDelete"
            class="bg-destructive text-white hover:bg-destructive/90 gap-2"
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
  Plus, Search, Pencil, Trash2, MoreVertical,
  Layers, Plane, TrendingUp, Building2,
  X, Eye, LayoutGrid, List, AlertTriangle,
  ChevronDown, Check
} from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import AircraftTypeFormDialog from '~/components/modules/aircraft-type/AircraftTypeFormDialog.vue'
import AircraftTypeViewDialog from '~/components/modules/aircraft-type/AircraftTypeViewDialog.vue'
import AircraftTypeCardSkeleton from '@/components/modules/aircraft-type/AircraftTypeCardSkeleton.vue'
import AircraftTypeRowSkeleton from '@/components/modules/aircraft-type/AircraftTypeRowSkeleton.vue'
import type { AircraftType } from '~/types/api'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'Types d\'aéronefs | VTA',
  meta: [{ name: 'description', content: 'Gestion des types d\'aéronefs.' }]
})

const { kgToTons } = useAircraftUtils()
const aircraftsStore = useAircraftsStore()
const aircraftTypesStore = useAircraftTypesStore()
const operatorsStore = useOperatorsStore()
const { success: showSuccess, error: showError } = useToast()
const { can } = usePermission()

// ─── State ────────────────────────────────────────────────────────────────────
const searchQuery    = ref('')
// Utilise "default" comme sentinelle pour éviter l'erreur shadcn "value cannot be empty string"
const sortBy         = ref('default')
const viewMode       = ref<'grid' | 'list'>('grid')
const dialogOpen     = ref(false)
const viewDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const selectedType   = ref<AircraftType | null>(null)
const typeToDelete   = ref<AircraftType | null>(null)
const isSearching    = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let searchTimeout: ReturnType<typeof setTimeout>

// ─── Computed ─────────────────────────────────────────────────────────────────
const loading      = computed(() => aircraftTypesStore.loading)
const hasMorePages = computed(() => aircraftTypesStore.hasMorePages)
const total        = computed(() => aircraftTypesStore.total)

const kpis = computed(() => {
  const types    = aircraftTypesStore.aircraftTypes
  const aircrafts = aircraftsStore.allAircrafts

  const typeCounts = types.map(t => ({
    id: t.id, name: t.name,
    count: aircrafts.filter(a => a.type?.id === t.id).length
  }))
  const mostUsedType      = [...typeCounts].sort((a, b) => b.count - a.count)[0]
  const activeAircrafts   = aircrafts.filter(a => a.in_activity).length
  const inactiveAircrafts = aircrafts.length - activeAircrafts
  const uniqueOperators   = new Set(aircrafts.map(a => a.operator?.id).filter(Boolean))

  return {
    totalTypes: total.value,
    totalAircrafts: aircrafts.length,
    activeAircrafts,
    inactiveAircrafts,
    mostUsedType,
    totalOperators: uniqueOperators.size
  }
})

/**
 * displayedTypes applique tri local sur la liste du store.
 * La recherche est gérée côté API (debouncedSearch).
 * Le tri utilise "default" comme valeur neutre (pas de tri supplémentaire).
 */
const displayedTypes = computed(() => {
  let types = [...aircraftTypesStore.aircraftTypes]

  // Filtre local de sécurité si une recherche est en cours
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    types = types.filter(t =>
      t.name.toLowerCase().includes(q) || t.sigle.toLowerCase().includes(q)
    )
  }

  switch (sortBy.value) {
    case 'name_asc':     types.sort((a, b) => a.name.localeCompare(b.name)); break
    case 'name_desc':    types.sort((a, b) => b.name.localeCompare(a.name)); break
    case 'sigle_asc':    types.sort((a, b) => a.sigle.localeCompare(b.sigle)); break
    case 'sigle_desc':   types.sort((a, b) => b.sigle.localeCompare(a.sigle)); break
    case 'created_desc': types.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()); break
    case 'created_asc':  types.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()); break
    case 'usage_desc':   types.sort((a, b) => getAircraftCount(b.id) - getAircraftCount(a.id)); break
    // "default" : pas de tri supplémentaire — ordre API
  }

  return types
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getAircraftCount = (typeId: number) =>
  aircraftsStore.allAircrafts.filter(a => a.type?.id === typeId).length

// ─── Fetch ────────────────────────────────────────────────────────────────────
const fetchAircraftTypes = async () => {
  aircraftTypesStore.resetPagination()
  const result = await aircraftTypesStore.fetchAircraftTypesPage(1)
  if (!result.success) showError(result.message || 'Erreur lors du chargement des types')
}

const loadMore = async () => {
  if (!hasMorePages.value || loading.value) return
  await aircraftTypesStore.loadNextPage()
}

// ─── Recherche ────────────────────────────────────────────────────────────────
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    const query = searchQuery.value.trim()

    if (!query) {
      isSearching.value = false
      await fetchAircraftTypes()
      return
    }

    isSearching.value = true
    try {
      const result = await aircraftTypesStore.findAircraftType(query)
      if (result.success && result.data) {
        aircraftTypesStore.aircraftTypes = Array.isArray(result.data) ? result.data : [result.data]
      } else {
        aircraftTypesStore.aircraftTypes = []
      }
    } catch {
      showError('Erreur lors de la recherche')
      aircraftTypesStore.aircraftTypes = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

const clearSearch = async () => {
  searchQuery.value = ''
  sortBy.value      = 'default'
  isSearching.value = false
  await fetchAircraftTypes()
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────
const openCreateDialog = () => { selectedType.value = null; dialogOpen.value = true }
const openEditDialog   = (type: AircraftType) => { selectedType.value = type; dialogOpen.value = true }
const openViewDialog   = (type: AircraftType) => { selectedType.value = type; viewDialogOpen.value = true }

const handleEditFromView = (type: AircraftType) => {
  selectedType.value    = type
  viewDialogOpen.value  = false
  dialogOpen.value      = true
}

const confirmDelete = (type: AircraftType) => {
  typeToDelete.value    = type
  viewDialogOpen.value  = false   // ferme le view dialog si ouvert
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
  } catch (err: any) {
    showError(err?.message || 'Impossible de supprimer ce type.')
  } finally {
    deleteDialogOpen.value = false
    typeToDelete.value     = null
  }
}

const handleSuccess = async () => {
  await fetchAircraftTypes()
  dialogOpen.value = false
}

// ─── Infinite scroll ──────────────────────────────────────────────────────────
const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMorePages.value && !loading.value && !searchQuery.value) loadMore()
    },
    { threshold: 0.5, rootMargin: '100px' }
  )
  observer.observe(loadMoreTrigger.value)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Restore view preference
  if (import.meta.client) {
    const saved = localStorage.getItem('aircraft-types-view-mode')
    if (saved === 'list' || saved === 'grid') viewMode.value = saved
  }
  try {
    await Promise.all([
      fetchAircraftTypes(),
      aircraftsStore.fetchAllAircrafts(),
      operatorsStore.fetchAllOperators()
    ])
  } catch {
    showError('Erreur lors du chargement des données initiales')
  }
  setTimeout(setupIntersectionObserver, 100)
})

onUnmounted(() => {
  observer?.disconnect()
  clearTimeout(searchTimeout)
})

watch(viewMode, (mode) => {
  if (import.meta.client) localStorage.setItem('aircraft-types-view-mode', mode)
})
</script>