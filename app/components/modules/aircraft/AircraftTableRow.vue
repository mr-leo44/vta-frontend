<template>
  <div
    class="group flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg
           hover:border-blue-400/60 dark:hover:border-blue-500/40 hover:bg-muted/30 transition-all duration-150 cursor-pointer"
    @click="$emit('view', aircraft)"
  >
    <!-- Indicateur statut -->
    <div
      class="w-0.5 self-stretch rounded-full shrink-0"
      :class="aircraft.in_activity ? 'bg-green-500' : 'bg-border'"
    />

    <!-- Icône -->
    <div
      class="h-8 w-8 rounded-md flex items-center justify-center shrink-0"
      :class="aircraft.in_activity ? 'bg-green-50 dark:bg-green-950' : 'bg-muted'"
    >
      <Plane
        class="h-4 w-4"
        :class="aircraft.in_activity ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'"
        :stroke-width="1.5"
      />
    </div>

    <!-- Informations -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="font-mono font-medium text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {{ aircraft.immatriculation }}
        </span>
        <span
          class="text-[11px] font-medium px-1.5 py-0.5 rounded border shrink-0"
          :class="aircraft.in_activity
            ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
            : 'bg-muted text-muted-foreground border-border'"
        >
          {{ aircraft.in_activity ? 'Actif' : 'Inactif' }}
        </span>
      </div>
      <div class="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
        <span v-if="aircraft.type" class="font-mono">
          {{ aircraft.type.sigle }}
          <span class="font-sans opacity-70">· {{ aircraft.type.name }}</span>
        </span>
        <span v-if="aircraft.operator">· {{ aircraft.operator.name }}</span>
        <span v-if="aircraft.pmad">· PMAD {{ kgToTons(aircraft.pmad) }}</span>
      </div>
    </div>

    <!-- Vols -->
    <div v-if="aircraft.flights" class="hidden lg:flex flex-col items-end shrink-0">
      <span class="text-sm font-semibold text-foreground">{{ aircraft.flights.length }}</span>
      <span class="text-[10px] text-muted-foreground">vol{{ aircraft.flights.length > 1 ? 's' : '' }}</span>
    </div>

    <!-- Menu -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child @click.stop>
        <Button
          variant="ghost" size="icon"
          class="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-44">
        <DropdownMenuItem @click.stop="$emit('view', aircraft)" class="cursor-pointer text-sm">
          <Eye class="mr-2 h-3.5 w-3.5" />Voir les détails
        </DropdownMenuItem>
        <DropdownMenuItem v-if="canEdit !== false" @click.stop="$emit('edit', aircraft)" class="cursor-pointer text-sm">
          <Pencil class="mr-2 h-3.5 w-3.5" />Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator v-if="canDelete !== false" />
        <DropdownMenuItem
          v-if="canDelete !== false"
          @click.stop="$emit('delete', aircraft)"
          class="text-destructive focus:text-destructive cursor-pointer text-sm"
        >
          <Trash2 class="mr-2 h-3.5 w-3.5" />Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { Plane, Eye, Pencil, Trash2, MoreVertical } from 'lucide-vue-next'
import type { Aircraft } from '~/types/api'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

defineProps<{
  aircraft: Aircraft
  canEdit?: boolean
  canDelete?: boolean
}>()

defineEmits<{
  view: [aircraft: Aircraft]
  edit: [aircraft: Aircraft]
  delete: [aircraft: Aircraft]
}>()

const { kgToTons } = useAircraftUtils()
</script>