<template>
  <Card class="hover:bg-muted/50 transition-colors">
    <CardContent class="p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 flex-1">
          <Skeleton class="h-12 w-12 rounded-full shrink-0" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-5 w-56" />
            <div class="flex items-center gap-2">
              <Skeleton class="h-4 w-12" />
              <Skeleton class="h-2 w-2 rounded-full" />
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-2 w-2 rounded-full" />
              <Skeleton class="h-4 w-32" />
            </div>
          </div>
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