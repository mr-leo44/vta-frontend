<template>
  <div class="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-600 via-emerald-600 to-emerald-600 p-8 text-white shadow-2xl">
    <div class="absolute inset-0 bg-black/10"></div>
    
    <div class="relative z-10">
      <div class="flex items-center gap-4 mb-2">
        <div class="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/30">
          <Bus class="h-9 w-9 text-white" />
        </div>
        
        <div>
          <h1 class="text-4xl font-bold tracking-tight">Rapports Paxbus</h1>
          <p class="text-white/90 text-sm mt-1 font-medium italic">
            Analyse et exportation des données de transport passagers
          </p>
        </div>
      </div>
    </div>

    <div class="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
    <div class="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-orange-400/20 blur-2xl"></div>
  </div>
</template>

<script setup lang="ts">
import { Bus } from 'lucide-vue-next'
</script>

<style scoped>
/* Optionnel : Animation d'entrée pour l'icône */
.h-16 {
  animation: pulse-subtle 3s infinite ease-in-out;
}

@keyframes pulse-subtle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>