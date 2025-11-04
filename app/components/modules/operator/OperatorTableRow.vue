<template>
  <div class="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
    <!-- Avatar/Icon -->
    <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Building2 class="h-5 w-5 text-primary" />
    </div>
    
    <!-- Informations principales -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <h3 class="font-medium truncate">{{ operator.name }}</h3>
        <Badge variant="secondary" class="text-xs">{{ operator.sigle }}</Badge>
      </div>
      <div class="flex items-center gap-2 text-sm text-muted-foreground mt-1">
        <span v-if="operator.country" class="flex items-center gap-1">
          <MapPin class="h-3 w-3" />
          {{ operator.country }}
        </span>
        <span v-if="operator.iata_code">• IATA: {{ operator.iata_code }}</span>
        <span v-if="operator.icao_code">• OACI: {{ operator.icao_code }}</span>
      </div>
    </div>
    
    <!-- Type et nature -->
    <div class="hidden md:flex items-center gap-2 flex-shrink-0">
      <Badge :variant="operator.flight_type.value === 'regular' ? 'default' : 'outline'" class="text-xs">
        {{ operator.flight_type.value === 'regular' ? 'Régulier' : 'Non régulier' }}
      </Badge>
      <Badge :variant="operator.flight_nature.value === 'commercial' ? 'default' : 'outline'" class="text-xs">
        {{ operator.flight_nature.value === 'commercial' ? 'Commercial' : 'Non commercial' }}
      </Badge>
    </div>
    
    <!-- Actions -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon">
          <MoreVertical class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="$emit('view', operator)">
          <Eye class="mr-2 h-4 w-4" />
          Voir les détails
        </DropdownMenuItem>
        <DropdownMenuItem @click="$emit('edit', operator)">
          <Pencil class="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="$emit('delete', operator)" class="text-destructive">
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
}>()

defineEmits<{
  view: [operator: Operator]
  edit: [operator: Operator]
  delete: [operator: Operator]
}>()
</script>