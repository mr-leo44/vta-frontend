<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <component :is="icon" :class="['h-5 w-5', iconColor]" />
      <h3 class="text-lg font-semibold">{{ title }}</h3>
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Immatriculation</TableHead>
          <TableHead>Exploitant</TableHead>
          <TableHead class="text-right">Passagers</TableHead>
          <TableHead v-if="isInternational" class="text-right">Fret Arr. (kg)</TableHead>
          <TableHead class="text-right">{{ isInternational ? 'Fret Dép. (kg)' : 'Fret (kg)' }}</TableHead>
          <TableHead v-if="isInternational" class="text-right">Exc. Arr. (kg)</TableHead>
          <TableHead class="text-right">{{ isInternational ? 'Exc. Dép. (kg)' : 'Excédent (kg)' }}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="flight in flights" :key="flight.id">
          <TableCell class="font-medium">{{ flight.immatriculation }}</TableCell>
          <TableCell>{{ flight.operator }}</TableCell>
          <TableCell class="text-right">{{ flight.passengers }}</TableCell>
          <TableCell v-if="isInternational" class="text-right">{{ flight.fret_arrivee }}</TableCell>
          <TableCell class="text-right">{{ isInternational ? flight.fret_depart : flight.fret }}</TableCell>
          <TableCell v-if="isInternational" class="text-right">{{ flight.excedent_arrivee }}</TableCell>
          <TableCell class="text-right">{{ isInternational ? flight.excedent_depart : flight.excedent }}</TableCell>
        </TableRow>
        <TableRow v-if="flights.length === 0">
          <TableCell :colspan="isInternational ? 7 : 5" class="text-center text-muted-foreground py-8">
            {{ emptyMessage }}
          </TableCell>
        </TableRow>
        <!-- Total Row -->
        <TableRow v-if="flights.length > 0" :class="['font-semibold', totalRowClass]">
          <TableCell colspan="2">{{ totalLabel }}</TableCell>
          <TableCell class="text-right">{{ totals.passengers }}</TableCell>
          <TableCell v-if="isInternational" class="text-right">{{ totals.fret_arrivee }}</TableCell>
          <TableCell class="text-right">{{ isInternational ? totals.fret_depart : totals.fret }}</TableCell>
          <TableCell v-if="isInternational" class="text-right">{{ totals.excedent_arrivee }}</TableCell>
          <TableCell class="text-right">{{ isInternational ? totals.excedent_depart : totals.excedent }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Props {
  title: string
  icon: any
  iconColor: string
  flights: any[]
  totals: any
  totalLabel: string
  totalRowClass: string
  emptyMessage: string
  isInternational?: boolean
}

defineProps<Props>()
</script>