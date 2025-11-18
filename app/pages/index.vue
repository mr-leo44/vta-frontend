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
          <div class="text-2xl font-bold">{{ stats.operators.total }}</div>
          <p class="text-xs text-muted-foreground">
            <span class="text-yellow-600">+{{ stats.operators.newThisMonth }} ce mois-ci</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Aéronefs</CardTitle>
          <Plane class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.aircrafts.total }}</div>
          <p class="text-xs text-muted-foreground">
            <span class="text-yellow-600">+{{ stats.aircrafts.newThisMonth }} ce mois-ci</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Vols</CardTitle>
          <PlaneTakeoff class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.flights.total }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="stats.flights.trend >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ stats.flights.trend >= 0 ? '+' : '' }}{{ stats.flights.monthlyFlights }} ce mois-ci
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Agents actifs</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.users.active }}</div>
          <p class="text-xs text-muted-foreground">
            <!-- ⚠️ DONNÉES MANQUANTES: L'API n'a pas d'endpoint pour les utilisateurs/agents -->
            <!-- Suggestion API: GET /users ou GET /agents -->
            <span class="text-yellow-600">Données non disponibles</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Rapports</CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.reports.total }}</div>
          <p class="text-xs text-muted-foreground">
            <!-- ⚠️ DONNÉES MANQUANTES: L'API n'a pas d'endpoint pour les rapports -->
            <!-- Suggestion API: GET /reports ou GET /statistics/reports -->
            <span class="text-yellow-600">Données non disponibles</span>
          </p>
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

        <Button variant="outline" class="h-24 flex-col gap-2" @click="navigateTo('/agents')" disabled>
          <Users class="h-8 w-8" />
          <span class="font-semibold">Gérer les agents</span>
          <span class="text-xs text-muted-foreground">(Bientôt disponible)</span>
        </Button>

        <Button variant="outline" class="h-24 flex-col gap-2" @click="navigateTo('/reports')" disabled>
          <FileText class="h-8 w-8" />
          <span class="font-semibold">Voir les rapports</span>
          <span class="text-xs text-muted-foreground">(Bientôt disponible)</span>
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
        <div v-if="recentActivities.length > 0" class="space-y-4">
          <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center gap-4">
            <div :class="['h-8 w-8 rounded-full flex items-center justify-center', activity.colorClass]">
              <component :is="activity.icon" class="h-4 w-4" :class="activity.iconColorClass" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">{{ activity.title }}</p>
              <p class="text-xs text-muted-foreground">{{ activity.description }} • {{ activity.timeAgo }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-muted-foreground">
          <p>Aucune activité récente</p>
          <!-- ⚠️ DONNÉES MANQUANTES: L'API n'a pas d'endpoint pour les activités/logs -->
          <!-- Suggestion API: GET /activities ou GET /audit-logs -->
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
import { ref, onMounted, computed } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const operatorsStore = useOperatorsStore()
const aircraftsStore = useAircraftsStore()
const flightsStore = useFlightsStore()

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
      newThisMonth : newOperatorsThisMonth,
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
      active: 0 // ⚠️ DONNÉE MANQUANTE - Pas d'endpoint users/agents
    },
    reports: {
      total: 0 // ⚠️ DONNÉE MANQUANTE - Pas d'endpoint rapports
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
      colorClass: 'bg-blue-100',
      iconColorClass: 'text-blue-600'
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
      colorClass: 'bg-indigo-100',
      iconColorClass: 'text-indigo-600'
    })
  })

  // Trier par date et limiter à 5 activités
  return activities
    .sort((a, b) => {
      // Tri basique, idéalement il faudrait une vraie date
      return 0
    })
    .slice(0, 5)
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
    // Charger les données en parallèle
    // Pour le dashboard, on charge TOUTES les données (pas de pagination)
    // pour avoir des stats précises
    await Promise.all([
      operatorsStore.fetchAllOperators(),  // Charge TOUS les opérateurs
      aircraftsStore.fetchAllAircrafts(),  // Charge TOUS les aéronefs
      flightsStore.fetchFlights(1)         // Charge première page des vols (pagination)
    ])
  } catch (error) {
    console.error('Erreur lors du chargement des données du dashboard:', error)
  } finally {
    loading.value = false
  }
})
</script>