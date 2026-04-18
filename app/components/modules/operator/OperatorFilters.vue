<template>
  <div class="bg-card border border-border rounded-xl overflow-hidden">
    <!-- En-tête -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border">
      <div class="flex items-center gap-2">
        <SlidersHorizontal class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm font-semibold">Filtres</span>
        <span
          v-if="activeFiltersCount > 0"
          class="inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold bg-blue-600 text-white rounded-full"
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

      <!-- Pays -->
      <div class="space-y-1.5">
        <Label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pays</Label>
        <Select
          :key="`country-${selectKey}`"
          :model-value="localFilters.country || ALL_VALUE"
          @update:model-value="onCountryChange"
        >
          <SelectTrigger
            class="h-9 text-sm"
            :class="localFilters.country ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/30' : ''"
          >
            <SelectValue placeholder="Tous les pays" />
          </SelectTrigger>
          <SelectContent class="max-h-[260px]">
            <SelectItem :value="ALL_VALUE">Tous les pays</SelectItem>
            <SelectItem
              v-for="country in availableCountries"
              :key="country"
              :value="country"
            >
              {{ country }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Type de vol -->
      <div class="space-y-1.5">
        <Label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type de vol</Label>
        <Select
          :key="`flight-${selectKey}`"
          :model-value="localFilters.flight_type || ALL_VALUE"
          @update:model-value="onFlightTypeChange"
        >
          <SelectTrigger
            class="h-9 text-sm"
            :class="localFilters.flight_type ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/30' : ''"
          >
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL_VALUE">Tous les types</SelectItem>
            <SelectItem value="regular">Vol régulier</SelectItem>
            <SelectItem value="non_regular">Vol non régulier (VNR)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Tri -->
      <div class="space-y-1.5">
        <Label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Trier par</Label>
        <Select
          :key="`sort-${selectKey}`"
          :model-value="localFilters.sort_by || ALL_VALUE"
          @update:model-value="onSortChange"
        >
          <SelectTrigger
            class="h-9 text-sm"
            :class="localFilters.sort_by ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/30' : ''"
          >
            <SelectValue placeholder="Par défaut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL_VALUE">Par défaut</SelectItem>
            <SelectItem value="name_asc">Nom (A → Z)</SelectItem>
            <SelectItem value="name_desc">Nom (Z → A)</SelectItem>
            <SelectItem value="created_desc">Plus récents d'abord</SelectItem>
            <SelectItem value="created_asc">Plus anciens d'abord</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Flotte active -->
      <div class="flex items-center gap-3 py-1">
        <Checkbox
          id="has_active_fleet"
          :checked="localFilters.has_active_fleet"
          @update:checked="onFleetChange"
          class="h-4 w-4"
        />
        <label
          for="has_active_fleet"
          class="text-sm leading-none cursor-pointer select-none"
        >
          Flotte active uniquement
        </label>
      </div>

      <!-- Tags filtres actifs -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-1.5 pt-1">
        <span
          v-if="localFilters.country"
          class="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full"
        >
          <MapPin class="h-3 w-3" />
          {{ localFilters.country }}
          <button @click="onCountryChange(ALL_VALUE)" class="ml-0.5 hover:opacity-70">
            <X class="h-2.5 w-2.5" />
          </button>
        </span>
        <span
          v-if="localFilters.flight_type"
          class="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full"
        >
          <Plane class="h-3 w-3" />
          {{ localFilters.flight_type === 'regular' ? 'Régulier' : 'VNR' }}
          <button @click="onFlightTypeChange(ALL_VALUE)" class="ml-0.5 hover:opacity-70">
            <X class="h-2.5 w-2.5" />
          </button>
        </span>
        <span
          v-if="localFilters.sort_by"
          class="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full"
        >
          <ArrowUpDown class="h-3 w-3" />
          {{ sortLabel(localFilters.sort_by) }}
          <button @click="onSortChange(ALL_VALUE)" class="ml-0.5 hover:opacity-70">
            <X class="h-2.5 w-2.5" />
          </button>
        </span>
        <span
          v-if="localFilters.has_active_fleet"
          class="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full"
        >
          Flotte active
          <button @click="onFleetChange(false)" class="ml-0.5 hover:opacity-70">
            <X class="h-2.5 w-2.5" />
          </button>
        </span>
      </div>

      <!-- Appliquer -->
      <Button
        @click="applyFilters"
        class="w-full h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        <Filter class="h-3.5 w-3.5 mr-1.5" />
        Appliquer les filtres
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Filter, SlidersHorizontal, RotateCcw, MapPin, Plane, ArrowUpDown } from 'lucide-vue-next'
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

/**
 * Valeur sentinelle pour représenter "tous / aucun filtre".
 * shadcn-vue Select interdit les valeurs vides ("") sur SelectItem —
 * on utilise donc cette constante interne, convertie en "" dans les émissions.
 */
const ALL_VALUE = '__all__'

const props = defineProps<{
  filters: OperatorFilters
  availableCountries: string[]
}>()

const emit = defineEmits<{
  'update:filters': [filters: OperatorFilters]
  apply: []
}>()

const localFilters = ref<OperatorFilters>({ ...props.filters })

/**
 * Clé réactive pour forcer le re-rendu des selects shadcn-vue
 * et garantir que l'affichage reflète toujours model-value.
 */
const selectKey = ref(0)

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
  selectKey.value++
}, { deep: true })

// ───── Helpers ────────────────────────────────────────────────────────────────

/** Convertit la valeur sentinelle en chaîne vide pour les filtres réels */
const normalize = (val: string): string => (val === ALL_VALUE ? '' : val)

const sortLabel = (val: string): string => {
  const labels: Record<string, string> = {
    name_asc:     'Nom A→Z',
    name_desc:    'Nom Z→A',
    created_desc: 'Plus récents',
    created_asc:  'Plus anciens',
  }
  return labels[val] ?? val
}

// ───── Computed ───────────────────────────────────────────────────────────────

const hasActiveFilters = computed(() =>
  localFilters.value.country !== '' ||
  localFilters.value.flight_type !== '' ||
  localFilters.value.sort_by !== '' ||
  localFilters.value.has_active_fleet
)

const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.value.country) count++
  if (localFilters.value.flight_type) count++
  if (localFilters.value.sort_by) count++
  if (localFilters.value.has_active_fleet) count++
  return count
})

// ───── Handlers ───────────────────────────────────────────────────────────────

const onCountryChange = (val: string) => {
  localFilters.value = { ...localFilters.value, country: normalize(val) }
  selectKey.value++
}

const onFlightTypeChange = (val: string) => {
  localFilters.value = { ...localFilters.value, flight_type: normalize(val) }
  selectKey.value++
}

const onSortChange = (val: string) => {
  localFilters.value = { ...localFilters.value, sort_by: normalize(val) }
  selectKey.value++
}

const onFleetChange = (val: boolean) => {
  localFilters.value = { ...localFilters.value, has_active_fleet: val }
}

const resetFilters = () => {
  localFilters.value = { country: '', flight_type: '', sort_by: '', has_active_fleet: false }
  selectKey.value++
  applyFilters()
}

const applyFilters = () => {
  emit('update:filters', { ...localFilters.value })
  emit('apply')
}
</script>