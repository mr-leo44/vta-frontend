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
            <Input 
              id="immatriculation" 
              v-model="formData.immatriculation" 
              placeholder="Ex: F-HREV" 
              class="font-mono"
              :class="{ 'border-destructive': errors.immatriculation }" 
            />
            <p v-if="errors.immatriculation" class="text-sm text-destructive mt-1">{{ errors.immatriculation }}</p>
          </div>
          
          <!-- Type d'aéronef avec Command -->
          <div class="col-span-2">
            <Label for="aircraft_type_id">Type d'aéronef <span class="text-destructive">*</span></Label>
            <Popover v-model:open="typePopoverOpen">
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  role="combobox"
                  :aria-expanded="typePopoverOpen"
                  class="w-full justify-between"
                  :class="{ 'border-destructive': errors.aircraft_type_id }"
                >
                  {{ selectedTypeLabel || "Sélectionner un type..." }}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-full p-0">
                <Command v-model:search-term="typeSearchTerm">
                  <CommandInput placeholder="Rechercher un type..." />
                  <CommandEmpty>Aucun type trouvé</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        v-for="type in filteredAircraftTypes"
                        :key="type.id"
                        :value="type.id.toString()"
                        @select="selectType(type)"
                      >
                        <Check
                          :class="[
                            'mr-2 h-4 w-4',
                            formData.aircraft_type_id === type.id.toString() ? 'opacity-100' : 'opacity-0'
                          ]"
                        />
                        <div class="flex items-center gap-2">
                          <span class="font-medium">{{ type.name }}</span>
                          <Badge variant="secondary" class="text-xs">{{ type.sigle }}</Badge>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p v-if="errors.aircraft_type_id" class="text-sm text-destructive mt-1">{{ errors.aircraft_type_id }}</p>
          </div>

          <!-- Exploitant avec Command -->
          <div class="col-span-2">
            <Label for="operator_id">Exploitant <span class="text-destructive">*</span></Label>
            <Popover v-model:open="operatorPopoverOpen">
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  role="combobox"
                  :aria-expanded="operatorPopoverOpen"
                  class="w-full justify-between"
                  :class="{ 'border-destructive': errors.operator_id }"
                >
                  {{ selectedOperatorLabel || "Sélectionner un exploitant..." }}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-full p-0">
                <Command v-model:search-term="operatorSearchTerm">
                  <CommandInput placeholder="Rechercher un exploitant..." />
                  <CommandEmpty>Aucun exploitant trouvé</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        v-for="operator in filteredOperators"
                        :key="operator.id"
                        :value="operator.id.toString()"
                        @select="selectOperator(operator)"
                      >
                        <Check
                          :class="[
                            'mr-2 h-4 w-4',
                            formData.operator_id === operator.id.toString() ? 'opacity-100' : 'opacity-0'
                          ]"
                        />
                        <div class="flex items-center gap-2">
                          <span class="font-medium">{{ operator.name }}</span>
                          <Badge variant="secondary" class="text-xs">{{ operator.sigle }}</Badge>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p v-if="errors.operator_id" class="text-sm text-destructive mt-1">{{ errors.operator_id }}</p>
          </div>

          <!-- PMAD -->
          <div class="col-span-2">
            <div class="flex items-center justify-between mb-2">
              <Label for="pmad">PMAD (kg)</Label>
              <Button 
                v-if="!isPmadManual && formData.pmad" 
                type="button" 
                variant="ghost" 
                size="sm"
                @click="isPmadManual = true"
                class="h-auto py-1 px-2 text-xs"
              >
                Saisir manuellement
              </Button>
            </div>
            <Input 
              id="pmad" 
              v-model.number="formData.pmad" 
              type="number" 
              placeholder="Ex: 79000"
              :class="{ 'border-destructive': errors.pmad }"
              :disabled="!isPmadManual && !isEdit && formData.pmad !== null" 
            />
            <p v-if="errors.pmad" class="text-sm text-destructive mt-1">{{ errors.pmad }}</p>
            <p v-if="!isPmadManual && formData.pmad && !isEdit" class="text-sm text-muted-foreground mt-1">
              PMAD par défaut du type d'aéronef
            </p>
          </div>

          <!-- Statut -->
          <div class="col-span-2">
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
import { Loader2, ChevronsUpDown, Check } from 'lucide-vue-next'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
const isPmadManual = ref(false)

// Popover states
const typePopoverOpen = ref(false)
const operatorPopoverOpen = ref(false)
const typeSearchTerm = ref('')
const operatorSearchTerm = ref('')
const selectedTypeLabel = ref('')
const selectedOperatorLabel = ref('')

const formData = ref<any>({
  immatriculation: '',
  pmad: null,
  in_activity: 'true',
  aircraft_type_id: '',
  operator_id: ''
})

// Filtered lists
const filteredAircraftTypes = computed(() => {
  if (!typeSearchTerm.value) return aircraftTypes.value
  return aircraftTypes.value.filter(type =>
    type.name.toLowerCase().includes(typeSearchTerm.value.toLowerCase()) ||
    type.sigle.toLowerCase().includes(typeSearchTerm.value.toLowerCase())
  )
})

const filteredOperators = computed(() => {
  if (!operatorSearchTerm.value) return operators.value
  return operators.value.filter(operator =>
    operator.name.toLowerCase().includes(operatorSearchTerm.value.toLowerCase()) ||
    operator.sigle.toLowerCase().includes(operatorSearchTerm.value.toLowerCase())
  )
})

// Selection handlers
const selectType = (type: AircraftType) => {
  formData.value.aircraft_type_id = type.id.toString()
  selectedTypeLabel.value = `${type.name} (${type.sigle})`
  typePopoverOpen.value = false
  typeSearchTerm.value = ''
}

const selectOperator = (operator: Operator) => {
  formData.value.operator_id = operator.id.toString()
  selectedOperatorLabel.value = `${operator.name} (${operator.sigle})`
  operatorPopoverOpen.value = false
  operatorSearchTerm.value = ''
}

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
  selectedTypeLabel.value = `${aircraft.type.name} (${aircraft.type.sigle})`
  selectedOperatorLabel.value = `${aircraft.operator.name} (${aircraft.operator.sigle})`
}

// Surveiller les changements de type d'aéronef pour précharger le PMAD
watch(() => formData.value.aircraft_type_id, (newTypeId) => {
  if (!isEdit.value && newTypeId && !isPmadManual.value) {
    const selectedType = aircraftTypes.value.find(type => type.id.toString() === newTypeId)
    if (selectedType && selectedType.default_pmad && selectedType.default_pmad > 0) {
      formData.value.pmad = selectedType.default_pmad
    } else {
      formData.value.pmad = null
    }
  }
})

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
  isPmadManual.value = false
  selectedTypeLabel.value = ''
  selectedOperatorLabel.value = ''
  typeSearchTerm.value = ''
  operatorSearchTerm.value = ''
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