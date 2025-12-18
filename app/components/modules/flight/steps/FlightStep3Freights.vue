<template>
  <div class="space-y-5 animate-in fade-in-50">
    <!-- Alert pour vol national -->
    <Alert v-if="isDomesticFlight" variant="default" class="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <Info class="h-4 w-4 text-blue-600" />
      <AlertTitle class="text-blue-900 dark:text-blue-100">Vol national</AlertTitle>
      <AlertDescription class="text-blue-700 dark:text-blue-300">
        Les données de fret et excédents à l'arrivée sont désactivées pour les vols nationaux.
      </AlertDescription>
    </Alert>

    <Card class="border-2">
      <CardHeader class="pb-3">
        <CardTitle class="text-base flex items-center gap-2">
          <Package class="h-4 w-4" />
          Fret
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label class="text-sm font-medium mb-2 block">Au départ</Label>
            <Input 
              v-model.number="formData.statistics!.fret_count!.departure" 
              type="number" 
              min="0"
              placeholder="0" 
              class="text-base" 
            />
          </div>
          <div class="relative">
            <Label class="text-sm font-medium mb-2 block flex items-center gap-2">
              À l'arrivée
              <Badge v-if="isDomesticFlight" variant="secondary" class="text-xs">
                Désactivé
              </Badge>
            </Label>
            <Input 
              v-model.number="formData.statistics!.fret_count!.arrival" 
              type="number" 
              min="0"
              placeholder="0" 
              class="text-base" 
              :disabled="isDomesticFlight"
              :class="{ 'bg-muted cursor-not-allowed opacity-60': isDomesticFlight }"
            />
            <p v-if="isDomesticFlight && formData.statistics!.fret_count!.arrival" class="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Info class="h-3 w-3" />
              Données enregistrées mais non modifiables
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="border-2">
      <CardHeader class="pb-3">
        <CardTitle class="text-base flex items-center gap-2">
          <AlertCircle class="h-4 w-4" />
          Excédents
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label class="text-sm font-medium mb-2 block">Au départ</Label>
            <Input 
              v-model.number="formData.statistics!.excedents!.departure" 
              type="number" 
              min="0"
              placeholder="0" 
              class="text-base" 
            />
          </div>
          <div class="relative">
            <Label class="text-sm font-medium mb-2 block flex items-center gap-2">
              À l'arrivée
              <Badge v-if="isDomesticFlight" variant="secondary" class="text-xs">
                Désactivé
              </Badge>
            </Label>
            <Input 
              v-model.number="formData.statistics!.excedents!.arrival" 
              type="number" 
              min="0"
              placeholder="0" 
              class="text-base" 
              :disabled="isDomesticFlight"
              :class="{ 'bg-muted cursor-not-allowed opacity-60': isDomesticFlight }"
            />
            <p v-if="isDomesticFlight && formData.statistics!.excedents!.arrival" class="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Info class="h-3 w-3" />
              Données enregistrées mais non modifiables
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { Package, AlertCircle, Info } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import type { FlightFormData } from '~/types/api'

interface Props {
  formData: FlightFormData
}

const props = defineProps<Props>()

// Vérifier si c'est un vol national
const isDomesticFlight = computed(() => {
  return props.formData.flight_regime === 'domestic'
})

// Watcher pour réinitialiser les valeurs d'arrivée si le vol devient national
watch(isDomesticFlight, (isNowDomestic) => {
  if (isNowDomestic) {
    // On ne reset pas les valeurs pour garder l'historique
    // mais on les désactive juste
    console.log('Vol national détecté - champs arrivée désactivés')
  }
})
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