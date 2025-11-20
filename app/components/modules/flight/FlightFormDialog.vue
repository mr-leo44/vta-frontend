<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <PlaneTakeoff class="h-5 w-5" />
          {{ isEditing ? 'Modifier le vol' : 'Nouveau vol' }}
        </DialogTitle>
        <DialogDescription>
          {{ isEditing ? 'Modifiez les informations du vol' : 'Enregistrez un nouveau vol avec ses statistiques' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Informations principales -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold flex items-center gap-2">
            <Info class="h-4 w-4" />
            Informations du vol
          </h3>
          
          <div class="grid grid-cols-2 gap-4">
            <!-- Numéro de vol -->
            <div class="space-y-2">
              <Label for="flight_number">
                Numéro de vol <span class="text-destructive">*</span>
              </Label>
              <Input
                id="flight_number"
                v-model="formData.flight_number"
                placeholder="Ex: AA123"
                required
                :disabled="loading"
              />
            </div>

            <!-- Statut -->
            <div class="space-y-2">
              <Label for="status">Statut</Label>
              <Select v-model="formData.status">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qrf">QRF</SelectItem>
                  <SelectItem value="prevu">Prévu</SelectItem>
                  <SelectItem value="atteri">Atterri</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                  <SelectItem value="detourne">Détourné</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Opérateur (Autocomplete) -->
          <div class="space-y-2">
            <Label for="operator">
              Opérateur <span class="text-destructive">*</span>
            </Label>
            <Popover v-model:open="operatorOpen">
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  role="combobox"
                  :aria-expanded="operatorOpen"
                  class="w-full justify-between"
                  :disabled="loading"
                >
                  {{ selectedOperator?.name || "Sélectionner un opérateur..." }}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-full p-0">
                <Command>
                  <CommandInput placeholder="Rechercher un opérateur..." />
                  <CommandEmpty>Aucun opérateur trouvé.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      v-for="operator in operatorsStore.allOperators"
                      :key="operator.id"
                      :value="operator.id"
                      @select="selectOperator(operator)"
                    >
                      <Check
                        class="mr-2 h-4 w-4"
                        :class="formData.operator_id === operator.id ? 'opacity-100' : 'opacity-0'"
                      />
                      {{ operator.name }} ({{ operator.sigle }})
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <!-- Aéronef (Autocomplete) -->
          <div class="space-y-2">
            <Label for="aircraft">
              Aéronef <span class="text-destructive">*</span>
            </Label>
            <Popover v-model:open="aircraftOpen">
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  role="combobox"
                  :aria-expanded="aircraftOpen"
                  class="w-full justify-between"
                  :disabled="loading"
                >
                  {{ selectedAircraft?.immatriculation || "Sélectionner un aéronef..." }}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-full p-0">
                <Command>
                  <CommandInput placeholder="Rechercher un aéronef..." />
                  <CommandEmpty>Aucun aéronef trouvé.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      v-for="aircraft in aircraftsStore.allAircrafts"
                      :key="aircraft.id"
                      :value="aircraft.id"
                      @select="selectAircraft(aircraft)"
                    >
                      <Check
                        class="mr-2 h-4 w-4"
                        :class="formData.aircraft_id === aircraft.id ? 'opacity-100' : 'opacity-0'"
                      />
                      {{ aircraft.immatriculation }} - {{ aircraft.type?.name }}
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <!-- Classification -->
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label>Régime</Label>
              <Select v-model="formData.flight_regime">
                <SelectTrigger>
                  <SelectValue placeholder="Régime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domestic">Domestique</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>Type</Label>
              <Select v-model="formData.flight_type">
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Régulier</SelectItem>
                  <SelectItem value="non_regular">Non régulier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>Nature</Label>
              <Select v-model="formData.flight_nature">
                <SelectTrigger>
                  <SelectValue placeholder="Nature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="non_commercial">Non commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Itinéraire -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold flex items-center gap-2">
            <MapPin class="h-4 w-4" />
            Itinéraire
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <!-- Départ -->
            <div class="space-y-2">
              <Label>Aéroport de départ <span class="text-destructive">*</span></Label>
              <Input
                v-model="departureInput"
                placeholder="Ex: FIH, NBO, JNB"
                @keydown.enter.prevent="addDeparture"
              />
              <div v-if="formData.departure.length > 0" class="flex flex-wrap gap-2 mt-2">
                <Badge
                  v-for="(dep, index) in formData.departure"
                  :key="index"
                  variant="secondary"
                  class="gap-1"
                >
                  {{ dep }}
                  <button
                    type="button"
                    @click="removeDeparture(index)"
                    class="ml-1 hover:text-destructive"
                  >
                    <X class="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            </div>

            <!-- Arrivée -->
            <div class="space-y-2">
              <Label>Aéroport d'arrivée <span class="text-destructive">*</span></Label>
              <Input
                v-model="arrivalInput"
                placeholder="Ex: FIH, NBO, JNB"
                @keydown.enter.prevent="addArrival"
              />
              <div v-if="formData.arrival.length > 0" class="flex flex-wrap gap-2 mt-2">
                <Badge
                  v-for="(arr, index) in formData.arrival"
                  :key="index"
                  variant="secondary"
                  class="gap-1"
                >
                  {{ arr }}
                  <button
                    type="button"
                    @click="removeArrival(index)"
                    class="ml-1 hover:text-destructive"
                  >
                    <X class="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            </div>
          </div>

          <!-- Horaires -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Heure de départ <span class="text-destructive">*</span></Label>
              <Input
                type="datetime-local"
                v-model="formData.departure_time"
                required
              />
            </div>

            <div class="space-y-2">
              <Label>Heure d'arrivée <span class="text-destructive">*</span></Label>
              <Input
                type="datetime-local"
                v-model="formData.arrival_time"
                required
              />
            </div>
          </div>
        </div>

        <Separator />

        <!-- Statistiques -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold flex items-center gap-2">
              <Users class="h-4 w-4" />
              Statistiques du vol
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="showStatistics = !showStatistics"
            >
              {{ showStatistics ? 'Masquer' : 'Afficher' }}
              <ChevronDown :class="showStatistics ? 'rotate-180' : ''" class="ml-2 h-4 w-4 transition-transform" />
            </Button>
          </div>

          <div v-if="showStatistics" class="space-y-4 p-4 border rounded-lg">
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label>Passagers</Label>
                <Input
                  type="number"
                  v-model.number="formData.statistics.passengers_count"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div class="space-y-2">
                <Label>Pax Business</Label>
                <Input
                  type="number"
                  v-model.number="formData.statistics.pax_bus"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div class="space-y-2">
                <Label>Go Pass</Label>
                <Input
                  type="number"
                  v-model.number="formData.statistics.go_pass_count"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <!-- Justification -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <Checkbox
                  id="has_justification"
                  :checked="formData.statistics.has_justification"
                  @update:checked="formData.statistics.has_justification = $event"
                />
                <Label for="has_justification">Ce vol nécessite une justification</Label>
              </div>

              <div v-if="formData.statistics.has_justification" class="space-y-2">
                <div class="flex gap-2">
                  <Popover v-model:open="justificationOpen">
                    <PopoverTrigger as-child>
                      <Button
                        variant="outline"
                        class="flex-1 justify-between"
                      >
                        Sélectionner une justification
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher..." />
                        <CommandEmpty>
                          <div class="p-4 text-center space-y-2">
                            <p class="text-sm text-muted-foreground">Aucune justification trouvée</p>
                            <Button
                              size="sm"
                              @click="showNewJustification = true; justificationOpen = false"
                            >
                              <Plus class="mr-2 h-4 w-4" />
                              Créer une justification
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="justif in justificationsStore.justifications"
                            :key="justif.id"
                            @select="addJustification(justif)"
                          >
                            {{ justif.name }}
                          </CommandItem>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    @click="showNewJustification = true"
                  >
                    <Plus class="h-4 w-4" />
                  </Button>
                </div>

                <!-- Justifications sélectionnées -->
                <div v-if="selectedJustifications.length > 0" class="flex flex-wrap gap-2 mt-2">
                  <Badge
                    v-for="(justif, index) in selectedJustifications"
                    :key="index"
                    variant="default"
                    class="gap-1"
                  >
                    {{ justif.name }}
                    <button
                      type="button"
                      @click="removeJustification(index)"
                      class="ml-1 hover:text-destructive"
                    >
                      <X class="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Remarques -->
        <div class="space-y-2">
          <Label>Remarques</Label>
          <Textarea
            v-model="formData.remarks"
            placeholder="Notes additionnelles..."
            rows="3"
          />
        </div>

        <DialogFooter class="gap-2">
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
            :disabled="loading"
          >
            Annuler
          </Button>
          <Button type="submit" :disabled="loading || !isFormValid">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Check v-else class="mr-2 h-4 w-4" />
            {{ isEditing ? 'Mettre à jour' : 'Créer le vol' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <!-- Dialog pour créer une nouvelle justification -->
  <Dialog v-model:open="showNewJustification">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Nouvelle justification</DialogTitle>
      </DialogHeader>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="justif_name">Nom de la justification</Label>
          <Input
            id="justif_name"
            v-model="newJustificationName"
            placeholder="Ex: Problème technique"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          @click="showNewJustification = false"
        >
          Annuler
        </Button>
        <Button @click="createNewJustification" :disabled="!newJustificationName.trim()">
          Créer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  PlaneTakeoff,
  Info,
  MapPin,
  Users,
  Check,
  Loader2,
  X,
  ChevronDown,
  ChevronsUpDown,
  Plus
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import type { Flight, FlightFormData } from '~/types/api'

const props = defineProps<{
  open: boolean
  flight?: Flight | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [flight: Flight]
}>()

const flightsStore = useFlightsStore()
const operatorsStore = useOperatorsStore()
const aircraftsStore = useAircraftsStore()
const justificationsStore = useFlightJustificationsStore()
const { success: showSuccess, error: showError } = useToast()

const loading = ref(false)
const showStatistics = ref(true)
const operatorOpen = ref(false)
const aircraftOpen = ref(false)
const justificationOpen = ref(false)
const showNewJustification = ref(false)
const newJustificationName = ref('')

const departureInput = ref('')
const arrivalInput = ref('')
const selectedJustifications = ref<any[]>([])

const formData = ref<FlightFormData>({
  flight_number: '',
  operator_id: 0,
  aircraft_id: 0,
  departure: [],
  arrival: [],
  departure_time: '',
  arrival_time: '',
  flight_regime: 'domestic',
  flight_type: 'regular',
  flight_nature: 'commercial',
  status: 'prevu',
  remarks: null,
  statistics: {
    passengers_count: 0,
    pax_bus: 0,
    go_pass_count: 0,
    has_justification: false,
    justification: []
  }
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isEditing = computed(() => !!props.flight)

const selectedOperator = computed(() =>
  operatorsStore.allOperators.find(o => o.id === formData.value.operator_id)
)

const selectedAircraft = computed(() =>
  aircraftsStore.allAircrafts.find(a => a.id === formData.value.aircraft_id)
)

const isFormValid = computed(() => {
  return formData.value.flight_number.trim().length > 0 &&
         formData.value.operator_id > 0 &&
         formData.value.aircraft_id > 0 &&
         formData.value.departure.length > 0 &&
         formData.value.arrival.length > 0 &&
         formData.value.departure_time &&
         formData.value.arrival_time
})

watch(() => props.open, async (open) => {
  if (open) {
    await Promise.all([
      operatorsStore.fetchAllOperators(),
      aircraftsStore.fetchAllAircrafts(),
      justificationsStore.fetchJustifications()
    ])
    
    if (props.flight) {
      // TODO: Load flight data
    } else {
      resetForm()
    }
  }
})

const selectOperator = (operator: any) => {
  formData.value.operator_id = operator.id
  operatorOpen.value = false
}

const selectAircraft = (aircraft: any) => {
  formData.value.aircraft_id = aircraft.id
  aircraftOpen.value = false
}

const addDeparture = () => {
  if (departureInput.value.trim()) {
    formData.value.departure.push(departureInput.value.trim().toUpperCase())
    departureInput.value = ''
  }
}

const removeDeparture = (index: number) => {
  formData.value.departure.splice(index, 1)
}

const addArrival = () => {
  if (arrivalInput.value.trim()) {
    formData.value.arrival.push(arrivalInput.value.trim().toUpperCase())
    arrivalInput.value = ''
  }
}

const removeArrival = (index: number) => {
  formData.value.arrival.splice(index, 1)
}

const addJustification = (justification: any) => {
  if (!selectedJustifications.value.find(j => j.id === justification.id)) {
    selectedJustifications.value.push(justification)
    formData.value.statistics.justification = selectedJustifications.value
  }
  justificationOpen.value = false
}

const removeJustification = (index: number) => {
  selectedJustifications.value.splice(index, 1)
  formData.value.statistics.justification = selectedJustifications.value
}

const createNewJustification = async () => {
  if (!newJustificationName.value.trim()) return
  
  const result = await justificationsStore.createJustification(newJustificationName.value)
  if (result.success && result.data) {
    addJustification(result.data)
    showSuccess('Justification créée', 'La nouvelle justification a été ajoutée')
    newJustificationName.value = ''
    showNewJustification.value = false
  } else {
    showError('Erreur', result.message || 'Impossible de créer la justification')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  try {
    const result = isEditing.value
      ? await flightsStore.updateFlight(props.flight!.id, formData.value)
      : await flightsStore.createFlight(formData.value)

    if (result.success && result.data) {
      showSuccess(
        isEditing.value ? 'Vol modifié' : 'Vol créé',
        `Le vol ${result.data.flight_number} a été ${isEditing.value ? 'modifié' : 'créé'} avec succès.`
      )

      emit('success', result.data)
      resetForm()
      isOpen.value = false
    } else {
      throw new Error(result.message || 'Erreur inconnue')
    }
  } catch (error: any) {
    showError('Erreur', error?.message || 'Une erreur est survenue')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  if (!loading.value) {
    resetForm()
    isOpen.value = false
  }
}

const resetForm = () => {
  formData.value = {
    flight_number: '',
    operator_id: 0,
    aircraft_id: 0,
    departure: [],
    arrival: [],
    departure_time: '',
    arrival_time: '',
    flight_regime: 'domestic',
    flight_type: 'regular',
    flight_nature: 'commercial',
    status: 'prevu',
    remarks: null,
    statistics: {
      passengers_count: 0,
      pax_bus: 0,
      go_pass_count: 0,
      has_justification: false,
      justification: []
    }
  }
  departureInput.value = ''
  arrivalInput.value = ''
  selectedJustifications.value = []
}
</script>