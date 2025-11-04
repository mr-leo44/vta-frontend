<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Exploitants</h1>
        <p class="text-muted-foreground">
          {{ total ?? 0 }} exploitant{{ total > 1 ? 's' : '' }} enregistré{{ total > 1 ? 's' : '' }}
        </p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="mr-2 h-4 w-4" />
        Nouvel exploitant
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
              placeholder="Rechercher par nom, code IATA ou OACI..."
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
      <div
        v-if="hasMorePages && !loading"
        ref="loadMoreTrigger"
        class="flex justify-center py-8"
      >
        <Button variant="outline" @click="loadMore" :disabled="loading">
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
      <div v-if="!hasMorePages && operators.length > 0" class="text-center py-4 text-muted-foreground text-sm">
        Tous les exploitants ont été chargés
      </div>
    </div>

    <!-- Empty State -->
    <Card v-else>
      <CardContent class="flex flex-col items-center justify-center py-12">
        <Building2 class="h-12 w-12 text-muted-foreground mb-4" />
        <p class="text-lg font-medium mb-2">
          {{ searchTerm ? 'Aucun résultat trouvé' : 'Aucun exploitant enregistré' }}
        </p>
        <p class="text-muted-foreground mb-4">
          {{ searchTerm ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par créer votre premier exploitant' }}
        </p>
        <Button v-if="!searchTerm" @click="openCreateDialog">
          <Plus class="mr-2 h-4 w-4" />
          Créer le premier exploitant
        </Button>
        <Button v-else variant="outline" @click="clearSearch">
          Effacer la recherche
        </Button>
      </CardContent>
    </Card>

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
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'exploitant <strong>"{{ operatorToDelete?.name }}"</strong> ?
            Cette action est irréversible et supprimera également toutes les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            @click="deleteOperator"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Plus,
  Search,
  X,
  LayoutGrid,
  List,
  Building2
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

// Dialog handlers
const openViewDialog = async (operator: Operator) => {
  // Recharger l'opérateur avec ses relations (flights, aircrafts)
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
  // Recharger la liste après création/modification
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

// Save view mode preference to localStorage
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