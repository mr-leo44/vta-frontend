<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Détails de l’exploitant</DialogTitle>
        <DialogDescription>Informations enregistrées sur cet exploitant.</DialogDescription>
      </DialogHeader>

      <div v-if="operator" class="space-y-4">
        <p><strong>Nom :</strong> {{ operator.name }}</p>
        <p><strong>Sigle :</strong> {{ operator.sigle }}</p>
        <p><strong>Pays :</strong> {{ operator.country || '—' }}</p>
        <p><strong>Code IATA :</strong> {{ operator.iata_code || '—' }}</p>
        <p><strong>Code OACI :</strong> {{ operator.icao_code || '—' }}</p>
        <p>
          <strong>Type de vol :</strong> {{ operator.flight_type.label }}<br />
          <strong>Nature du vol :</strong> {{ operator.flight_nature.label }}
        </p>
        <p class="text-muted-foreground text-sm">
          Créé le {{ new Date(operator.created_at!).toLocaleDateString() }}
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="open = false">Fermer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import type { Operator } from '~/types/api'

const open = defineModel<boolean>('open')
defineProps<{ operator: Operator | null }>()
</script>
