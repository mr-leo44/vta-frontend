<template>
  <Card 
    :class="['group hover:shadow-xl transition-all border-2 cursor-pointer', hoverBorderClass]"
    @click="$emit('click')"
  >
    <CardHeader>
      <div class="flex items-center gap-1 justify-between ">
        <div
          :class="['h-10 lg:h-12 w-10 lg:w-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform', gradientClass]"
        >
          <component :is="icon" class="h-4 lg:h-6 w-4 lg:w-6 text-white" />
        </div>
        <Badge variant="secondary">{{ badge }}</Badge>
      </div>
      <CardTitle class="mt-4 text-sm lg:text-base">{{ title }}</CardTitle>
      <CardDescription class="text-xs lg:text-base">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button class="w-full" variant="outline">
        <Download class="mr-2 h-4 w-4 text-sm lg:text-base" />
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