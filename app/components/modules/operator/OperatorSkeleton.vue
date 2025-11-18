<template>
  <Card class="hover:shadow-md transition-shadow">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div class="flex-1 space-y-2">
          <Skeleton class="h-6 w-3/4" />
          <div class="flex gap-2">
            <Skeleton class="h-5 w-16" />
            <Skeleton class="h-5 w-20" />
          </div>
        </div>
        <Skeleton class="h-8 w-8 rounded-md" />
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-5 w-12" />
        </div>
        <div class="flex items-center justify-between">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-5 w-10" />
        </div>
        <div class="pt-2 border-t">
          <Skeleton class="h-4 w-32" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>