<template>
  <div class="space-y-6">

    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold">Paramètres</h1>
      <p class="text-sm text-muted-foreground mt-1">Gérez vos informations de profil</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>

    <div v-else class="space-y-6">

      <!-- Profile Information -->
      <Card class="border-2">
        <CardHeader>
          <div class="flex items-start justify-between">
            <div>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Vos informations personnelles</CardDescription>
            </div>
            <div :class="roleClass(user?.role)" class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold h-fit">
              {{ roleLabel(user?.role) }}
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- User Avatar/Name -->
          <div class="flex items-center gap-4 pb-4 border-b">
            <div class="h-16 w-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <span class="text-lg font-bold uppercase">{{ user?.username.charAt(0) }}</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold">{{ user?.name }}</h3>
              <p class="text-sm text-muted-foreground">@{{ user?.username }}</p>
            </div>
          </div>

          <!-- Form -->
          <form class="space-y-4" @submit.prevent="updateProfile">
            <!-- Name -->
            <div class="space-y-2">
              <Label for="name">Nom complet</Label>
              <Input
                id="name"
                v-model="profileForm.name"
                placeholder="Jean Dupont"
                disabled
                class="bg-muted"
              />
              <p class="text-xs text-muted-foreground">Contactez un administrateur pour modifier votre nom</p>
            </div>

            <!-- Username -->
            <div class="space-y-2">
              <Label for="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                v-model="profileForm.username"
                placeholder="jdupont"
                disabled
                class="bg-muted"
              />
              <p class="text-xs text-muted-foreground">Ne peut pas être modifié</p>
            </div>

            <!-- Function -->
            <div class="space-y-2">
              <Label for="function">Fonction</Label>
              <Input
                id="function"
                :value="user?.function ?? 'Non assignée'"
                placeholder="Fonction"
                disabled
                class="bg-muted"
              />
              <p class="text-xs text-muted-foreground">Assignée par un administrateur</p>
            </div>



            <!-- Save Button -->
            <Button
              type="submit"
              :disabled="saving"
              class="w-full"
            >
              <span v-if="saving" class="flex items-center gap-2">
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enregistrement...
              </span>
              <span v-else>Enregistrer les modifications</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      <!-- Security -->
      <Card class="border-2">
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>Gérez votre accès et votre mot de passe</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Password Change -->
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="current-password">Mot de passe actuel</Label>
              <Input
                id="current-password"
                v-model="passwordForm.current"
                type="password"
                placeholder="••••••••"
                :disabled="changingPassword"
              />
            </div>

            <div class="space-y-2">
              <Label for="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                v-model="passwordForm.new"
                type="password"
                placeholder="••••••••"
                :disabled="changingPassword"
              />
            </div>

            <div class="space-y-2">
              <Label for="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                v-model="passwordForm.confirm"
                type="password"
                placeholder="••••••••"
                :disabled="changingPassword"
              />
            </div>

            <Button
              @click="changePassword"
              :disabled="!passwordForm.current || !passwordForm.new || !passwordForm.confirm || changingPassword"
              class="w-full"
            >
              <span v-if="changingPassword" class="flex items-center gap-2">
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Changement...
              </span>
              <span v-else>Changer le mot de passe</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Account Info -->
      <Card class="border-2 bg-muted/30">
        <CardHeader>
          <CardTitle class="text-base">Informations du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Rôle</span>
              <span :class="roleClass(user?.role)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {{ roleLabel(user?.role) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Fonction</span>
              <span class="font-medium">{{ user?.function ?? 'Non assignée' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Identifiant</span>
              <span class="font-mono text-xs">{{ user?.id }}</span>
            </div>

          </div>
        </CardContent>
      </Card>

      <!-- Danger Zone -->
      <Card class="border-2 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle class="text-base text-red-600 dark:text-red-400">Zone dangereuse</CardTitle>
          <CardDescription>Actions irréversibles</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <Button
            @click="handleLogout"
            :disabled="loggingOut"
            variant="destructive"
            class="w-full"
          >
            <span v-if="loggingOut" class="flex items-center gap-2">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Déconnexion...
            </span>
            <span v-else>Déconnexion</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button, Input, Label,
} from '#components'
import type { AuthUser } from '~/types/api'
import { useToast } from '@/composables/useToast'

definePageMeta({ middleware: 'auth' })

const { apiFetch } = useApi()
const { success: showSuccess, error: showError } = useToast()
const authStore = useAuthStore()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const changingPassword = ref(false)
const loggingOut = ref(false)


const user = ref<AuthUser | null>(null)

const profileForm = ref({
  name: '',
  username: '',
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: '',
})

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

const roleLabel = (role?: string | null) => ({
  admin: 'Administrateur',
  manager: 'Manager',
  permanent: 'Permanent',
  agent: 'Agent',
}[role ?? ''] ?? '—')

const roleClass = (role?: string | null) => ({
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  permanent: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  agent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}[role ?? ''] ?? 'bg-gray-100 text-gray-600')

// ─────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────

const fetchProfile = async () => {
  loading.value = true
  try {
    user.value = authStore.user as AuthUser
    profileForm.value = {
      name: user.value?.name ?? '',
      username: user.value?.username ?? '',
    }
  } catch (err) {
    showError('Erreur lors du chargement du profil')
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  saving.value = true
  try {
    await apiFetch('/me/profile', {
      method: 'PUT',
      body: {
        name: profileForm.value.name,
      },
    })

    showSuccess('Profil mis à jour', 'Vos informations ont été enregistrées')
    await fetchProfile()
  } catch (err: any) {
    showError(err?.data?.message ?? 'Erreur lors de la mise à jour du profil')
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    showError('Les mots de passe ne correspondent pas')
    return
  }

  changingPassword.value = true
  try {
    await apiFetch('/me/password', {
      method: 'PUT',
      body: {
        current_password: passwordForm.value.current,
        new_password: passwordForm.value.new,
      },
    })

    showSuccess('Mot de passe changé', 'Votre nouveau mot de passe est actif')
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (err: any) {
    showError(err?.data?.message ?? 'Erreur lors du changement de mot de passe')
  } finally {
    changingPassword.value = false
  }
}

const handleLogout = async () => {
  loggingOut.value = true
  try {
    await authStore.logout()
    showSuccess('Déconnexion réussie')
    await router.push('/login')
  } catch (err) {
    showError('Erreur lors de la déconnexion')
    loggingOut.value = false
  }
}

// ─────────────────────────────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────────────────────────────

onMounted(() => fetchProfile())
</script>
