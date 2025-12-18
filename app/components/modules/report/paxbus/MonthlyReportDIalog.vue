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
          <Select v-model="form.year">
            <SelectTrigger><SelectValue placeholder="Année" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="y in years" :key="y" :value="String(y)">{{ y }}</SelectItem>
            </SelectContent>
          </Select>
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
const props = defineProps<{ open: boolean, loading: boolean }>()
const emit = defineEmits(['update:open', 'generate'])

const isOpen = computed({ get: () => props.open, set: (v) => emit('update:open', v) })
const form = ref({ month: '', year: '' })
const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
</script>