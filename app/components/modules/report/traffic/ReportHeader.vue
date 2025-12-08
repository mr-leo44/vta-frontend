<template>
  <div class="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
    <div class="absolute inset-0 bg-black/10"></div>
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-2">
        <div class="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
          <FileBarChart class="h-7 w-7" />
        </div>
        <div>
          <h1 class="text-4xl font-bold">Rapports de Trafic</h1>
          <p class="text-white/90 text-sm mt-1">
            Générer et exporter les rapports mensuels et annuels
          </p>
        </div>
      </div>
    </div>
    <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
    <div class="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
  </div>
</template>

<script setup lang="ts">
import { FileBarChart } from 'lucide-vue-next'
</script>