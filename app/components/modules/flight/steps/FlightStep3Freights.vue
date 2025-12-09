<template>
  <div class="space-y-5 animate-in fade-in-50">
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
          <div>
            <Label class="text-sm font-medium mb-2 block">À l'arrivée</Label>
            <Input 
              v-model.number="formData.statistics!.fret_count!.arrival" 
              type="number" 
              min="0"
              placeholder="0" 
              class="text-base" 
            />
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
          <div>
            <Label class="text-sm font-medium mb-2 block">À l'arrivée</Label>
            <Input 
              v-model.number="formData.statistics!.excedents!.arrival" 
              type="number" 
              min="0"
              placeholder="0" 
              class="text-base" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Package, AlertCircle } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FlightFormData } from '~/types/api'

interface Props {
  formData: FlightFormData
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