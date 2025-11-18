<template>
  <Card class="hover:shadow-md transition-shadow">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div class="flex-1 space-y-2">
          <Skeleton class="h-5 w-3/4" />
          <Skeleton class="h-4 w-16" />
        </div>
        <Skeleton class="h-8 w-8 rounded-md" />
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-5 w-8" />
        </div>
        <div class="flex items-center justify-between">
          <Skeleton class="h-4 w-16" />
          <Skeleton class="h-4 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>