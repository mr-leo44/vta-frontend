<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle class="text-base">Filtres</CardTitle>
        <Button variant="ghost" size="sm" @click="resetFilters" :disabled="!hasActiveFilters">
          <X class="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Pays -->
      <div class="space-y-2">
        <Label>Pays</Label>
        <Select v-model="localFilters.country">
          <SelectTrigger :class="{ 'bg-blue-50 border-blue-300': localFilters.country && localFilters.country !== '' }">
            <SelectValue placeholder="Sélectionner un pays..." />
          </SelectTrigger>
          <SelectContent class="max-h-[300px]">
            <SelectItem value="all">Tous les pays</SelectItem>
            <SelectItem v-for="country in availableCountries" :key="country" :value="country">
              {{ country }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="availableCountries.length === 0" class="text-xs text-muted-foreground mt-1">
          Aucun pays trouvé
        </p>
      </div>

      <!-- Type de vol -->
      <div class="space-y-2">
        <Label>Type de vol</Label>
        <Select v-model="localFilters.flight_type">
          <SelectTrigger :class="{ 'bg-blue-50 border-blue-300': localFilters.flight_type && localFilters.flight_type !== '' }">
            <SelectValue placeholder="Sélectionner un type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="regular">Vol régulier</SelectItem>
            <SelectItem value="non_regular">Vol non régulier (VNR)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Tri -->
      <div class="space-y-2">
        <Label>Trier par</Label>
        <Select v-model="localFilters.sort_by">
          <SelectTrigger :class="{ 'bg-blue-50 border-blue-300': localFilters.sort_by && localFilters.sort_by !== '' }">
            <SelectValue placeholder="Sélectionner un tri..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Nom (A à Z)</SelectItem>
            <SelectItem value="name_desc">Nom (Z à A)</SelectItem>
            <SelectItem value="created_desc">Plus récents d'abord</SelectItem>
            <SelectItem value="created_asc">Plus anciens d'abord</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Statut de la flotte -->
      <div class="space-y-2">
        <Label>Flotte</Label>
        <div class="flex items-center space-x-2">
          <Checkbox
            id="has_active_fleet"
            :checked="localFilters.has_active_fleet"
            @update:checked="localFilters.has_active_fleet = $event"
          />
          <label
            for="has_active_fleet"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Avec flotte active uniquement
          </label>
        </div>
      </div>

      <!-- Info sur les filtres actifs -->
      <div v-if="hasActiveFilters" class="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-xs font-semibold text-blue-900 mb-2">Filtres actifs:</p>
        <div class="flex flex-wrap gap-2">
          <span v-if="localFilters.country" class="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded-full">
            {{ localFilters.country }}
          </span>
          <span v-if="localFilters.flight_type" class="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded-full">
            {{ localFilters.flight_type === 'regular' ? 'Vol régulier' : 'VNR' }}
          </span>
          <span v-if="localFilters.has_active_fleet" class="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded-full">
            Flotte active
          </span>
        </div>
      </div>

      <!-- Appliquer -->
      <Button @click="applyFilters" class="w-full">
        <Filter class="h-4 w-4 mr-2" />
        Appliquer les filtres
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Filter } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export interface OperatorFilters {
  country: string
  flight_type: string
  sort_by: string
  has_active_fleet: boolean
}

const props = defineProps<{
  filters: OperatorFilters
  availableCountries: string[]
}>()

const emit = defineEmits<{
  'update:filters': [filters: OperatorFilters]
  apply: []
}>()

const localFilters = ref<OperatorFilters>({ ...props.filters })

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

const hasActiveFilters = computed(() => {
  return (
    localFilters.value.country !== '' ||
    localFilters.value.flight_type !== '' ||
    localFilters.value.sort_by !== '' ||
    localFilters.value.has_active_fleet
  )
})

const resetFilters = () => {
  localFilters.value = {
    country: '',
    flight_type: '',
    sort_by: '',
    has_active_fleet: false
  }
  applyFilters()
}

const applyFilters = () => {
  emit('update:filters', { ...localFilters.value })
  emit('apply')
}
</script>