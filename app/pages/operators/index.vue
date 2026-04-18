<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Exploitants</h1>
        <p class="text-sm text-muted-foreground mt-0.5">
          {{ total ?? 0 }} exploitant{{ (total ?? 0) > 1 ? 's' : '' }} enregistré{{ (total ?? 0) > 1 ? 's' : '' }}
        </p>
      </div>
      <Button
        v-if="can('operator.create')"
        @click="openCreateDialog"
        size="sm"
        class="gap-1.5"
      >
        <Plus class="h-4 w-4" />
        Nouvel exploitant
      </Button>
    </div>

    <!-- Barre de recherche + toggle vue -->
    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          v-model="searchTerm"
          placeholder="Rechercher par nom, code IATA ou OACI..."
          class="pl-9 h-9 text-sm"
          @input="debouncedSearch"
        />
      </div>
      <Button
        v-if="searchTerm"
        variant="ghost"
        size="icon"
        class="h-9 w-9 shrink-0"
        @click="clearSearch"
      >
        <X class="h-4 w-4" />
      </Button>

      <!-- Toggle vue cards / table -->
      <div class="flex items-center bg-muted rounded-md p-0.5 shrink-0">
        <button
          @click="viewMode = 'cards'"
          class="h-7 w-7 flex items-center justify-center rounded transition-all"
          :class="viewMode === 'cards'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'"
        >
          <LayoutGrid class="h-3.5 w-3.5" />
        </button>
        <button
          @click="viewMode = 'table'"
          class="h-7 w-7 flex items-center justify-center rounded transition-all"
          :class="viewMode === 'table'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'"
        >
          <List class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <!-- Layout filtres + contenu -->
    <div class="grid gap-5 md:grid-cols-[240px_1fr]">

      <!-- Sidebar filtres (desktop) -->
      <div class="hidden md:block">
        <OperatorFilters
          :filters="filters"
          :available-countries="availableCountries"
          @update:filters="filters = $event"
          @apply="applyFilters"
        />
      </div>

      <!-- Contenu principal -->
      <div class="space-y-3 min-w-0">

        <!-- Skeleton chargement initial -->
        <template v-if="loading && operators.length === 0">
          <OperatorTableSkeleton v-if="viewMode === 'table'" :count="6" />
          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <OperatorSkeleton v-for="i in 6" :key="i" />
          </div>
        </template>

        <!-- Liste opérateurs -->
        <template v-else-if="operators.length > 0">

          <!-- Vue cartes -->
          <div v-if="viewMode === 'cards'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <OperatorCard
              v-for="operator in operators"
              :key="operator.id"
              :operator="operator"
              :can-edit="can('operator.update')"
              :can-delete="can('operator.delete')"
              @view="openViewDialog"
              @edit="openEditDialog"
              @delete="confirmDelete"
            />
          </div>

          <!-- Vue table -->
          <div v-else class="space-y-1.5">
            <OperatorTableRow
              v-for="operator in operators"
              :key="operator.id"
              :operator="operator"
              :can-edit="can('operator.update')"
              :can-delete="can('operator.delete')"
              @view="openViewDialog"
              @edit="openEditDialog"
              @delete="confirmDelete"
            />
          </div>

          <!-- Charger plus (infinite scroll trigger) -->
          <div v-if="hasMorePages && !loading" ref="loadMoreTrigger" class="flex justify-center pt-4 pb-2">
            <Button variant="outline" size="sm" @click="loadMore" :disabled="loading" class="gap-1.5 text-xs">
              <ChevronDown class="h-3.5 w-3.5" />
              Charger plus
            </Button>
          </div>

          <!-- Skeleton chargement suivant -->
          <template v-if="loading && operators.length > 0">
            <OperatorTableSkeleton v-if="viewMode === 'table'" :count="3" />
            <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <OperatorSkeleton v-for="i in 3" :key="i" />
            </div>
          </template>

          <!-- Fin de liste -->
          <div v-if="!hasMorePages && operators.length > 0" class="flex justify-center pt-4 pb-2">
            <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check class="h-3.5 w-3.5 text-green-500" />
              Tous les exploitants sont affichés
            </span>
          </div>
        </template>

        <!-- État vide -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <div class="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mb-4">
            <Building2 class="h-7 w-7 text-muted-foreground" />
          </div>
          <p class="font-medium text-sm mb-1">
            {{ searchTerm ? 'Aucun résultat trouvé' : 'Aucun exploitant enregistré' }}
          </p>
          <p class="text-xs text-muted-foreground mb-5 max-w-xs">
            {{ searchTerm
              ? 'Essayez avec d\'autres termes de recherche ou ajustez les filtres.'
              : 'Commencez par créer votre premier exploitant.' }}
          </p>
          <Button v-if="!searchTerm && can('operator.create')" @click="openCreateDialog" size="sm" class="gap-1.5">
            <Plus class="h-4 w-4" />
            Créer le premier exploitant
          </Button>
          <Button v-else variant="outline" size="sm" @click="clearSearch" class="gap-1.5">
            <X class="h-4 w-4" />
            Effacer la recherche
          </Button>
        </div>

      </div>
    </div>

    <!-- Dialog vue détail -->
    <OperatorViewDialog
      v-model:open="viewDialogOpen"
      :operator="selectedOperator"
      @edit="openEditDialog"
    />

    <!-- Dialog formulaire (création / édition) -->
    <OperatorFormDialog
      v-model:open="formDialogOpen"
      :operator="operatorToEdit"
      @success="handleFormSuccess"
    />

    <!-- Dialog confirmation suppression -->
    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-destructive" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'exploitant
            <strong class="text-foreground">"{{ operatorToDelete?.name }}"</strong> ?
            Cette action est irréversible et supprimera toutes les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            @click="deleteOperator"
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
  Plus, Search, X, LayoutGrid, List, Building2,
  ChevronDown, Check, Trash2, AlertTriangle
} from 'lucide-vue-next'
import type { Operator } from '~/types/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import OperatorCard from '~/components/modules/operator/OperatorCard.vue'
import OperatorTableRow from '~/components/modules/operator/OperatorTableRow.vue'
import OperatorSkeleton from '~/components/modules/operator/OperatorSkeleton.vue'
import OperatorTableSkeleton from '~/components/modules/operator/OperatorTableSkeleton.vue'
import OperatorViewDialog from '~/components/modules/operator/OperatorViewDialog.vue'
import OperatorFormDialog from '@/components/modules/operator/OperatorFormDialog.vue'
import OperatorFilters, { type OperatorFilters as FilterType } from '~/components/modules/operator/OperatorFilters.vue'

definePageMeta({ middleware: 'auth' })

const operatorsStore = useOperatorsStore()
const { success: showSuccess, error: showError } = useToast()
const { can } = usePermission()

// State store
const operators    = computed(() => operatorsStore.operators)
const loading      = computed(() => operatorsStore.loading)
const hasMorePages = computed(() => operatorsStore.hasMorePages)
const total        = computed(() => operatorsStore.total)

const searchTerm = ref('')
const viewMode   = ref<'cards' | 'table'>('cards')
const isSearching = ref(false)

// Dialogs
const viewDialogOpen   = ref(false)
const formDialogOpen   = ref(false)
const deleteDialogOpen = ref(false)

const selectedOperator  = ref<Operator | null>(null)
const operatorToEdit    = ref<Operator | null>(null)
const operatorToDelete  = ref<Operator | null>(null)

// Infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let searchTimeout: ReturnType<typeof setTimeout>

// Filtres
const filters = ref<FilterType>({
  country: '',
  flight_type: '',
  sort_by: '',
  has_active_fleet: false
})

// Stock complet pour les filtres (indépendant de la pagination)
const allOperatorsBackup = ref<Operator[]>([])

// Pays disponibles — toujours basés sur la liste complète
const availableCountries = computed(() => {
  const source = allOperatorsBackup.value.length > 0
    ? allOperatorsBackup.value
    : operatorsStore.operators
  const countries = source.map(o => o.country).filter((c): c is string => Boolean(c))
  return [...new Set(countries)].sort()
})

// ───── Fetch ─────────────────────────────────────────────────────────────────

const fetchOperators = async () => {
  operatorsStore.resetPagination()
  const result = await operatorsStore.fetchOperators(1)
  if (!result.success) showError(result.message || 'Erreur lors du chargement des exploitants')
}

const fetchAllOperators = async () => {
  const result = await operatorsStore.fetchAllOperators()
  if (result.success && result.data) allOperatorsBackup.value = [...result.data]
}

const loadMore = async () => {
  if (!hasMorePages.value || loading.value) return
  await operatorsStore.loadNextPage()
}

// ───── Recherche ─────────────────────────────────────────────────────────────

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (searchTerm.value.trim()) {
      isSearching.value = true
      operatorsStore.resetPagination()
      const result = await operatorsStore.searchOperators(searchTerm.value)
      if (result.success && result.data) {
        allOperatorsBackup.value = [...result.data]
        operatorsStore.operators = result.data
        operatorsStore.total     = result.data.length
      } else {
        operatorsStore.operators = []
        operatorsStore.total     = 0
        if (result.message) showError(result.message)
      }
      isSearching.value = false
    } else {
      isSearching.value = false
      await fetchOperators()
    }
  }, 300)
}

const clearSearch = () => {
  searchTerm.value = ''
  filters.value = { country: '', flight_type: '', sort_by: '', has_active_fleet: false }
  fetchOperators()
}

// ───── Filtres ────────────────────────────────────────────────────────────────

const applyFilters = () => {
  let filtered = allOperatorsBackup.value.length > 0
    ? [...allOperatorsBackup.value]
    : [...operatorsStore.operators]

  if (filters.value.country) {
    filtered = filtered.filter(o => o.country === filters.value.country)
  }
  if (filters.value.flight_type) {
    filtered = filtered.filter(o => o.flight_type?.value === filters.value.flight_type)
  }
  if (filters.value.has_active_fleet) {
    filtered = filtered.filter(o => o.aircrafts?.some(a => a.in_activity))
  }

  switch (filters.value.sort_by) {
    case 'name_asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name)); break
    case 'name_desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name)); break
    case 'created_desc':
      filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()); break
    case 'created_asc':
      filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()); break
  }

  operatorsStore.operators = filtered
}

// ───── Dialogs ────────────────────────────────────────────────────────────────

const openViewDialog = async (operator: Operator) => {
  const result = await operatorsStore.fetchOperator(operator.id)
  if (result.success && result.data) {
    selectedOperator.value = result.data
    viewDialogOpen.value   = true
  }
}

const openCreateDialog = () => {
  operatorToEdit.value = null
  formDialogOpen.value = true
}

const openEditDialog = (operator: Operator) => {
  operatorToEdit.value  = operator
  viewDialogOpen.value  = false
  formDialogOpen.value  = true
}

const confirmDelete = (operator: Operator) => {
  operatorToDelete.value  = operator
  deleteDialogOpen.value  = true
}

const deleteOperator = async () => {
  if (!operatorToDelete.value) return
  const result = await operatorsStore.deleteOperator(operatorToDelete.value.id)
  if (result.success) {
    showSuccess('Exploitant supprimé avec succès')
    deleteDialogOpen.value  = false
    operatorToDelete.value  = null
  } else {
    showError(result.message || 'Erreur lors de la suppression')
  }
}

const handleFormSuccess = async () => {
  searchTerm.value ? clearSearch() : await fetchOperators()
}

// ───── Infinite scroll ────────────────────────────────────────────────────────

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

// ───── Lifecycle ─────────────────────────────────────────────────────────────

onMounted(async () => {
  // Restaure la préférence de vue
  if (import.meta.client) {
    const saved = localStorage.getItem('operators-view-mode')
    if (saved === 'table' || saved === 'cards') viewMode.value = saved
  }
  await fetchAllOperators()
  await fetchOperators()
  setTimeout(setupIntersectionObserver, 100)
})

onUnmounted(() => {
  observer?.disconnect()
  clearTimeout(searchTimeout)
})

watch(viewMode, (mode) => {
  if (import.meta.client) localStorage.setItem('operators-view-mode', mode)
})
</script>