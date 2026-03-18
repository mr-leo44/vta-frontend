<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Building2 class="h-5 w-5 text-blue-500" />
          Nouvel exploitant
        </DialogTitle>
        <DialogDescription>
          Créer un exploitant qui sera automatiquement sélectionné.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 pt-2">

        <!-- Nom -->
        <div class="space-y-1.5">
          <Label for="op-name">Nom <span class="text-destructive">*</span></Label>
          <Input
            id="op-name"
            v-model="form.name"
            placeholder="Air France, Corsair..."
            :class="{ 'border-destructive': errors.name }"
          />
          <p v-if="errors.name" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.name }}
          </p>
        </div>

        <!-- Sigle -->
        <div class="space-y-1.5">
          <Label for="op-sigle">Sigle <span class="text-destructive">*</span></Label>
          <Input
            id="op-sigle"
            v-model="form.sigle"
            placeholder="AF, XK..."
            maxlength="10"
            class="uppercase"
            :class="{ 'border-destructive': errors.sigle }"
            @input="form.sigle = form.sigle.toUpperCase()"
          />
          <p v-if="errors.sigle" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.sigle }}
          </p>
        </div>

        <!-- Type de vol -->
        <div class="space-y-1.5">
          <Label>Type de vol <span class="text-destructive">*</span></Label>
          <Select v-model="form.flight_type">
            <SelectTrigger :class="{ 'border-destructive': errors.flight_type }">
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Vol régulier</SelectItem>
              <SelectItem value="non_regular">Vol non régulier (VNR)</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.flight_type" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.flight_type }}
          </p>
        </div>

        <!-- Codes IATA / ICAO -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label for="op-iata">Code IATA</Label>
            <Input
              id="op-iata"
              v-model="form.iata_code"
              placeholder="AF"
              maxlength="5"
              class="uppercase"
              @input="form.iata_code = form.iata_code?.toUpperCase() ?? ''"
            />
            <p v-if="errors.iata_code" class="text-xs text-destructive">{{ errors.iata_code }}</p>
          </div>
          <div class="space-y-1.5">
            <Label for="op-icao">Code OACI</Label>
            <Input
              id="op-icao"
              v-model="form.icao_code"
              placeholder="AFR"
              maxlength="5"
              class="uppercase"
              @input="form.icao_code = form.icao_code?.toUpperCase() ?? ''"
            />
            <p v-if="errors.icao_code" class="text-xs text-destructive">{{ errors.icao_code }}</p>
          </div>
        </div>

        <!-- Pays — combobox dynamique (même pattern que OperatorFormDialog) -->
        <div class="space-y-1.5">
          <Label>Pays</Label>
          <Popover v-model:open="countryPopoverOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="countryPopoverOpen"
                class="w-full justify-between h-10"
                type="button"
              >
                <span :class="{ 'text-muted-foreground': !form.country }">
                  {{ form.country || 'Sélectionner un pays...' }}
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
                      {{ countrySearchTerm.trim()
                        ? `"${countrySearchTerm}" n'existe pas dans la liste`
                        : 'Aucun pays enregistré' }}
                    </p>
                    <Button
                      v-if="countrySearchTerm.trim()"
                      type="button"
                      variant="ghost"
                      class="w-full gap-2"
                      @click="useCustomCountry"
                    >
                      <Plus class="h-4 w-4" />
                      Utiliser « {{ countrySearchTerm.trim() }} »
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandList>
                  <CommandGroup class="max-h-56 overflow-y-auto">
                    <CommandItem
                      v-for="country in filteredCountries"
                      :key="country"
                      :value="country"
                      @select="selectCountry(country)"
                    >
                      <Check
                        :class="['mr-2 h-4 w-4', form.country === country ? 'opacity-100' : 'opacity-0']"
                      />
                      {{ country }}
                    </CommandItem>
                  </CommandGroup>
                  <!-- Toujours proposer "utiliser ce terme" si une recherche est en cours -->
                  <div
                    v-if="countrySearchTerm.trim() && filteredCountries.length > 0"
                    class="border-t px-1 py-1"
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      class="w-full justify-start text-muted-foreground hover:text-foreground"
                      @click="useCustomCountry"
                    >
                      <Plus class="h-3 w-3 mr-1" />
                      Utiliser « {{ countrySearchTerm.trim() }} »
                    </Button>
                  </div>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p class="text-xs text-muted-foreground">
            <template v-if="allCountries.length === 0">
              Aucun pays enregistré — saisissez un nom pour en créer un.
            </template>
            <template v-else>
              {{ allCountries.length }} pays disponible(s) — issus des exploitants existants.
            </template>
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <Button type="button" variant="outline" class="flex-1" @click="isOpen = false">
            Annuler
          </Button>
          <Button
            type="submit"
            class="flex-1 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Plus v-else class="mr-2 h-4 w-4" />
            Créer l'exploitant
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Building2, AlertCircle, Plus, Loader2, ChevronsUpDown, Check } from 'lucide-vue-next'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Popover, PopoverTrigger, PopoverContent,
} from '@/components/ui/popover'
import {
  Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList,
} from '@/components/ui/command'
import type { OperatorFormData } from '~/types/api'

interface Props {
  open: boolean
  prefillName?: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'created', operator: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const operatorsStore = useOperatorsStore()
const { success: showSuccess, error: showError } = useToast()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

const loading = ref(false)
const countryPopoverOpen = ref(false)
const countrySearchTerm = ref('')

const form = reactive({
  name: props.prefillName ?? '',
  sigle: '',
  flight_type: '' as 'regular' | 'non_regular' | '',
  iata_code: '',
  icao_code: '',
  country: '' as string | null,
})

const errors = reactive<Record<string, string>>({})

watch(() => props.prefillName, (val) => {
  if (val) form.name = val
})

// ── Pays dynamiques — exactement comme OperatorFormDialog ────────
// On extrait les pays uniques depuis les opérateurs déjà chargés dans le store.
// Quand operatorsStore.allOperators est vide, la liste sera vide et
// l'utilisateur pourra taper librement un pays via useCustomCountry().
const allCountries = computed(() => {
  const existing = operatorsStore.allOperators
    .map((op) => op.country)
    .filter((c): c is string => !!c && c.trim() !== '')
  return [...new Set(existing)].sort()
})

const filteredCountries = computed(() => {
  const term = countrySearchTerm.value.trim().toLowerCase()
  if (!term) return allCountries.value
  return allCountries.value.filter((c) => c.toLowerCase().includes(term))
})

const selectCountry = (country: string) => {
  form.country = country
  countryPopoverOpen.value = false
  countrySearchTerm.value = country
}

// Permet d'utiliser un pays libre (absent de la liste) — comme dans OperatorFormDialog
const useCustomCountry = () => {
  const val = countrySearchTerm.value.trim()
  if (!val) return
  form.country = val
  countryPopoverOpen.value = false
  countrySearchTerm.value = ''
}

// ── Validation ───────────────────────────────────────────────────
const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = 'Le nom est requis'
  if (!form.sigle.trim()) errors.sigle = 'Le sigle est requis'
  if (form.sigle.length > 10) errors.sigle = 'Maximum 10 caractères'
  if (!form.flight_type) errors.flight_type = 'Le type de vol est requis'
  if (form.iata_code && (form.iata_code.length < 2 || form.iata_code.length > 5))
    errors.iata_code = '2 à 5 caractères'
  if (form.icao_code && (form.icao_code.length < 3 || form.icao_code.length > 5))
    errors.icao_code = '3 à 5 caractères'
  return Object.keys(errors).length === 0
}

// ── Soumission ───────────────────────────────────────────────────
const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const payload: OperatorFormData = {
      name: form.name.trim(),
      sigle: form.sigle.trim(),
      flight_type: form.flight_type as 'regular' | 'non_regular',
      iata_code: form.iata_code || null,
      icao_code: form.icao_code || null,
      country: form.country || null,
    }

    const res = await operatorsStore.createOperator(payload)

    if (res.success && res.data) {
      showSuccess(`Exploitant « ${res.data.name} » créé avec succès`)
      emit('created', res.data)
      isOpen.value = false
      Object.assign(form, {
        name: '', sigle: '', flight_type: '',
        iata_code: '', icao_code: '', country: null,
      })
      countrySearchTerm.value = ''
    } else {
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