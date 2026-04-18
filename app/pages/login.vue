<template>
  <LoadingScreen v-if="checking" message="Vérification de votre session..." />

  <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-950 flex">

    <!-- Panneau gauche branding (md+) -->
    <div class="hidden md:flex md:w-5/12 bg-blue-600 flex-col justify-between p-10 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 28px 28px;" />

      <div class="relative z-10 flex items-center gap-3">
        <div class="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
          <span class="text-sm font-black text-white">VTA</span>
        </div>
        <span class="text-white font-bold text-lg">VTA System</span>
      </div>

      <div class="relative z-10 space-y-6">
        <div>
          <h1 class="text-4xl font-bold text-white leading-tight">
            Gestion du<br />Trafic Aérien
          </h1>
          <p class="text-blue-100 mt-3 text-base leading-relaxed max-w-xs">
            Plateforme centralisée pour la gestion des vols, opérateurs et aéronefs.
          </p>
        </div>
        <div class="space-y-3">
          <div v-for="item in features" :key="item.label" class="flex items-center gap-3 text-blue-100 text-sm">
            <div class="h-6 w-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
              <component :is="item.icon" class="h-3.5 w-3.5 text-white" />
            </div>
            {{ item.label }}
          </div>
        </div>
      </div>

      <div class="relative z-10 text-blue-200 text-xs">
        © {{ new Date().getFullYear() }} VTA System · v1.0.0
      </div>
    </div>

    <!-- Panneau droit formulaire -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-12">

      <!-- Logo mobile only -->
      <div class="md:hidden flex items-center gap-2.5 mb-10">
        <div class="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
          <span class="text-sm font-black text-white">VTA</span>
        </div>
        <span class="font-bold text-gray-900 dark:text-white text-lg">VTA System</span>
      </div>

      <div class="w-full max-w-sm">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Entrez vos identifiants pour accéder au système
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">

          <div class="space-y-1.5">
            <label for="username" class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom d'utilisateur
            </label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="Votre identifiant"
                required
                :disabled="loading"
                autocomplete="username"
                class="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-shadow"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                :disabled="loading"
                autocomplete="current-password"
                class="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-shadow"
              />
              <button
                type="button"
                tabindex="-1"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div v-if="error"
            class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle class="h-4 w-4 shrink-0" />
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
          >
            <div v-if="loading" class="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <LogIn v-else class="h-4 w-4" />
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>

        </form>

        <div class="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-600">
          <Shield class="h-3.5 w-3.5" />
          Accès sécurisé · Système VTA
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { AlertCircle, User, Lock, LogIn, Shield, Eye, EyeOff, PlaneTakeoff, Plane, BarChart3 } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import LoadingScreen from '@/components/LoadingScreen.vue'

definePageMeta({ layout: false, middleware: [] })

const authStore = useAuthStore()
const router    = useRouter()
const route     = useRoute()

const username     = ref('')
const password     = ref('')
const loading      = ref(false)
const error        = ref('')
const checking     = ref(true)
const showPassword = ref(false)

const features = [
  { icon: PlaneTakeoff, label: 'Suivi des vols en temps réel' },
  { icon: Plane,        label: 'Gestion des aéronefs et opérateurs' },
  { icon: BarChart3,    label: 'Rapports et statistiques de trafic' },
]

onMounted(async () => {
  if (authStore.$hydrate) await authStore.$hydrate()
  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect as string
    await router.push(redirect && redirect !== '/login' ? redirect : '/')
  } else {
    checking.value = false
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value   = ''
  const result  = await authStore.login({ username: username.value, password: password.value })
  loading.value = false

  if (result.success) {
    const redirect = route.query.redirect as string
    await router.push(redirect && redirect !== '/login' ? redirect : '/')
  } else {
    error.value    = result.message || 'Identifiants incorrects'
    password.value = ''
  }
}
</script>