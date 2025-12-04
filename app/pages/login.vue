<template>
  <!-- Écran de chargement pendant la vérification -->
  <LoadingScreen v-if="checking" message="Vérification de votre session..." />

  <div v-else class="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-indigo-400/10 blur-3xl animate-pulse delay-500"></div>
    </div>

    <!-- Login Card -->
    <Card class="w-full max-w-md relative z-10 shadow-2xl border-2">
      <CardHeader class="space-y-4 pb-8">
        <!-- Logo avec animation -->
        <div class="flex justify-center">
          <div class="relative group">
            <div class="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div class="relative h-20 w-20 rounded-full bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300">
              <span class="text-3xl font-black text-white">VTA</span>
            </div>
          </div>
        </div>

        <div class="text-center space-y-2">
          <CardTitle class="text-3xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Connexion
          </CardTitle>
          <CardDescription class="text-base">
            Connectez-vous à votre compte VTA
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="space-y-2">
            <Label for="username" class="text-sm font-semibold">Nom d'utilisateur</Label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User class="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="username"
                v-model="username"
                type="text"
                placeholder="Votre nom d'utilisateur"
                required
                :disabled="loading"
                autocomplete="username"
                class="pl-10 h-12 text-base border-2 focus:border-primary transition-all"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="password" class="text-sm font-semibold">Mot de passe</Label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock class="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                :disabled="loading"
                autocomplete="current-password"
                class="pl-10 h-12 text-base border-2 focus:border-primary transition-all"
              />
            </div>
          </div>

          <Alert v-if="error" variant="destructive" class="animate-in fade-in-50">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            class="w-full h-12 text-base font-semibold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300" 
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <div class="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
              Connexion en cours...
            </span>
            <span v-else class="flex items-center gap-2">
              <LogIn class="h-5 w-5" />
              Se connecter
            </span>
          </Button>
        </form>
      </CardContent>

      <CardFooter class="flex flex-col gap-4">
        <div class="text-sm text-muted-foreground text-center w-full flex items-center gap-2 justify-center">
          <Shield class="h-4 w-4" />
          Système de gestion des vols • VTA
        </div>
      </CardFooter>
    </Card>

    <!-- Version info -->
    <div class="absolute bottom-4 right-4 text-xs text-muted-foreground">
      v1.0.0
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, User, Lock, LogIn, Shield } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import LoadingScreen from '@/components/LoadingScreen.vue'

definePageMeta({
  layout: false,
  middleware: []
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const checking = ref(true)

onMounted(async () => {
  // Attendre l'hydratation complète
  if (authStore.$hydrate) {
    await authStore.$hydrate()
  }
  
  // Vérifier si déjà authentifié
  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect as string
    await router.push(redirect && redirect !== '/login' ? redirect : '/')
  } else {
    checking.value = false
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  const result = await authStore.login({
    username: username.value,
    password: password.value
  })
  
  loading.value = false
  
  if (result.success) {
    // Récupérer le paramètre de redirection depuis l'URL
    const redirect = route.query.redirect as string
    
    // Rediriger vers la page demandée ou vers l'accueil
    await router.push(redirect && redirect !== '/login' ? redirect : '/')
  } else {
    error.value = result.message || 'Identifiants incorrects'
    password.value = ''
  }
}
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