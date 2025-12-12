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
            <Label class="mb-1.5" for="name">Nom complet <span class="text-destructive">*</span></Label>
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
            <Label class="mb-1.5" for="sigle">Sigle <span class="text-destructive">*</span></Label>
            <Input
              id="sigle"
              v-model="formData.sigle"
              placeholder="Ex: AF"
              maxlength="10"
              :class="{ 'border-destructive': errors.sigle }"
            />
            <p v-if="errors.sigle" class="text-sm text-destructive mt-1">{{ errors.sigle }}</p>
          </div>

          <!-- Type de vol -->
          <div>
            <Label class="mb-1.5" for="flight_type">Type de vol <span class="text-destructive">*</span></Label>
            <Select v-model="formData.flight_type">
              <SelectTrigger :class="{ 'border-destructive': errors.flight_type }" class="w-full">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Vol régulier</SelectItem>
                <SelectItem value="non_regular">Vol non régulier (VNR)</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.flight_type" class="text-sm text-destructive mt-1">{{ errors.flight_type }}</p>
          </div>

          <!-- Code IATA -->
          <div>
            <Label class="mb-1.5" for="iata_code">Code IATA</Label>
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
            <Label class="mb-1.5" for="icao_code">Code OACI</Label>
            <Input
              id="icao_code"
              v-model="formData.icao_code"
              placeholder="Ex: AFR"
              maxlength="5"
              :class="{ 'border-destructive': errors.icao_code }"
            />
            <p v-if="errors.icao_code" class="text-sm text-destructive mt-1">{{ errors.icao_code }}</p>
          </div>

          <!-- Pays avec Command/Select -->
          <div class="col-span-2">
            <Label class="mb-1.5" for="country">Pays</Label>
            <Popover v-model:open="countryPopoverOpen">
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  :aria-expanded="countryPopoverOpen"
                  class="w-full justify-between h-10"
                  :class="{ 'border-destructive': errors.country }"
                >
                  <span :class="{ 'text-muted-foreground': !formData.country }">
                    {{ formData.country || "Sélectionner un pays..." }}
                  </span>
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-full p-0" align="start">
                <Command>
                  <CommandInput v-model="countrySearchTerm" placeholder="Rechercher un pays..." />
                  <CommandEmpty>
                    <div class="p-4 text-center space-y-2">
                      <p class="text-sm text-muted-foreground">
                        {{ countrySearchTerm.trim() ? `"${countrySearchTerm}" n'existe pas dans la liste` : 'Aucun pays trouvé' }}
                      </p>
                      <Button 
                        @click="addNewCountry"
                        class="w-full gap-2"
                        type="button"
                        variant="ghost"
                      >
                        <Plus class="h-4 w-4" />
                        Utiliser "{{ countrySearchTerm.trim() }}"
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup class="max-h-64 overflow-y-auto">
                    <CommandItem
                      v-for="country in filteredCountries"
                      :key="country"
                      :value="country"
                      @select="selectCountry(country)"
                    >
                      <Check
                        :class="[
                          'mr-2 h-4 w-4',
                          formData.country === country ? 'opacity-100' : 'opacity-0'
                        ]"
                      />
                      {{ country }}
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <p v-if="errors.country" class="text-sm text-destructive mt-1">{{ errors.country }}</p>
            <p v-if="allCountries.length === 0" class="text-xs text-muted-foreground mt-1">
              Aucun pays enregistré. Commencez à taper pour en créer un.
            </p>
            <p v-else class="text-xs text-muted-foreground mt-1">
              {{ allCountries.length }} pays disponible(s)
            </p>
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
import { ref, computed, watch, onMounted } from 'vue'
import { Loader2, ChevronsUpDown, Check, Plus } from 'lucide-vue-next'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

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

// Charger tous les opérateurs au montage
onMounted(async () => {
  if (operatorsStore.allOperators.length === 0) {
    await operatorsStore.fetchAllOperators()
  }
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isEdit = computed(() => !!props.operator)

const loading = ref(false)
const errors = ref<Partial<Record<keyof OperatorFormSchema, string>>>({})
const countryPopoverOpen = ref(false)
const countrySearchTerm = ref('')

// Liste des pays extraite des opérateurs existants
const allCountries = computed(() => {
  // Récupérer tous les pays uniques des opérateurs existants
  const existingCountries = operatorsStore.allOperators
    .map(op => op.country)
    .filter((country): country is string => !!country && country.trim() !== '')
  
  // Créer un Set pour avoir uniquement les valeurs uniques, puis trier
  const uniqueCountries = [...new Set(existingCountries)].sort()
  
  return uniqueCountries
})

const filteredCountries = computed(() => {
  const term = countrySearchTerm.value.trim().toLowerCase()
  if (!term) {
    return allCountries.value
  }
  return allCountries.value.filter(country =>
    country.toLowerCase().includes(term)
  )
})

const formData = ref<OperatorFormSchema>({
  name: '',
  sigle: '',
  iata_code: null,
  icao_code: null,
  country: null,
  flight_type: 'regular',
})

const selectCountry = (country: string) => {
  formData.value.country = country
  countryPopoverOpen.value = false
  countrySearchTerm.value = country
}


const addNewCountry = () => {
  if (countrySearchTerm.value.trim()) {
    const newCountry = countrySearchTerm.value.trim()
    // Simplement remplir le champ country du formulaire
    // Le pays sera ajouté à la liste globale après création de l'opérateur
    formData.value.country = newCountry
    countryPopoverOpen.value = false
    countrySearchTerm.value = ''
  }
}

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
  }
  errors.value = {}
  countrySearchTerm.value = ''
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