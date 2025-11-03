<template>
  <div v-if="!authStore.currentUser" class="space-y-6">
    <div>
      <!-- Skeleton pour le titre et le texte -->
      <div class="mb-4">
        <Skeleton class="h-8 w-1/3 mb-2" /> <!-- titre h1 -->
        <Skeleton class="h-4 w-1/4" /> <!-- texte d'accueil -->
      </div>

      <!-- Skeleton pour le Card -->
      <Card>
        <CardHeader>
          <Skeleton class="h-5 w-1/4 mb-1" /> <!-- CardTitle -->
          <Skeleton class="h-4 w-1/3" /> <!-- CardDescription -->
        </CardHeader>
        <CardContent class="grid gap-4 md:grid-cols-2">
          <!-- Skeleton pour le bouton "Gérer les exploitants" -->
          <Skeleton class="h-24 w-full rounded-lg" />
          <!-- Skeleton pour le bouton "Gérer les vols" -->
          <Skeleton class="h-24 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>

  </div>
  <div v-else class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">Tableau de bord</h1>
      <p class="text-muted-foreground">
        Bienvenue, {{ authStore.user?.username || '' }} !
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Accès rapide</CardTitle>
        <CardDescription>Raccourcis vers les fonctionnalités principales</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 md:grid-cols-2">
        <Button variant="outline" class="h-24 flex-col gap-2" @click="navigateTo('/operators')">
          <Building2 class="h-8 w-8" />
          <span class="font-semibold">Gérer les exploitants</span>
        </Button>
        <Button variant="outline" class="h-24 flex-col gap-2" disabled>
          <Plane class="h-8 w-8" />
          <span class="font-semibold">Gérer les vols</span>
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Building2, Plane } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Skeleton from '~/components/ui/skeleton/Skeleton.vue'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
</script>