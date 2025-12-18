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
          <Select v-model="year">
            <SelectTrigger><SelectValue placeholder="Année" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="y in years" :key="y" :value="String(y)">{{ y }}</SelectItem>
            </SelectContent>
          </Select>
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
const props = defineProps<{ open: boolean, loading: boolean }>()
const emit = defineEmits(['update:open', 'generate'])

const isOpen = computed({ get: () => props.open, set: (v) => emit('update:open', v) })
const year = ref('')
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
</script>