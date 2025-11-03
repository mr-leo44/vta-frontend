<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Exploitants</h1>
        <p class="text-muted-foreground">Gérer les compagnies aériennes et exploitants</p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="mr-2 h-4 w-4" />
        Nouvel exploitant
      </Button>
    </div>

    <!-- Search Bar -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex gap-4">
          <div class="flex-1">
            <Input v-model="searchTerm" placeholder="Rechercher par nom ou code IATA..." @input="debouncedSearch" />
          </div>
          <Button variant="outline" @click="clearSearch">
            Effacer
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Operators List -->
    <div v-if="loading && operators.length === 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <OperatorSkeleton v-for="i in 6" :key="i" />
    </div>

    <div v-else-if="operators.length > 0" class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <OperatorCard v-for="operator in operators" :key="operator.id" :operator="operator" @view="openViewDialog"
          @edit="openEditDialog" @delete="confirmDelete" />
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-12">
      <p class="text-muted-foreground mb-4">Aucun exploitant trouvé</p>
      <Button @click="openCreateDialog">
        Créer le premier exploitant
      </Button>
    </div>

    <!-- All Dialogs -->
    <OperatorCreateDialog v-model:open="createDialogOpen" @created="fetchOperators" />
    <OperatorEditDialog v-model:open="editDialogOpen" :operator="operatorToEdit" @updated="fetchOperators" />
    <OperatorViewDialog v-model:open="viewDialogOpen" :operator="operatorToView" />

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'exploitant "{{ operatorToDelete?.name }}" ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction @click="deleteOperator" class="bg-destructive text-white hover:bg-destructive/90">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import type { Operator } from '~/types/api'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '~/components/ui/alert-dialog'
import { useOperatorsStore } from '~/stores/operators'
import { useToast } from '~/composables/useToast'
import OperatorCard from '~/components/modules/operator/OperatorCard.vue'
import OperatorSkeleton from '~/components/modules/operator/OperatorSkeleton.vue'
import OperatorCreateDialog from '~/components/modules/operator/OperatorCreateDialog.vue'
import OperatorEditDialog from '~/components/modules/operator/OperatorEditDialog.vue'
import OperatorViewDialog from '~/components/modules/operator/OperatorViewDialog.vue'


definePageMeta({
  middleware: 'auth'
})

const operatorsStore = useOperatorsStore()
const { success: showSuccess, error: showError } = useToast()

const operators = ref<Operator[]>([])
const loading = ref(false)
const searchTerm = ref('')
const deleteDialogOpen = ref(false)
const operatorToDelete = ref<Operator | null>(null)

const createDialogOpen = ref(false)
const editDialogOpen = ref(false)
const viewDialogOpen = ref(false)

const operatorToEdit = ref<Operator | null>(null)
const operatorToView = ref<Operator | null>(null)

let searchTimeout: NodeJS.Timeout

// Fetch initial operators
const fetchOperators = async () => {
  loading.value = true
  const result = await operatorsStore.fetchOperators()

  if (result.success) {
    operators.value = operatorsStore.operators
  } else {
    showError(result.message || 'Erreur lors du chargement des exploitants')
  }

  loading.value = false
}

// Search with debounce
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (searchTerm.value.trim()) {
      loading.value = true
      const result = await operatorsStore.searchOperator(searchTerm.value)

      if (result.success && result.data) {
        operators.value = [result.data]
      } else {
        operators.value = []
        if (result.message) {
          showError(result.message)
        }
      }

      loading.value = false
    } else {
      await fetchOperators()
    }
  }, 300)
}

const clearSearch = () => {
  searchTerm.value = ''
  fetchOperators()
}

const openViewDialog = (operator: Operator) => {
  operatorToView.value = operator
  viewDialogOpen.value = true
}

const openCreateDialog = () => {
  createDialogOpen.value = true
}

const openEditDialog = (operator: Operator) => {
  operatorToEdit.value = operator
  editDialogOpen.value = true
}

const confirmDelete = (operator: Operator) => {
  operatorToDelete.value = operator
  deleteDialogOpen.value = true
}

const deleteOperator = async () => {
  if (!operatorToDelete.value) return

  const result = await operatorsStore.deleteOperator(operatorToDelete.value.id)

  if (result.success) {
    operators.value = operators.value.filter(o => o.id !== operatorToDelete.value!.id)
    showSuccess('Exploitant supprimé avec succès')
    deleteDialogOpen.value = false
    operatorToDelete.value = null
  } else {
    showError(result.message || 'Erreur lors de la suppression')
  }
}

// Initialize on mount
onMounted(() => {
  fetchOperators()
})
</script>