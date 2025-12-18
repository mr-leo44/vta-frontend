<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Rapport Annuel de Trafic</DialogTitle>
        <DialogDescription>
          Sélectionnez l'année pour générer le rapport annuel
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="annual-year">Année</Label>
          <Select v-model="localForm.year">
            <SelectTrigger id="annual-year">
              <SelectValue placeholder="Sélectionner une année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="year in availableYears" :key="year" :value="String(year)">
                {{ year }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="close">
          Annuler
        </Button>
        <Button @click="generate" :disabled="!isValid || loading">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          <Download v-else class="mr-2 h-4 w-4" />
          Générer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-vue-next'

interface Props {
  open: boolean
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'generate': [form: { year: string }]
}>()

const localForm = ref({
  year: ''
})

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push(i)
  }
  return years
})

const isValid = computed(() => {
  return localForm.value.year !== ''
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const close = () => {
  emit('update:open', false)
}

const generate = () => {
  if (isValid.value) {
    emit('generate', { ...localForm.value })
  }
}

// Reset form when dialog closes
watch(() => props.open, (newValue) => {
  if (!newValue) {
    localForm.value = {
      year: ''
    }
  }
})
</script>