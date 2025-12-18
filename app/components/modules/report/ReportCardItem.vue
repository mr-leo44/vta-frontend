<template>
  <Card 
    :class="['group hover:shadow-xl transition-all border-2 cursor-pointer', hoverBorderClass]"
    @click="$emit('click')"
  >
    <CardHeader>
      <div class="flex items-center justify-between">
        <div
          :class="['h-12 w-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform', gradientClass]"
        >
          <component :is="icon" class="h-6 w-6 text-white" />
        </div>
        <Badge variant="secondary">{{ badge }}</Badge>
      </div>
      <CardTitle class="mt-4">{{ title }}</CardTitle>
      <CardDescription>{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button class="w-full" variant="outline">
        <Download class="mr-2 h-4 w-4" />
        Générer
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download } from 'lucide-vue-next'

interface Props {
  icon: any
  title: string
  description: string
  badge: string
  gradientClass: string
  hoverBorderClass: string
}

defineProps<Props>()
defineEmits<{
  click: []
}>()
</script>