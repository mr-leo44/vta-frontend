<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Nouvel exploitant</DialogTitle>
        <DialogDescription>Remplissez les informations de l’exploitant à créer.</DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <Input v-model="form.name" placeholder="Nom complet" required />
          <Input v-model="form.sigle" placeholder="Sigle" required />
          <Input v-model="form.iata_code" placeholder="Code IATA (optionnel)" />
          <Input v-model="form.icao_code" placeholder="Code OACI (optionnel)" />
          <Input v-model="form.country" placeholder="Pays (optionnel)" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <Select v-model="form.flight_type">
            <SelectTrigger><SelectValue placeholder="Type de vol" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Régulier</SelectItem>
              <SelectItem value="non_regular">Non régulier</SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="form.flight_nature">
            <SelectTrigger><SelectValue placeholder="Nature du vol" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="non_commercial">Non commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="open = false">Annuler</Button>
          <Button type="submit" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            Créer
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { useOperatorsStore } from '~/stores/operators'
import { useToast } from '~/composables/useToast'
import type { OperatorFormData } from '~/types/api'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const open = defineModel<boolean>('open')
const emit = defineEmits(['created'])

const operatorsStore = useOperatorsStore()
const { success: showSuccess, error: showError } = useToast()

const loading = ref(false)
const form = ref<OperatorFormData>({
  name: '',
  sigle: '',
  iata_code: null,
  icao_code: null,
  country: null,
  flight_type: 'regular',
  flight_nature: 'commercial'
})

const handleSubmit = async () => {
  loading.value = true
  const result = await operatorsStore.createOperator(form.value)
  loading.value = false

  if (result.success) {
    showSuccess('Exploitant créé avec succès')
    emit('created', result.data)
    open.value = false
  } else {
    showError(result.message)
  }
}
</script>
