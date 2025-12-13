<template>
  <div class="space-y-5 animate-in fade-in-50">
    <!-- Flight Number -->
    <div class="space-y-2">
      <Label for="flight_number" class="text-base font-semibold flex items-center gap-2">
        <Plane class="h-4 w-4" />
        Numéro de vol
      </Label>
      <Input id="flight_number" v-model="formData.flight_number" placeholder="AF1234, BA567, etc." class="text-base"
        :class="{ 'border-destructive': errors.flight_number }" />
      <p v-if="errors.flight_number" class="text-xs text-destructive flex items-center gap-1">
        <AlertCircle class="h-3 w-3" />{{ errors.flight_number }}
      </p>
    </div>

    <!-- Operator Selection -->
    <div class="space-y-2">
      <Label class="text-base font-semibold flex items-center gap-2">
        <Building2 class="h-4 w-4" />
        Exploitant
      </Label>
      <Popover v-model:open="operatorPopoverOpen">
        <PopoverTrigger as-child>
          <Button variant="outline" role="combobox" :aria-expanded="operatorPopoverOpen"
            class="w-full justify-between h-10 text-base" :class="{ 'border-destructive': errors.operator_id }">
            <span :class="{ 'text-muted-foreground': !selectedOperatorLabel }">
              {{ selectedOperatorLabel || 'Sélectionner un exploitant' }}
            </span>
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-full p-0">
          <Command v-model:search-term="operatorSearchTerm">
            <CommandInput placeholder="Chercher exploitant..." />
            <CommandEmpty>Aucun exploitant trouvé</CommandEmpty>
            <CommandList>
              <CommandGroup class="max-h-64 overflow-y-auto">
                <CommandItem v-for="operator in filteredOperators" :key="operator.id" :value="operator.id.toString()"
                  @select="selectOperator(operator)">
                  <Check :class="[
                    'mr-2 h-4 w-4',
                    formData.operator_id === operator.id ? 'opacity-100' : 'opacity-0'
                  ]" />
                  <div class="flex-1">
                    <div class="font-medium">{{ operator.name }}</div>
                    <div class="text-xs text-muted-foreground">{{ operator.sigle }}</div>
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p v-if="errors.operator_id" class="text-xs text-destructive flex items-center gap-1">
        <AlertCircle class="h-3 w-3" />{{ errors.operator_id }}
      </p>
    </div>

    <!-- Aircraft Selection -->
    <div class="space-y-2">
      <div class="flex items-center justify-between mb-1">
        <Label class="text-base font-semibold flex items-center gap-2">
          <Plane class="h-4 w-4" />
          Aéronef
        </Label>
        <Button v-if="formData.operator_id && !showAllAircrafts" type="button" variant="ghost" size="sm"
          @click="showAllAircrafts = true" class="text-xs h-auto py-1">
          <Plus class="h-3 w-3 mr-1" />
          Choisir autre aéronef
        </Button>
        <Button v-if="showAllAircrafts" type="button" variant="ghost" size="sm" @click="showAllAircrafts = false"
          class="text-xs h-auto py-1">
          <X class="h-3 w-3 mr-1" />
          Uniquement opérateur
        </Button>
      </div>

      <Popover v-model:open="aircraftPopoverOpen">
        <PopoverTrigger as-child>
          <Button variant="outline" role="combobox" :aria-expanded="aircraftPopoverOpen"
            class="w-full justify-between h-10 text-base" :class="{ 'border-destructive': errors.aircraft_id }"
            :disabled="!formData.operator_id">
            <span :class="{ 'text-muted-foreground': !selectedAircraftLabel }">
              {{ selectedAircraftLabel || 'Sélectionner un aéronef' }}
            </span>
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-full p-0">
          <Command v-model:search-term="aircraftSearchTerm">
            <CommandInput placeholder="Chercher aéronef..." />
            <CommandEmpty>Aucun aéronef trouvé</CommandEmpty>
            <CommandList>
              <CommandGroup v-if="!showAllAircrafts && operatorAircrafts.length > 0" class="max-h-64 overflow-y-auto">
                <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Aéronefs de l'exploitant
                </div>
                <CommandItem v-for="aircraft in filteredOperatorAircrafts" :key="aircraft.id"
                  :value="aircraft.id.toString()" @select="selectAircraft(aircraft)">
                  <Check :class="[
                    'mr-2 h-4 w-4',
                    formData.aircraft_id === aircraft.id ? 'opacity-100' : 'opacity-0'
                  ]" />
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-medium">{{ aircraft.immatriculation }}</span>
                    <Badge variant="secondary" class="text-xs">{{ aircraft.type?.sigle || aircraft.type?.name }}</Badge>
                  </div>
                </CommandItem>
              </CommandGroup>

              <CommandGroup v-if="showAllAircrafts" class="max-h-64 overflow-y-auto">
                <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Tous les aéronefs
                </div>
                <CommandItem v-for="aircraft in filteredAllAircrafts" :key="aircraft.id" :value="aircraft.id.toString()"
                  @select="selectAircraft(aircraft)">
                  <Check :class="[
                    'mr-2 h-4 w-4',
                    formData.aircraft_id === aircraft.id ? 'opacity-100' : 'opacity-0'
                  ]" />
                  <div class="flex items-center gap-2 flex-1">
                    <span class="font-mono font-medium">{{ aircraft.immatriculation }}</span>
                    <Badge variant="secondary" class="text-xs">{{ aircraft.type?.sigle || aircraft.type?.name }}</Badge>
                    <span class="text-xs text-muted-foreground ml-auto">{{ aircraft.operator?.sigle }}</span>
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <p v-if="errors.aircraft_id" class="text-xs text-destructive flex items-center gap-1">
        <AlertCircle class="h-3 w-3" />{{ errors.aircraft_id }}
      </p>
      <p v-if="!formData.operator_id" class="text-xs text-muted-foreground">
        Sélectionnez d'abord un exploitant
      </p>
      <p v-else-if="showAllAircrafts" class="text-xs text-muted-foreground">
        Affichage de tous les aéronefs disponibles
      </p>
      <p v-else-if="operatorAircrafts.length === 0" class="text-xs text-amber-600 dark:text-amber-400">
        Aucun aéronef trouvé pour cet exploitant
      </p>
    </div>

    <!-- Flight Regime & Flight Nature -->
    <div class="space-y-2">
      <div class="flex gap-2 max-w-full">
        <div class="flex-1">
          <Label class="text-base font-semibold flex items-center gap-2">
            Régime du vol
          </Label>
          <Select v-model="formData.flight_regime">
            <SelectTrigger class="h-10 w-full">
              <SelectValue placeholder="Sélectionner un régime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domestic">Domestique</SelectItem>
              <SelectItem value="international">International</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex-1">
          <Label class="text-base font-semibold flex items-center gap-2">
            Nature du vol
          </Label>
          <Select v-model="formData.flight_nature">
            <SelectTrigger class="h-10 w-full">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="(label,nature) in FLIGHT_NATURE_LABELS" :key="nature" :value="nature">{{ label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Plane, Building2, AlertCircle, ChevronsUpDown, Check, Plus, X } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandList
} from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { FLIGHT_NATURE_LABELS, type FlightFormData } from '~/types/api'

interface Props {
  formData: FlightFormData
  errors: Record<string, string>
  operators: any[]
  aircrafts: any[]
  selectedOperatorLabel: string
  selectedAircraftLabel: string
}

interface Emits {
  (e: 'update:selectedOperatorLabel', value: string): void
  (e: 'update:selectedAircraftLabel', value: string): void
  (e: 'operatorChanged', operatorId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const operatorsStore = useOperatorsStore()

const operatorPopoverOpen = ref(false)
const aircraftPopoverOpen = ref(false)
const operatorSearchTerm = ref('')
const aircraftSearchTerm = ref('')
const showAllAircrafts = ref(false)

// Filtered operators
const filteredOperators = computed(() => {
  if (!operatorSearchTerm.value) return props.operators
  return props.operators.filter(operator =>
    operator.name.toLowerCase().includes(operatorSearchTerm.value.toLowerCase()) ||
    operator.sigle.toLowerCase().includes(operatorSearchTerm.value.toLowerCase())
  )
})

// Filtrer les avions selon l'opérateur sélectionné
const operatorAircrafts = computed(() => {
  if (!props.formData.operator_id) return []

  return props.aircrafts.filter(aircraft => {
    const aircraftOperatorId = aircraft.operator_id || aircraft.operator?.id
    return aircraftOperatorId === props.formData.operator_id
  })
})

const filteredOperatorAircrafts = computed(() => {
  if (!aircraftSearchTerm.value) return operatorAircrafts.value
  return operatorAircrafts.value.filter(aircraft =>
    aircraft.immatriculation.toLowerCase().includes(aircraftSearchTerm.value.toLowerCase()) ||
    aircraft.type?.sigle?.toLowerCase().includes(aircraftSearchTerm.value.toLowerCase()) ||
    aircraft.type?.name?.toLowerCase().includes(aircraftSearchTerm.value.toLowerCase())
  )
})

const filteredAllAircrafts = computed(() => {
  if (!aircraftSearchTerm.value) return props.aircrafts
  return props.aircrafts.filter(aircraft =>
    aircraft.immatriculation.toLowerCase().includes(aircraftSearchTerm.value.toLowerCase()) ||
    aircraft.type?.sigle?.toLowerCase().includes(aircraftSearchTerm.value.toLowerCase()) ||
    aircraft.type?.name?.toLowerCase().includes(aircraftSearchTerm.value.toLowerCase()) ||
    aircraft.operator?.sigle?.toLowerCase().includes(aircraftSearchTerm.value.toLowerCase())
  )
})

const selectOperator = async (operator: any) => {
  props.formData.operator_id = operator.id
  emit('update:selectedOperatorLabel', `${operator.name} (${operator.sigle})`)
  operatorPopoverOpen.value = false
  operatorSearchTerm.value = ''

  // Réinitialiser l'avion sélectionné et le mode d'affichage
  props.formData.aircraft_id = 0
  emit('update:selectedAircraftLabel', '')
  showAllAircrafts.value = false

  // Charger les détails de l'opérateur pour récupérer flight_type et flight_nature
  emit('operatorChanged', operator.id)
}

const natures = FLIGHT_NATURE_LABELS

const selectAircraft = (aircraft: any) => {
  props.formData.aircraft_id = aircraft.id
  emit('update:selectedAircraftLabel', aircraft.immatriculation)
  aircraftPopoverOpen.value = false
  aircraftSearchTerm.value = ''
}

// Réinitialiser showAllAircrafts quand l'opérateur change
watch(() => props.formData.operator_id, () => {
  showAllAircrafts.value = false
})
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>