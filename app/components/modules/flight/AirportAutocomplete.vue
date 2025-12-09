<template>
  <div class="space-y-2">
    <Label :class="labelClass">
      <slot name="label">{{ label }}</slot>
    </Label>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <Label class="text-xs text-muted-foreground mb-1 block">Code IATA</Label>
        <Popover v-model:open="popoverOpen">
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox"
              :class="['w-full justify-between h-10 text-base font-semibold', errorClass]"
            >
              <span :class="{ 'text-muted-foreground': !modelValue.iata }">
                {{ modelValue.iata || 'XXX' }}
              </span>
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-full p-0">
            <Command :filter-fn="filterAirports">
              <CommandInput 
                v-model="searchQuery"
                placeholder="Chercher ou créer code IATA..." 
              />
              <CommandEmpty>
                <Button 
                  variant="ghost" 
                  class="w-full justify-start text-left"
                  @click="createNewAirport"
                  :disabled="!isValidIataCode(searchQuery)"
                >
                  <Plus class="mr-2 h-4 w-4" />
                  Créer: "{{ searchQuery.toUpperCase() }}"
                </Button>
              </CommandEmpty>
              <CommandGroup class="max-h-64 overflow-y-auto">
                <CommandItem 
                  v-for="airport in knownAirports" 
                  :key="airport.iata"
                  :value="airport.iata"
                  @select="selectAirport(airport)"
                >
                  <Check :class="[
                    'mr-2 h-4 w-4',
                    modelValue.iata === airport.iata ? 'opacity-100' : 'opacity-0'
                  ]" />
                  <div class="flex-1">
                    <div class="font-medium">{{ airport.iata }}</div>
                    <div class="text-xs text-muted-foreground">{{ airport.name }}</div>
                  </div>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        <p v-if="errorIata" class="text-xs text-destructive mt-1">
          {{ errorIata }}
        </p>
      </div>
      <div>
        <Label class="text-xs text-muted-foreground mb-1 block">Nom</Label>
        <Input 
          :model-value="modelValue.name" 
          @update:model-value="updateName"
          placeholder="Nom de l'aéroport" 
          class="text-base"
          :class="{ 'border-destructive': errorName }"
        />
        <p v-if="errorName" class="text-xs text-destructive mt-1">
          {{ errorName }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronsUpDown, Check, Plus } from 'lucide-vue-next'
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

interface Airport {
  iata: string
  name: string
}

interface Props {
  modelValue: { iata: string; name: string }
  label?: string
  labelClass?: string
  errorIata?: string
  errorName?: string
}

interface Emits {
  (e: 'update:modelValue', value: { iata: string; name: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Aéroport',
  labelClass: 'text-base font-semibold flex items-center gap-2'
})

const emit = defineEmits<Emits>()

const flightsStore = useFlightsStore()

const popoverOpen = ref(false)
const searchQuery = ref('')

// Charger tous les vols au montage du composant
onMounted(async () => {
  if (flightsStore.allFlights.length === 0) {
    await flightsStore.fetchAllAircrafts()
  }
})

// Récupérer les aéroports uniques de TOUS les vols existants
const knownAirports = computed(() => {
  const airports = new Map<string, Airport>()
  
  // Utiliser allFlights au lieu de flights pour avoir l'historique complet
  flightsStore.allFlights.forEach(flight => {
    // Départ
    if (flight.departure) {
      const dep = typeof flight.departure === 'object' 
        ? flight.departure 
        : { iata: flight.departure[0] || '', name: flight.departure[1] || '' }
      
      if (dep.iata && !airports.has(dep.iata)) {
        airports.set(dep.iata, { iata: dep.iata, name: dep.name })
      }
    }
    
    // Arrivée
    if (flight.arrival) {
      const arr = typeof flight.arrival === 'object'
        ? flight.arrival
        : { iata: flight.arrival[0] || '', name: flight.arrival[1] || '' }
      
      if (arr.iata && !airports.has(arr.iata)) {
        airports.set(arr.iata, { iata: arr.iata, name: arr.name })
      }
    }
  })
  
  return Array.from(airports.values()).sort((a, b) => a.iata.localeCompare(b.iata))
})

const errorClass = computed(() => {
  return props.errorIata ? 'border-destructive' : ''
})

const isValidIataCode = (code: string): boolean => {
  const trimmed = code.trim()
  return trimmed.length === 3 && /^[A-Z]{3}$/i.test(trimmed)
}

const filterAirports = (list: any[], search: string) => {
  if (!search) return list
  const query = search.toLowerCase()
  return list.filter(item =>
    item.iata.toLowerCase().includes(query) ||
    item.name.toLowerCase().includes(query)
  )
}

const createNewAirport = () => {
  const iataCode = searchQuery.value.trim().toUpperCase()
  
  if (isValidIataCode(iataCode)) {
    emit('update:modelValue', { iata: iataCode, name: '' })
    popoverOpen.value = false
    searchQuery.value = ''
    
    // Focus sur le champ nom après un court délai
    setTimeout(() => {
      const nameInput = document.querySelector('input[placeholder="Nom de l\'aéroport"]') as HTMLInputElement
      if (nameInput) {
        nameInput.focus()
      }
    }, 100)
  }
}

const selectAirport = (airport: Airport) => {
  emit('update:modelValue', { iata: airport.iata, name: airport.name })
  popoverOpen.value = false
  searchQuery.value = ''
}

const updateName = (name: string) => {
  emit('update:modelValue', { ...props.modelValue, name })
}

// Watch pour auto-complétion automatique
watch(() => props.modelValue.iata, (newIata) => {
  if (newIata && newIata.length === 3) {
    const match = knownAirports.value.find(a => a.iata === newIata.toUpperCase())
    if (match && !props.modelValue.name) {
      emit('update:modelValue', { iata: match.iata, name: match.name })
    }
  }
})
</script>