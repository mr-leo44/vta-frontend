<template>
  <div class="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-indigo-400/10 blur-3xl animate-pulse delay-500"></div>
    </div>

    <!-- Loading content -->
    <div class="relative z-10 flex flex-col items-center gap-6">
      <!-- Logo avec animation -->
      <div class="relative group">
        <div class="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur opacity-75 animate-pulse"></div>
        <div class="relative h-24 w-24 rounded-full bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
          <span class="text-4xl font-black text-white">VTA</span>
        </div>
      </div>

      <!-- Spinner -->
      <div class="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

      <!-- Texte -->
      <div class="text-center space-y-2">
        <p class="text-lg font-semibold text-foreground">{{ message || 'Vérification en cours...' }}</p>
        <p class="text-sm text-muted-foreground">Système de gestion des vols • VTA</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

defineProps<Props>()
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.delay-500 {
  animation-delay: 500ms;
}

.delay-1000 {
  animation-delay: 1000ms;
}
</style>