<template>
  <Transition name="slide-fade">
    <Card class="border-2 border-blue-200/50 dark:border-blue-800/50">
      <CardHeader class="pb-3">
        <div class="flex items-center gap-3">
          <div class="flex items-center space-x-2">
            <input 
              id="hasJustification" 
              v-model="formData.statistics!.has_justification" 
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-primary cursor-pointer" 
            />
            <Label for="hasJustification" class="text-base font-semibold cursor-pointer">
              Ajouter des justifications
            </Label>
          </div>
        </div>
      </CardHeader>

      <!-- Justifications Inputs -->
      <Transition name="slide-fade">
        <CardContent 
          v-if="formData.statistics!.has_justification" 
          class="space-y-4 border-t pt-4"
        >
          <div 
            v-for="idx in justificationCount" 
            :key="idx"
            class="space-y-3 p-4 bg-muted/30 rounded-lg border border-blue-200/30"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold">Justification {{ idx }}</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                @click="removeJustification(idx - 1)"
                class="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Minus class="h-4 w-4" />
              </Button>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium">Type de justification</Label>
              <Popover v-model:open="justificationPopovers[idx - 1]">
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" class="w-full justify-between h-10">
                    <span :class="{ 'text-muted-foreground': !justificationNames[idx - 1] }">
                      {{ justificationNames[idx - 1] || 'Sélectionner...' }}
                    </span>
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-full p-0">
                  <Command :filter-fn="filterJustifications">
                    <CommandInput 
                      v-model="justificationSearches[idx - 1]"
                      placeholder="Chercher ou créer..." 
                      :disabled="justificationsLoading" 
                    />
                    <CommandEmpty>
                      <div 
                        v-if="justificationsLoading"
                        class="p-2 text-xs text-muted-foreground text-center"
                      >
                        Chargement des justifications...
                      </div>
                      <Button 
                        v-else 
                        variant="ghost" 
                        class="w-full justify-start text-left"
                        @click="createNewJustificationItem(idx - 1)"
                        :disabled="!justificationSearches[idx - 1]"
                      >
                        <Plus class="mr-2 h-4 w-4" />
                        Créer: "{{ justificationSearches[idx - 1] }}"
                      </Button>
                    </CommandEmpty>
                    <CommandGroup class="max-h-64 overflow-y-auto">
                      <CommandItem 
                        v-for="j in justifications" 
                        :key="j.id" 
                        :value="j.name"
                        @select="selectJustificationItem(idx - 1, j.name)"
                      >
                        <Check :class="[
                          'mr-2 h-4 w-4',
                          justificationNames[idx - 1] === j.name ? 'opacity-100' : 'opacity-0'
                        ]" />
                        {{ j.name }}
                      </CommandItem>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label class="text-sm font-medium">Valeur</Label>
                <span class="text-xs text-muted-foreground">
                  Total: {{ justificationsTotalValue }} / {{ Math.abs(passengersEcart) }}
                </span>
              </div>
              <Input 
                v-model.number="justificationValues[idx - 1]" 
                type="number" 
                min="0" 
                placeholder="0"
                class="text-base" 
                :class="{ 'border-destructive': justificationsExceedLimit }" 
              />
              <p v-if="justificationsExceedLimit" class="text-xs text-destructive flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                La somme des justifications ({{ justificationsTotalValue }}) dépasse l'écart ({{
                  Math.abs(passengersEcart) }})
              </p>
            </div>

            <!-- SFR Input (conditional for Militaires) -->
            <Transition name="slide-fade">
              <div v-if="justificationNames[idx - 1] === 'Militaires'" class="space-y-2">
                <Label class="text-sm font-medium">SFR</Label>
                <Input 
                  v-model="justificationSfr[idx - 1]" 
                  type="text" 
                  placeholder="SFR value"
                  class="text-base" 
                />
              </div>
            </Transition>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            @click="addJustification" 
            class="w-full gap-2"
          >
            <Plus class="h-4 w-4" />
            Ajouter une justification
          </Button>

          <p v-if="errors.justification" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />{{ errors.justification }}
          </p>
        </CardContent>
      </Transition>
    </Card>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Plus, 
  Minus, 
  AlertCircle, 
  ChevronsUpDown, 
  Check 
} from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandEmpty
} from '@/components/ui/command'
import type { FlightFormData } from '~/types/api'

interface Props {
  formData: FlightFormData
  passengersEcart: number
  errors: Record<string, string>
}

const props = defineProps<Props>()

const justificationsStore = useFlightJustificationsStore()

const justificationCount = ref(1)
const justificationNames = ref<string[]>([''])
const justificationValues = ref<number[]>([0])
const justificationSfr = ref<string[]>([''])
const justificationPopovers = ref<boolean[]>([false])
const justificationSearches = ref<string[]>([''])

const justifications = computed(() => justificationsStore.justifications)
const justificationsLoading = computed(() => justificationsStore.loading)

const justificationsTotalValue = computed(() => {
  return justificationValues.value.reduce((sum, val) => sum + (val || 0), 0)
})

const justificationsExceedLimit = computed(() => {
  return justificationsTotalValue.value > Math.abs(props.passengersEcart)
})

const addJustification = () => {
  justificationCount.value++
  justificationNames.value.push('')
  justificationValues.value.push(0)
  justificationSfr.value.push('')
  justificationPopovers.value.push(false)
  justificationSearches.value.push('')
}

const removeJustification = (index: number) => {
  justificationCount.value--
  justificationNames.value.splice(index, 1)
  justificationValues.value.splice(index, 1)
  justificationSfr.value.splice(index, 1)
  justificationPopovers.value.splice(index, 1)
  justificationSearches.value.splice(index, 1)
}

const selectJustificationItem = (index: number, name: string) => {
  justificationNames.value[index] = name
  justificationPopovers.value[index] = false
}

const createNewJustificationItem = async (index: number) => {
  const name = justificationSearches.value[index].trim()
  if (name) {
    const result = await justificationsStore.createJustification(name)
    if (result.success && result.data) {
      justificationNames.value[index] = result.data.name
      justificationPopovers.value[index] = false
      justificationSearches.value[index] = ''
    } else {
      justificationNames.value[index] = name
      justificationPopovers.value[index] = false
      justificationSearches.value[index] = ''
    }
  }
}

const filterJustifications = (list: any[], search: string) => {
  if (!search) return list
  return list.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
}

const buildJustificationData = () => {
  const stats = props.formData.statistics

  if (!stats?.has_justification) {
    stats!.justification = {}
    return
  }

  const output: Record<string, any> = {}

  for (let i = 0; i < justificationCount.value; i++) {
    const name = justificationNames.value[i]
    const value = justificationValues.value[i]
    const sfr = justificationSfr.value[i]

    if (!name) continue

    if (name === "Militaires") {
      output[name] = {
        sfr: sfr || "",
        value: value || 0,
      }
      continue
    }

    output[name] = value || 0
  }

  stats!.justification = output
}

const loadJustificationsFromFormData = () => {
  if (props.formData.statistics?.has_justification && props.formData.statistics?.justification) {
    const justif = props.formData.statistics.justification
    justificationCount.value = 0
    justificationNames.value = []
    justificationValues.value = []
    justificationSfr.value = []

    for (const [key, value] of Object.entries(justif)) {
      justificationNames.value.push(key)

      if (key === 'Militaires' && typeof value === 'object' && value !== null) {
        justificationValues.value.push((value as any).value || 0)
        justificationSfr.value.push((value as any).sfr || '')
      } else {
        justificationValues.value.push(typeof value === 'number' ? value : 0)
        justificationSfr.value.push('')
      }

      justificationCount.value++
    }

    if (justificationCount.value === 0) {
      justificationCount.value = 1
      justificationNames.value = ['']
      justificationValues.value = [0]
      justificationSfr.value = ['']
    }

    justificationPopovers.value = Array(justificationCount.value).fill(false)
    justificationSearches.value = Array(justificationCount.value).fill(false)
  }
}

// Watch pour construire les données lors de la soumission
watch(() => props.formData.statistics?.has_justification, (hasJustif) => {
  if (hasJustif) {
    buildJustificationData()
  }
})

// Watch pour mettre à jour les justifications quand elles changent
watch([justificationNames, justificationValues, justificationSfr], () => {
  if (props.formData.statistics?.has_justification) {
    buildJustificationData()
  }
}, { deep: true })

onMounted(async () => {
  if (justificationsStore.justifications.length === 0) {
    await justificationsStore.fetchJustifications()
  }
  
  // Charger les justifications existantes si en mode édition
  loadJustificationsFromFormData()
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>