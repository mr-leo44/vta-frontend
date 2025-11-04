<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Modifier l\'exploitant' : 'Nouvel exploitant' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Modifier les informations de l\'exploitant' : 'Remplissez les informations de l\'exploitant à créer' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <!-- Nom -->
          <div class="col-span-2">
            <Label for="name">Nom complet <span class="text-destructive">*</span></Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Ex: Air France"
              :class="{ 'border-destructive': errors.name }"
            />
            <p v-if="errors.name" class="text-sm text-destructive mt-1">{{ errors.name }}</p>
          </div>

          <!-- Sigle -->
          <div>
            <Label for="sigle">Sigle <span class="text-destructive">*</span></Label>
            <Input
              id="sigle"
              v-model="formData.sigle"
              placeholder="Ex: AF"
              maxlength="10"
              :class="{ 'border-destructive': errors.sigle }"
            />
            <p v-if="errors.sigle" class="text-sm text-destructive mt-1">{{ errors.sigle }}</p>
          </div>

          <!-- Code IATA -->
          <div>
            <Label for="iata_code">Code IATA</Label>
            <Input
              id="iata_code"
              v-model="formData.iata_code"
              placeholder="Ex: AF"
              maxlength="5"
              :class="{ 'border-destructive': errors.iata_code }"
            />
            <p v-if="errors.iata_code" class="text-sm text-destructive mt-1">{{ errors.iata_code }}</p>
          </div>

          <!-- Code OACI -->
          <div>
            <Label for="icao_code">Code OACI</Label>
            <Input
              id="icao_code"
              v-model="formData.icao_code"
              placeholder="Ex: AFR"
              maxlength="5"
              :class="{ 'border-destructive': errors.icao_code }"
            />
            <p v-if="errors.icao_code" class="text-sm text-destructive mt-1">{{ errors.icao_code }}</p>
          </div>

          <!-- Pays -->
          <div class="col-span-2">
            <Label for="country">Pays</Label>
            <Input
              id="country"
              v-model="formData.country"
              placeholder="Ex: France"
              maxlength="100"
              :class="{ 'border-destructive': errors.country }"
            />
            <p v-if="errors.country" class="text-sm text-destructive mt-1">{{ errors.country }}</p>
          </div>

          <!-- Type de vol -->
          <div>
            <Label for="flight_type">Type de vol <span class="text-destructive">*</span></Label>
            <Select v-model="formData.flight_type">
              <SelectTrigger :class="{ 'border-destructive': errors.flight_type }">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Vol régulier</SelectItem>
                <SelectItem value="non_regular">Vol non régulier (VNR)</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.flight_type" class="text-sm text-destructive mt-1">{{ errors.flight_type }}</p>
          </div>

          <!-- Nature du vol -->
          <div>
            <Label for="flight_nature">Nature du vol <span class="text-destructive">*</span></Label>
            <Select v-model="formData.flight_nature">
              <SelectTrigger :class="{ 'border-destructive': errors.flight_nature }">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="commercial">Vol commercial</SelectItem>
                <SelectItem value="non_commercial">Vol non commercial</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.flight_nature" class="text-sm text-destructive mt-1">{{ errors.flight_nature }}</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="handleCancel" :disabled="loading">
            Annuler
          </Button>
          <Button type="submit" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ isEdit ? 'Modifier' : 'Créer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import type { Operator } from '~/types/api'
import { operatorFormSchema, type OperatorFormSchema } from '~/schemas/operator.schema'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps<{
  operator?: Operator | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const operatorsStore = useOperatorsStore()
const { success: showSuccess, error: showError } = useToast()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isEdit = computed(() => !!props.operator)

const loading = ref(false)
const errors = ref<Partial<Record<keyof OperatorFormSchema, string>>>({})

const formData = ref<OperatorFormSchema>({
  name: '',
  sigle: '',
  iata_code: null,
  icao_code: null,
  country: null,
  flight_type: 'regular',
  flight_nature: 'commercial'
})

// Initialiser le formulaire
watch(() => props.operator, (operator) => {
  if (operator) {
    formData.value = {
      name: operator.name,
      sigle: operator.sigle,
      iata_code: operator.iata_code || null,
      icao_code: operator.icao_code || null,
      country: operator.country || null,
      flight_type: operator.flight_type.value as 'regular' | 'non_regular',
      flight_nature: operator.flight_nature.value as 'commercial' | 'non_commercial'
    }
  }
}, { immediate: true })

watch(isOpen, (open) => {
  if (!open && !props.operator) {
    resetForm()
  }
})

const resetForm = () => {
  formData.value = {
    name: '',
    sigle: '',
    iata_code: null,
    icao_code: null,
    country: null,
    flight_type: 'regular',
    flight_nature: 'commercial'
  }
  errors.value = {}
}

const handleCancel = () => {
  isOpen.value = false
  if (!isEdit.value) {
    resetForm()
  }
}

const handleSubmit = async () => {
  errors.value = {}
  
  // Validation avec Zod
  const validation = operatorFormSchema.safeParse(formData.value)
  
  if (!validation.success) {
    validation.error.errors.forEach(err => {
      if (err.path[0]) {
        errors.value[err.path[0] as keyof OperatorFormSchema] = err.message
      }
    })
    showError('Veuillez corriger les erreurs dans le formulaire')
    return
  }

  loading.value = true

  let result
  if (isEdit.value && props.operator) {
    result = await operatorsStore.updateOperator(props.operator.id, validation.data)
  } else {
    result = await operatorsStore.createOperator(validation.data)
  }

  loading.value = false

  if (result.success) {
    showSuccess(isEdit.value ? 'Exploitant modifié avec succès' : 'Exploitant créé avec succès')
    isOpen.value = false
    resetForm()
    emit('success')
  } else {
    if (result.errors) {
      Object.entries(result.errors).forEach(([key, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          errors.value[key as keyof OperatorFormSchema] = messages[0]
        }
      })
    }
    showError(result.message || 'Une erreur est survenue')
  }
}
</script>