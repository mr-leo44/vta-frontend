<template>
  <div
    class="group flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg hover:border-blue-500/30 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all duration-150 cursor-pointer"
    @click="$emit('view', operator)"
  >
    <!-- Indicateur type de vol — deux teintes de bleu -->
    <div
      class="w-0.5 self-stretch rounded-full shrink-0"
      :class="operator.flight_type?.value === 'regular' ? 'bg-blue-600' : 'bg-blue-400'"
    />

    <!-- Icône -->
    <div class="h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
      <Building2 class="h-4 w-4 text-blue-600 dark:text-blue-400" />
    </div>

    <!-- Informations principales -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="font-medium text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {{ operator.name }}
        </span>
        <Badge variant="secondary" class="text-xs font-mono shrink-0">{{ operator.sigle }}</Badge>
      </div>
      <div class="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
        <span v-if="operator.country" class="flex items-center gap-1">
          <MapPin class="h-3 w-3" />
          {{ operator.country }}
        </span>
        <span v-if="operator.iata_code" class="font-mono">· IATA {{ operator.iata_code }}</span>
        <span v-if="operator.icao_code" class="font-mono">· OACI {{ operator.icao_code }}</span>
      </div>
    </div>

    <!-- Badge type de vol -->
    <Badge
      :class="operator.flight_type?.value === 'regular'
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'"
      class="text-xs shrink-0 border"
      variant="outline"
    >
      {{ operator.flight_type?.value === 'regular' ? 'Régulier' : 'Non régulier' }}
    </Badge>

    <!-- Actions -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child @click.stop>
        <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-44">
        <DropdownMenuItem @click.stop="$emit('view', operator)" class="cursor-pointer">
          <Eye class="mr-2 h-4 w-4" />
          Voir les détails
        </DropdownMenuItem>
        <DropdownMenuItem v-if="canEdit !== false" @click.stop="$emit('edit', operator)" class="cursor-pointer">
          <Pencil class="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator v-if="canDelete !== false" />
        <DropdownMenuItem
          v-if="canDelete !== false"
          @click.stop="$emit('delete', operator)"
          class="text-destructive focus:text-destructive cursor-pointer"
        >
          <Trash2 class="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { Building2, Eye, Pencil, Trash2, MoreVertical, MapPin } from 'lucide-vue-next'
import type { Operator } from '~/types/api'
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
  operator: Operator
  canEdit?: boolean
  canDelete?: boolean
}>()

defineEmits<{
  view: [operator: Operator]
  edit: [operator: Operator]
  delete: [operator: Operator]
}>()
</script>