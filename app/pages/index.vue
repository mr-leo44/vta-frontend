<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">Tableau de bord</h1>
      <p class="text-muted-foreground">
        Bienvenue, {{ authStore.user?.username || 'utilisateur' }} !
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

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
</script>