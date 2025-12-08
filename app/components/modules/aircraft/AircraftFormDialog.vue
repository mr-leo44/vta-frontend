<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Modifier l\'aéronef' : 'Nouvel aéronef' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Modifier les informations de l\'aéronef' : 'Remplissez les informations de l\'aéronef à créer' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <!-- Immatriculation -->
          <div class="col-span-2">
            <Label for="immatriculation">Immatriculation <span class="text-destructive">*</span></Label>
            <Input id="immatriculation" v-model="formData.immatriculation" placeholder="Ex: F-HREV" class="font-mono"
              :class="{ 'border-destructive': errors.immatriculation }" />
            <p v-if="errors.immatriculation" class="text-sm text-destructive mt-1">{{ errors.immatriculation }}</p>
          </div>
          <!-- Type d'aéronef -->
          <div class="col-span-2">
            <Label for="aircraft_type_id">Type d'aéronef <span class="text-destructive">*</span></Label>
            <Select v-model="formData.aircraft_type_id">
              <SelectTrigger :class="{ 'border-destructive': errors.aircraft_type_id }">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in aircraftTypes" :key="type.id" :value="type.id.toString()">
                  {{ type.name }} ({{ type.sigle }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.aircraft_type_id" class="text-sm text-destructive mt-1">{{ errors.aircraft_type_id }}</p>
          </div>

          <!-- Exploitant -->
          <div class="col-span-2">
            <Label for="operator_id">Exploitant <span class="text-destructive">*</span></Label>
            <Select v-model="formData.operator_id">
              <SelectTrigger :class="{ 'border-destructive': errors.operator_id }">
                <SelectValue placeholder="Sélectionner un exploitant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="operator in operators" :key="operator.id" :value="operator.id.toString()">
                  {{ operator.name }} ({{ operator.sigle }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.operator_id" class="text-sm text-destructive mt-1">{{ errors.operator_id }}</p>
          </div>

          <!-- PMAD -->
          <div>
            <Label for="pmad">PMAD (kg)</Label>
            <Input id="pmad" v-model.number="formData.pmad" type="number" placeholder="Ex: 79000"
              :class="{ 'border-destructive': errors.pmad }" />
            <p v-if="errors.pmad" class="text-sm text-destructive mt-1">{{ errors.pmad }}</p>
          </div>

          <!-- Statut -->
          <div>
            <Label for="in_activity">Statut <span class="text-destructive">*</span></Label>
            <Select v-model="formData.in_activity">
              <SelectTrigger :class="{ 'border-destructive': errors.in_activity }">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">En activité</SelectItem>
                <SelectItem value="false">Inactif</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.in_activity" class="text-sm text-destructive mt-1">{{ errors.in_activity }}</p>
          </div>
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
import type { Aircraft, AircraftType, Operator } from '~/types/api'
import { aircraftFormSchema, type AircraftFormSchema } from '~/schemas/aircraft.schema'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useAircraftsStore } from '~/stores/aircrafts'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  aircraft?: Aircraft | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const aircraftsStore = useAircraftsStore()
const { success: showSuccess, error: showError } = useToast()
const { apiFetch } = useApi()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isEdit = computed(() => !!props.aircraft)

const loading = ref(false)
const loadingData = ref(false)
const errors = ref<Partial<Record<keyof AircraftFormSchema, string>>>({})

const aircraftTypes = ref<AircraftType[]>([])
const operators = ref<Operator[]>([])

const formData = ref<any>({
  immatriculation: '',
  pmad: null,
  in_activity: 'true',
  aircraft_type_id: '',
  operator_id: ''
})

// Charger les types d'aéronefs et opérateurs
const loadFormData = async () => {
  loadingData.value = true
  try {
    const [typesRes, operatorsRes] = await Promise.all([
      apiFetch<{ data: AircraftType[] }>('/aircraft-types/all'),
      apiFetch<{ data: Operator[] }>('/operators/all')
    ])
    aircraftTypes.value = typesRes.data || []
    operators.value = operatorsRes.data || []
    
    // Une fois les données chargées, initialiser le formulaire si en mode édition
    if (props.aircraft) {
      initializeForm(props.aircraft)
    }
  } catch (error) {
    showError('Erreur lors du chargement des données')
  } finally {
    loadingData.value = false
  }
}

// Initialiser le formulaire avec les données de l'aircraft
const initializeForm = (aircraft: Aircraft) => {
  formData.value = {
    immatriculation: aircraft.immatriculation,
    pmad: aircraft.pmad,
    in_activity: aircraft.in_activity ? 'true' : 'false',
    aircraft_type_id: aircraft.type.id.toString(),
    operator_id: aircraft.operator.id.toString()
  }
}

// Surveiller les changements de props.aircraft ET de props.open
watch([() => props.aircraft, () => props.open], ([aircraft, open]) => {
  if (open && aircraft && aircraftTypes.value.length > 0 && operators.value.length > 0) {
    initializeForm(aircraft)
  }
}, { immediate: true })

// Surveiller l'ouverture du dialog
watch(isOpen, async (open) => {
  if (open) {
    await loadFormData()
    // Re-initialiser après le chargement si en mode édition
    if (props.aircraft) {
      initializeForm(props.aircraft)
    }
  } else if (!isEdit.value) {
    resetForm()
  }
})

const resetForm = () => {
  formData.value = {
    immatriculation: '',
    pmad: null,
    in_activity: 'true',
    aircraft_type_id: '',
    operator_id: ''
  }
  errors.value = {}
}

const handleCancel = () => {
  isOpen.value = false
  if (!isEdit.value) {
    resetForm()
  }
}

const handleSubmit = async () => {
  errors.value = {}

  // Convert string values to proper types
  const dataToValidate = {
    ...formData.value,
    aircraft_type_id: parseInt(formData.value.aircraft_type_id as any) || 0,
    operator_id: parseInt(formData.value.operator_id as any) || 0,
    in_activity: formData.value.in_activity === 'true' || formData.value.in_activity === true
  }

  // Validation avec Zod
  const validation = aircraftFormSchema.safeParse(dataToValidate)

  if (!validation.success) {
    validation.error.errors.forEach(err => {
      if (err.path[0]) {
        errors.value[err.path[0] as keyof AircraftFormSchema] = err.message
      }
    })
    showError('Veuillez corriger les erreurs dans le formulaire')
    return
  }

  loading.value = true

  let result
  if (isEdit.value && props.aircraft) {
    result = await aircraftsStore.updateAircraft(props.aircraft.id, validation.data)
  } else {
    result = await aircraftsStore.createAircraft(validation.data)
  }

  loading.value = false

  if (result.success) {
    showSuccess(isEdit.value ? 'Aéronef modifié avec succès' : 'Aéronef créé avec succès')
    isOpen.value = false
    resetForm()
    emit('success')
  } else {
    if (result.errors) {
      Object.entries(result.errors).forEach(([key, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          errors.value[key as keyof AircraftFormSchema] = messages[0]
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