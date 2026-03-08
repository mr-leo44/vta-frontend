<!-- components/modules/flight/AirportAutocomplete.vue -->
<template>
  <div class="space-y-2">
    <Label :class="labelClass">
      <slot name="label">{{ label }}</slot>
    </Label>

    <div class="grid grid-cols-2 gap-3">
      <!-- Champ IATA -->
      <div class="relative">
        <Label class="text-xs text-muted-foreground mb-1 block">Code IATA</Label>
        <Input
          :value="modelValue.iata"
          placeholder="XXX"
          maxlength="4"
          class="text-base font-mono font-semibold uppercase"
          :class="{ 'border-destructive': errorIata }"
          @input="onIataInput"
          @focus="open = true; cursor = -1"
          @blur="() => setTimeout(() => open = false, 160)"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="confirm"
          @keydown.escape="open = false"
        />
        <p v-if="errorIata" class="text-xs text-destructive mt-1">{{ errorIata }}</p>

        <!-- Dropdown suggestions -->
        <div
          v-if="open && suggestions.length > 0"
          class="absolute z-200 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg overflow-hidden"
        >
          <ul class="max-h-52 overflow-y-auto py-1">
            <li
              v-for="(airport, i) in suggestions"
              :key="airport.iata"
              class="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm select-none"
              :class="i === cursor ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'"
              @mousedown.prevent="select(airport)"
            >
              <span class="font-mono font-bold w-10 shrink-0">{{ airport.iata }}</span>
              <span class="text-muted-foreground truncate text-xs">{{ airport.name }}</span>
            </li>
          </ul>
        </div>

        <!-- Aucun résultat -->
        <div
          v-else-if="open && query.length > 0 && suggestions.length === 0"
          class="absolute z-200 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md"
        >
          <button
            v-if="isValid3(query)"
            class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            @mousedown.prevent="create"
          >
            <Plus class="h-4 w-4 shrink-0" />
            Créer « {{ query.toUpperCase() }} »
          </button>
          <p v-else class="px-3 py-2 text-xs text-muted-foreground">
            Aucun résultat. Tapez 3 lettres pour créer.
          </p>
        </div>
      </div>

      <!-- Champ Nom -->
      <div>
        <Label class="text-xs text-muted-foreground mb-1 block">Nom</Label>
        <Input
          ref="nameRef"
          :model-value="modelValue.name"
          @update:model-value="(v) => emit('update:modelValue', { ...modelValue, name: v })"
          placeholder="Nom de l'aéroport"
          class="text-base"
          :class="{ 'border-destructive': errorName }"
        />
        <p v-if="errorName" class="text-xs text-destructive mt-1">{{ errorName }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Plus } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Airport { iata: string; name: string }

interface Props {
  modelValue: { iata: string; name: string }
  label?: string
  labelClass?: string
  errorIata?: string
  errorName?: string
  excludeIata?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Aéroport',
  labelClass: 'text-base font-semibold flex items-center gap-2',
  excludeIata: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Airport): void
}>()

const flightsStore = useFlightsStore()
const nameRef  = ref<any>(null)
const open     = ref(false)
const query    = ref('')
const cursor   = ref(-1)

onMounted(async () => {
  if (flightsStore.allFlights.length === 0) {
    await flightsStore.fetchAllAircrafts()
  }
})

// Extrait {iata,name} depuis la nouvelle structure {from,to} ou l'ancienne {iata,name}
const extractPoints = (loc: any): Airport[] => {
  if (!loc || typeof loc !== 'object' || Array.isArray(loc)) return []
  if (loc.from || loc.to) {
    return [loc.from, loc.to]
      .filter((pt: any) => pt?.iata && typeof pt.iata === 'string')
      .map((pt: any) => ({ iata: pt.iata as string, name: (pt.name as string) || '' }))
  }
  if (typeof loc.iata === 'string' && loc.iata) {
    return [{ iata: loc.iata, name: loc.name || '' }]
  }
  return []
}

const allAirports = computed<Airport[]>(() => {
  const map = new Map<string, Airport>()
  flightsStore.allFlights.forEach(flight => {
    for (const loc of [flight.departure, flight.arrival]) {
      for (const pt of extractPoints(loc)) {
        if (!map.has(pt.iata) && pt.iata !== props.excludeIata) {
          map.set(pt.iata, pt)
        }
      }
    }
  })
  return Array.from(map.values()).sort((a, b) => a.iata.localeCompare(b.iata))
})

const suggestions = computed<Airport[]>(() => {
  const q = query.value.trim().toLowerCase()
  const list = q
    ? allAirports.value.filter(a =>
        a.iata.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
      )
    : allAirports.value
  return list.slice(0, 20)
})

const isValid3 = (s: string) => /^[A-Za-z]{3}$/.test(s.trim())

const onIataInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value.toUpperCase()
  ;(e.target as HTMLInputElement).value = val
  query.value  = val
  cursor.value = -1
  open.value   = true
  emit('update:modelValue', { iata: val, name: props.modelValue.name })
}

const select = (a: Airport) => {
  emit('update:modelValue', { iata: a.iata, name: a.name })
  query.value  = ''
  open.value   = false
  cursor.value = -1
}

const create = () => {
  const iata = query.value.trim().toUpperCase()
  if (!isValid3(iata)) return
  emit('update:modelValue', { iata, name: '' })
  query.value = ''
  open.value  = false
  nextTick(() => {
    const el = nameRef.value?.$el ?? nameRef.value
    if (el) (el as HTMLInputElement).focus()
  })
}

const move = (dir: 1 | -1) => {
  const max = suggestions.value.length - 1
  if (max < 0) return
  cursor.value = Math.max(0, Math.min(max, cursor.value + dir))
}

const confirm = () => {
  if (cursor.value >= 0 && suggestions.value[cursor.value]) {
    select(suggestions.value[cursor.value])
  } else if (isValid3(query.value)) {
    create()
  }
}
</script>