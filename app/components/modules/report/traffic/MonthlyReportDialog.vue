<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Rapport Mensuel de Trafic</DialogTitle>
        <DialogDescription>
          Sélectionnez le mois, l'année et le régime pour générer le rapport
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="month">Mois</Label>
          <Select v-model="localForm.month">
            <SelectTrigger id="month">
              <SelectValue placeholder="Sélectionner un mois" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Janvier</SelectItem>
              <SelectItem value="2">Février</SelectItem>
              <SelectItem value="3">Mars</SelectItem>
              <SelectItem value="4">Avril</SelectItem>
              <SelectItem value="5">Mai</SelectItem>
              <SelectItem value="6">Juin</SelectItem>
              <SelectItem value="7">Juillet</SelectItem>
              <SelectItem value="8">Août</SelectItem>
              <SelectItem value="9">Septembre</SelectItem>
              <SelectItem value="10">Octobre</SelectItem>
              <SelectItem value="11">Novembre</SelectItem>
              <SelectItem value="12">Décembre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="year">Année</Label>
          <Select v-model="localForm.year">
            <SelectTrigger id="year">
              <SelectValue placeholder="Sélectionner une année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="year in availableYears" :key="year" :value="String(year)">
                {{ year }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="regime">Régime</Label>
          <Select v-model="localForm.regime">
            <SelectTrigger id="regime">
              <SelectValue placeholder="Sélectionner un régime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domestic">Domestique</SelectItem>
              <SelectItem value="international">International</SelectItem>
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
  'generate': [form: { month: string; year: string; regime: string }]
}>()

const localForm = ref({
  month: '',
  year: '',
  regime: ''
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
  return localForm.value.month && localForm.value.year && localForm.value.regime
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
      month: '',
      year: '',
      regime: ''
    }
  }
})
</script>