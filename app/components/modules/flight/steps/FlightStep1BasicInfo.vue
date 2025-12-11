<template>
  <div class="space-y-5 animate-in fade-in-50">
    <!-- Flight Number -->
    <div class="space-y-2">
      <Label for="flight_number" class="text-base font-semibold flex items-center gap-2">
        <Plane class="h-4 w-4" />
        Numéro de vol
      </Label>
      <Input 
        id="flight_number" 
        v-model="formData.flight_number" 
        placeholder="AF1234, BA567, etc."
        class="text-base" 
        :class="{ 'border-destructive': errors.flight_number }" 
      />
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
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            :aria-expanded="operatorPopoverOpen"
            class="w-full justify-between h-10 text-base"
            :class="{ 'border-destructive': errors.operator_id }"
          >
            <span :class="{ 'text-muted-foreground': !selectedOperatorLabel }">
              {{ selectedOperatorLabel || 'Sélectionner un exploitant' }}
            </span>
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-full p-0">
          <Command>
            <CommandInput placeholder="Chercher exploitant..." />
            <CommandEmpty>Aucun exploitant trouvé</CommandEmpty>
            <CommandGroup class="max-h-64 overflow-y-auto">
              <CommandItem 
                v-for="operator in operators" 
                :key="operator.id" 
                :value="operator.id.toString()"
                @select="selectOperator(operator)"
              >
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
          </Command>
        </PopoverContent>
      </Popover>
      <p v-if="errors.operator_id" class="text-xs text-destructive flex items-center gap-1">
        <AlertCircle class="h-3 w-3" />{{ errors.operator_id }}
      </p>
    </div>

    <!-- Aircraft Selection -->
    <div class="space-y-2">
      <Label class="text-base font-semibold flex items-center gap-2">
        <Plane class="h-4 w-4" />
        Aéronef
      </Label>
      <Popover v-model:open="aircraftPopoverOpen">
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            :aria-expanded="aircraftPopoverOpen"
            class="w-full justify-between h-10 text-base"
            :class="{ 'border-destructive': errors.aircraft_id }"
            :disabled="!formData.operator_id"
          >
            <span :class="{ 'text-muted-foreground': !selectedAircraftLabel }">
              {{ selectedAircraftLabel || 'Sélectionner un aéronef' }}
            </span>
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-full p-0">
          <Command>
            <CommandInput placeholder="Chercher aéronef..." />
            <CommandEmpty>Aucun aéronef trouvé</CommandEmpty>
            <CommandGroup class="max-h-64 overflow-y-auto">
              <CommandItem 
                v-for="aircraft in filteredAircrafts" 
                :key="aircraft.id" 
                :value="aircraft.id.toString()"
                @select="selectAircraft(aircraft)"
              >
                <Check :class="[
                  'mr-2 h-4 w-4',
                  formData.aircraft_id === aircraft.id ? 'opacity-100' : 'opacity-0'
                ]" />
                <div class="flex-1">
                  <div class="font-medium">{{ aircraft.immatriculation }}</div>
                  <div class="text-xs text-muted-foreground">{{ aircraft.type?.name }}</div>
                </div>
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <p v-if="errors.aircraft_id" class="text-xs text-destructive flex items-center gap-1">
        <AlertCircle class="h-3 w-3" />{{ errors.aircraft_id }}
      </p>
      <p v-if="!formData.operator_id" class="text-xs text-muted-foreground">
        Sélectionnez d'abord un exploitant
      </p>
      <p v-else-if="filteredAircrafts.length === 0" class="text-xs text-amber-600 dark:text-amber-400">
        Aucun aéronef trouvé pour cet exploitant
      </p>
    </div>

    <!-- Flight Regime -->
    <div class="space-y-2">
      <Label class="text-base font-semibold flex items-center gap-2">
        Régime du vol
      </Label>
      <Select v-model="formData.flight_regime">
        <SelectTrigger class="h-10">
          <SelectValue placeholder="Sélectionner un régime" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="domestic">Domestique</SelectItem>
          <SelectItem value="international">International</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Plane, Building2, AlertCircle, ChevronsUpDown, Check } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  CommandEmpty
} from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { FlightFormData } from '~/types/api'

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

// Filtrer les avions selon l'opérateur sélectionné
const filteredAircrafts = computed(() => {
  if (!props.formData.operator_id) return []
  
  // Filter aircrafts by operator_id
  const filtered = props.aircrafts.filter(aircraft => {
    // Handle both direct operator_id and nested operator object
    const aircraftOperatorId = aircraft.operator_id || aircraft.operator?.id
    return aircraftOperatorId === props.formData.operator_id
  })
  
  console.log('Filtered aircrafts for operator', props.formData.operator_id, ':', filtered)
  return filtered
})

const selectOperator = async (operator: any) => {
  props.formData.operator_id = operator.id
  emit('update:selectedOperatorLabel', `${operator.name} (${operator.sigle})`)
  operatorPopoverOpen.value = false
  
  // Réinitialiser l'avion sélectionné
  props.formData.aircraft_id = 0
  emit('update:selectedAircraftLabel', '')
  
  // Charger les détails de l'opérateur pour récupérer flight_type et flight_nature
  emit('operatorChanged', operator.id)
}

const selectAircraft = (aircraft: any) => {
  props.formData.aircraft_id = aircraft.id
  emit('update:selectedAircraftLabel', aircraft.immatriculation)
  aircraftPopoverOpen.value = false
}
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