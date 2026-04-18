<template>
  <div class="space-y-1.5">
    <div
      v-for="i in count"
      :key="i"
      class="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg"
    >
      <div class="w-0.5 self-stretch rounded-full bg-muted shrink-0" />
      <Skeleton class="h-8 w-8 rounded-md shrink-0" />
      <div class="flex-1 space-y-1.5 min-w-0">
        <div class="flex items-center gap-2">
          <Skeleton class="h-3.5 w-24" />
          <Skeleton class="h-4 w-12 rounded" />
        </div>
        <div class="flex items-center gap-2">
          <Skeleton class="h-3 w-10" />
          <Skeleton class="h-3 w-28" />
          <Skeleton class="h-3 w-20" />
        </div>
      </div>
      <div class="hidden lg:flex flex-col items-end gap-1 shrink-0">
        <Skeleton class="h-4 w-6" />
        <Skeleton class="h-3 w-8" />
      </div>
      <Skeleton class="h-8 w-8 rounded-md shrink-0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

withDefaults(defineProps<{ count?: number }>(), { count: 5 })
</script>