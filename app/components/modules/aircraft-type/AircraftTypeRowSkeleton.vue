<template>
  <div class="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg">
    <!-- Indicateur -->
    <div class="w-0.5 self-stretch rounded-full bg-muted shrink-0" />
    <!-- Icône -->
    <Skeleton class="h-8 w-8 rounded-md shrink-0" />
    <!-- Infos -->
    <div class="flex-1 space-y-1.5 min-w-0">
      <Skeleton class="h-3.5 w-48" />
      <div class="flex items-center gap-2">
        <Skeleton class="h-3 w-12" />
        <Skeleton class="h-3 w-1 rounded-full" />
        <Skeleton class="h-3 w-20" />
        <Skeleton class="h-3 w-1 rounded-full" />
        <Skeleton class="h-3 w-16" />
      </div>
    </div>
    <!-- Menu -->
    <Skeleton class="h-8 w-8 rounded-md shrink-0" />
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>