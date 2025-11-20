<template>
  <Card class="hover:bg-muted/50 transition-colors">
    <CardContent class="p-4">
      <div class="flex items-center gap-4">
        <Skeleton class="h-12 w-12 rounded-lg shrink-0" />
        <div class="flex-1 space-y-2">
          <Skeleton class="h-5 w-32" />
          <Skeleton class="h-4 w-48" />
        </div>
        <div class="hidden md:flex gap-2">
          <Skeleton class="h-4 w-16" />
          <Skeleton class="h-4 w-4 rounded-full" />
          <Skeleton class="h-4 w-16" />
        </div>
        <div class="hidden lg:flex gap-4">
          <Skeleton class="h-8 w-20" />
          <Skeleton class="h-8 w-20" />
        </div>
        <Skeleton class="h-8 w-8 rounded-md shrink-0" />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>