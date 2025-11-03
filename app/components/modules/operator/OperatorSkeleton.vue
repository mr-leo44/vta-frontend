<template>
  <Card>
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="flex-1 space-y-2">
          <Skeleton class="h-5 w-3/4" />
          <div class="flex items-center gap-2">
            <Skeleton class="h-5 w-16" />
            <Skeleton class="h-5 w-12" />
          </div>
        </div>
        <Skeleton class="h-8 w-8 rounded" />
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        <Skeleton class="h-4 w-1/2" />
        <div class="flex items-center gap-2">
          <Skeleton class="h-5 w-20" />
          <Skeleton class="h-5 w-24" />
        </div>
        <Skeleton class="h-3 w-32" />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>