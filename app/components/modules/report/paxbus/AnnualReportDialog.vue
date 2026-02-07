<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Rapport Annuel Paxbus</DialogTitle>
        <DialogDescription>Sélectionnez l'année de référence.</DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label>Année</Label>
          <Popover v-model:open="yearOpen">
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-full justify-between">
                {{ year || 'Sélectionner une année' }}
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
                      v-for="y in availableYears"
                      :key="y"
                      :value="String(y)"
                      @select="() => {
                        year = String(y)
                        yearOpen = false
                      }"
                    >
                      <Check
                        :class="cn(
                          'mr-2 h-4 w-4',
                          year === String(y) ? 'opacity-100' : 'opacity-0',
                        )"
                      />
                      {{ y }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">Annuler</Button>
        <Button @click="$emit('generate', { year })" :disabled="!year || loading">Générer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<{ open: boolean, loading: boolean }>()
const emit = defineEmits(['update:open', 'generate'])

const isOpen = computed({ get: () => props.open, set: (v) => emit('update:open', v) })
const year = ref('')
const yearOpen = ref(false)

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 2025; i <= currentYear; i++) {
    years.push(i)
  }
  return years.reverse()
})
</script>