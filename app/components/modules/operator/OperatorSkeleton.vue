<template>
  <div class="bg-card border border-border rounded-xl overflow-hidden">
    <!-- Bande couleur -->
    <Skeleton class="h-1 w-full rounded-none" />
    <div class="p-5">
      <!-- En-tête -->
      <div class="flex items-start gap-3 mb-4">
        <Skeleton class="h-10 w-10 rounded-lg shrink-0" />
        <div class="flex-1 space-y-1.5">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-3 w-1/3" />
        </div>
      </div>
      <!-- Badges -->
      <div class="flex gap-1.5 mb-4">
        <Skeleton class="h-5 w-16 rounded-full" />
        <Skeleton class="h-5 w-20 rounded-full" />
        <Skeleton class="h-5 w-14 rounded-full" />
      </div>
      <!-- Pays -->
      <Skeleton class="h-3.5 w-28" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>