<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Rapport Mensuel Paxbus</DialogTitle>
        <DialogDescription>Choisissez le mois et l'année pour le rapport.</DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label>Mois</Label>
          <Select v-model="form.month">
            <SelectTrigger><SelectValue placeholder="Mois" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="(m, i) in months" :key="i" :value="String(i+1)">{{ m }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label>Année</Label>
          <Popover v-model:open="yearOpen">
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-full justify-between">
                {{ form.year || 'Sélectionner une année' }}
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
                      v-for="y in years"
                      :key="y"
                      :value="String(y)"
                      @select="() => {
                        form.year = String(y)
                        yearOpen = false
                      }"
                    >
                      <Check
                        :class="cn(
                          'mr-2 h-4 w-4',
                          form.year === String(y) ? 'opacity-100' : 'opacity-0',
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
        <Button @click="$emit('generate', form)" :disabled="!form.month || !form.year || loading">
          Générer
        </Button>
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
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<{ open: boolean, loading: boolean }>()
const emit = defineEmits(['update:open', 'generate'])

const isOpen = computed({ get: () => props.open, set: (v) => emit('update:open', v) })
const form = ref({ month: '', year: '' })
const yearOpen = ref(false)
const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const yearsList = []
  for (let i = 2025; i <= currentYear; i++) {
    yearsList.push(i)
  }
  return yearsList.reverse()
})
</script>