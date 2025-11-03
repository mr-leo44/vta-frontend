<template>
  <div class="flex min-h-screen items-center justify-center bg-muted/50">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <div class="flex justify-center mb-4">
          <div class="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
            <span class="text-3xl font-bold text-primary-foreground">VTA</span>
          </div>
        </div>
        <CardTitle class="text-2xl text-center">Connexion</CardTitle>
        <CardDescription class="text-center">
          Connectez-vous à votre compte VTA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              v-model="username"
              type="text"
              placeholder="Votre nom d'utilisateur"
              required
              :disabled="loading"
              autocomplete="username"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="password">Mot de passe</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              :disabled="loading"
              autocomplete="current-password"
            />
          </div>

          <Alert v-if="error" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <Button type="submit" class="w-full" :disabled="loading">
            <span v-if="loading" class="flex items-center gap-2">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              Connexion en cours...
            </span>
            <span v-else>Se connecter</span>
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div class="text-sm text-muted-foreground text-center w-full">
          Système de gestion des vols • VTA
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: false,
  middleware: []
})

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
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
    await router.push('/')
  } else {
    error.value = result.message || 'Identifiants incorrects'
    password.value = ''
  }
}
</script>