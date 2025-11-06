<template>
  <div class="space-y-3">
    <div v-for="i in count" :key="i" class="flex items-center gap-4 p-4 border rounded-lg">
      <Skeleton class="h-10 w-10 rounded-full" />
      <div class="flex-1 space-y-2">
        <Skeleton class="h-4 w-32" />
        <Skeleton class="h-3 w-2/3" />
      </div>
      <div class="hidden lg:block">
        <Skeleton class="h-8 w-16" />
      </div>
      <Skeleton class="h-8 w-8 rounded" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

withDefaults(defineProps<{
  count?: number
}>(), {
  count: 5
})
</script>