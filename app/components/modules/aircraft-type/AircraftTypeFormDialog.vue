<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Layers class="h-5 w-5" />
          {{ isEditing ? 'Modifier le type' : 'Nouveau type d\'aéronef' }}
        </DialogTitle>
        <DialogDescription>
          {{ isEditing ? 'Modifiez les informations du type d\'aéronef' : 'Créez un nouveau type d\'aéronef avec ses caractéristiques' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Nom -->
        <div class="space-y-2">
          <Label for="name" class="flex items-center gap-2">
            <FileText class="h-3.5 w-3.5" />
            Nom du type
            <span class="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            v-model="formData.name"
            placeholder="Ex: Boeing 737-800, Airbus A320neo"
            :disabled="loading"
            maxlength="255"
            required
            :class="errors.name ? 'border-destructive' : ''"
          />
          <p v-if="errors.name" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ errors.name }}
          </p>
          <p v-else class="text-xs text-muted-foreground">
            Nom complet et descriptif du type d'aéronef (max 255 caractères)
          </p>
        </div>

        <!-- Sigle -->
        <div class="space-y-2">
          <Label for="sigle" class="flex items-center gap-2">
            <Hash class="h-3.5 w-3.5" />
            Sigle (Code ICAO)
            <span class="text-destructive">*</span>
          </Label>
          <Input
            id="sigle"
            v-model="formData.sigle"
            placeholder="Ex: B738, A320, B777-800, A320NEO"
            :disabled="loading"
            maxlength="15"
            class="font-mono uppercase"
            required
            :class="errors.sigle ? 'border-destructive' : ''"
            @input="formData.sigle = formData.sigle.toUpperCase()"
          />
          <p v-if="errors.sigle" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ errors.sigle }}
          </p>
          <p v-else class="text-xs text-muted-foreground">
            Code ICAO du type (lettres, chiffres et tirets, max 15 caractères)
          </p>
        </div>

        <!-- Guide des exemples -->
        <div class="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
          <div class="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
            <Info class="h-4 w-4" />
            Exemples de types courants
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-blue-100 dark:border-blue-900">
              <Plane class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <div>
                <div class="font-medium">Boeing 737-800</div>
                <div class="text-muted-foreground font-mono">B737-800</div>
              </div>
            </div>
            <div class="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-blue-100 dark:border-blue-900">
              <Plane class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <div>
                <div class="font-medium">Airbus A320neo</div>
                <div class="text-muted-foreground font-mono">A320NEO</div>
              </div>
            </div>
            <div class="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-blue-100 dark:border-blue-900">
              <Plane class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <div>
                <div class="font-medium">Boeing 777-300ER</div>
                <div class="text-muted-foreground font-mono">B777-300ER</div>
              </div>
            </div>
            <div class="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-blue-100 dark:border-blue-900">
              <Plane class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <div>
                <div class="font-medium">Airbus A380-800</div>
                <div class="text-muted-foreground font-mono">A380-800</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview en direct -->
        <div v-if="formData.name && formData.sigle" class="p-4 border-2 border-dashed rounded-lg bg-muted/30">
          <div class="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Eye class="h-3.5 w-3.5" />
            Aperçu du type
          </div>
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Plane class="h-6 w-6 text-white" />
            </div>
            <div class="flex-1">
              <div class="font-bold text-base">{{ formData.name }}</div>
              <Badge variant="secondary" class="font-mono text-xs mt-1">
                {{ formData.sigle }}
              </Badge>
            </div>
          </div>
        </div>

        <!-- Stats si édition -->
        <div v-if="isEditing && aircraftType" class="p-4 border rounded-lg bg-muted/30 space-y-3">
          <div class="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <BarChart3 class="h-3.5 w-3.5" />
            Statistiques actuelles
          </div>
          <div class="grid grid-cols-3 gap-3 text-sm">
            <div class="text-center p-3 bg-background rounded-lg border">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ aircraftCount }}</div>
              <div class="text-xs text-muted-foreground mt-1">Aéronefs</div>
            </div>
            <div class="text-center p-3 bg-background rounded-lg border">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ operatorCount }}</div>
              <div class="text-xs text-muted-foreground mt-1">Exploitants</div>
            </div>
            <div class="text-center p-3 bg-background rounded-lg border">
              <div class="text-xs text-muted-foreground mb-1">Créé le</div>
              <div class="font-semibold text-xs">{{ formatDate(aircraftType.created_at) }}</div>
            </div>
          </div>
        </div>

        <DialogFooter class="gap-2">
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
            :disabled="loading"
          >
            <X class="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button type="submit" :disabled="loading || !isFormValid">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Check v-else class="mr-2 h-4 w-4" />
            {{ isEditing ? 'Mettre à jour' : 'Créer le type' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  Layers, 
  FileText, 
  Hash, 
  Info, 
  Plane, 
  Check, 
  Loader2,
  X,
  Eye,
  BarChart3,
  AlertCircle
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AircraftType, AircraftTypeFormData } from '~/types/api'

interface FormErrors {
  name?: string
  sigle?: string
}

const props = defineProps<{
  open: boolean
  aircraftType?: AircraftType | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [aircraftType: AircraftType]
}>()

const aircraftTypesStore = useAircraftTypesStore()
const aircraftsStore = useAircraftsStore()
const { success: showSuccess, error: showError } = useToast()

const loading = ref(false)
const formData = ref<AircraftTypeFormData>({
  name: '',
  sigle: ''
})
const errors = ref<FormErrors>({})

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isEditing = computed(() => !!props.aircraftType)

const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0 &&
         formData.value.sigle.trim().length > 0 &&
         formData.value.name.length <= 255 &&
         formData.value.sigle.length <= 15 &&
         /^[A-Z0-9-]+$/.test(formData.value.sigle)
})

const aircraftCount = computed(() => {
  if (!props.aircraftType) return 0
  return aircraftsStore.allAircrafts.filter(
    a => a.type?.id === props.aircraftType?.id
  ).length
})

const operatorCount = computed(() => {
  if (!props.aircraftType) return 0
  const operators = new Set(
    aircraftsStore.allAircrafts
      .filter(a => a.type?.id === props.aircraftType?.id)
      .map(a => a.operator?.id)
      .filter(Boolean)
  )
  return operators.size
})

// Initialiser le formulaire quand le dialog s'ouvre
watch(() => props.open, (open) => {
  if (open) {
    if (props.aircraftType) {
      formData.value = {
        name: props.aircraftType.name,
        sigle: props.aircraftType.sigle
      }
    } else {
      resetForm()
    }
    errors.value = {}
  }
})

const resetForm = () => {
  formData.value = {
    name: '',
    sigle: ''
  }
  errors.value = {}
}

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Validation du nom
  if (!formData.value.name.trim()) {
    errors.value.name = 'Le nom est requis'
    isValid = false
  } else if (formData.value.name.length > 255) {
    errors.value.name = 'Le nom ne peut pas dépasser 255 caractères'
    isValid = false
  }

  // Validation du sigle
  if (!formData.value.sigle.trim()) {
    errors.value.sigle = 'Le sigle est requis'
    isValid = false
  } else if (formData.value.sigle.length > 15) {
    errors.value.sigle = 'Le sigle ne peut pas dépasser 15 caractères'
    isValid = false
  } else if (!/^[A-Z0-9-]+$/.test(formData.value.sigle)) {
    errors.value.sigle = 'Le sigle ne peut contenir que des lettres majuscules, chiffres et tirets'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const result = isEditing.value
      ? await aircraftTypesStore.updateAircraftType(props.aircraftType!.id, formData.value)
      : await aircraftTypesStore.createAircraftType(formData.value)

    if (result.success && result.data) {
      showSuccess(
        isEditing.value ? 'Type modifié' : 'Type créé',
        `Le type ${result.data.name} a été ${isEditing.value ? 'modifié' : 'créé'} avec succès.`
      )

      emit('success', result.data)
      resetForm()
      isOpen.value = false
    } else {
      throw new Error(result.message || 'Erreur inconnue')
    }
  } catch (error: any) {
    console.error('Error submitting form:', error)
    
    // Gestion des erreurs de validation
    if (error?.errors) {
      errors.value = error.errors
      showError('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire')
    } else {
      showError('Erreur', error?.message || 'Une erreur est survenue lors de l\'enregistrement.')
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  if (!loading.value) {
    resetForm()
    isOpen.value = false
  }
}

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>