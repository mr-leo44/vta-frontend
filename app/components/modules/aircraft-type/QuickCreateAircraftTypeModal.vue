<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-sm">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Tag class="h-5 w-5 text-purple-500" />
          Nouveau type d'aéronef
        </DialogTitle>
        <DialogDescription>
          Créer un type qui sera automatiquement sélectionné.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 pt-2">

        <!-- Sigle ICAO -->
        <div class="space-y-1.5">
          <Label for="atype-sigle">
            Sigle ICAO <span class="text-destructive">*</span>
          </Label>
          <Input
            id="atype-sigle"
            v-model="form.sigle"
            placeholder="B737, A320, DHC6..."
            maxlength="10"
            class="uppercase font-mono"
            :class="{ 'border-destructive': errors.sigle }"
            @input="form.sigle = form.sigle.toUpperCase()"
          />
          <p v-if="errors.sigle" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.sigle }}
          </p>
        </div>

        <!-- Nom complet -->
        <div class="space-y-1.5">
          <Label for="atype-name">
            Nom complet <span class="text-destructive">*</span>
          </Label>
          <Input
            id="atype-name"
            v-model="form.name"
            placeholder="Boeing 737-800, Airbus A320..."
            :class="{ 'border-destructive': errors.name }"
          />
          <p v-if="errors.name" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.name }}
          </p>
        </div>

        <!-- PMAD par défaut -->
        <div class="space-y-1.5">
          <Label for="atype-pmad">
            PMAD par défaut (kg) <span class="text-destructive">*</span>
          </Label>
          <Input
            id="atype-pmad"
            v-model.number="form.default_pmad"
            type="number"
            min="0"
            placeholder="79016"
            :class="{ 'border-destructive': errors.default_pmad }"
          />
          <p class="text-xs text-muted-foreground">
            Poids maximum au décollage — pré-rempli lors de la création d'aéronef.
          </p>
          <p v-if="errors.default_pmad" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.default_pmad }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <Button type="button" variant="outline" class="flex-1" @click="isOpen = false">
            Annuler
          </Button>
          <Button
            type="submit"
            class="flex-1 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Plus v-else class="mr-2 h-4 w-4" />
            Créer le type
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Tag, AlertCircle, Plus, Loader2 } from 'lucide-vue-next'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AircraftTypeFormData } from '~/types/api'

interface Props {
  open: boolean
  prefillSigle?: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'created', aircraftType: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// useAircraftTypesStore — méthode : createAircraftType(data: AircraftTypeFormData)
const aircraftTypesStore = useAircraftTypesStore()
const { success: showSuccess, error: showError } = useToast()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

const loading = ref(false)

const form = reactive({
  sigle: props.prefillSigle ?? '',
  name: '',
  default_pmad: null as number | null,
})

const errors = reactive<Record<string, string>>({})

watch(() => props.prefillSigle, (val) => {
  if (val) form.sigle = val.toUpperCase()
})

const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.sigle.trim()) errors.sigle = 'Le sigle est requis'
  if (!form.name.trim()) errors.name = 'Le nom est requis'
  if (form.default_pmad === null || form.default_pmad === undefined)
    errors.default_pmad = 'Le PMAD est requis'
  else if (form.default_pmad < 0)
    errors.default_pmad = 'Le PMAD doit être positif'
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    // Payload typé AircraftTypeFormData (name, sigle, default_pmad)
    const payload: AircraftTypeFormData = {
      name: form.name.trim(),
      sigle: form.sigle.trim(),
      default_pmad: form.default_pmad as number,
    }

    // useAircraftTypesStore.createAircraftType() — conforme à aircraft-types.ts
    const res = await aircraftTypesStore.createAircraftType(payload)

    if (res.success && res.data) {
      showSuccess(`Type « ${res.data.sigle} » créé avec succès`)
      emit('created', res.data)
      isOpen.value = false
      Object.assign(form, { sigle: '', name: '', default_pmad: null })
    } else {
      // Erreurs de validation retournées par le store (err?.data?.errors)
      if (res.errors) {
        Object.assign(errors, res.errors)
      } else {
        showError(res.message || 'Erreur lors de la création')
      }
    }
  } catch (e: any) {
    showError(e.message || 'Erreur inattendue')
  } finally {
    loading.value = false
  }
}
</script>