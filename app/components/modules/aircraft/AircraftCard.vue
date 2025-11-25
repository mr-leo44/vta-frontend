<template>
  <Card class="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden">
    <!-- Status indicator border -->
    <div :class="[
      'absolute left-0 top-0 bottom-0 w-1 transition-all',
      aircraft.in_activity ? 'bg-green-500' : 'bg-gray-400'
    ]"></div>
    
    <!-- Gradient overlay on hover -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <!-- Main clickable area for view -->
    <div @click="$emit('view', aircraft)" class="relative">
      <CardHeader class="pb-3">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Aircraft icon with status indicator -->
            <div class="relative inline-block mb-3">
              <div :class="[
                'h-16 w-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg',
                aircraft.in_activity 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              ]">
                <Plane class="h-8 w-8 text-white" />
              </div>
              <!-- Status dot -->
              <div :class="[
                'absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-background',
                aircraft.in_activity ? 'bg-green-500' : 'bg-gray-400'
              ]"></div>
            </div>
            
            <CardTitle class="text-xl font-mono mb-2 group-hover:text-primary transition-colors">
              {{ aircraft.immatriculation }}
            </CardTitle>
            
            <CardDescription class="mt-2">
              <div class="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" class="font-semibold gap-1">
                  <Layers class="h-3 w-3" />
                  {{ aircraft.type?.sigle || 'N/A' }}
                </Badge>
                <Badge :variant="aircraft.in_activity ? 'default' : 'outline'" class="gap-1">
                  <Activity class="h-3 w-3" />
                  {{ aircraft.in_activity ? 'Actif' : 'Inactif' }}
                </Badge>
              </div>
            </CardDescription>
          </div>
          
          <!-- Actions menu -->
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
              <DropdownMenuItem @click.stop="$emit('view', aircraft)" class="cursor-pointer">
                <Eye class="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem @click.stop="$emit('edit', aircraft)" class="cursor-pointer">
                <Pencil class="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                @click.stop="$emit('delete', aircraft)" 
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
        <!-- Aircraft type -->
        <div class="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Plane class="h-4 w-4 text-muted-foreground shrink-0" />
          <span class="font-medium">{{ aircraft.type?.name || 'Type inconnu' }}</span>
        </div>
        
        <!-- Operator -->
        <div class="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Building2 class="h-4 w-4 text-muted-foreground shrink-0" />
          <span class="font-medium">{{ aircraft.operator?.name || 'Opérateur inconnu' }}</span>
        </div>
        
        <!-- PMAD -->
        <div v-if="aircraft.pmad" class="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div class="flex items-center gap-2">
            <Weight class="h-4 w-4 text-primary" />
            <span class="text-sm font-medium">PMAD</span>
          </div>
          <span class="font-bold text-primary">{{ aircraft.pmad.toLocaleString() }} kg</span>
        </div>
        
        <!-- Flights count -->
        <div v-if="aircraft.flights && aircraft.flights.length > 0" class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div class="flex items-center gap-2">
            <PlaneTakeoff class="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span class="text-sm font-medium">Vols enregistrés</span>
          </div>
          <Badge variant="default" class="font-bold">
            {{ aircraft.flights.length }}
          </Badge>
        </div>
      </CardContent>
    </div>

    <!-- Quick action buttons at bottom -->
    <div class="px-6 pb-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button 
        variant="outline" 
        size="sm" 
        class="flex-1 gap-2"
        @click.stop="$emit('edit', aircraft)"
      >
        <Pencil class="h-3 w-3" />
        Modifier
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        class="gap-2"
        @click.stop="$emit('view', aircraft)"
      >
        <Eye class="h-3 w-3" />
        Détails
      </Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Eye, Pencil, Trash2, MoreVertical, Plane, Building2, Layers, Activity, Weight, PlaneTakeoff } from 'lucide-vue-next'
import type { Aircraft } from '~/types/api'
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
  aircraft: Aircraft
}>()

defineEmits<{
  view: [aircraft: Aircraft]
  edit: [aircraft: Aircraft]
  delete: [aircraft: Aircraft]
}>()
</script>