<template>
  <Card class="hover:shadow-lg transition-shadow cursor-pointer">
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <CardTitle class="text-lg">{{ operator.name }}</CardTitle>
          <CardDescription class="mt-1">
            <div class="flex items-center gap-2">
              <Badge variant="secondary">{{ operator.sigle }}</Badge>
              <Badge v-if="operator.iata_code" variant="outline">{{ operator.iata_code }}</Badge>
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
    </CardHeader>
    <CardContent>
      <div class="space-y-2 text-sm">
        <div v-if="operator.country" class="flex items-center gap-2 text-muted-foreground">
          <MapPin class="h-4 w-4" />
          <span>{{ operator.country }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Badge :variant="operator.flight_type.value === 'regular' ? 'default' : 'secondary'">
            {{ operator.flight_type.label }}
          </Badge>
          <Badge :variant="operator.flight_nature.value === 'commercial' ? 'default' : 'secondary'">
            {{ operator.flight_nature.label }}
          </Badge>
        </div>
        <div v-if="operator.icao_code" class="text-xs text-muted-foreground">
          Code OACI : {{ operator.icao_code }}
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Eye, Pencil, Trash2, MoreVertical, MapPin } from 'lucide-vue-next'
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