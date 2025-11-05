<template>
  <Card class="hover:shadow-lg transition-shadow cursor-pointer">
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <CardTitle class="text-lg font-mono">{{ aircraft.immatriculation }}</CardTitle>
          <CardDescription class="mt-1">
            <div class="flex items-center gap-2">
              <Badge variant="secondary">{{ aircraft.type?.sigle || 'N/A' }}</Badge>
              <Badge :variant="aircraft.in_activity ? 'default' : 'outline'">
                {{ aircraft.in_activity ? 'Actif' : 'Inactif' }}
              </Badge>
            </div>
          </CardDescription>
        </div>
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
    </CardHeader>
    <CardContent>
      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2 text-muted-foreground">
          <Plane class="h-4 w-4" />
          <span>{{ aircraft.type?.name || 'Type inconnu' }}</span>
        </div>
        <div class="flex items-center gap-2 text-muted-foreground">
          <Building2 class="h-4 w-4" />
          <span>{{ aircraft.operator?.name || 'Opérateur inconnu' }}</span>
        </div>
        <div v-if="aircraft.pmad" class="text-xs text-muted-foreground">
          PMAD: {{ aircraft.pmad.toLocaleString() }} kg
        </div>
        <div v-if="aircraft.flights && aircraft.flights.length > 0" class="text-xs text-muted-foreground pt-2 border-t">
          {{ aircraft.flights.length }} vol{{ aircraft.flights.length > 1 ? 's' : '' }} enregistré{{ aircraft.flights.length > 1 ? 's' : '' }}
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Eye, Pencil, Trash2, MoreVertical, Plane, Building2 } from 'lucide-vue-next'
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