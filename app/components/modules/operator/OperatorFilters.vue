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
          <SelectTrigger>
            <SelectValue placeholder="Tous les pays" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les pays</SelectItem>
            <SelectItem v-for="country in availableCountries" :key="country" :value="country">
              {{ country }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Type de vol -->
      <div class="space-y-2">
        <Label>Type de vol</Label>
        <Select v-model="localFilters.flight_type">
          <SelectTrigger>
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="regular">Vol régulier</SelectItem>
            <SelectItem value="non_regular">Vol non régulier (VNR)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Nature du vol -->
      <div class="space-y-2">
        <Label>Nature du vol</Label>
        <Select v-model="localFilters.flight_nature">
          <SelectTrigger>
            <SelectValue placeholder="Toutes les natures" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les natures</SelectItem>
            <SelectItem value="commercial">Vol commercial</SelectItem>
            <SelectItem value="non_commercial">Vol non commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Tri -->
      <div class="space-y-2">
        <Label>Trier par</Label>
        <Select v-model="localFilters.sort_by">
          <SelectTrigger>
            <SelectValue placeholder="Ordre par défaut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Nom (A-Z)</SelectItem>
            <SelectItem value="name_desc">Nom (Z-A)</SelectItem>
            <SelectItem value="created_desc">Plus récents</SelectItem>
            <SelectItem value="created_asc">Plus anciens</SelectItem>
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
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Avec flotte active uniquement
          </label>
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
  flight_nature: string
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
    localFilters.value.flight_nature !== '' ||
    localFilters.value.sort_by !== '' ||
    localFilters.value.has_active_fleet
  )
})

const resetFilters = () => {
  localFilters.value = {
    country: '',
    flight_type: '',
    flight_nature: '',
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