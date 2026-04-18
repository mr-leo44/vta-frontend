<template>
  <div class="bg-card border border-border rounded-xl overflow-hidden">
    <!-- En-tête -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border">
      <div class="flex items-center gap-2">
        <SlidersHorizontal class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm font-semibold">Filtres</span>
        <span
          v-if="activeFiltersCount > 0"
          class="inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full"
        >
          {{ activeFiltersCount }}
        </span>
      </div>
      <button
        v-if="hasActiveFilters"
        @click="resetFilters"
        class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
      >
        <RotateCcw class="h-3 w-3" />
        Réinitialiser
      </button>
    </div>

    <div class="p-4 space-y-5">

      <!-- Exploitant -->
      <div class="space-y-1.5">
        <Label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exploitant</Label>
        <Select
          :key="`op-${selectKey}`"
          :model-value="localFilters.operator_id || 'all'"
          @update:model-value="onOperatorChange"
        >
          <SelectTrigger
            class="h-9 text-sm"
            :class="localFilters.operator_id ? 'border-primary/50 bg-primary/5' : ''"
          >
            <SelectValue placeholder="Tous les exploitants" />
          </SelectTrigger>
          <SelectContent class="max-h-[260px]">
            <SelectItem value="all">Tous les exploitants</SelectItem>
            <SelectItem
              v-for="operator in availableOperators"
              :key="operator.id"
              :value="operator.id.toString()"
            >
              {{ operator.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Type d'aéronef -->
      <div class="space-y-1.5">
        <Label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type d'aéronef</Label>
        <Select
          :key="`type-${selectKey}`"
          :model-value="localFilters.aircraft_type_id || 'all'"
          @update:model-value="onTypeChange"
        >
          <SelectTrigger
            class="h-9 text-sm"
            :class="localFilters.aircraft_type_id ? 'border-primary/50 bg-primary/5' : ''"
          >
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent class="max-h-[260px]">
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem
              v-for="type in availableTypes"
              :key="type.id"
              :value="type.id.toString()"
            >
              {{ type.name }} ({{ type.sigle }})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Statut -->
      <div class="space-y-1.5">
        <Label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Statut</Label>
        <Select
          :key="`status-${selectKey}`"
          :model-value="localFilters.in_activity || 'all'"
          @update:model-value="onActivityChange"
        >
          <SelectTrigger
            class="h-9 text-sm"
            :class="localFilters.in_activity ? 'border-primary/50 bg-primary/5' : ''"
          >
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="true">En activité</SelectItem>
            <SelectItem value="false">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- PMAD preset select -->
      <div class="space-y-1.5">
        <Label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">PMAD</Label>
        <Select :model-value="pmadPreset" @update:model-value="onPmadPresetChange">
          <SelectTrigger class="h-9 text-sm">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="lt50">Moins de 50T</SelectItem>
            <SelectItem value="gte50">50T et plus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Tri -->
      <div class="space-y-1.5">
        <Label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Trier par</Label>
        <Select
          :key="`sort-${selectKey}`"
          :model-value="localFilters.sort_by || 'default'"
          @update:model-value="onSortChange"
        >
          <SelectTrigger
            class="h-9 text-sm"
            :class="localFilters.sort_by ? 'border-primary/50 bg-primary/5' : ''"
          >
            <SelectValue placeholder="Par défaut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Par défaut</SelectItem>
            <SelectItem value="immatriculation_asc">Immatriculation (A → Z)</SelectItem>
            <SelectItem value="immatriculation_desc">Immatriculation (Z → A)</SelectItem>
            <SelectItem value="created_desc">Plus récents d'abord</SelectItem>
            <SelectItem value="created_asc">Plus anciens d'abord</SelectItem>
            <SelectItem value="pmad_desc">PMAD (décroissant)</SelectItem>
            <SelectItem value="pmad_asc">PMAD (croissant)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Avec vols -->
      <div class="flex items-center gap-3 py-1">
        <Checkbox
          id="has_flights"
          :checked="localFilters.has_flights"
          @update:checked="onFlightsChange"
          class="h-4 w-4"
        />
        <label for="has_flights" class="text-sm leading-none cursor-pointer select-none">
          Avec vols uniquement
        </label>
      </div>

      <!-- Tags filtres actifs -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-1.5 pt-1">
        <span
          v-if="localFilters.operator_id"
          class="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
        >
          <Building2 class="h-3 w-3" />
          {{ operatorLabel }}
          <button @click="onOperatorChange('all')" class="ml-0.5 hover:text-primary/70">
            <X class="h-2.5 w-2.5" />
          </button>
        </span>
        <span
          v-if="localFilters.aircraft_type_id"
          class="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
        >
          <Layers class="h-3 w-3" />
          {{ typeLabel }}
          <button @click="onTypeChange('all')" class="ml-0.5 hover:text-primary/70">
            <X class="h-2.5 w-2.5" />
          </button>
        </span>
        <span
          v-if="localFilters.in_activity"
          class="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
        >
          {{ localFilters.in_activity === 'true' ? 'En activité' : 'Inactif' }}
          <button @click="onActivityChange('all')" class="ml-0.5 hover:text-primary/70">
            <X class="h-2.5 w-2.5" />
          </button>
        </span>
        <span
          v-if="localFilters.has_flights"
          class="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
        >
          Avec vols
          <button @click="onFlightsChange(false)" class="ml-0.5 hover:text-primary/70">
            <X class="h-2.5 w-2.5" />
          </button>
        </span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, SlidersHorizontal, RotateCcw, Building2, Layers } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import type {
  AircraftFilterActivity,
  AircraftFilters,
  AircraftFilterSort,
  AircraftType,
  Operator
} from '~/types/api'

const props = defineProps<{
  filters: AircraftFilters
  availableOperators: Operator[]
  availableTypes: AircraftType[]
}>()

const emit = defineEmits<{
  'update:filters': [filters: AircraftFilters]
}>()

const localFilters = ref<AircraftFilters>({ ...props.filters })

/**
 * selectKey : incrémenté à chaque changement pour forcer le re-render
 * des Select shadcn-vue qui conservent un état interne visuel stale.
 */
const selectKey = ref(0)

watch(() => props.filters, (v) => {
  localFilters.value = { ...v }
  selectKey.value++
}, { deep: true })

const normalizeNullableNumber = (value: number | string | null | undefined) => {
  if (value === '' || value === null || value === undefined) return null

  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const getNormalizedFilters = (): AircraftFilters => ({
  ...localFilters.value,
  pmad_min: normalizeNullableNumber(localFilters.value.pmad_min),
  pmad_max: normalizeNullableNumber(localFilters.value.pmad_max)
})

const emitFilters = () => {
  const normalizedFilters = getNormalizedFilters()
  // no custom PMAD validation here — pmad presets are controlled by the select
  localFilters.value = normalizedFilters
  emit('update:filters', normalizedFilters)
}

// PMAD preset helper: maps between localFilters pmad_min/max and select state
const pmadPreset = computed<string>({
  get: () => {
    const min = normalizeNullableNumber(localFilters.value.pmad_min)
    const max = normalizeNullableNumber(localFilters.value.pmad_max)
    if (min === null && max === null) return 'all'
    if (max === 50000 && min === 0) return 'lt50'
    if (min === 50000 && max === null) return 'gte50'
    return 'all'
  },
  set: (val: string) => {
    switch (val) {
      case 'lt50':
        localFilters.value = { ...localFilters.value, pmad_min: null, pmad_max: 50000 }
        break
      case 'gte50':
        localFilters.value = { ...localFilters.value, pmad_min: 50000, pmad_max: null }
        break
      default:
        localFilters.value = { ...localFilters.value, pmad_min: null, pmad_max: null }
    }
    selectKey.value++
    emitFilters()
  }
})

const onPmadPresetChange = (val: string) => { pmadPreset.value = val }

// Labels pour les pills actifs
const operatorLabel = computed(() => {
  const op = props.availableOperators.find(o => o.id.toString() === localFilters.value.operator_id)
  return op?.name ?? localFilters.value.operator_id
})

const typeLabel = computed(() => {
  const t = props.availableTypes.find(t => t.id.toString() === localFilters.value.aircraft_type_id)
  return t ? `${t.sigle}` : localFilters.value.aircraft_type_id
})

const hasActiveFilters = computed(() =>
  !!localFilters.value.operator_id ||
  !!localFilters.value.aircraft_type_id ||
  !!localFilters.value.in_activity ||
  normalizeNullableNumber(localFilters.value.pmad_min) !== null ||
  normalizeNullableNumber(localFilters.value.pmad_max) !== null ||
  !!localFilters.value.sort_by ||
  localFilters.value.has_flights
)

const activeFiltersCount = computed(() => {
  let c = 0
  if (localFilters.value.operator_id) c++
  if (localFilters.value.aircraft_type_id) c++
  if (localFilters.value.in_activity) c++
  if (
    normalizeNullableNumber(localFilters.value.pmad_min) !== null ||
    normalizeNullableNumber(localFilters.value.pmad_max) !== null
  ) c++
  if (localFilters.value.sort_by) c++
  if (localFilters.value.has_flights) c++
  return c
})

// Handlers — chaque handler met à jour + incrémente selectKey
const onOperatorChange = (val: string) => {
  localFilters.value = { ...localFilters.value, operator_id: val === 'all' ? '' : val }
  selectKey.value++
  emitFilters()
}
const onTypeChange = (val: string) => {
  localFilters.value = { ...localFilters.value, aircraft_type_id: val === 'all' ? '' : val }
  selectKey.value++
  emitFilters()
}
const onActivityChange = (val: string) => {
  const nextValue: AircraftFilterActivity = val === 'all' ? '' : (val as Exclude<AircraftFilterActivity, ''>)
  localFilters.value = { ...localFilters.value, in_activity: nextValue }
  selectKey.value++
  emitFilters()
}
const onSortChange = (val: string) => {
  const nextValue: AircraftFilterSort = val === 'default' ? '' : (val as Exclude<AircraftFilterSort, ''>)
  localFilters.value = { ...localFilters.value, sort_by: nextValue }
  selectKey.value++
  emitFilters()
}
const onFlightsChange = (val: boolean | 'indeterminate') => {
  localFilters.value = { ...localFilters.value, has_flights: val === true }
  emitFilters()
}

const resetFilters = () => {
  localFilters.value = {
    operator_id: '', aircraft_type_id: '', in_activity: '',
    pmad_min: null, pmad_max: null, sort_by: '', has_flights: false
  }
  selectKey.value++
  emitFilters()
}
</script>
