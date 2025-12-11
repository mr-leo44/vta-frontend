<template>
  <Card class="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden">
    <!-- linear overlay on hover -->
    <div class="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <!-- Main clickable area for view -->
    <div @click="$emit('view', operator)" class="relative">
      <CardHeader class="pb-3">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Company logo/icon with animation -->
            <div class="h-16 w-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
              <Building2 class="h-8 w-8 text-white" />
            </div>
            
            <CardTitle class="text-xl mb-2 group-hover:text-primary transition-colors">
              {{ operator.name }}
            </CardTitle>
            
            <CardDescription class="mt-2">
              <div class="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" class="font-semibold">{{ operator.sigle }}</Badge>
                <Badge v-if="operator.iata_code" variant="outline" class="font-mono">
                  <Ticket class="h-3 w-3 mr-1" />
                  {{ operator.iata_code }}
                </Badge>
              </div>
            </CardDescription>
          </div>
          
          <!-- Actions menu (non-clickable for view) -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child @click.stop>
              <Button 
                variant="ghost" 
                size="icon"
                class="h-9 w-9 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10"
              >
                <MoreVertical class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuItem @click.stop="$emit('view', operator)" class="cursor-pointer">
                <Eye class="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem @click.stop="$emit('edit', operator)" class="cursor-pointer">
                <Pencil class="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                @click.stop="$emit('delete', operator)" 
                class="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 class="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent class="space-y-3">
        <!-- Location info -->
        <div v-if="operator.country" class="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <MapPin class="h-4 w-4 text-muted-foreground shrink-0" />
          <span class="font-medium">{{ operator.country }}</span>
        </div>
        
        <!-- Flight type and nature badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <Badge 
            :variant="operator.flight_type.value === 'regular' ? 'default' : 'secondary'"
            class="gap-1"
          >
            <Plane class="h-3 w-3" />
            {{ operator.flight_type.label }}
          </Badge>
          <Badge 
            :variant="operator.flight_nature.value === 'commercial' ? 'default' : 'secondary'"
            class="gap-1"
          >
            <Briefcase class="h-3 w-3" />
            {{ operator.flight_nature.label }}
          </Badge>
        </div>
        
        <!-- ICAO code -->
        <div v-if="operator.icao_code" class="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-muted/30 rounded">
          <Radio class="h-3 w-3" />
          <span>Code OACI : <span class="font-mono font-semibold">{{ operator.icao_code }}</span></span>
        </div>
      </CardContent>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Eye, Pencil, Trash2, MoreVertical, MapPin, Building2, Plane, Briefcase, Ticket, Radio } from 'lucide-vue-next'
import type { Operator } from '~/types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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