<template>
  <div class="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
    <!-- Status indicator -->
    <div :class="[
      'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
      aircraft.in_activity ? 'bg-green-100' : 'bg-gray-100'
    ]">
      <Plane :class="[
        'h-5 w-5',
        aircraft.in_activity ? 'text-green-600' : 'text-gray-400'
      ]" />
    </div>
    
    <!-- Informations principales -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <h3 class="font-mono font-medium">{{ aircraft.immatriculation }}</h3>
        <Badge :variant="aircraft.in_activity ? 'default' : 'secondary'" class="text-xs">
          {{ aircraft.in_activity ? 'Actif' : 'Inactif' }}
        </Badge>
      </div>
      <div class="flex items-center gap-2 text-sm text-muted-foreground mt-1">
        <span class="flex items-center gap-1">
          {{ aircraft.type?.name || 'Type inconnu' }}
          <span v-if="aircraft.type?.sigle" class="text-xs">({{ aircraft.type.sigle }})</span>
        </span>
        <span>• {{ aircraft.operator?.name || 'Opérateur inconnu' }}</span>
        <span v-if="aircraft.pmad">• PMAD: {{ aircraft.pmad.toLocaleString() }} kg</span>
      </div>
    </div>
    
    <!-- Statistiques -->
    <div v-if="aircraft.flights" class="hidden lg:block text-center flex-shrink-0">
      <div class="text-lg font-semibold">{{ aircraft.flights.length }}</div>
      <div class="text-xs text-muted-foreground">Vol{{ aircraft.flights.length > 1 ? 's' : '' }}</div>
    </div>
    
    <!-- Actions -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon">
          <MoreVertical class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="$emit('view', aircraft)">
          <Eye class="mr-2 h-4 w-4" />
          Voir les détails
        </DropdownMenuItem>
        <DropdownMenuItem @click="$emit('edit', aircraft)">
          <Pencil class="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="$emit('delete', aircraft)" class="text-destructive">
          <Trash2 class="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { Plane, Eye, Pencil, Trash2, MoreVertical } from 'lucide-vue-next'
import type { Aircraft } from '~/types/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

defineProps<{
  aircraft: Aircraft
}>()

defineEmits<{
  view: [aircraft: Aircraft]
  edit: [aircraft: Aircraft]
  delete: [aircraft: Aircraft]
}>()
</script>