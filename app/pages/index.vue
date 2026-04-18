<template>
  <LoadingScreen v-if="loading" message="Chargement du tableau de bord..." />

  <div v-else class="space-y-6">

    <!-- Hero -->
    <div class="rounded-xl bg-blue-600 px-6 py-5 text-white">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center text-xl">👋</div>
          <div>
            <h1 class="text-xl font-bold leading-tight">
              Bonjour, {{ authStore.user?.name }} !
            </h1>
            <p class="text-blue-100 text-sm mt-0.5">
              {{ currentDate }} · {{ roleLabelFull }}
            </p>
          </div>
        </div>
        <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-sm">
          <span class="h-1.5 w-1.5 rounded-full bg-green-300"></span>
          Session active
        </div>
      </div>
    </div>

    <!-- KPIs — filtrés par rôle -->
    <div v-if="visibleStats.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in visibleStats"
        :key="stat.key"
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 group"
        @click="navigateTo(stat.link)"
      >
        <div class="flex items-start justify-between mb-3">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</span>
          <div class="h-8 w-8 rounded-lg flex items-center justify-center" :class="stat.iconBg">
            <component :is="stat.icon" class="h-4 w-4" :class="stat.iconColor" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{{ stat.value }}</div>
        <div class="mt-2 flex items-center gap-1.5 text-xs">
          <span class="flex items-center gap-1 font-medium px-1.5 py-0.5 rounded" :class="stat.badge.class">
            <component :is="stat.badge.icon" class="h-3 w-3" />
            {{ stat.badge.text }}
          </span>
          <span class="text-gray-400">ce mois</span>
        </div>
      </div>
    </div>

    <!-- Accès rapide + Activités -->
    <div class="grid gap-6 lg:grid-cols-3">

      <!-- Accès rapide (2/3) -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
          <div class="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center">
            <Zap class="h-3.5 w-3.5 text-white" />
          </div>
          <h2 class="font-semibold text-gray-900 dark:text-white text-sm">Accès rapide</h2>
        </div>
        <div class="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">

          <button
            v-for="sc in visibleShortcuts"
            :key="sc.key"
            class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-150 group text-left"
            @click="navigateTo(sc.link)"
          >
            <div class="h-10 w-10 rounded-lg flex items-center justify-center" :class="sc.iconBg">
              <component :is="sc.icon" class="h-5 w-5" :class="sc.iconColor" />
            </div>
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{{ sc.label }}</span>
          </button>

          <!-- Permissions — toujours visible -->
          <button
            class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-150 group text-left"
            @click="navigateTo('/permissions')"
          >
            <div class="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
              <Shield class="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">Mes permissions</span>
          </button>

        </div>
      </div>

      <!-- Activités récentes (1/3) -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
          <div class="h-6 w-6 rounded-md bg-gray-800 dark:bg-gray-200 flex items-center justify-center">
            <Activity class="h-3.5 w-3.5 text-white dark:text-gray-800" />
          </div>
          <h2 class="font-semibold text-gray-900 dark:text-white text-sm">Activité récente</h2>
        </div>

        <div v-if="recentActivities.length" class="divide-y divide-gray-50 dark:divide-gray-800">
          <div
            v-for="act in recentActivities"
            :key="act.id"
            class="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div class="h-7 w-7 rounded-md flex items-center justify-center mt-0.5 shrink-0" :class="act.iconBg">
              <component :is="act.icon" class="h-3.5 w-3.5" :class="act.iconColor" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{{ act.title }}</p>
              <p class="text-xs text-gray-400 truncate mt-0.5">{{ act.description }}</p>
            </div>
            <span class="text-[10px] text-gray-400 whitespace-nowrap mt-1">{{ act.timeAgo }}</span>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-12 text-center px-5">
          <div class="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <Activity class="h-6 w-6 text-gray-400" />
          </div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Aucune activité</p>
          <p class="text-xs text-gray-400 mt-1">Les actions apparaîtront ici</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Building2, Plane, Users, FileText, Upload,
  PlaneTakeoff, TrendingUp, TrendingDown, AlertCircle,
  Zap, Activity, Shield, BarChart3
} from 'lucide-vue-next'
import LoadingScreen from '~/components/LoadingScreen.vue'
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'Tableau de bord | VTA',
  meta: [
    { name: 'description', content: 'Tableau de bord de gestion du trafic aérien. Consultez les statistiques, les vols, les exploitants et les aéronefs.' }
  ]
})

const authStore      = useAuthStore()
const operatorsStore = useOperatorsStore()
const aircraftsStore = useAircraftsStore()
const flightsStore   = useFlightsStore()
const usersStore     = useUsersStore()
const { nav }        = usePermission()
const { error: showError } = useToast()

const loading = ref(true)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const roleLabelFull = computed(() => ({
  admin:     'Administrateur',
  manager:   'Manager',
  permanent: 'Permanent',
  agent:     'Agent',
}[authStore.user?.role ?? ''] ?? ''))

const currentDate = computed(() =>
  new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
)

const getTimeAgo = (d: string): string => {
  const diff  = Date.now() - new Date(d).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 60)  return `${mins}min`
  if (hours < 24)  return `${hours}h`
  if (days  === 1) return 'hier'
  if (days  < 30)  return `${days}j`
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ─── Stats brutes ──────────────────────────────────────────────────────────────

const rawStats = computed(() => {
  const now   = new Date()
  const month = now.getMonth()
  const year  = now.getFullYear()
  const prev  = month - 1

  const inMonth = (date: string | null) => {
    if (!date) return false
    const d = new Date(date)
    return d.getMonth() === month && d.getFullYear() === year
  }

  const monthFlights = flightsStore.flights.filter(f => inMonth(f.departure_time)).length
  const prevFlights  = flightsStore.flights.filter(f => {
    const d = new Date(f.departure_time)
    return d.getMonth() === prev && d.getFullYear() === year
  }).length

  return {
    newOperators: operatorsStore.allOperators.filter(o => inMonth(o.created_at)).length,
    newAircrafts: aircraftsStore.allAircrafts.filter(a => inMonth(a.created_at)).length,
    monthFlights,
    flightTrend: monthFlights - prevFlights,
  }
})

// ─── KPI Cards
// Règles :
//   admin    → tout (operators, aircrafts, flights, agents)
//   manager  → operators, aircrafts, flights  (pas agents)
//   agent    → operators, aircrafts, flights  (pas agents)
//   permanent→ flights seulement
// ──────────────────────────────────────────────────────────────────────────────

const visibleStats = computed(() => {
  const s   = rawStats.value
  const all = [
    // Exploitants — admin / manager / agent (pas permanent)
    nav.value.operators && {
      key:       'operators',
      label:     'Exploitants',
      value:     operatorsStore.allOperators.length,
      icon:      Building2,
      iconBg:    'bg-blue-100 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400',
      link:      '/operators',
      badge: { icon: TrendingUp, text: `+${s.newOperators}`, class: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
    },

    // Aéronefs — admin / manager / agent (pas permanent)
    nav.value.aircrafts && {
      key:       'aircrafts',
      label:     'Aéronefs',
      value:     aircraftsStore.allAircrafts.length,
      icon:      Plane,
      iconBg:    'bg-sky-100 dark:bg-sky-950',
      iconColor: 'text-sky-600 dark:text-sky-400',
      link:      '/aircrafts',
      badge: { icon: TrendingUp, text: `+${s.newAircrafts}`, class: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400' },
    },

    // Vols — tous les rôles
    nav.value.flights && {
      key:       'flights',
      label:     'Vols',
      value:     flightsStore.total,
      icon:      PlaneTakeoff,
      iconBg:    'bg-indigo-100 dark:bg-indigo-950',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      link:      '/flights',
      badge: {
        icon:  s.flightTrend >= 0 ? TrendingUp : TrendingDown,
        text:  `${s.flightTrend >= 0 ? '+' : ''}${s.monthFlights}`,
        class: s.flightTrend >= 0
          ? 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400'
          : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
      },
    },

    // Agents — admin uniquement
    nav.value.agents && {
      key:       'agents',
      label:     'Agents',
      value:     usersStore.allUsers.length,
      icon:      Users,
      iconBg:    'bg-teal-100 dark:bg-teal-950',
      iconColor: 'text-teal-600 dark:text-teal-400',
      link:      '/agents',
      badge: usersStore.allUsers.length > 0
        ? { icon: TrendingUp, text: `${usersStore.allUsers.length} actifs`, class: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400' }
        : { icon: AlertCircle, text: 'Non disponible', class: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
    },
  ]
  return all.filter(Boolean) as any[]
})

// ─── Accès rapide
// Règles :
//   admin    → flights, operators, aircrafts, reports, agents, imports
//   manager  → flights, operators, aircrafts, reports  (pas agents/imports)
//   agent    → flights, operators, aircrafts           (pas rapports)
//   permanent→ flights seulement (+ permissions toujours en dur en bas)
// ──────────────────────────────────────────────────────────────────────────────

const visibleShortcuts = computed(() => {
  const all = [
    // Vols — tous
    nav.value.flights && {
      key:       'flights',
      label:     'Gérer les vols',
      icon:      PlaneTakeoff,
      iconBg:    'bg-indigo-100 dark:bg-indigo-950',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      link:      '/flights',
    },

    // Exploitants — admin / manager / agent
    nav.value.operators && {
      key:       'operators',
      label:     'Exploitants',
      icon:      Building2,
      iconBg:    'bg-blue-100 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400',
      link:      '/operators',
    },

    // Aéronefs — admin / manager / agent
    nav.value.aircrafts && {
      key:       'aircrafts',
      label:     'Aéronefs',
      icon:      Plane,
      iconBg:    'bg-sky-100 dark:bg-sky-950',
      iconColor: 'text-sky-600 dark:text-sky-400',
      link:      '/aircrafts',
    },

    // Rapports — admin + manager uniquement
    nav.value.reports && {
      key:       'reports',
      label:     'Rapports',
      icon:      FileText,
      iconBg:    'bg-orange-100 dark:bg-orange-950',
      iconColor: 'text-orange-600 dark:text-orange-400',
      link:      '/reports',
    },

    // Agents — admin uniquement
    nav.value.agents && {
      key:       'agents',
      label:     'Gestion agents',
      icon:      Users,
      iconBg:    'bg-teal-100 dark:bg-teal-950',
      iconColor: 'text-teal-600 dark:text-teal-400',
      link:      '/agents',
    },

    // Imports — admin uniquement
    nav.value.imports && {
      key:       'imports',
      label:     'Imports',
      icon:      Upload,
      iconBg:    'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-400',
      link:      '/imports',
    },

    // Audit logs — admin uniquement
    nav.value.agents && {
      key:       'audit',
      label:     'Audit logs',
      icon:      BarChart3,
      iconBg:    'bg-red-100 dark:bg-red-950',
      iconColor: 'text-red-600 dark:text-red-400',
      link:      '/audit',
    },
  ]
  return all.filter(Boolean) as any[]
})

// ─── Activités récentes ────────────────────────────────────────────────────────

const recentActivities = computed(() => {
  const out: any[] = []

  if (nav.value.flights) {
    ;[...flightsStore.flights]
      .sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime())
      .slice(0, 3)
      .forEach(f => out.push({
        id:          `f-${f.id}`,
        title:       f.flight_number,
        description: `${f.departure?.from?.iata ?? '?'} → ${f.departure?.to?.iata ?? '?'}`,
        timeAgo:     getTimeAgo(f.departure_time),
        icon:        PlaneTakeoff,
        iconBg:      'bg-indigo-100 dark:bg-indigo-950',
        iconColor:   'text-indigo-600 dark:text-indigo-400',
      }))
  }

  if (nav.value.aircrafts) {
    ;[...aircraftsStore.allAircrafts]
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 2)
      .forEach(a => out.push({
        id:          `a-${a.id}`,
        title:       a.immatriculation,
        description: a.type?.name ?? 'Type inconnu',
        timeAgo:     a.created_at ? getTimeAgo(a.created_at) : '—',
        icon:        Plane,
        iconBg:      'bg-sky-100 dark:bg-sky-950',
        iconColor:   'text-sky-600 dark:text-sky-400',
      }))
  }

  return out.slice(0, 6)
})

// ─── Chargement conditionnel selon le rôle ────────────────────────────────────

onMounted(async () => {
  loading.value = true
  try {
    const calls: Promise<any>[] = []
    // Chaque fetch ne se déclenche que si l'utilisateur a la permission correspondante
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