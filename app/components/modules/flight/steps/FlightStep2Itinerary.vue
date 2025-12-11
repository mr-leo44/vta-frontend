<template>
  <div class="space-y-5 animate-in fade-in-50">
    <!-- Departure Airport -->
    <div class="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
      <AirportAutocomplete
        :model-value="formData.departure"
        @update:model-value="(val) => formData.departure = val"
        label="Aéroport de départ"
        label-class="text-base font-semibold flex items-center gap-2 mb-3"
        :error-iata="errors['departure.iata']"
        :error-name="errors['departure.name']"
      >
        <template #label>
          <MapPin class="h-4 w-4 text-blue-600" />
          Aéroport de départ
        </template>
      </AirportAutocomplete>
    </div>

    <!-- Arrival Airport -->
    <div class="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
      <AirportAutocomplete
        :model-value="formData.arrival"
        @update:model-value="(val) => formData.arrival = val"
        label="Aéroport d'arrivée"
        label-class="text-base font-semibold flex items-center gap-2 mb-3"
        :error-iata="errors['arrival.iata']"
        :error-name="errors['arrival.name']"
      >
        <template #label>
          <MapPin class="h-4 w-4 text-green-600" />
          Aéroport d'arrivée
        </template>
      </AirportAutocomplete>
    </div>

    <!-- Times -->
    <div class="space-y-3">
      <Label class="text-sm font-semibold flex items-center gap-2">
        <Clock class="h-4 w-4" />
        Horaires
      </Label>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label for="departure_time" class="text-xs text-muted-foreground mb-1 block">
            Départ
          </Label>
          <Input 
            id="departure_time" 
            v-model="formData.departure_time" 
            type="datetime-local" 
            class="text-base"
            :class="{ 'border-destructive': errors.departure_time }" 
            @change="validateTimes"
          />
          <p v-if="errors.departure_time" class="text-xs text-destructive mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ errors.departure_time }}
          </p>
        </div>
        <div>
          <Label for="arrival_time" class="text-xs text-muted-foreground mb-1 block">
            Arrivée
          </Label>
          <Input 
            id="arrival_time" 
            v-model="formData.arrival_time" 
            type="datetime-local" 
            class="text-base"
            :class="{ 'border-destructive': errors.arrival_time || timeValidationError }" 
            @change="validateTimes"
          />
          <p v-if="errors.arrival_time" class="text-xs text-destructive mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ errors.arrival_time }}
          </p>
          <p v-else-if="timeValidationError" class="text-xs text-destructive mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ timeValidationError }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MapPin, Clock, AlertCircle } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import AirportAutocomplete from '~/components/modules/flight/AirportAutocomplete.vue'
import type { FlightFormData } from '~/types/api'

interface Props {
  formData: FlightFormData
  errors: Record<string, string>
}

const props = defineProps<Props>()

const timeValidationError = ref<string>('')

const validateTimes = () => {
  timeValidationError.value = ''
  
  if (props.formData.departure_time && props.formData.arrival_time) {
    const departureDate = new Date(props.formData.departure_time)
    const arrivalDate = new Date(props.formData.arrival_time)
    
    if (departureDate <= arrivalDate) {
      timeValidationError.value = "L'heure de départ doit être postérieure à l'heure d'arrivée"
    }
  }
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