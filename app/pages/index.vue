<template>
  <LoadingScreen v-if="loading" message="Chargement du tableau de bord..." />

  <div v-else class="space-y-6">

    <!-- Hero banner -->
    <div class="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-400 to-blue-600 p-8 text-white shadow-2xl">
      <div class="absolute inset-0 bg-black/10" />
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-2">
          <div class="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span class="text-2xl">👋</span>
          </div>
          <div>
            <h1 class="text-3xl font-bold">Bienvenue, {{ authStore.user?.username ?? '' }} !</h1>
            <p class="text-white/90 text-sm mt-1 flex items-center gap-2">
              Voici un aperçu de votre activité
              <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                {{ roleLabelFull }}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div class="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
    </div>

    <!-- KPI Cards — visibles uniquement si l'utilisateur a accès aux données -->
    <div v-if="visibleStats.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card
        v-for="stat in visibleStats"
        :key="stat.key"
        class="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 relative overflow-hidden"
        :class="`hover:border-${stat.color}-500/50`"
        @click="navigateTo(stat.link)"
      >
        <div
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          :class="`bg-linear-to-br from-${stat.color}-500/5 to-transparent`"
        />
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ stat.label }}</CardTitle>
          <div
            class="h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
            :class="`bg-${stat.color}-100 dark:bg-${stat.color}-950`"
          >
            <component :is="stat.icon" class="h-5 w-5" :class="`text-${stat.color}-600 dark:text-${stat.color}-400`" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold bg-clip-text text-transparent" :class="`bg-linear-to-br from-${stat.color}-600 to-${stat.color}-800`">
            {{ stat.value }}
          </div>
          <p v-if="stat.badge" class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" :class="stat.badge.class">
              <component :is="stat.badge.icon" class="h-3 w-3" />
              {{ stat.badge.text }}
            </span>
            ce mois-ci
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Accès rapide — filtré par permissions -->
    <Card class="border-2 shadow-lg">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Zap class="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle class="text-xl">Accès rapide</CardTitle>
            <CardDescription>Raccourcis vers vos fonctionnalités disponibles</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

        <Button
          v-for="shortcut in visibleShortcuts"
          :key="shortcut.key"
          variant="outline"
          class="h-28 flex-col gap-3 group transition-all"
          :class="`hover:border-${shortcut.color}-500 hover:bg-${shortcut.color}-50 dark:hover:bg-${shortcut.color}-950/20`"
          @click="navigateTo(shortcut.link)"
        >
          <div
            class="h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
            :class="`bg-${shortcut.color}-100 dark:bg-${shortcut.color}-950`"
          >
            <component :is="shortcut.icon" class="h-6 w-6" :class="`text-${shortcut.color}-600 dark:text-${shortcut.color}-400`" />
          </div>
          <span class="font-semibold">{{ shortcut.label }}</span>
        </Button>

        <!-- Toujours visible : Mes permissions -->
        <Button
          variant="outline"
          class="h-28 flex-col gap-3 group hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all"
          @click="navigateTo('/permissions')"
        >
          <div class="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Shield class="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <span class="font-semibold">Mes permissions</span>
        </Button>

      </CardContent>
    </Card>

    <!-- Activités récentes -->
    <Card class="border-2 shadow-lg">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Activity class="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle class="text-xl">Activités récentes</CardTitle>
            <CardDescription>Les dernières actions enregistrées dans le système</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="recentActivities.length" class="space-y-3">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-all cursor-pointer group"
          >
            <div class="h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" :class="activity.colorClass">
              <component :is="activity.icon" class="h-5 w-5" :class="activity.iconColorClass" />
            </div>
            <div class="flex-1">
              <p class="font-medium">{{ activity.title }}</p>
              <p class="text-sm text-muted-foreground">{{ activity.description }}</p>
            </div>
            <div class="text-xs text-muted-foreground whitespace-nowrap">{{ activity.timeAgo }}</div>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <div class="h-20 w-20 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
            <Activity class="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <p class="text-lg font-medium mb-2">Aucune activité récente</p>
          <p class="text-sm text-muted-foreground">Les activités apparaîtront ici une fois que vous commencerez à utiliser le système</p>
        </div>
      </CardContent>
    </Card>

  </div>
</template>

<script setup lang="ts">
import {
  Building2, Plane, Users, FileText, Upload,
  PlaneTakeoff, TrendingUp, TrendingDown, AlertCircle,
  Zap, Activity, Shield, ShieldCheck
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import LoadingScreen from '~/components/LoadingScreen.vue'
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'

definePageMeta({ middleware: 'auth' })

const authStore      = useAuthStore()
const operatorsStore = useOperatorsStore()
const aircraftsStore = useAircraftsStore()
const flightsStore   = useFlightsStore()
const usersStore     = useUsersStore()
const { can, nav, isAdmin, isManager, isPermanent, isAgent } = usePermission()
const { error: showError } = useToast()

const loading = ref(true)

// ─── Label du rôle ────────────────────────────────────────────────────────────

const roleLabelFull = computed(() => ({
  admin:     'Administrateur',
  manager:   'Manager',
  permanent: 'Permanent',
  agent:     'Agent',
}[authStore.user?.role ?? ''] ?? ''))

// ─── Statistiques — uniquement les domaines accessibles ──────────────────────

const rawStats = computed(() => {
  const now          = new Date()
  const currentMonth = now.getMonth()
  const currentYear  = now.getFullYear()
  const lastMonth    = currentMonth - 1

  const monthlyFlights = flightsStore.flights.filter(f => {
    const d = new Date(f.departure_time)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).length

  const lastMonthFlights = flightsStore.flights.filter(f => {
    const d = new Date(f.departure_time)
    return d.getMonth() === lastMonth && d.getFullYear() === currentYear
  }).length

  const newOperators = operatorsStore.allOperators.filter(o => {
    const d = new Date(o.created_at ?? '')
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).length

  const newAircrafts = aircraftsStore.allAircrafts.filter(a => {
    const d = new Date(a.created_at ?? '')
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).length

  const trend = monthlyFlights - lastMonthFlights

  return { monthlyFlights, lastMonthFlights, newOperators, newAircrafts, trend }
})

/**
 * KPI cards filtrées selon les permissions.
 * Chaque card n'est incluse que si le user a le droit de voir la donnée.
 */
const visibleStats = computed(() => {
  const items = []

  if (nav.value.operators) {
    items.push({
      key:   'operators',
      label: 'Exploitants',
      value: operatorsStore.allOperators.length,
      icon:  Building2,
      color: 'blue',
      link:  '/operators',
      badge: {
        icon:  TrendingUp,
        text:  `+${rawStats.value.newOperators}`,
        class: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400',
      },
    })
  }

  if (nav.value.aircrafts) {
    items.push({
      key:   'aircrafts',
      label: 'Aéronefs',
      value: aircraftsStore.allAircrafts.length,
      icon:  Plane,
      color: 'indigo',
      link:  '/aircrafts',
      badge: {
        icon:  TrendingUp,
        text:  `+${rawStats.value.newAircrafts}`,
        class: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400',
      },
    })
  }

  if (nav.value.flights) {
    const trend = rawStats.value.trend
    items.push({
      key:   'flights',
      label: 'Vols',
      value: flightsStore.total,
      icon:  PlaneTakeoff,
      color: 'purple',
      link:  '/flights',
      badge: {
        icon:  trend >= 0 ? TrendingUp : TrendingDown,
        text:  `${trend >= 0 ? '+' : ''}${rawStats.value.monthlyFlights}`,
        class: trend >= 0
          ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
          : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
      },
    })
  }

  if (nav.value.agents) {
    items.push({
      key:   'agents',
      label: 'Agents actifs',
      value: usersStore.allUsers.length,
      icon:  Users,
      color: 'green',
      link:  '/agents',
      badge: usersStore.allUsers.length === 0
        ? { icon: AlertCircle, text: 'Données non disponibles', class: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' }
        : null,
    })
  }

  return items
})

// ─── Accès rapide — filtré par permissions ────────────────────────────────────

/**
 * Chaque shortcut est conditionné par une clé de `nav`.
 * "Mes permissions" est rendu directement dans le template (toujours visible).
 */
const visibleShortcuts = computed(() => {
  const all = [
    {
      key:   'flights',
      show:  nav.value.flights,
      label: 'Gérer les vols',
      icon:  PlaneTakeoff,
      color: 'purple',
      link:  '/flights',
    },
    {
      key:   'operators',
      show:  nav.value.operators,
      label: 'Gérer les exploitants',
      icon:  Building2,
      color: 'blue',
      link:  '/operators',
    },
    {
      key:   'aircrafts',
      show:  nav.value.aircrafts,
      label: 'Gérer les aéronefs',
      icon:  Plane,
      color: 'indigo',
      link:  '/aircrafts',
    },
    {
      key:   'reports',
      show:  nav.value.reports,
      label: 'Voir les rapports',
      icon:  FileText,
      color: 'orange',
      link:  '/reports',
    },
    {
      key:   'agents',
      show:  nav.value.agents,
      label: 'Gérer les utilisateurs',
      icon:  Users,
      color: 'teal',
      link:  '/agents',
    },
    {
      key:   'imports',
      show:  nav.value.imports,
      label: 'Imports',
      icon:  Upload,
      color: 'teal',
      link:  '/imports',
    },
  ]

  return all.filter(s => s.show)
})

// ─── Activités récentes ───────────────────────────────────────────────────────

const recentActivities = computed(() => {
  const activities: any[] = []

  // Vols — si le user peut les voir
  if (nav.value.flights) {
    ;[...flightsStore.flights]
      .sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime())
      .slice(0, 3)
      .forEach(f => {
        activities.push({
          id:           `flight-${f.id}`,
          title:        'Vol enregistré',
          description:  `${f.flight_number}  ${f.departure?.from?.iata ?? ''} → ${f.departure?.to?.iata ?? ''}`,
          timeAgo:      getTimeAgo(f.departure_time),
          icon:         PlaneTakeoff,
          colorClass:   'bg-blue-100 dark:bg-blue-950',
          iconColorClass: 'text-blue-600 dark:text-blue-400',
        })
      })
  }

  // Aéronefs — si le user peut les voir
  if (nav.value.aircrafts) {
    ;[...aircraftsStore.allAircrafts]
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 2)
      .forEach(a => {
        activities.push({
          id:           `aircraft-${a.id}`,
          title:        'Aéronef ajouté',
          description:  `${a.type?.name ?? 'Type inconnu'} (${a.immatriculation})`,
          timeAgo:      a.created_at ? getTimeAgo(a.created_at) : '—',
          icon:         Plane,
          colorClass:   'bg-indigo-100 dark:bg-indigo-950',
          iconColorClass: 'text-indigo-600 dark:text-indigo-400',
        })
      })
  }

  return activities.slice(0, 5)
})

// ─── Helper date ──────────────────────────────────────────────────────────────

const getTimeAgo = (dateString: string): string => {
  const diff  = Date.now() - new Date(dateString).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins  < 60)  return `Il y a ${mins} minute${mins  > 1 ? 's' : ''}`
  if (hours < 24)  return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  if (days  === 1) return 'Hier'
  if (days  < 30)  return `Il y a ${days} jour${days   > 1 ? 's' : ''}`
  return new Date(dateString).toLocaleDateString('fr-FR')
}

// ─── Chargement conditionnel selon les permissions ───────────────────────────

onMounted(async () => {
  loading.value = true
  try {
    const calls: Promise<any>[] = []

    // On ne charge que les données auxquelles le user a accès
    if (nav.value.operators) calls.push(operatorsStore.fetchAllOperators())
    if (nav.value.aircrafts)  calls.push(aircraftsStore.fetchAllAircrafts())
    if (nav.value.flights)    calls.push(flightsStore.fetchFlights(1))
    if (nav.value.agents)     calls.push(usersStore.fetchAllUsers())

    await Promise.all(calls)
  } catch {
    showError('Erreur lors du chargement du tableau de bord')
  } finally {
    loading.value = false
  }
})
</script>