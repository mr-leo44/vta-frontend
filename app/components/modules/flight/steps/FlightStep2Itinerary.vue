<template>
  <div class="space-y-5 animate-in fade-in-50">

    <!-- DÉPART -->
    <div class="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
      <Label class="text-base font-semibold flex items-center gap-2 mb-4">
        <PlaneTakeoff class="h-4 w-4 text-blue-600" />
        Départ
      </Label>

      <div class="grid grid-cols-2 gap-4">
        <AirportField
          label="De"
          label-color="blue"
          :iata="formData.departure.from.iata"
          :name="formData.departure.from.name"
          :all-airports="allAirports"
          :error-iata="errors['departure.from.iata']"
          :error-name="errors['departure.from.name']"
          @update="(v) => setPoint('departure', 'from', v.iata, v.name)"
        >
          <template #icon><MapPin class="h-3 w-3" /></template>
        </AirportField>

        <AirportField
          label="Vers"
          label-color="blue"
          :iata="formData.departure.to.iata"
          :name="formData.departure.to.name"
          :all-airports="allAirports"
          :error-iata="errors['departure.to.iata']"
          :error-name="errors['departure.to.name']"
          @update="(v) => setPoint('departure', 'to', v.iata, v.name)"
        >
          <template #icon><ArrowRight class="h-3 w-3" /></template>
        </AirportField>
      </div>

      <div v-if="formData.departure.from.iata && formData.departure.to.iata"
        class="mt-3 flex items-center gap-2 text-xs bg-blue-100/60 dark:bg-blue-900/20 px-3 py-1.5 rounded text-blue-700 dark:text-blue-300 flex-wrap">
        <span class="font-mono font-bold">{{ formData.departure.from.iata }}</span>
        <span class="text-muted-foreground">{{ formData.departure.from.name }}</span>
        <ArrowRight class="h-3 w-3 shrink-0" />
        <span class="font-mono font-bold">{{ formData.departure.to.iata }}</span>
        <span class="text-muted-foreground">{{ formData.departure.to.name }}</span>
      </div>
    </div>

    <!-- ARRIVÉE -->
    <div class="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
      <Label class="text-base font-semibold flex items-center gap-2 mb-4">
        <PlaneLanding class="h-4 w-4 text-green-600" />
        Arrivée
      </Label>

      <div class="grid grid-cols-2 gap-4">
        <AirportField
          label="De"
          label-color="green"
          :iata="formData.arrival.from.iata"
          :name="formData.arrival.from.name"
          :all-airports="allAirports"
          :error-iata="errors['arrival.from.iata']"
          :error-name="errors['arrival.from.name']"
          @update="(v) => setPoint('arrival', 'from', v.iata, v.name)"
        >
          <template #icon><MapPin class="h-3 w-3" /></template>
        </AirportField>

        <AirportField
          label="Vers"
          label-color="green"
          :iata="formData.arrival.to.iata"
          :name="formData.arrival.to.name"
          :all-airports="allAirports"
          :error-iata="errors['arrival.to.iata']"
          :error-name="errors['arrival.to.name']"
          @update="(v) => setPoint('arrival', 'to', v.iata, v.name)"
        >
          <template #icon><ArrowRight class="h-3 w-3" /></template>
        </AirportField>
      </div>

      <div v-if="formData.arrival.from.iata && formData.arrival.to.iata"
        class="mt-3 flex items-center gap-2 text-xs bg-green-100/60 dark:bg-green-900/20 px-3 py-1.5 rounded text-green-700 dark:text-green-300 flex-wrap">
        <span class="font-mono font-bold">{{ formData.arrival.from.iata }}</span>
        <span class="text-muted-foreground">{{ formData.arrival.from.name }}</span>
        <ArrowRight class="h-3 w-3 shrink-0" />
        <span class="font-mono font-bold">{{ formData.arrival.to.iata }}</span>
        <span class="text-muted-foreground">{{ formData.arrival.to.name }}</span>
      </div>
    </div>

    <!-- HORAIRES -->
    <div class="space-y-3">
      <Label class="text-sm font-semibold flex items-center gap-2">
        <Clock class="h-4 w-4" /> Horaires
      </Label>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label for="departure_time" class="text-xs text-muted-foreground mb-1 block">Départ</Label>
          <Input
            id="departure_time"
            v-model="formData.departure_time"
            type="datetime-local"
            class="text-base"
            :class="{ 'border-destructive': errors.departure_time }"
            @change="validateTimes"
          />
          <p v-if="errors.departure_time" class="text-xs text-destructive mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.departure_time }}
          </p>
        </div>
        <div>
          <Label for="arrival_time" class="text-xs text-muted-foreground mb-1 block">Arrivée</Label>
          <Input
            id="arrival_time"
            v-model="formData.arrival_time"
            type="datetime-local"
            class="text-base"
            :class="{ 'border-destructive': errors.arrival_time || timeValidationError }"
            @change="validateTimes"
          />
          <p v-if="errors.arrival_time" class="text-xs text-destructive mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.arrival_time }}
          </p>
          <p v-else-if="timeValidationError" class="text-xs text-destructive mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ timeValidationError }}
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h, onMounted } from 'vue'
import { MapPin, Clock, AlertCircle, ArrowRight, PlaneTakeoff, PlaneLanding, Plus } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { FlightFormData } from '~/types/api'

interface Airport { iata: string; name: string }
interface Props {
  formData: FlightFormData
  errors: Record<string, string>
}

const props = defineProps<Props>()

// ─── Composant champ aéroport autonome ──────────────────────────────────────
// Chaque instance a son propre état (query, dropdown, cursor)
// ce qui évite les interférences entre les 4 champs
const AirportField = defineComponent({
  name: 'AirportField',
  props: {
    iata:        { type: String,  required: true },
    name:        { type: String,  required: true },
    label:       { type: String,  required: true },
    labelColor:  { type: String,  default: 'blue' },
    allAirports: { type: Array as () => Airport[], required: true },
    errorIata:   { type: String,  default: '' },
    errorName:   { type: String,  default: '' },
  },
  emits: ['update'],
  setup(p, { emit, slots }) {
    const query      = ref('')
    const open       = ref(false)
    const cursor     = ref(-1)
    const nameRef    = ref<any>(null)

    const colorMap: Record<string, string> = {
      blue:  'text-blue-700 dark:text-blue-300',
      green: 'text-green-700 dark:text-green-300',
    }
    const labelCls = computed(() => colorMap[p.labelColor] || colorMap.blue)

    const suggestions = computed(() => {
      const q = query.value.trim().toLowerCase()
      const list = q
        ? p.allAirports.filter(a =>
            a.iata.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
          )
        : p.allAirports
      return list.slice(0, 20)
    })

    const isValid3 = (s: string) => /^[A-Za-z]{3}$/.test(s.trim())

    const onInput = (e: Event) => {
      const val = (e.target as HTMLInputElement).value.toUpperCase()
      ;(e.target as HTMLInputElement).value = val
      query.value = val
      cursor.value = -1
      open.value = true
      emit('update', { iata: val, name: p.name })
    }

    const onFocus = () => { open.value = true; cursor.value = -1 }
    const onBlur  = () => setTimeout(() => { open.value = false }, 160)

    const select = (a: Airport) => {
      emit('update', { iata: a.iata, name: a.name })
      query.value  = ''
      open.value   = false
      cursor.value = -1
    }

    const create = () => {
      const iata = query.value.trim().toUpperCase()
      if (!isValid3(iata)) return
      emit('update', { iata, name: '' })
      query.value = ''
      open.value  = false
      // focus sur le champ nom
      setTimeout(() => {
        const el = nameRef.value?.$el ?? nameRef.value
        if (el) (el as HTMLInputElement).focus()
      }, 50)
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

    const updateName = (e: Event) => {
      emit('update', { iata: p.iata, name: (e.target as HTMLInputElement).value })
    }

    return () => h('div', { class: 'space-y-1' }, [
      // Label
      h('div', { class: `text-xs font-semibold flex items-center gap-1.5 ${labelCls.value}` }, [
        slots.icon?.(),
        p.label,
      ]),

      // Input IATA + dropdown
      h('div', { class: 'relative' }, [
        h(Input, {
          value: p.iata,
          placeholder: 'IATA',
          maxlength: 4,
          class: `font-mono font-bold uppercase ${p.errorIata ? 'border-destructive' : ''}`,
          onInput:              onInput,
          onFocus:              onFocus,
          onBlur:               onBlur,
          'onKeydown.down':     (e: Event) => { e.preventDefault(); move(1) },
          'onKeydown.up':       (e: Event) => { e.preventDefault(); move(-1) },
          'onKeydown.enter':    (e: Event) => { e.preventDefault(); confirm() },
          'onKeydown.escape':   () => { open.value = false },
        }),

        // Dropdown
        open.value && h('div', {
          class: 'absolute z-[200] top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg overflow-hidden'
        }, [
          suggestions.value.length > 0
            ? h('ul', { class: 'max-h-52 overflow-y-auto py-1' },
                suggestions.value.map((a, i) =>
                  h('li', {
                    key: a.iata,
                    class: `flex items-center gap-2 px-3 py-2 cursor-pointer text-sm select-none
                      ${i === cursor.value ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`,
                    onMousedown: (e: MouseEvent) => { e.preventDefault(); select(a) },
                  }, [
                    h('span', { class: 'font-mono font-bold w-10 shrink-0' }, a.iata),
                    h('span', { class: 'text-muted-foreground truncate text-xs' }, a.name),
                  ])
                )
              )
            : h('div', { class: 'px-3 py-2' },
                isValid3(query.value)
                  ? h('button', {
                      class: 'flex w-full items-center gap-2 text-sm hover:text-accent-foreground',
                      onMousedown: (e: MouseEvent) => { e.preventDefault(); create() },
                    }, [h(Plus, { class: 'h-4 w-4 shrink-0' }), `Créer « ${query.value.toUpperCase()} »`])
                  : h('p', { class: 'text-xs text-muted-foreground' }, 'Aucun résultat. Tapez 3 lettres pour créer.')
              ),
        ]),
      ]),

      // Input Nom
      h(Input, {
        ref: nameRef,
        value: p.name,
        placeholder: "Nom de l'aéroport",
        class: `text-sm mt-1 ${p.errorName ? 'border-destructive' : ''}`,
        onInput: updateName,
      }),

      // Erreurs
      (p.errorIata || p.errorName) && h('p', { class: 'text-xs text-destructive flex items-center gap-1 mt-0.5' }, [
        h(AlertCircle, { class: 'h-3 w-3 shrink-0' }),
        p.errorIata || p.errorName,
      ]),
    ])
  }
})

// ─── Store & données ─────────────────────────────────────────────────────────
const flightsStore = useFlightsStore()
const timeValidationError = ref('')

onMounted(async () => {
  if (flightsStore.allFlights.length === 0) {
    await flightsStore.fetchAllAircrafts()
  }
})

const allAirports = computed<Airport[]>(() => {
  const map = new Map<string, Airport>()
  flightsStore.allFlights.forEach(flight => {
    for (const loc of [flight.departure, flight.arrival] as any[]) {
      if (!loc || typeof loc !== 'object' || Array.isArray(loc)) continue
      // Nouvelle structure { from, to }
      if (loc.from || loc.to) {
        for (const pt of [loc.from, loc.to]) {
          if (pt?.iata && typeof pt.iata === 'string' && !map.has(pt.iata)) {
            map.set(pt.iata, { iata: pt.iata, name: pt.name || '' })
          }
        }
      // Ancienne structure { iata, name }
      } else if (loc.iata && !map.has(loc.iata)) {
        map.set(loc.iata, { iata: loc.iata, name: loc.name || '' })
      }
    }
  })
  return Array.from(map.values()).sort((a, b) => a.iata.localeCompare(b.iata))
})

// ─── Mutation formData ───────────────────────────────────────────────────────
type Section = 'departure' | 'arrival'
type Side    = 'from' | 'to'

const setPoint = (section: Section, side: Side, iata: string, name: string) => {
  props.formData[section][side].iata = iata
  props.formData[section][side].name = name
}

// ─── Validation horaires ─────────────────────────────────────────────────────
const validateTimes = () => {
  timeValidationError.value = ''
  if (props.formData.departure_time && props.formData.arrival_time) {
    const dep = new Date(props.formData.departure_time)
    const arr = new Date(props.formData.arrival_time)
    if (dep >= arr)
      timeValidationError.value = "L'heure d'arrivée doit être postérieure à l'heure de départ"
  }
}
</script>

<style scoped>
.animate-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>