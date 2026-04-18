<template>
  <div
    class="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all duration-150
           hover:border-blue-400/60 dark:hover:border-blue-500/40 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(24,95,165,0.08)]"
    @click="$emit('view', operator)"
  >
    <!-- Barre latérale gauche : bleu plein = régulier, bleu clair = non régulier -->
    <div
      class="absolute left-0 top-0 bottom-0 w-[3px]"
      :class="operator.flight_type?.value === 'regular'
        ? 'bg-blue-600'
        : 'bg-blue-200 dark:bg-blue-800'"
    />

    <!-- Corps -->
    <div class="pl-5 pr-4 pt-4 pb-4">

      <!-- Ligne 1 : icône + nom + sigle + menu -->
      <div class="flex items-start justify-between gap-2 mb-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <!-- Icône -->
          <div class="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
            <Building2 class="h-[18px] w-[18px] text-blue-600 dark:text-blue-400" :stroke-width="1.5" />
          </div>
          <!-- Nom + sigle -->
          <div class="min-w-0">
            <p class="text-[13.5px] font-semibold leading-tight truncate text-foreground
                       group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ operator.name }}
            </p>
            <p class="text-[11px] font-mono text-muted-foreground mt-0.5">{{ operator.sigle }}</p>
          </div>
        </div>

        <!-- Menu (visible au hover) -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child @click.stop>
            <Button
              variant="ghost"
              size="icon"
              class="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity border border-border rounded-md"
            >
              <MoreVertical class="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-44">
            <DropdownMenuItem @click.stop="$emit('view', operator)" class="cursor-pointer text-sm">
              <Eye class="mr-2 h-3.5 w-3.5" />
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canEdit !== false"
              @click.stop="$emit('edit', operator)"
              class="cursor-pointer text-sm"
            >
              <Pencil class="mr-2 h-3.5 w-3.5" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator v-if="canDelete !== false" />
            <DropdownMenuItem
              v-if="canDelete !== false"
              @click.stop="$emit('delete', operator)"
              class="text-destructive focus:text-destructive cursor-pointer text-sm"
            >
              <Trash2 class="mr-2 h-3.5 w-3.5" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Séparateur -->
      <div class="h-px bg-border mb-3" />

      <!-- Ligne 2 : codes IATA / OACI -->
      <div class="flex items-center gap-1.5 flex-wrap mb-3">
        <span
          v-if="operator.iata_code"
          class="inline-flex items-center font-mono text-[11px] font-medium px-1.5 py-0.5 rounded
                 bg-muted border border-border text-muted-foreground leading-relaxed"
        >
          <span class="opacity-60 mr-1 font-normal">IATA</span>{{ operator.iata_code }}
        </span>
        <span
          v-if="operator.icao_code"
          class="inline-flex items-center font-mono text-[11px] font-medium px-1.5 py-0.5 rounded
                 bg-muted border border-border text-muted-foreground leading-relaxed"
        >
          <span class="opacity-60 mr-1 font-normal">OACI</span>{{ operator.icao_code }}
        </span>
      </div>

      <!-- Ligne 3 : badge type de vol -->
      <div
        class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-[3px] rounded border"
        :class="operator.flight_type?.value === 'regular'
          ? 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
          : 'bg-muted text-muted-foreground border-border'"
      >
        <Send
          class="h-[11px] w-[11px]"
          :class="operator.flight_type?.value === 'regular' ? 'text-blue-600 dark:text-blue-400' : ''"
          :stroke-width="2"
        />
        {{ operator.flight_type?.label }}
      </div>

      <!-- Ligne 4 : pays + hint hover -->
      <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
        <div v-if="operator.country" class="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Globe class="h-3 w-3 shrink-0" :stroke-width="1.5" />
          <span class="truncate">{{ operator.country }}</span>
        </div>
        <span
          class="text-[11px] font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
        >
          Voir →
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, Pencil, Trash2, MoreVertical, Building2, Send, Globe } from 'lucide-vue-next'
import type { Operator } from '~/types/api'
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