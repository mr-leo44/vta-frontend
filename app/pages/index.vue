<template>
  <div v-if="!authStore.currentUser" class="space-y-6">
    <div>
      <!-- Skeleton pour le titre et le texte -->
      <div class="mb-4">
        <Skeleton class="h-8 w-1/3 mb-2" />
        <Skeleton class="h-4 w-1/4" />
      </div>

      <!-- Skeleton pour le Card -->
      <Card>
        <CardHeader>
          <Skeleton class="h-5 w-1/4 mb-1" />
          <Skeleton class="h-4 w-1/3" />
        </CardHeader>
        <CardContent class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton class="h-24 w-full rounded-lg" />
          <Skeleton class="h-24 w-full rounded-lg" />
          <Skeleton class="h-24 w-full rounded-lg" />
          <Skeleton class="h-24 w-full rounded-lg" />
          <Skeleton class="h-24 w-full rounded-lg" />
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

    <!-- Statistiques principales -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Exploitants</CardTitle>
          <Building2 class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">24</div>
          <p class="text-xs text-muted-foreground">+2 ce mois-ci</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Aéronefs</CardTitle>
          <Plane class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">142</div>
          <p class="text-xs text-muted-foreground">+12 ce mois-ci</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Vols</CardTitle>
          <PlaneTakeoff class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">356</div>
          <p class="text-xs text-muted-foreground">+45 ce mois-ci</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Agents actifs</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">18</div>
          <p class="text-xs text-muted-foreground">+1 ce mois-ci</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Rapports</CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">89</div>
          <p class="text-xs text-muted-foreground">+23 ce mois-ci</p>
        </CardContent>
      </Card>
    </div>

    <!-- Accès rapide -->
    <Card>
      <CardHeader>
        <CardTitle>Accès rapide</CardTitle>
        <CardDescription>Raccourcis vers les fonctionnalités principales</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Button variant="outline" class="h-24 flex-col gap-2" @click="navigateTo('/operators')">
          <Building2 class="h-8 w-8" />
          <span class="font-semibold">Gérer les exploitants</span>
        </Button>
        
        <Button variant="outline" class="h-24 flex-col gap-2" @click="navigateTo('/flights')">
          <PlaneTakeoff class="h-8 w-8" />
          <span class="font-semibold">Gérer les vols</span>
        </Button>

        <Button variant="outline" class="h-24 flex-col gap-2" @click="navigateTo('/aircrafts')">
          <Plane class="h-8 w-8" />
          <span class="font-semibold">Gérer les aéronefs</span>
        </Button>

        <Button variant="outline" class="h-24 flex-col gap-2" @click="navigateTo('/aircrafts/types')">
          <Layers class="h-8 w-8" />
          <span class="font-semibold">Types d'aéronefs</span>
        </Button>

        <Button variant="outline" class="h-24 flex-col gap-2" @click="navigateTo('/agents')">
          <Users class="h-8 w-8" />
          <span class="font-semibold">Gérer les agents</span>
        </Button>

        <Button variant="outline" class="h-24 flex-col gap-2" @click="navigateTo('/reports')">
          <FileText class="h-8 w-8" />
          <span class="font-semibold">Voir les rapports</span>
        </Button>

        <Button variant="outline" class="h-24 flex-col gap-2" @click="navigateTo('/permissions')">
          <Shield class="h-8 w-8" />
          <span class="font-semibold">Gérer les permissions</span>
        </Button>
      </CardContent>
    </Card>

    <!-- Activités récentes -->
    <Card>
      <CardHeader>
        <CardTitle>Activités récentes</CardTitle>
        <CardDescription>Les dernières actions effectuées dans le système</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <PlaneTakeoff class="h-4 w-4 text-blue-600" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">Nouveau vol enregistré</p>
              <p class="text-xs text-muted-foreground">AF1234 Paris-Tokyo • Il y a 1 heure</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Plane class="h-4 w-4 text-indigo-600" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">Nouvel aéronef ajouté</p>
              <p class="text-xs text-muted-foreground">Boeing 737-800 • Il y a 2 heures</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <Building2 class="h-4 w-4 text-green-600" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">Exploitant mis à jour</p>
              <p class="text-xs text-muted-foreground">Air France • Il y a 5 heures</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <FileText class="h-4 w-4 text-purple-600" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">Nouveau rapport généré</p>
              <p class="text-xs text-muted-foreground">Rapport mensuel • Hier</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Users class="h-4 w-4 text-orange-600" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">Nouvel agent enregistré</p>
              <p class="text-xs text-muted-foreground">Marie Dupont • Il y a 2 jours</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Building2, Plane, Users, FileText, Shield, Layers, PlaneTakeoff } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Skeleton from '~/components/ui/skeleton/Skeleton.vue'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
</script>