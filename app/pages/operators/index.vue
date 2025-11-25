<template>
  <div class="space-y-6">
    <!-- Header avec gradient moderne -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <Building2 class="h-7 w-7" />
            </div>
            <div>
              <h1 class="text-4xl font-bold">Exploitants</h1>
              <p class="text-white/90 text-sm mt-1">
                {{ total ?? 0 }} exploitant{{ total > 1 ? 's' : '' }} enregistré{{ total > 1 ? 's' : '' }}
              </p>
            </div>
          </div>
        </div>
        <Button 
          @click="openCreateDialog"
          size="lg"
          class="bg-white text-blue-600 hover:bg-white/90 shadow-xl gap-2"
        >
          <Plus class="h-5 w-5" />
          Nouvel exploitant
        </Button>
      </div>
      <!-- Decorative circles -->
      <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      <div class="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
    </div>

    <!-- Search and View Toggle -->
    <Card class="border-2 shadow-lg">
      <CardContent class="pt-6">
        <div class="flex items-center gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              v-model="searchTerm" 
              placeholder="Rechercher par nom, code IATA ou OACI..." 
              class="pl-10 h-12 border-2"
              @input="debouncedSearch" 
            />
          </div>
          <Button 
            variant="outline" 
            @click="clearSearch" 
            :disabled="!searchTerm"
            class="h-12 px-4"
          >
            <X class="h-4 w-4" />
          </Button>

          <!-- View Toggle -->
          <div class="flex items-center border-2 rounded-lg overflow-hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              :class="{ 'bg-primary text-primary-foreground': viewMode === 'cards' }" 
              @click="viewMode = 'cards'"
              class="rounded-none h-12 px-4"
            >
              <LayoutGrid class="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              :class="{ 'bg-primary text-primary-foreground': viewMode === 'table' }" 
              @click="viewMode = 'table'"
              class="rounded-none h-12 px-4"
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
        <OperatorFilters 
          :filters="filters" 
          :available-countries="availableCountries" 
          @update:filters="filters = $event"
          @apply="applyFilters" 
        />
      </div>

      <!-- Main Content -->
      <div class="space-y-4">
        <!-- Loading Initial -->
        <div v-if="loading && operators.length === 0">
          <OperatorTableSkeleton v-if="viewMode === 'table'" :count="6" />
          <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <OperatorSkeleton v-for="i in 6" :key="i" />
          </div>
        </div>

        <!-- Operators List -->
        <div v-else-if="operators.length > 0" class="space-y-4">
          <!-- Cards View -->
          <div v-if="viewMode === 'cards'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <OperatorCard 
              v-for="operator in operators" 
              :key="operator.id" 
              :operator="operator" 
              @view="openViewDialog"
              @edit="openEditDialog" 
              @delete="confirmDelete" 
            />
          </div>

          <!-- Table View -->
          <div v-else class="space-y-3">
            <OperatorTableRow 
              v-for="operator in operators" 
              :key="operator.id" 
              :operator="operator"
              @view="openViewDialog"
              @edit="openEditDialog" 
              @delete="confirmDelete" 
            />
          </div>

          <!-- Load More Trigger -->
          <div v-if="hasMorePages && !loading" ref="loadMoreTrigger" class="flex justify-center py-8">
            <Button variant="outline" @click="loadMore" :disabled="loading" size="lg" class="gap-2">
              <ChevronDown class="h-4 w-4" />
              Charger plus d'exploitants
            </Button>
          </div>

          <!-- Loading More -->
          <div v-if="loading && operators.length > 0" class="py-4">
            <OperatorTableSkeleton v-if="viewMode === 'table'" :count="3" />
            <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <OperatorSkeleton v-for="i in 3" :key="i" />
            </div>
          </div>

          <!-- End of list -->
          <div v-if="!hasMorePages && operators.length > 0" class="text-center py-8">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <Check class="h-4 w-4 text-green-600" />
              <span class="text-sm font-medium">Tous les exploitants ont été chargés</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <Card v-else class="border-2 border-dashed">
          <CardContent class="flex flex-col items-center justify-center py-16">
            <div class="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center mb-6">
              <Building2 class="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <p class="text-xl font-semibold mb-2">
              {{ searchTerm ? 'Aucun résultat trouvé' : 'Aucun exploitant enregistré' }}
            </p>
            <p class="text-muted-foreground mb-6 text-center max-w-md">
              {{ searchTerm ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par créer votre premier exploitant' }}
            </p>
            <Button v-if="!searchTerm" @click="openCreateDialog" size="lg" class="gap-2">
              <Plus class="h-4 w-4" />
              Créer le premier exploitant
            </Button>
            <Button v-else variant="outline" @click="clearSearch" size="lg" class="gap-2">
              <X class="h-4 w-4" />
              Effacer la recherche
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- View Dialog -->
    <OperatorViewDialog 
      v-model:open="viewDialogOpen" 
      :operator="selectedOperator" 
      @edit="openEditDialog" 
    />

    <!-- Form Dialog (Create/Edit) -->
    <OperatorFormDialog 
      v-model:open="formDialogOpen" 
      :operator="operatorToEdit" 
      @success="handleFormSuccess" 
    />

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-destructive" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'exploitant <strong class="text-foreground">"{{ operatorToDelete?.name }}"</strong> ?
            Cette action est irréversible et supprimera également toutes les données associées.
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
  Plus,
  Search,
  X,
  LayoutGrid,
  List,
  Building2,
  ChevronDown,
  Check,
  Trash2,
  AlertTriangle
} from 'lucide-vue-next'
import type { Operator } from '~/types/api'
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
import OperatorCard from '~/components/modules/operator/OperatorCard.vue'
import OperatorTableRow from '~/components/modules/operator/OperatorTableRow.vue'
import OperatorSkeleton from '~/components/modules/operator/OperatorSkeleton.vue'
import OperatorTableSkeleton from '~/components/modules/operator/OperatorTableSkeleton.vue'
import OperatorViewDialog from '~/components/modules/operator/OperatorViewDialog.vue'
import OperatorFormDialog from '@/components/modules/operator/OperatorFormDialog.vue'
import OperatorFilters, { type OperatorFilters as FilterType } from '~/components/modules/operator/OperatorFilters.vue'

definePageMeta({
  middleware: 'auth'
})

const operatorsStore = useOperatorsStore()
const { success: showSuccess, error: showError } = useToast()

// State
const operators = computed(() => operatorsStore.operators)
const loading = computed(() => operatorsStore.loading)
const hasMorePages = computed(() => operatorsStore.hasMorePages)
const total = computed(() => operatorsStore.total)

const searchTerm = ref('')
const viewMode = ref<'cards' | 'table'>('cards')
const isSearching = ref(false)

// Dialog states
const viewDialogOpen = ref(false)
const formDialogOpen = ref(false)
const deleteDialogOpen = ref(false)

// Selected items
const selectedOperator = ref<Operator | null>(null)
const operatorToEdit = ref<Operator | null>(null)
const operatorToDelete = ref<Operator | null>(null)

// Intersection Observer
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let searchTimeout: NodeJS.Timeout

// Fetch initial operators
const fetchOperators = async () => {
  operatorsStore.resetPagination()
  const result = await operatorsStore.fetchOperators(1)

  if (!result.success) {
    showError(result.message || 'Erreur lors du chargement des exploitants')
  }
}

// Load more for infinite scroll
const loadMore = async () => {
  if (!hasMorePages.value || loading.value) return
  await operatorsStore.loadNextPage()
}

// Search with debounce
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (searchTerm.value.trim()) {
      isSearching.value = true
      operatorsStore.resetPagination()

      const result = await operatorsStore.searchOperators(searchTerm.value)

      if (result.success && result.data) {
        operatorsStore.operators = result.data
        operatorsStore.total = result.data.length
      } else {
        operatorsStore.operators = []
        operatorsStore.total = 0
        if (result.message) {
          showError(result.message)
        }
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
  fetchOperators()
}

// State pour les filtres
const filters = ref<FilterType>({
  country: '',
  flight_type: '',
  flight_nature: '',
  sort_by: '',
  has_active_fleet: false
})

// Liste des pays disponibles
const availableCountries = computed(() => {
  const countries = operators.value
    .map(o => o.country)
    .filter((c): c is string => c !== null && c !== '')
  return [...new Set(countries)].sort()
})

// Fonction pour appliquer les filtres
const applyFilters = () => {
  let filtered = [...operatorsStore.operators]

  if (filters.value.country && filters.value.country !== 'all') {
    filtered = filtered.filter(o => o.country === filters.value.country)
  }

  if (filters.value.flight_type && filters.value.flight_type !== 'all') {
    filtered = filtered.filter(o => o.flight_type.value === filters.value.flight_type)
  }

  if (filters.value.flight_nature && filters.value.flight_nature !== 'all') {
    filtered = filtered.filter(o => o.flight_nature.value === filters.value.flight_nature)
  }

  if (filters.value.has_active_fleet) {
    filtered = filtered.filter(o =>
      o.aircrafts && o.aircrafts.some(a => a.in_activity)
    )
  }

  switch (filters.value.sort_by) {
    case 'name_asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name_desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name))
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
  }

  operatorsStore.operators = filtered
}

// Dialog handlers
const openViewDialog = async (operator: Operator) => {
  const result = await operatorsStore.fetchOperator(operator.id)
  if (result.success && result.data) {
    selectedOperator.value = result.data
    viewDialogOpen.value = true
  }
}

const openCreateDialog = () => {
  operatorToEdit.value = null
  formDialogOpen.value = true
}

const openEditDialog = (operator: Operator) => {
  operatorToEdit.value = operator
  viewDialogOpen.value = false
  formDialogOpen.value = true
}

const confirmDelete = (operator: Operator) => {
  operatorToDelete.value = operator
  deleteDialogOpen.value = true
}

const deleteOperator = async () => {
  if (!operatorToDelete.value) return

  const result = await operatorsStore.deleteOperator(operatorToDelete.value.id)

  if (result.success) {
    showSuccess('Exploitant supprimé avec succès')
    deleteDialogOpen.value = false
    operatorToDelete.value = null
  } else {
    showError(result.message || 'Erreur lors de la suppression')
  }
}

const handleFormSuccess = async () => {
  if (searchTerm.value) {
    clearSearch()
  } else {
    await fetchOperators()
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
  await fetchOperators()

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
    localStorage.setItem('operators-view-mode', mode)
  }
})

// Restore view mode preference
onMounted(() => {
  if (import.meta.client) {
    const savedMode = localStorage.getItem('operators-view-mode')
    if (savedMode === 'table' || savedMode === 'cards') {
      viewMode.value = savedMode
    }
  }
})
</script>