<template>
  <div class="bg-card border border-border rounded-xl overflow-hidden">
    <!-- Barre latérale simulée -->
    <div class="flex">
      <div class="w-[3px] bg-muted shrink-0"></div>
      <div class="flex-1 pl-5 pr-4 pt-4 pb-4">
        <!-- En-tête : icône + nom -->
        <div class="flex items-start gap-2.5 mb-3">
          <Skeleton class="h-9 w-9 rounded-lg shrink-0" />
          <div class="flex-1 space-y-1.5 pt-0.5">
            <Skeleton class="h-3.5 w-3/4" />
            <Skeleton class="h-3 w-1/4" />
          </div>
        </div>
        <!-- Séparateur -->
        <div class="h-px bg-border mb-3" />
        <!-- PMAD pill -->
        <Skeleton class="h-5 w-24 rounded mb-3" />
        <!-- Footer -->
        <div class="flex items-center gap-1.5 pt-2.5 border-t border-border">
          <Skeleton class="h-3 w-3 rounded" />
          <Skeleton class="h-3 w-20" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>