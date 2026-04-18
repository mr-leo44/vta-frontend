<template>
  <div
    class="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all duration-150
           hover:border-blue-400/60 dark:hover:border-blue-500/40 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(24,95,165,0.08)]"
    @click="$emit('view', aircraft)"
  >
    <!-- Barre latérale : vert = actif, gris = inactif -->
    <div
      class="absolute left-0 top-0 bottom-0 w-[3px]"
      :class="aircraft.in_activity ? 'bg-green-500' : 'bg-border'"
    />

    <div class="pl-5 pr-4 pt-4 pb-4">

      <!-- En-tête : icône + immatriculation + statut + menu -->
      <div class="flex items-start justify-between gap-2 mb-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
            :class="aircraft.in_activity
              ? 'bg-green-50 dark:bg-green-950'
              : 'bg-muted'"
          >
            <Plane
              class="h-[18px] w-[18px]"
              :class="aircraft.in_activity
                ? 'text-green-600 dark:text-green-400'
                : 'text-muted-foreground'"
              :stroke-width="1.5"
            />
          </div>
          <div class="min-w-0">
            <p class="text-[13.5px] font-semibold font-mono leading-tight truncate text-foreground
                       group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ aircraft.immatriculation }}
            </p>
            <span
              class="text-[11px] font-medium"
              :class="aircraft.in_activity
                ? 'text-green-600 dark:text-green-400'
                : 'text-muted-foreground'"
            >
              {{ aircraft.in_activity ? 'En activité' : 'Inactif' }}
            </span>
          </div>
        </div>

        <!-- Menu actions -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child @click.stop>
            <Button
              variant="ghost" size="icon"
              class="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity border border-border rounded-md"
            >
              <MoreVertical class="h-3.5 w-3.5" />
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

      <!-- Séparateur -->
      <div class="h-px bg-border mb-3" />

      <!-- Codes : type + PMAD -->
      <div class="flex items-center gap-1.5 flex-wrap mb-3">
        <span
          v-if="aircraft.type?.sigle"
          class="inline-flex items-center font-mono text-[11px] font-medium px-1.5 py-0.5 rounded
                 bg-muted border border-border text-muted-foreground leading-relaxed"
        >
          <span class="opacity-60 mr-1 font-normal">TYPE</span>{{ aircraft.type.sigle }}
        </span>
        <span
          v-if="aircraft.pmad"
          class="inline-flex items-center font-mono text-[11px] font-medium px-1.5 py-0.5 rounded
                 bg-muted border border-border text-muted-foreground leading-relaxed"
        >
          <span class="opacity-60 mr-1 font-normal">PMAD</span>{{ kgToTons(aircraft.pmad) }}
        </span>
      </div>

      <!-- Infos : type complet + opérateur -->
      <div class="space-y-1.5 mb-3">
        <div v-if="aircraft.type?.name" class="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Layers class="h-3 w-3 shrink-0" :stroke-width="1.5" />
          <span class="truncate">{{ aircraft.type.name }}</span>
        </div>
        <div v-if="aircraft.operator?.name" class="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Building2 class="h-3 w-3 shrink-0" :stroke-width="1.5" />
          <span class="truncate">{{ aircraft.operator.name }}</span>
        </div>
      </div>

      <!-- Footer : vols + hint -->
      <div class="flex items-center justify-between pt-2.5 border-t border-border">
        <span
          v-if="aircraft.flights && aircraft.flights.length > 0"
          class="flex items-center gap-1.5 text-[12px] text-blue-600 dark:text-blue-400 font-medium"
        >
          <PlaneTakeoff class="h-3 w-3 shrink-0" :stroke-width="1.5" />
          {{ aircraft.flights.length }} vol{{ aircraft.flights.length > 1 ? 's' : '' }}
        </span>
        <span v-else class="text-[12px] text-muted-foreground">Aucun vol</span>
        <span class="text-[11px] font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Voir →
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, Pencil, Trash2, MoreVertical, Plane, Building2, Layers, PlaneTakeoff } from 'lucide-vue-next'
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