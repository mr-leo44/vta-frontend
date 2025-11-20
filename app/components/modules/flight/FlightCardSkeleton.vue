<template>
  <Card class="hover:shadow-md transition-shadow">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-2 flex-1">
          <Skeleton class="h-10 w-10 rounded-lg" />
          <div class="space-y-2 flex-1">
            <Skeleton class="h-5 w-24" />
            <Skeleton class="h-3 w-32" />
          </div>
        </div>
        <Skeleton class="h-8 w-8 rounded-md" />
      </div>
    </CardHeader>
    <CardContent class="space-y-3">
      <Skeleton class="h-12 w-full rounded-lg" />
      <div class="grid grid-cols-2 gap-2">
        <Skeleton class="h-16 w-full" />
        <Skeleton class="h-16 w-full" />
      </div>
      <div class="flex gap-2">
        <Skeleton class="h-6 w-20" />
        <Skeleton class="h-6 w-24" />
        <Skeleton class="h-6 w-16" />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>