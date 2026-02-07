<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Rapport Annuel de Trafic</DialogTitle>
        <DialogDescription>
          Sélectionnez l'année pour générer le rapport annuel
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="annual-year">Année</Label>
          <Popover v-model:open="yearOpen">
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-full justify-between">
                {{ localForm.year || 'Sélectionner une année' }}
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-[200px] p-0" side="top">
              <Command>
                <CommandInput placeholder="Rechercher année..." />
                <CommandEmpty>Aucune année trouvée.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      v-for="year in availableYears"
                      :key="year"
                      :value="String(year)"
                      @select="() => {
                        localForm.year = String(year)
                        yearOpen = false
                      }"
                    >
                      <Check
                        :class="cn(
                          'mr-2 h-4 w-4',
                          localForm.year === String(year) ? 'opacity-100' : 'opacity-0',
                        )"
                      />
                      {{ year }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Check, ChevronsUpDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'generate': [form: { year: string }]
}>()

const localForm = ref({
  year: ''
})

const yearOpen = ref(false)

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 2025; i <= currentYear; i++) {
    years.push(i)
  }
  return years.reverse()
})

const isValid = computed(() => {
  return localForm.value.year !== ''
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
      year: ''
    }
  }
})
</script>