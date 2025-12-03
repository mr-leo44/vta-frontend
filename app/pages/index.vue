<template>
  <div v-if="loading" class="space-y-6">
    <div>
      <!-- Skeleton pour le titre et le texte -->
      <div class="mb-4">
        <Skeleton class="h-8 w-1/3 mb-2" />
        <Skeleton class="h-4 w-1/4" />
      </div>

      <!-- Skeleton pour les statistiques -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Skeleton class="h-32 w-full rounded-lg" />
        <Skeleton class="h-32 w-full rounded-lg" />
        <Skeleton class="h-32 w-full rounded-lg" />
        <Skeleton class="h-32 w-full rounded-lg" />
        <Skeleton class="h-32 w-full rounded-lg" />
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
        </CardContent>
      </Card>
    </div>
  </div>

  <div v-else class="space-y-6">
    <!-- Header avec linear moderne -->
    <div
      class="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-purple-600 to-slate-600 p-8 text-white shadow-2xl">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-2">
          <div class="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span class="text-2xl">👋</span>
          </div>
          <div>
            <h1 class="text-3xl font-bold">Bienvenue, {{ authStore.user?.username || '' }} !</h1>
            <p class="text-white/90 text-sm mt-1">
              Voici un aperçu de votre activité
            </p>
          </div>
        </div>
      </div>
      <!-- Decorative circles -->
      <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      <div class="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
    </div>

    <!-- Statistiques principales avec design moderne -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card
        class="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500/50 relative overflow-hidden">
        <div
          class="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        </div>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Exploitants</CardTitle>
          <div
            class="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Building2 class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold bg-linear-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {{ stats.operators.total }}
          </div>
          <p class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400">
              <TrendingUp class="h-3 w-3" />
              +{{ stats.operators.newThisMonth }}
            </span>
            ce mois-ci
          </p>
        </CardContent>
      </Card>

      <Card
        class="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-indigo-500/50 relative overflow-hidden">
        <div
          class="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        </div>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Aéronefs</CardTitle>
          <div
            class="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plane class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold bg-linear-to-br from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
            {{ stats.aircrafts.total }}
          </div>
          <p class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400">
              <TrendingUp class="h-3 w-3" />
              +{{ stats.aircrafts.newThisMonth }}
            </span>
            ce mois-ci
          </p>
        </CardContent>
      </Card>

      <Card
        class="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-500/50 relative overflow-hidden">
        <div
          class="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        </div>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Vols</CardTitle>
          <div
            class="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PlaneTakeoff class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold bg-linear-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
            {{ stats.flights.total }}
          </div>
          <p class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <span :class="[
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
              stats.flights.trend >= 0
                ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
            ]">
              <component :is="stats.flights.trend >= 0 ? TrendingUp : TrendingDown" class="h-3 w-3" />
              {{ stats.flights.trend >= 0 ? '+' : '' }}{{ stats.flights.monthlyFlights }}
            </span>
            ce mois-ci
          </p>
        </CardContent>
      </Card>

      <Card
        class="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-green-500/50 relative overflow-hidden">
        <div
          class="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        </div>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Agents actifs</CardTitle>
          <div
            class="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold bg-linear-to-br from-green-600 to-green-800 bg-clip-text text-transparent">
            {{ stats.users.active }}
          </div>
          <p class="text-xs text-muted-foreground mt-2">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              <AlertCircle class="h-3 w-3" />
              Données non disponibles
            </span>
          </p>
        </CardContent>
      </Card>

      <Card
        class="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-500/50 relative overflow-hidden">
        <div
          class="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        </div>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Rapports</CardTitle>
          <div
            class="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText class="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold bg-linear-to-br from-orange-600 to-orange-800 bg-clip-text text-transparent">
            {{ stats.reports.total }}
          </div>
          <p class="text-xs text-muted-foreground mt-2">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              <AlertCircle class="h-3 w-3" />
              Données non disponibles
            </span>
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Accès rapide avec design moderne -->
    <Card class="border-2 shadow-lg">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Zap class="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle class="text-xl">Accès rapide</CardTitle>
            <CardDescription>Raccourcis vers les fonctionnalités principales</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Button variant="outline"
          class="h-28 flex-col gap-3 group hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
          @click="navigateTo('/operators')">
          <div
            class="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Building2 class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <span class="font-semibold">Gérer les exploitants</span>
        </Button>

        <Button variant="outline"
          class="h-28 flex-col gap-3 group hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
          @click="navigateTo('/flights')">
          <div
            class="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PlaneTakeoff class="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <span class="font-semibold">Gérer les vols</span>
        </Button>

        <Button variant="outline"
          class="h-28 flex-col gap-3 group hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
          @click="navigateTo('/aircrafts')">
          <div
            class="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plane class="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span class="font-semibold">Gérer les aéronefs</span>
        </Button>

        <Button variant="outline"
          class="h-28 flex-col gap-3 group hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all"
          @click="navigateTo('/aircrafts/types')">
          <div
            class="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layers class="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <span class="font-semibold">Types d'aéronefs</span>
        </Button>

        <Button variant="outline" class="h-28 flex-col gap-3 opacity-60 cursor-not-allowed" disabled>
          <div class="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <Users class="h-6 w-6 text-gray-400" />
          </div>
          <div class="text-center">
            <span class="font-semibold block">Gérer les agents</span>
            <span class="text-xs text-muted-foreground">(Bientôt disponible)</span>
          </div>
        </Button>

        <Button variant="outline"
          class="h-28 flex-col gap-3 group hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
          @click="navigateTo('/reports/traffic')">
          <div
            class="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText class="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <span class="font-semibold">Voir les rapports</span>
        </Button>
      </CardContent>
    </Card>

    <!-- Activités récentes avec design moderne -->
    <Card class="border-2 shadow-lg">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Activity class="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle class="text-xl">Activités récentes</CardTitle>
            <CardDescription>Les dernières actions effectuées dans le système</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="recentActivities.length > 0" class="space-y-3">
          <div v-for="activity in recentActivities" :key="activity.id"
            class="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-all cursor-pointer group">
            <div
              :class="['h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform', activity.colorClass]">
              <component :is="activity.icon" class="h-5 w-5" :class="activity.iconColorClass" />
            </div>
            <div class="flex-1">
              <p class="font-medium">{{ activity.title }}</p>
              <p class="text-sm text-muted-foreground">{{ activity.description }}</p>
            </div>
            <div class="text-xs text-muted-foreground whitespace-nowrap">
              {{ activity.timeAgo }}
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <div class="h-20 w-20 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
            <Activity class="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <p class="text-lg font-medium mb-2">Aucune activité récente</p>
          <p class="text-sm text-muted-foreground">Les activités apparaîtront ici une fois que vous commencerez à
            utiliser le système</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Building2, Plane, Users, FileText, Layers, PlaneTakeoff, TrendingUp, TrendingDown, AlertCircle, Zap, Activity } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Skeleton from '~/components/ui/skeleton/Skeleton.vue'
import { ref, onMounted, computed } from 'vue'
import { useToast } from '@/composables/useToast'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const operatorsStore = useOperatorsStore()
const aircraftsStore = useAircraftsStore()
const flightsStore = useFlightsStore()

const { success: showSuccess, error: showError } = useToast()

const loading = ref(true)

// Statistiques calculées
const stats = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const lastMonth = currentMonth - 1
  const currentYear = now.getFullYear()

  // Calcul des vols du mois
  const monthlyFlights = flightsStore.flights.filter(f => {
    const flightDate = new Date(f.departure_time)
    return flightDate.getMonth() === currentMonth && flightDate.getFullYear() === currentYear
  }).length

  const lastMonthFlights = flightsStore.flights.filter(f => {
    const flightDate = new Date(f.departure_time)
    return flightDate.getMonth() === lastMonth && flightDate.getFullYear() === currentYear
  }).length

  // Calcul des operateurs du mois
  const newOperatorsThisMonth = operatorsStore.allOperators.filter(o => {
    const operatorDate = new Date(o.created_at)
    return operatorDate.getMonth() === currentMonth && operatorDate.getFullYear() === currentYear
  }).length

  // Calcul des aéronefs du mois
  const newAircraftsThisMonth = aircraftsStore.allAircrafts.filter(a => {
    const aircraftDate = new Date(a.created_at)
    return aircraftDate.getMonth() === currentMonth && aircraftDate.getFullYear() === currentYear
  }).length

  return {
    operators: {
      total: operatorsStore.allOperators.length || 0,
      newThisMonth: newOperatorsThisMonth,
    },
    aircrafts: {
      total: aircraftsStore.allAircrafts.length || 0,
      newThisMonth: newAircraftsThisMonth,
    },
    flights: {
      total: flightsStore.total || 0,
      monthlyFlights,
      trend: monthlyFlights - lastMonthFlights
    },
    users: {
      active: 0
    },
    reports: {
      total: 0
    }
  }
})

// Activités récentes basées sur les vraies données
const recentActivities = computed(() => {
  const activities: any[] = []

  // Derniers vols (limité à 3)
  const recentFlights = [...flightsStore.flights]
    .sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime())
    .slice(0, 3)

  recentFlights.forEach(flight => {
    activities.push({
      id: `flight-${flight.id}`,
      title: 'Nouveau vol enregistré',
      description: `${flight.flight_number} ${flight.departure?.[0] || ''}-${flight.arrival?.[0] || ''}`,
      timeAgo: getTimeAgo(flight.departure_time),
      icon: PlaneTakeoff,
      colorClass: 'bg-blue-100 dark:bg-blue-950',
      iconColorClass: 'text-blue-600 dark:text-blue-400'
    })
  })

  // Derniers aéronefs (limité à 2)
  const recentAircrafts = [...aircraftsStore.allAircrafts]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 2)

  recentAircrafts.forEach(aircraft => {
    activities.push({
      id: `aircraft-${aircraft.id}`,
      title: 'Nouvel aéronef ajouté',
      description: `${aircraft.type?.name || 'Type inconnu'} (${aircraft.immatriculation})`,
      timeAgo: aircraft.created_at ? getTimeAgo(aircraft.created_at) : 'Date inconnue',
      icon: Plane,
      colorClass: 'bg-indigo-100 dark:bg-indigo-950',
      iconColorClass: 'text-indigo-600 dark:text-indigo-400'
    })
  })

  return activities.slice(0, 5)
})

// Fonction helper pour calculer le temps écoulé
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  } else if (diffDays === 1) {
    return 'Hier'
  } else if (diffDays < 30) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('fr-FR')
  }
}

// Chargement des données au montage
onMounted(async () => {
  loading.value = true

  try {
    await Promise.all([
      operatorsStore.fetchAllOperators(),
      aircraftsStore.fetchAllAircrafts(),
      flightsStore.fetchFlights(1)
    ])
  } catch (error) {
    showError('Erreur lors du chargement des données du dashboard:', error)
  } finally {
    loading.value = false
  }
})
</script>