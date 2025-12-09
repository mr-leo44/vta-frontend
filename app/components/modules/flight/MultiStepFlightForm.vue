<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-3xl max-h-[95vh] overflow-y-auto p-0">
      <div class="sticky top-0 z-50 bg-background border-b">
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-center justify-between mb-4">
            <div>
              <DialogTitle class="text-2xl font-bold">
                {{ isEdit ? '✏️ Modifier le vol' : '✈️ Nouveau vol' }}
              </DialogTitle>
              <DialogDescription class="text-sm mt-1">
                {{ stepTitles[currentStep - 1] }}
              </DialogDescription>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-sm font-semibold text-muted-foreground">
                Étape {{ currentStep }}/4
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                @click="handleClose"
                class="text-muted-foreground hover:text-foreground"
              >
                <X class="h-5 w-5" />
              </Button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-3">
            <div class="flex justify-between gap-2">
              <div 
                v-for="(title, idx) in stepTitles" 
                :key="idx" 
                class="flex-1 text-xs text-center"
                :class="idx + 1 <= currentStep ? 'text-primary font-semibold' : 'text-muted-foreground'"
              >
                <div class="flex items-center justify-center mb-1">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    :class="[
                      idx + 1 <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    ]"
                  >
                    {{ idx + 1 <= currentStep ? '✓' : idx + 1 }}
                  </div>
                </div>
                <span class="hidden sm:inline">{{ title }}</span>
              </div>
            </div>
            <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                class="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                :style="{ width: `${(currentStep / 4) * 100}%` }" 
              />
            </div>
          </div>
          
          <!-- Status Select (Outside Steps) - Only in Edit Mode -->
          <Transition name="slide-fade">
            <div v-if="isEdit" class="mt-4 pt-4 border-t">
              <Label class="text-sm font-medium mb-2 block">Statut du vol</Label>
              <Select v-model="formData.status">
                <SelectTrigger class="h-10">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prevu">
                    <span class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                      Prévu
                    </span>
                  </SelectItem>
                  <SelectItem value="atteri">
                    <span class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-green-500"></div>
                      Atterri
                    </span>
                  </SelectItem>
                  <SelectItem value="qrf">
                    <span class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                      QRF
                    </span>
                  </SelectItem>
                  <SelectItem value="annule">
                    <span class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-red-500"></div>
                      Annulé
                    </span>
                  </SelectItem>
                  <SelectItem value="detourne">
                    <span class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                      Détourné
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Transition>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit" class="px-6 py-6 space-y-6">
        <!-- STEP 1: Flight Info -->
        <Transition name="fade" mode="out-in">
          <FlightStep1BasicInfo
            v-if="currentStep === 1"
            key="step1"
            :form-data="formData"
            :errors="errors"
            :operators="operators"
            :aircrafts="aircrafts"
            :selected-operator-label="selectedOperatorLabel"
            :selected-aircraft-label="selectedAircraftLabel"
            @update:selected-operator-label="selectedOperatorLabel = $event"
            @update:selected-aircraft-label="selectedAircraftLabel = $event"
            @operator-changed="handleOperatorChange"
          />
        </Transition>

        <!-- STEP 2: Itinerary -->
        <Transition name="fade" mode="out-in">
          <FlightStep2Itinerary
            v-if="currentStep === 2"
            key="step2"
            :form-data="formData"
            :errors="errors"
          />
        </Transition>

        <!-- STEP 3: Freights -->
        <Transition name="fade" mode="out-in">
          <FlightStep3Freights
            v-if="currentStep === 3"
            key="step3"
            :form-data="formData"
          />
        </Transition>

        <!-- STEP 4: Passengers & Justifications -->
        <Transition name="fade" mode="out-in">
          <FlightStep4Passengers
            v-if="currentStep === 4"
            key="step4"
            :form-data="formData"
            :errors="errors"
            :passengers-ecart="formData_passengers_ecart"
          />
        </Transition>

        <!-- Navigation Buttons -->
        <div class="flex gap-3 pt-6 border-t sticky bottom-0 bg-background">
          <Button 
            type="button" 
            variant="outline" 
            :disabled="currentStep === 1" 
            @click="previousStep" 
            class="flex-1"
          >
            <ChevronLeft class="mr-2 h-4 w-4" />
            Précédent
          </Button>

          <Button 
            type="button" 
            v-if="currentStep < 4" 
            @click="nextStep"
            class="flex-1 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Suivant
            <ChevronRight class="ml-2 h-4 w-4" />
          </Button>
          <Button 
            v-else 
            type="submit"
            class="flex-1 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Check class="mr-2 h-4 w-4" />
            {{ isEdit ? 'Modifier' : 'Créer' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { Flight } from '~/types/api'
import FlightStep1BasicInfo from '@/components/modules/flight/steps/FlightStep1BasicInfo.vue'
import FlightStep2Itinerary from '@/components/modules/flight/steps/FlightStep2Itinerary.vue'
import FlightStep3Freights from '@/components/modules/flight/steps/FlightStep3Freights.vue'
import FlightStep4Passengers from '@/components/modules/flight/steps/FlightStep4Passengers.vue'
import { useFlightForm } from '@/composables/useFlightForm'

interface Props {
  open?: boolean
  flight?: Flight
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'submit'): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})

const emit = defineEmits<Emits>()

const flightsStore = useFlightsStore()
const aircraftsStore = useAircraftsStore()
const operatorsStore = useOperatorsStore()
const { success: showSuccess, error: showError } = useToast()

// Use composable
const { 
  formData, 
  errors, 
  formData_passengers_ecart,
  validateForm,
  resetForm,
  loadFlightData
} = useFlightForm()

// State
const currentStep = ref(1)
const stepTitles = ['Infos de base', 'Itinéraire', 'Frets & Excédents', 'Passagers & Justifications']
const isEdit = computed(() => !!props.flight)
const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const selectedOperatorLabel = ref('')
const selectedAircraftLabel = ref('')

const operators = computed(() => operatorsStore.allOperators)
const aircrafts = computed(() => aircraftsStore.allAircrafts)

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleClose = () => {
  if (!isEdit.value) {
    resetForm()
  }
  currentStep.value = 1
  isOpen.value = false
}

const handleOperatorChange = async (operatorId: number) => {
  const response = await operatorsStore.fetchOperator(operatorId)

  if (response.success && response.data) {
    const operator = response.data
    
    const flightType = typeof operator.flight_type === 'string' 
      ? operator.flight_type 
      : operator.flight_type?.value ?? 'regular'
    
    const flightNature = typeof operator.flight_nature === 'string' 
      ? operator.flight_nature 
      : operator.flight_nature?.value ?? 'commercial'
    
    formData.value.flight_type = flightType
    formData.value.flight_nature = flightNature
  }
}

const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      return
    }

    // Calculate and add passengers_ecart
    formData.value.statistics!.passengers_ecart = formData_passengers_ecart.value

    if (isEdit.value && props.flight) {
      await flightsStore.updateFlight(props.flight.id, formData.value)
      showSuccess('Vol modifié avec succès')
    } else {
      await flightsStore.createFlight(formData.value)
      showSuccess('Vol créé avec succès')
    }
    
    emit('submit')
    resetForm()
    currentStep.value = 1
    isOpen.value = false
    
  } catch (error: any) {
    showError(error.message || 'Une erreur est survenue')
  }
}

const initializeForm = () => {
  if (isEdit.value && props.flight) {
    loadFlightData(props.flight)
    
    // Set labels
    selectedOperatorLabel.value = props.flight.operator
      ? `${props.flight.operator.name} (${props.flight.operator.sigle})`
      : ''
    selectedAircraftLabel.value = String(props.flight.aircraft?.immatriculation || '')
  } else {
    resetForm()
    selectedOperatorLabel.value = ''
    selectedAircraftLabel.value = ''
  }
}

watch(isOpen, async (newVal) => {
  if (newVal) {
    if (operatorsStore.allOperators.length === 0) {
      await operatorsStore.fetchAllOperators()
    }
    if (aircraftsStore.allAircrafts.length === 0) {
      await aircraftsStore.fetchAllAircrafts()
    }

    initializeForm()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>