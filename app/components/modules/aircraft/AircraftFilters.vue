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
      <!-- Opérateur -->
      <div class="space-y-2">
        <Label>Exploitant</Label>
        <Select v-model="localFilters.operator_id">
          <SelectTrigger>
            <SelectValue placeholder="Tous les exploitants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les exploitants</SelectItem>
            <SelectItem v-for="operator in availableOperators" :key="operator.id" :value="operator.id.toString()">
              {{ operator.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Type d'aéronef -->
      <div class="space-y-2">
        <Label>Type d'aéronef</Label>
        <Select v-model="localFilters.aircraft_type_id">
          <SelectTrigger>
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem v-for="type in availableTypes" :key="type.id" :value="type.id.toString()">
              {{ type.name }} ({{ type.sigle }})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Statut d'activité -->
      <div class="space-y-2">
        <Label>Statut</Label>
        <Select v-model="localFilters.in_activity">
          <SelectTrigger>
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="true">En activité</SelectItem>
            <SelectItem value="false">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- PMAD Range -->
      <div class="space-y-2">
        <Label>PMAD (kg)</Label>
        <div class="grid grid-cols-2 gap-2">
          <Input
            v-model.number="localFilters.pmad_min"
            type="number"
            placeholder="Min"
            class="text-sm"
          />
          <Input
            v-model.number="localFilters.pmad_max"
            type="number"
            placeholder="Max"
            class="text-sm"
          />
        </div>
      </div>

      <!-- Tri -->
      <div class="space-y-2">
        <Label>Trier par</Label>
        <Select v-model="localFilters.sort_by">
          <SelectTrigger>
            <SelectValue placeholder="Ordre par défaut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immatriculation_asc">Immatriculation (A-Z)</SelectItem>
            <SelectItem value="immatriculation_desc">Immatriculation (Z-A)</SelectItem>
            <SelectItem value="created_desc">Plus récents</SelectItem>
            <SelectItem value="created_asc">Plus anciens</SelectItem>
            <SelectItem value="pmad_desc">PMAD (décroissant)</SelectItem>
            <SelectItem value="pmad_asc">PMAD (croissant)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Options supplémentaires -->
      <div class="space-y-2">
        <Label>Options</Label>
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="has_flights"
              :checked="localFilters.has_flights"
              @update:checked="localFilters.has_flights = $event"
            />
            <label
              for="has_flights"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Avec vols uniquement
            </label>
          </div>
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { AircraftType, Operator } from '~/types/api'

export interface AircraftFilters {
  operator_id: string
  aircraft_type_id: string
  in_activity: string
  pmad_min: number | null
  pmad_max: number | null
  sort_by: string
  has_flights: boolean
}

const props = defineProps<{
  filters: AircraftFilters
  availableOperators: Operator[]
  availableTypes: AircraftType[]
}>()

const emit = defineEmits<{
  'update:filters': [filters: AircraftFilters]
  apply: []
}>()

const localFilters = ref<AircraftFilters>({ ...props.filters })

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

const hasActiveFilters = computed(() => {
  return (
    localFilters.value.operator_id !== '' ||
    localFilters.value.aircraft_type_id !== '' ||
    localFilters.value.in_activity !== '' ||
    localFilters.value.pmad_min !== null ||
    localFilters.value.pmad_max !== null ||
    localFilters.value.sort_by !== '' ||
    localFilters.value.has_flights
  )
})

const resetFilters = () => {
  localFilters.value = {
    operator_id: '',
    aircraft_type_id: '',
    in_activity: '',
    pmad_min: null,
    pmad_max: null,
    sort_by: '',
    has_flights: false
  }
  applyFilters()
}

const applyFilters = () => {
  emit('update:filters', { ...localFilters.value })
  emit('apply')
}
</script>