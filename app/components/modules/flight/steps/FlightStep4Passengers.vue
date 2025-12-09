<template>
  <div class="space-y-5 animate-in fade-in-50">
    <!-- Passenger Statistics -->
    <Card class="border-2 border-purple-200/50 dark:border-purple-800/50">
      <CardHeader class="pb-3">
        <CardTitle class="text-base flex items-center gap-2">
          <Users class="h-4 w-4 text-purple-600" />
          Statistiques passagers
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label class="text-sm font-medium mb-2 block">Nombre de passagers</Label>
            <Input 
              v-model.number="formData.statistics!.passengers_count" 
              type="number" 
              min="0"
              placeholder="0" 
              class="text-base font-semibold" 
            />
          </div>
          <div>
            <Label class="text-sm font-medium mb-2 block">Go Pass Count</Label>
            <Input 
              v-model.number="formData.statistics!.go_pass_count" 
              type="number" 
              min="0" 
              placeholder="0"
              class="text-base font-semibold" 
            />
          </div>
          <div>
            <Label class="text-sm font-medium mb-2 block">Pax bus</Label>
            <Input 
              v-model.number="formData.statistics!.pax_bus" 
              type="number" 
              min="0" 
              placeholder="0"
              class="text-base" 
            />
          </div>
          <div>
            <Label class="text-sm font-medium mb-2 block">Écart</Label>
            <div
              class="flex items-center h-10 px-3 border rounded-md bg-muted text-muted-foreground font-semibold"
            >
              {{ passengersEcart > 0 ? '+' : '' }}{{ passengersEcart }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Justifications Section -->
    <JustificationsSection
      v-if="formData.statistics!.passengers_count > formData.statistics!.go_pass_count"
      :form-data="formData"
      :passengers-ecart="passengersEcart"
      :errors="errors"
    />

    <!-- Observations -->
    <Card class="border-2 border-amber-200/50 dark:border-amber-800/50">
      <CardHeader class="pb-3">
        <CardTitle class="text-base flex items-center gap-2">
          <AlertTriangle class="h-4 w-4 text-amber-600" />
          Observations
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <Label for="remarks" class="text-sm font-medium">
          Remarques ou observations supplémentaires
        </Label>
        <textarea 
          id="remarks" 
          v-model="formData.remarks"
          placeholder="Ajouter des observations, notes spéciales, ou remarques sur le vol..." 
          rows="4"
          class="w-full px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
        />
        <p class="text-xs text-muted-foreground">
          {{ formData.remarks?.length || 0 }} caractère(s)
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Users, AlertTriangle } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import JustificationsSection from '~/components/modules/flight/JustificationsSection.vue'
import type { FlightFormData } from '~/types/api'

interface Props {
  formData: FlightFormData
  errors: Record<string, string>
  passengersEcart: number
}

defineProps<Props>()
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