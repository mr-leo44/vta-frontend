<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Modifier le vol' : 'Nouveau vol' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Modifier les informations du vol' : 'Remplissez les informations du vol à créer' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Informations de base -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Informations de base</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <Label for="flight_number">Numéro de vol <span class="text-destructive">*</span></Label>
              <Input
                id="flight_number"
                v-model="formData.flight_number"
                placeholder="Ex: AF1234"
                :class="{ 'border-destructive': errors.flight_number }"
              />
              <p v-if="errors.flight_number" class="text-sm text-destructive mt-1">{{ errors.flight_number }}</p>
            </div>

            <div class="col-span-2">
              <Label for="operator_id">Exploitant <span class="text-destructive">*</span></Label>
              <Select v-model="formData.operator_id">
                <SelectTrigger :class="{ 'border-destructive': errors.operator_id }">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="operator in operators" :key="operator.id" :value="operator.id.toString()">
                    {{ operator.name }} ({{ operator.sigle }})
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.operator_id" class="text-sm text-destructive mt-1">{{ errors.operator_id }}</p>
            </div>

            <div class="col-span-2">
              <Label for="aircraft_id">Aéronef <span class="text-destructive">*</span></Label>
              <Select v-model="formData.aircraft_id">
                <SelectTrigger :class="{ 'border-destructive': errors.aircraft_id }">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="aircraft in aircrafts" :key="aircraft.id" :value="aircraft.id.toString()">
                    {{ aircraft.immatriculation }} ({{ aircraft.type?.name }})
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.aircraft_id" class="text-sm text-destructive mt-1">{{ errors.aircraft_id }}</p>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Itinéraire -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Itinéraire</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="departure">Départ <span class="text-destructive">*</span></Label>
              <Input
                id="departure"
                v-model="formData.departure"
                placeholder="Ex: CDG"
                :class="{ 'border-destructive': errors.departure }"
              />
              <p v-if="errors.departure" class="text-sm text-destructive mt-1">{{ errors.departure }}</p>
            </div>

            <div>
              <Label for="arrival">Arrivée <span class="text-destructive">*</span></Label>
              <Input
                id="arrival"
                v-model="formData.arrival"
                placeholder="Ex: JFK"
                :class="{ 'border-destructive': errors.arrival }"
              />
              <p v-if="errors.arrival" class="text-sm text-destructive mt-1">{{ errors.arrival }}</p>
            </div>

            <div>
              <Label for="departure_time">Heure de départ <span class="text-destructive">*</span></Label>
              <Input
                id="departure_time"
                v-model="formData.departure_time"
                type="datetime-local"
                :class="{ 'border-destructive': errors.departure_time }"
              />
              <p v-if="errors.departure_time" class="text-sm text-destructive mt-1">{{ errors.departure_time }}</p>
            </div>

            <div>
              <Label for="arrival_time">Heure d'arrivée <span class="text-destructive">*</span></Label>
              <Input
                id="arrival_time"
                v-model="formData.arrival_time"
                type="datetime-local"
                :class="{ 'border-destructive': errors.arrival_time }"
              />
              <p v-if="errors.arrival_time" class="text-sm text-destructive mt-1">{{ errors.arrival_time }}</p>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Remarques -->
        <div>
          <Label for="remarks">Remarques</Label>
          <Textarea
            id="remarks"
            v-model="formData.remarks"
            placeholder="Remarques optionnelles..."
            rows="3"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="handleCancel" :disabled="loading">
            Annuler
          </Button>
          <Button type="submit" :disabled="loading || loadingData">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ isEdit ? 'Modifier' : 'Créer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import type { Flight, Operator, Aircraft } from '~/types/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps<{
  flight?: Flight | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const flightsStore = useFlightsStore()
const { success: showSuccess, error: showError } = useToast()
const { apiFetch } = useApi()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isEdit = computed(() => !!props.flight)

const loading = ref(false)
const loadingData = ref(false)
const errors = ref<Record<string, string>>({})

const operators = ref<Operator[]>([])
const aircrafts = ref<Aircraft[]>([])

const formData = ref({
  flight_number: '',
  operator_id: '',
  aircraft_id: '',
  departure: '',
  arrival: '',
  departure_time: '',
  arrival_time: '',
  remarks: ''
})

const loadFormData = async () => {
  loadingData.value = true
  try {
    const [operatorsRes, aircraftsRes] = await Promise.all([
      apiFetch<any>('/operators?per_page=1000'),
      apiFetch<any>('/aircrafts')
    ])
    
    operators.value = Array.isArray(operatorsRes) ? operatorsRes : (operatorsRes.data || [])
    aircrafts.value = Array.isArray(aircraftsRes) ? aircraftsRes : (aircraftsRes.data || [])
  } catch (error) {
    showError('Erreur lors du chargement des données')
  } finally {
    loadingData.value = false
  }
}

watch(() => props.flight, (flight) => {
  if (flight) {
    formData.value = {
      flight_number: flight.flight_number,
      operator_id: flight.operator_id?.toString() || '',
      aircraft_id: flight.aircraft_id?.toString() || '',
      departure: flight.departure?.[0] || '',
      arrival: flight.arrival?.[0] || '',
      departure_time: formatDateTimeForInput(flight.departure_time),
      arrival_time: formatDateTimeForInput(flight.arrival_time),
      remarks: flight.remarks || ''
    }
  }
}, { immediate: true })

watch(isOpen, (open) => {
  if (open) {
    loadFormData()
  } else if (!props.flight) {
    resetForm()
  }
})

const formatDateTimeForInput = (dateTime: string) => {
  const date = new Date(dateTime)
  return date.toISOString().slice(0, 16)
}

const resetForm = () => {
  formData.value = {
    flight_number: '',
    operator_id: '',
    aircraft_id: '',
    departure: '',
    arrival: '',
    departure_time: '',
    arrival_time: '',
    remarks: ''
  }
  errors.value = {}
}

const handleCancel = () => {
  isOpen.value = false
  if (!isEdit.value) {
    resetForm()
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.flight_number) {
    errors.value.flight_number = 'Le numéro de vol est requis'
  }
  if (!formData.value.operator_id) {
    errors.value.operator_id = 'L\'exploitant est requis'
  }
  if (!formData.value.aircraft_id) {
    errors.value.aircraft_id = 'L\'aéronef est requis'
  }
  if (!formData.value.departure) {
    errors.value.departure = 'L\'aéroport de départ est requis'
  }
  if (!formData.value.arrival) {
    errors.value.arrival = 'L\'aéroport d\'arrivée est requis'
  }
  if (!formData.value.departure_time) {
    errors.value.departure_time = 'L\'heure de départ est requise'
  }
  if (!formData.value.arrival_time) {
    errors.value.arrival_time = 'L\'heure d\'arrivée est requise'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showError('Veuillez corriger les erreurs dans le formulaire')
    return
  }

  loading.value = true

  const payload = {
    flight_number: formData.value.flight_number,
    operator_id: parseInt(formData.value.operator_id),
    aircraft_id: parseInt(formData.value.aircraft_id),
    departure: [formData.value.departure],
    arrival: [formData.value.arrival],
    departure_time: new Date(formData.value.departure_time).toISOString(),
    arrival_time: new Date(formData.value.arrival_time).toISOString(),
    remarks: formData.value.remarks || null
  }

  let result
  if (isEdit.value && props.flight) {
    result = await flightsStore.updateFlight(props.flight.id, payload)
  } else {
    result = await flightsStore.createFlight(payload)
  }

  loading.value = false

  if (result.success) {
    showSuccess(isEdit.value ? 'Vol modifié avec succès' : 'Vol créé avec succès')
    isOpen.value = false
    resetForm()
    emit('success')
  } else {
    if (result.errors) {
      errors.value = {}
      Object.entries(result.errors).forEach(([key, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          errors.value[key] = messages[0]
        }
      })
    }
    showError(result.message || 'Une erreur est survenue')
  }
}

onMounted(() => {
  if (isOpen.value) {
    loadFormData()
  }
})
</script>