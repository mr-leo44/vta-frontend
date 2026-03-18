<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Plane class="h-5 w-5 text-indigo-500" />
          Nouvel aéronef
        </DialogTitle>
        <DialogDescription>
          Créer un aéronef qui sera automatiquement sélectionné.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 pt-2">

        <!-- Immatriculation -->
        <div class="space-y-1.5">
          <Label for="ac-immat">Immatriculation <span class="text-destructive">*</span></Label>
          <Input
            id="ac-immat"
            v-model="form.immatriculation"
            placeholder="F-HBXA, TU-VAE..."
            class="uppercase font-mono"
            :class="{ 'border-destructive': errors.immatriculation }"
            @input="form.immatriculation = form.immatriculation.toUpperCase()"
          />
          <p v-if="errors.immatriculation" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.immatriculation }}
          </p>
        </div>

        <!-- Exploitant -->
        <div class="space-y-1.5">
          <Label>Exploitant <span class="text-destructive">*</span></Label>
          <Popover v-model:open="operatorPopoverOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                class="w-full justify-between"
                :class="{ 'border-destructive': errors.operator_id }"
              >
                <span :class="{ 'text-muted-foreground': !selectedOperatorLabel }">
                  {{ selectedOperatorLabel || 'Sélectionner un exploitant' }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-full p-0">
              <Command v-model:search-term="operatorSearch">
                <CommandInput placeholder="Chercher exploitant..." />
                <CommandList>
                  <CommandEmpty>
                    <div class="py-2 px-1 text-center space-y-2">
                      <p class="text-sm text-muted-foreground">Aucun exploitant trouvé</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        class="w-full border-dashed text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
                        @click="openCreateOperator"
                      >
                        <Plus class="h-3 w-3 mr-1" />
                        Créer « {{ operatorSearch }} »
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup class="max-h-52 overflow-y-auto">
                    <CommandItem
                      v-for="op in filteredOperators"
                      :key="op.id"
                      :value="op.id.toString()"
                      @select="selectOperator(op)"
                    >
                      <Check :class="['mr-2 h-4 w-4', form.operator_id === op.id ? 'opacity-100' : 'opacity-0']" />
                      <div>
                        <div class="font-medium">{{ op.name }}</div>
                        <div class="text-xs text-muted-foreground">{{ op.sigle }}</div>
                      </div>
                    </CommandItem>
                    <div class="border-t mt-1 pt-1 px-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        class="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                        @click="openCreateOperator"
                      >
                        <Plus class="h-3 w-3 mr-1" />
                        Créer un nouvel exploitant
                      </Button>
                    </div>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p v-if="errors.operator_id" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.operator_id }}
          </p>
        </div>

        <!-- Type d'aéronef -->
        <div class="space-y-1.5">
          <Label>Type d'aéronef <span class="text-destructive">*</span></Label>
          <Popover v-model:open="typePopoverOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                class="w-full justify-between"
                :class="{ 'border-destructive': errors.aircraft_type_id }"
              >
                <span :class="{ 'text-muted-foreground': !selectedTypeLabel }">
                  {{ selectedTypeLabel || 'Sélectionner un type' }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-full p-0">
              <Command v-model:search-term="typeSearch">
                <CommandInput placeholder="Chercher type (B737, A320...)..." />
                <CommandList>
                  <CommandEmpty>
                    <div class="py-2 px-1 text-center space-y-2">
                      <p class="text-sm text-muted-foreground">Aucun type trouvé</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        class="w-full border-dashed text-indigo-600 border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                        @click="openCreateType"
                      >
                        <Plus class="h-3 w-3 mr-1" />
                        Créer le type « {{ typeSearch }} »
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup class="max-h-52 overflow-y-auto">
                    <CommandItem
                      v-for="t in filteredTypes"
                      :key="t.id"
                      :value="t.id.toString()"
                      @select="selectType(t)"
                    >
                      <Check :class="['mr-2 h-4 w-4', form.aircraft_type_id === t.id ? 'opacity-100' : 'opacity-0']" />
                      <div class="flex items-center gap-2">
                        <span class="font-medium">{{ t.sigle }}</span>
                        <span class="text-xs text-muted-foreground">{{ t.name }}</span>
                        <Badge variant="outline" class="ml-auto text-xs">{{ t.default_pmad?.toLocaleString() }} kg</Badge>
                      </div>
                    </CommandItem>
                    <div class="border-t mt-1 pt-1 px-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        class="w-full justify-start text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                        @click="openCreateType"
                      >
                        <Plus class="h-3 w-3 mr-1" />
                        Créer un nouveau type
                      </Button>
                    </div>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p v-if="errors.aircraft_type_id" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.aircraft_type_id }}
          </p>
        </div>

        <!-- PMAD -->
        <div class="space-y-1.5">
          <Label for="ac-pmad">
            PMAD (kg)
            <span v-if="selectedTypePmad" class="text-xs text-muted-foreground font-normal ml-1">
              — défaut type : {{ selectedTypePmad.toLocaleString() }} kg
            </span>
          </Label>
          <Input
            id="ac-pmad"
            v-model.number="form.pmad"
            type="number"
            min="0"
            :placeholder="selectedTypePmad ? String(selectedTypePmad) : 'Poids max au décollage...'"
          />
        </div>

        <!-- En activité -->
        <div class="flex items-center gap-3 py-1">
          <Switch id="ac-activity" v-model:checked="form.in_activity" />
          <Label for="ac-activity" class="cursor-pointer">En activité</Label>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <Button type="button" variant="outline" class="flex-1" @click="isOpen = false">
            Annuler
          </Button>
          <Button
            type="submit"
            class="flex-1 bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Plus v-else class="mr-2 h-4 w-4" />
            Créer l'aéronef
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>

  <!-- Sous-modal empilé : Créer un exploitant -->
  <QuickCreateOperatorModal
    v-model:open="createOperatorOpen"
    :prefill-name="operatorSearch"
    @created="onOperatorCreated"
  />

  <!-- Sous-modal empilé : Créer un type d'aéronef -->
  <QuickCreateAircraftTypeModal
    v-model:open="createTypeOpen"
    :prefill-sigle="typeSearch"
    @created="onTypeCreated"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Plane, AlertCircle, Plus, Loader2, ChevronsUpDown, Check } from 'lucide-vue-next'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Popover, PopoverTrigger, PopoverContent,
} from '@/components/ui/popover'
import {
  Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import QuickCreateOperatorModal from '../operator/QuickCreateOperatorModal.vue'
import QuickCreateAircraftTypeModal from '../aircraft-type/QuickCreateAircraftTypeModal.vue'

interface Props {
  open: boolean
  preselectedOperatorId?: number
  preselectedOperatorLabel?: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'created', aircraft: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Stores — noms et méthodes conformes aux fichiers réels
const aircraftsStore = useAircraftsStore()     // createAircraft(), fetchAllAircrafts(), allAircrafts
const operatorsStore = useOperatorsStore()     // createOperator(), fetchAllOperators(), allOperators
const aircraftTypesStore = useAircraftTypesStore() // createAircraftType(), fetchAllAircraftTypes(), allAircraftTypes

const { success: showSuccess, error: showError } = useToast()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

const loading = ref(false)
const operatorPopoverOpen = ref(false)
const typePopoverOpen = ref(false)
const operatorSearch = ref('')
const typeSearch = ref('')
const selectedOperatorLabel = ref(props.preselectedOperatorLabel ?? '')
const selectedTypeLabel = ref('')
const selectedTypePmad = ref<number | null>(null)
const createOperatorOpen = ref(false)
const createTypeOpen = ref(false)

const form = reactive({
  immatriculation: '',
  operator_id: props.preselectedOperatorId ?? 0,
  aircraft_type_id: 0,
  pmad: null as number | null,
  in_activity: true,
})

const errors = reactive<Record<string, string>>({})

watch(() => props.preselectedOperatorId, (id) => { if (id) form.operator_id = id })
watch(() => props.preselectedOperatorLabel, (label) => { if (label) selectedOperatorLabel.value = label })

// ── Listes depuis les stores ─────────────────────────────────────
// useAircraftTypesStore expose `allAircraftTypes` (et non `allTypes`)
const operators = computed(() => operatorsStore.allOperators)
const aircraftTypes = computed(() => aircraftTypesStore.allAircraftTypes)

const filteredOperators = computed(() => {
  if (!operatorSearch.value) return operators.value
  const q = operatorSearch.value.toLowerCase()
  return operators.value.filter(
    (o) => o.name.toLowerCase().includes(q) || o.sigle.toLowerCase().includes(q),
  )
})

const filteredTypes = computed(() => {
  if (!typeSearch.value) return aircraftTypes.value
  const q = typeSearch.value.toLowerCase()
  return aircraftTypes.value.filter(
    (t) => t.sigle.toLowerCase().includes(q) || t.name.toLowerCase().includes(q),
  )
})

// ── Sélections ───────────────────────────────────────────────────
const selectOperator = (op: any) => {
  form.operator_id = op.id
  selectedOperatorLabel.value = `${op.name} (${op.sigle})`
  operatorPopoverOpen.value = false
  operatorSearch.value = ''
}

const selectType = (t: any) => {
  form.aircraft_type_id = t.id
  selectedTypeLabel.value = `${t.sigle} — ${t.name}`
  selectedTypePmad.value = t.default_pmad
  if (!form.pmad) form.pmad = t.default_pmad
  typePopoverOpen.value = false
  typeSearch.value = ''
}

// ── Ouverture des sous-modaux ────────────────────────────────────
const openCreateOperator = () => {
  operatorPopoverOpen.value = false
  createOperatorOpen.value = true
}

const openCreateType = () => {
  typePopoverOpen.value = false
  createTypeOpen.value = true
}

// ── Callbacks après création dans les sous-modaux ────────────────
const onOperatorCreated = async (operator: any) => {
  // Rafraîchit la liste complète dans le store (fetchAllOperators)
  await operatorsStore.fetchAllOperators()
  selectOperator(operator)
}

const onTypeCreated = async (type: any) => {
  // Rafraîchit la liste complète dans le store (fetchAllAircraftTypes)
  await aircraftTypesStore.fetchAllAircraftTypes()
  selectType(type)
}

// ── Validation ───────────────────────────────────────────────────
const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.immatriculation.trim()) errors.immatriculation = "L'immatriculation est requise"
  if (!form.operator_id) errors.operator_id = "L'exploitant est requis"
  if (!form.aircraft_type_id) errors.aircraft_type_id = "Le type est requis"
  return Object.keys(errors).length === 0
}

// ── Soumission ───────────────────────────────────────────────────
const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const payload = {
      immatriculation: form.immatriculation.trim(),
      operator_id: form.operator_id,
      aircraft_type_id: form.aircraft_type_id,
      // pmad est optionnel (null = non envoyé)
      ...(form.pmad !== null ? { pmad: form.pmad } : {}),
      in_activity: form.in_activity,
    }

    // useAircraftsStore.createAircraft() — conforme au store aircrafts.ts
    const res = await aircraftsStore.createAircraft(payload)

    if (res.success && res.data) {
      showSuccess(`Aéronef « ${res.data.immatriculation} » créé avec succès`)
      emit('created', res.data)
      isOpen.value = false
      // Reset du formulaire
      Object.assign(form, {
        immatriculation: '',
        operator_id: props.preselectedOperatorId ?? 0,
        aircraft_type_id: 0,
        pmad: null,
        in_activity: true,
      })
      selectedTypeLabel.value = ''
      selectedTypePmad.value = null
      if (!props.preselectedOperatorLabel) selectedOperatorLabel.value = ''
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

// ── Chargement initial des types si pas encore fait ──────────────
onMounted(async () => {
  if (!aircraftTypesStore.allAircraftTypes.length) {
    await aircraftTypesStore.fetchAllAircraftTypes()
  }
})
</script>