<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Faits Saillants</DialogTitle>
        <DialogDescription>
          Sélectionnez la période pour générer les faits saillants
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="type">Type de période</Label>
          <Select v-model="localForm.type">
            <SelectTrigger id="type">
              <SelectValue placeholder="Sélectionner le type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="annual">Annuel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <template v-if="localForm.type === 'monthly'">
          <div class="space-y-2">
            <Label for="hl-month">Mois</Label>
            <Select v-model="localForm.month">
              <SelectTrigger id="hl-month">
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
        </template>

        <div class="space-y-2">
          <Label for="hl-year">Année</Label>
          <Select v-model="localForm.year">
            <SelectTrigger id="hl-year">
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
  'generate': [form: { type: string; month: string; year: string }]
}>()

const localForm = ref({
  type: '',
  month: '',
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
  if (!localForm.value.type || !localForm.value.year) return false
  if (localForm.value.type === 'monthly' && !localForm.value.month) return false
  return true
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
      type: '',
      month: '',
      year: ''
    }
  }
})

// Reset month when type changes to annual
watch(() => localForm.value.type, (newType) => {
  if (newType === 'annual') {
    localForm.value.month = ''
  }
})
</script>