<template>
  <Card>
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="flex-1 space-y-2">
          <Skeleton class="h-5 w-24" />
          <div class="flex items-center gap-2">
            <Skeleton class="h-5 w-16" />
            <Skeleton class="h-5 w-20" />
          </div>
        </div>
        <Skeleton class="h-8 w-8 rounded" />
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-4 w-4" />
          <Skeleton class="h-4 w-20" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div class="pt-2 border-t space-y-2">
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-3/4" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>
