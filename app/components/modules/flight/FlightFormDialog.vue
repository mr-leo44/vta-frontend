<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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

        <!-- Statistiques passagers -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">Statistiques passagers</h3>
            <Switch v-model:checked="includeStatistics" />
          </div>
          
          <div v-if="includeStatistics" class="grid grid-cols-3 gap-4">
            <div>
              <Label for="passengers_count">Nombre de passagers</Label>
              <Input
                id="passengers_count"
                v-model.number="formData.statistics.passengers_count"
                type="number"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <Label for="pax_bus">Passagers business</Label>
              <Input
                id="pax_bus"
                v-model.number="formData.statistics.pax_bus"
                type="number"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <Label for="go_pass_count">Go pass</Label>
              <Input
                id="go_pass_count"
                v-model.number="formData.statistics.go_pass_count"
                type="number"
                placeholder="0"
                min="0"
              />
            </div>

            <div class="col-span-3">
              <Label for="passengers_ecart">Écart passagers</Label>
              <Input
                id="passengers_ecart"
                v-model.number="formData.statistics.passengers_ecart"
                type="number"
                placeholder="0"
              />
              <p class="text-xs text-muted-foreground mt-1">
                Positif = surréservation, Négatif = sous-occupation
              </p>
            </div>

            <!-- Justification si écart -->
            <div v-if="formData.statistics.passengers_ecart !== 0" class="col-span-3 p-4 border rounded-lg bg-amber-50">
              <div class="flex items-start gap-2 mb-3">
                <AlertCircle class="h-4 w-4 text-amber-600 mt-0.5" />
                <div class="flex-1">
                  <Label class="text-amber-900">Justification requise</Label>
                  <p class="text-xs text-amber-700 mt-1">Un écart passagers nécessite une justification</p>
                </div>
                <Switch v-model:checked="formData.statistics.has_justification" />
              </div>

              <div v-if="formData.statistics.has_justification" class="space-y-3">
                <div>
                  <Label for="justification_id">Type de justification</Label>
                  <Select v-model="formData.statistics.justification_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une justification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="just in justifications" :key="just.id" :value="just.id.toString()">
                        {{ just.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label for="justification_comment">Commentaire (optionnel)</Label>
                  <Textarea
                    id="justification_comment"
                    v-model="formData.statistics.justification_comment"
                    placeholder="Détails supplémentaires..."
                    rows="2"
                  />
                </div>
              </div>
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
import { Loader2, AlertCircle } from 'lucide-vue-next'
import type { Flight } from '~/types/api'
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
import { Switch } from '@/components/ui/switch'
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
const dropdownData = useSharedDropdownData()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isEdit = computed(() => !!props.flight)

const loading = ref(false)
const loadingData = computed(() => dropdownData.loading.value)
const errors = ref<Record<string, string>>({})

const operators = computed(() => dropdownData.operators.value)
const aircrafts = computed(() => dropdownData.aircrafts.value)
const justifications = computed(() => dropdownData.justifications.value)

const includeStatistics = ref(false)

const formData = ref({
  flight_number: '',
  operator_id: '',
  aircraft_id: '',
  departure: '',
  arrival: '',
  departure_time: '',
  arrival_time: '',
  remarks: '',
  statistics: {
    passengers_count: 0,
    pax_bus: 0,
    go_pass_count: 0,
    passengers_ecart: 0,
    has_justification: false,
    justification_id: '',
    justification_comment: ''
  }
})

watch(() => props.flight, (flight) => {
  if (flight) {
    formData.value = {
      flight_number: flight.flight_number,
      operator_id: flight.operator?.id?.toString() || '',
      aircraft_id: flight.aircraft_id?.toString() || '',
      departure: flight.departure?.[0] || '',
      arrival: flight.arrival?.[0] || '',
      departure_time: formatDateTimeForInput(flight.departure_time),
      arrival_time: formatDateTimeForInput(flight.arrival_time),
      remarks: flight.remarks || '',
      statistics: {
        passengers_count: flight.statistics?.passengers_count || 0,
        pax_bus: flight.statistics?.pax_bus || 0,
        go_pass_count: flight.statistics?.go_pass_count || 0,
        passengers_ecart: flight.statistics?.passengers_ecart || 0,
        has_justification: flight.statistics?.has_justification || false,
        justification_id: '',
        justification_comment: ''
      }
    }
    includeStatistics.value = !!flight.statistics
  }
}, { immediate: true })

watch(isOpen, async (open) => {
  if (open) {
    await Promise.all([
      dropdownData.loadOperators(),
      dropdownData.loadAircrafts(),
      dropdownData.loadJustifications()
    ])
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
    remarks: '',
    statistics: {
      passengers_count: 0,
      pax_bus: 0,
      go_pass_count: 0,
      passengers_ecart: 0,
      has_justification: false,
      justification_id: '',
      justification_comment: ''
    }
  }
  includeStatistics.value = false
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
  
  // Validation des statistiques
  if (includeStatistics.value && formData.value.statistics.passengers_ecart !== 0) {
    if (formData.value.statistics.has_justification && !formData.value.statistics.justification_id) {
      errors.value.justification_id = 'Veuillez sélectionner une justification'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showError('Veuillez corriger les erreurs dans le formulaire')
    return
  }

  loading.value = true

  const payload: any = {
    flight_number: formData.value.flight_number,
    operator_id: parseInt(formData.value.operator_id),
    aircraft_id: parseInt(formData.value.aircraft_id),
    departure: [formData.value.departure],
    arrival: [formData.value.arrival],
    departure_time: new Date(formData.value.departure_time).toISOString(),
    arrival_time: new Date(formData.value.arrival_time).toISOString(),
    remarks: formData.value.remarks || null
  }

  // Ajouter les statistiques si activées
  if (includeStatistics.value) {
    payload.statistics = {
      passengers_count: formData.value.statistics.passengers_count,
      pax_bus: formData.value.statistics.pax_bus,
      go_pass_count: formData.value.statistics.go_pass_count,
      passengers_ecart: formData.value.statistics.passengers_ecart,
      has_justification: formData.value.statistics.has_justification
    }

    // Ajouter la justification si nécessaire
    if (formData.value.statistics.has_justification && formData.value.statistics.justification_id) {
      payload.statistics.justification_id = parseInt(formData.value.statistics.justification_id)
      payload.statistics.justification_comment = formData.value.statistics.justification_comment || null
    }
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

onMounted(async () => {
  if (isOpen.value) {
    await Promise.all([
      dropdownData.loadOperators(),
      dropdownData.loadAircrafts(),
      dropdownData.loadJustifications()
    ])
  }
})
</script>